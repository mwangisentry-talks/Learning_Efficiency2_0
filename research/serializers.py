# serializers.py
from rest_framework import serializers
from .models import LearningRecord, ResearchPillar, KnowledgeGapTracker


class ResearchPillarSerializer(serializers.ModelSerializer):
    total_sessions = serializers.SerializerMethodField()
    open_gaps = serializers.SerializerMethodField()
    average_efficiency = serializers.SerializerMethodField()

    class Meta:
        model = ResearchPillar
        fields = [
            "id",
            "name",
            "description",
            "total_sessions",
            "open_gaps",
            "average_efficiency",
            "created_at",
        ]

    def get_total_sessions(self, obj):
        return obj.sessions.count()

    def get_open_gaps(self, obj):
        return obj.gaps.filter(status="OPEN").count()

    def get_average_efficiency(self, obj):
        sessions = obj.sessions.exclude(learning_efficiency=None)
        if not sessions.exists():
            return None
        total = sum(s.learning_efficiency for s in sessions)
        return round(total / sessions.count(), 2)


class LearningRecordSerializer(serializers.ModelSerializer):
    efficiency_percentage = serializers.ReadOnlyField()
    efficiency_rating = serializers.ReadOnlyField()
    produced_output = serializers.ReadOnlyField()
    pillar_name = serializers.SerializerMethodField()

    class Meta:
        model = LearningRecord
        fields = [
            "id",
            "title",
            "pillar",
            "pillar_name",
            "session_type",
            "time_spent",
            "concept_links",
            "knowledge_gaps",
            "research_questions",
            "learning_efficiency",
            "max_efficiency",
            "efficiency_percentage",
            "efficiency_rating",
            "output_type",
            "output_notes",
            "recurring_gap",
            "gap_description",
            "produced_output",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "learning_efficiency",
            "max_efficiency",
            "created_at",
            "updated_at",
        ]

    def get_pillar_name(self, obj):
        return obj.pillar.get_name_display() if obj.pillar else None


class KnowledgeGapTrackerSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField()
    session_count = serializers.SerializerMethodField()
    pillar_name = serializers.SerializerMethodField()

    class Meta:
        model = KnowledgeGapTracker
        fields = [
            "id",
            "gap",
            "pillar",
            "pillar_name",
            "sessions",
            "status",
            "status_display",
            "session_count",
            "resolution_notes",
            "created_at",
            "resolved_at",
        ]

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_session_count(self, obj):
        return obj.sessions.count()

    def get_pillar_name(self, obj):
        return obj.pillar.get_name_display() if obj.pillar else None


class DashboardSerializer(serializers.Serializer):
    """PhD research dashboard summary"""
    total_sessions = serializers.IntegerField()
    total_hours = serializers.FloatField()
    average_efficiency = serializers.FloatField()
    highest_efficiency = serializers.FloatField()
    open_gaps = serializers.IntegerField()
    resolved_gaps = serializers.IntegerField()
    sessions_with_output = serializers.IntegerField()
    sessions_by_type = serializers.DictField()
    sessions_by_pillar = serializers.DictField()
    recent_sessions = LearningRecordSerializer(many=True)