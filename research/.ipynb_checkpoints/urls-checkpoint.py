from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LearningRecordViewSet

router = DefaultRouter()
router.register(r'records', LearningRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]