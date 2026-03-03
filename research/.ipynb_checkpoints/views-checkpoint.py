from rest_framework import viewsets
from .models import LearningRecord
from .serializers import LearningRecordSerializer

class LearningRecordViewSet(viewsets.ModelViewSet):
    queryset = LearningRecord.objects.all().order_by('-created_at')
    serializer_class = LearningRecordSerializer