from django.contrib import admin
from .models import (
    UserAnalytics, TaskAnalytics, SystemAnalytics,
    Badge, UserBadge, ActivityLog
)


@admin.register(UserAnalytics)
class UserAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['user', 'productivity_score', 'total_tasks_completed', 
                    'on_time_completion_rate', 'level', 'total_points']
    list_filter = ['level', 'productivity_score']
    search_fields = ['user__name', 'user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TaskAnalytics)
class TaskAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['task', 'risk_level', 'completion_probability', 
                    'view_count', 'submission_count']
    list_filter = ['risk_level']
    search_fields = ['task__title']


@admin.register(SystemAnalytics)
class SystemAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_tasks_created', 'total_tasks_completed',
                    'total_active_users', 'average_user_productivity']
    list_filter = ['date']
    date_hierarchy = 'date'


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'points_reward']
    list_filter = ['category']
    search_fields = ['name', 'description']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'earned_at']
    list_filter = ['badge__category', 'earned_at']
    search_fields = ['user__name', 'badge__name']


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'entity_type', 'timestamp']
    list_filter = ['action', 'entity_type', 'timestamp']
    search_fields = ['user__name', 'action']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
