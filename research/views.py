# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Max, Sum, Count
from .models import LearningRecord, ResearchPillar, KnowledgeGapTracker
from .serializers import (
    LearningRecordSerializer,
    ResearchPillarSerializer,
    KnowledgeGapTrackerSerializer,
    DashboardSerializer,
)


class ResearchPillarViewSet(viewsets.ModelViewSet):
    queryset = ResearchPillar.objects.all()
    serializer_class = ResearchPillarSerializer

    @action(detail=True, methods=["get"])
    def sessions(self, request, pk=None):
        """All sessions under a specific pillar"""
        pillar = self.get_object()
        sessions = pillar.sessions.all()
        serializer = LearningRecordSerializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def gaps(self, request, pk=None):
        """All knowledge gaps under a specific pillar"""
        pillar = self.get_object()
        gaps = pillar.gaps.all()
        serializer = KnowledgeGapTrackerSerializer(gaps, many=True)
        return Response(serializer.data)


class LearningRecordViewSet(viewsets.ModelViewSet):
    queryset = LearningRecord.objects.all()
    serializer_class = LearningRecordSerializer

    def get_queryset(self):
        queryset = LearningRecord.objects.all()

        # Filter by pillar
        pillar = self.request.query_params.get("pillar")
        if pillar:
            queryset = queryset.filter(pillar__name=pillar)

        # Filter by session type
        session_type = self.request.query_params.get("session_type")
        if session_type:
            queryset = queryset.filter(session_type=session_type)

        # Filter by recurring gaps only
        recurring = self.request.query_params.get("recurring_gaps")
        if recurring == "true":
            queryset = queryset.filter(recurring_gap=True)

        # Filter by sessions that produced output
        has_output = self.request.query_params.get("has_output")
        if has_output == "true":
            queryset = queryset.exclude(output_type="NONE")

        return queryset

    @action(detail=False, methods=["get"])
    def top_sessions(self, request):
        """Top 5 highest efficiency sessions"""
        sessions = (
            LearningRecord.objects
            .exclude(learning_efficiency=None)
            .order_by("-learning_efficiency")[:5]
        )
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def weak_sessions(self, request):
        """Sessions with lowest efficiency — needs attention"""
        sessions = (
            LearningRecord.objects
            .exclude(learning_efficiency=None)
            .order_by("learning_efficiency")[:5]
        )
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)


class KnowledgeGapViewSet(viewsets.ModelViewSet):
    queryset = KnowledgeGapTracker.objects.all()
    serializer_class = KnowledgeGapTrackerSerializer

    def get_queryset(self):
        queryset = KnowledgeGapTracker.objects.all()

        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())

        pillar = self.request.query_params.get("pillar")
        if pillar:
            queryset = queryset.filter(pillar__name=pillar)

        return queryset

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        """Mark a knowledge gap as resolved"""
        gap = self.get_object()
        notes = request.data.get("resolution_notes", "")
        gap.resolve(notes=notes)
        serializer = self.get_serializer(gap)
        return Response(serializer.data)


class DashboardViewSet(viewsets.ViewSet):
    """PhD research progress dashboard"""

    @action(detail=False, methods=["get"])
    def summary(self, request):
        records = LearningRecord.objects.all()
        gaps = KnowledgeGapTracker.objects.all()

        # Aggregate stats
        total_sessions = records.count()
        total_hours = records.aggregate(total=Sum("time_spent"))["total"] or 0
        avg_efficiency = records.exclude(
            learning_efficiency=None
        ).aggregate(avg=Avg("learning_efficiency"))["avg"] or 0
        highest_efficiency = records.exclude(
            learning_efficiency=None
        ).aggregate(highest=Max("learning_efficiency"))["highest"] or 0

        # Gap stats
        open_gaps = gaps.filter(status="OPEN").count()
        resolved_gaps = gaps.filter(status="RESOLVED").count()

        # Output stats
        sessions_with_output = records.exclude(output_type="NONE").count()

        # Sessions breakdown by type
        sessions_by_type = dict(
            records.values("session_type")
            .annotate(count=Count("id"))
            .values_list("session_type", "count")
        )

        # Sessions breakdown by pillar
        sessions_by_pillar = dict(
            records.exclude(pillar=None)
            .values("pillar__name")
            .annotate(count=Count("id"))
            .values_list("pillar__name", "count")
        )

        # Recent 5 sessions
        recent_sessions = records.order_by("-created_at")[:5]

        data = {
            "total_sessions": total_sessions,
            "total_hours": round(total_hours, 2),
            "average_efficiency": round(avg_efficiency, 2),
            "highest_efficiency": round(highest_efficiency, 2),
            "open_gaps": open_gaps,
            "resolved_gaps": resolved_gaps,
            "sessions_with_output": sessions_with_output,
            "sessions_by_type": sessions_by_type,
            "sessions_by_pillar": sessions_by_pillar,
            "recent_sessions": recent_sessions,
        }

        serializer = DashboardSerializer(data)
        return Response(serializer.data)