from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LearningRecordViewSet,
    ResearchPillarViewSet,
    KnowledgeGapViewSet,
    DashboardViewSet,
)

router = DefaultRouter()
router.register(r"records", LearningRecordViewSet, basename="records")
router.register(r"pillars", ResearchPillarViewSet, basename="pillars")
router.register(r"gaps", KnowledgeGapViewSet, basename="gaps")
router.register(r"dashboard", DashboardViewSet, basename="dashboard")

urlpatterns = [
    path("", include(router.urls)),  # ← no prefix here
]
