from rest_framework import serializers
from .models import Task, Submission
from accounts.serializers import UserSerializer

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'deadline', 'created_by', 'created_at', 'attachment', 'assigned_users', 'priority')
        read_only_fields = ('created_by', 'created_at')

    def to_internal_value(self, data):
        if hasattr(data, 'getlist'):
            data_dict = data.copy()
            assigned = data.getlist('assigned_users')
            if assigned:
                flat_assigned = []
                for item in assigned:
                    if isinstance(item, str) and ',' in item:
                        flat_assigned.extend([x.strip() for x in item.split(',') if x.strip()])
                    elif item:
                        flat_assigned.append(item)
                data_dict.setlist('assigned_users', flat_assigned)
            data = data_dict
        return super().to_internal_value(data)

class SubmissionSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    task_details = TaskSerializer(source='task', read_only=True)

    class Meta:
        model = Submission
        fields = ('id', 'task', 'user', 'content', 'status', 'submitted_at', 'user_details', 'task_details', 'attachment')
        read_only_fields = ('user', 'status', 'submitted_at')
