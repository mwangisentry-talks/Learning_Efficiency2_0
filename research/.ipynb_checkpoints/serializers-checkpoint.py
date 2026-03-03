from rest_framework import serializers
from .models import LearningRecord

class LearningRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningRecord
        fields = '__all__'
        read_only_fields = ['learning_efficiency', 'created_at']