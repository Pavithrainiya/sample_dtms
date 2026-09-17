from rest_framework import serializers
from .models import (
    UserAnalytics, TaskAnalytics, SystemAnalytics,
    Badge, UserBadge, ActivityLog
)


class UserAnalyticsSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    completion_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = UserAnalytics
        fields = '__all__'
    
    def get_completion_rate(self, obj):
        if obj.total_tasks_assigned == 0:
            return 0
        return round((obj.total_tasks_completed / obj.total_tasks_assigned) * 100, 2)


class TaskAnalyticsSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = TaskAnalytics
        fields = '__all__'


class SystemAnalyticsSerializer(serializers.ModelSerializer):
    completion_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemAnalytics
        fields = '__all__'
    
    def get_completion_rate(self, obj):
        if obj.total_tasks_created == 0:
            return 0
        return round((obj.total_tasks_completed / obj.total_tasks_created) * 100, 2)


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class UserBadgeSerializer(serializers.ModelSerializer):
    badge_details = BadgeSerializer(source='badge', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = UserBadge
        fields = '__all__'


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = '__all__'


class DashboardAnalyticsSerializer(serializers.Serializer):
    """Comprehensive dashboard analytics"""
    # Overview
    total_users = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    total_tasks_completed = serializers.IntegerField()
    total_submissions = serializers.IntegerField()
    
    # Rates
    completion_rate = serializers.FloatField()
    average_productivity = serializers.FloatField()
    
    # Recent Activity
    tasks_this_week = serializers.IntegerField()
    tasks_this_month = serializers.IntegerField()
    active_users_today = serializers.IntegerField()
    
    # Performance
    top_performers = UserAnalyticsSerializer(many=True)
    at_risk_tasks = TaskAnalyticsSerializer(many=True)
    
    # Trends (time series data)
    completion_trend = serializers.ListField()
    user_activity_trend = serializers.ListField()


class LeaderboardSerializer(serializers.Serializer):
    """Leaderboard for gamification"""
    rank = serializers.IntegerField()
    user_id = serializers.IntegerField()
    user_name = serializers.CharField()
    user_email = serializers.EmailField()
    total_points = serializers.IntegerField()
    level = serializers.IntegerField()
    productivity_score = serializers.IntegerField()
    tasks_completed = serializers.IntegerField()
    badges_count = serializers.IntegerField()
