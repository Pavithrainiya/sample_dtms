from django.db import models
from django.contrib.auth import get_user_model
from tasks.models import Task

User = get_user_model()

class UserAnalytics(models.Model):
    """Track detailed user analytics"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='analytics')
    
    # Productivity Metrics
    productivity_score = models.IntegerField(default=0)  # 0-100
    total_tasks_completed = models.IntegerField(default=0)
    total_tasks_assigned = models.IntegerField(default=0)
    on_time_completion_rate = models.FloatField(default=0.0)  # Percentage
    
    # Engagement Metrics
    total_login_count = models.IntegerField(default=0)
    last_active = models.DateTimeField(auto_now=True)
    average_response_time = models.DurationField(null=True, blank=True)
    
    # Gamification
    total_points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    streak_days = models.IntegerField(default=0)
    last_streak_date = models.DateField(null=True, blank=True)
    
    # Quality Metrics
    average_submission_quality = models.FloatField(default=0.0)
    total_submissions = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "User Analytics"
    
    def __str__(self):
        return f"Analytics for {self.user.name}"
    
    def calculate_productivity_score(self):
        """Calculate overall productivity score (0-100)"""
        if self.total_tasks_assigned == 0:
            return 0
        
        completion_rate = (self.total_tasks_completed / self.total_tasks_assigned) * 100
        on_time_weight = self.on_time_completion_rate * 0.4
        quality_weight = self.average_submission_quality * 0.3
        engagement_weight = min(self.streak_days * 2, 30) * 0.3
        
        score = (completion_rate * 0.4) + on_time_weight + quality_weight + engagement_weight
        self.productivity_score = min(int(score), 100)
        self.save()
        return self.productivity_score


class TaskAnalytics(models.Model):
    """Track analytics for individual tasks"""
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name='analytics')
    
    # Time Metrics
    estimated_completion_time = models.DurationField(null=True, blank=True)
    actual_completion_time = models.DurationField(null=True, blank=True)
    
    # Engagement Metrics
    view_count = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)
    submission_count = models.IntegerField(default=0)
    
    # Prediction
    predicted_completion_date = models.DateTimeField(null=True, blank=True)
    completion_probability = models.FloatField(default=0.0)  # 0-1
    risk_level = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low Risk'),
            ('medium', 'Medium Risk'),
            ('high', 'High Risk'),
            ('critical', 'Critical Risk')
        ],
        default='low'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics for {self.task.title}"


class SystemAnalytics(models.Model):
    """Daily system-wide analytics snapshot"""
    date = models.DateField(unique=True)
    
    # Task Metrics
    total_tasks_created = models.IntegerField(default=0)
    total_tasks_completed = models.IntegerField(default=0)
    total_tasks_overdue = models.IntegerField(default=0)
    average_completion_time = models.DurationField(null=True, blank=True)
    
    # User Metrics
    total_active_users = models.IntegerField(default=0)
    new_user_registrations = models.IntegerField(default=0)
    average_user_productivity = models.FloatField(default=0.0)
    
    # Engagement Metrics
    total_submissions = models.IntegerField(default=0)
    total_logins = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "System Analytics"
        ordering = ['-date']
    
    def __str__(self):
        return f"System Analytics - {self.date}"


class Badge(models.Model):
    """Achievement badges for gamification"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50)  # emoji or icon class
    category = models.CharField(
        max_length=50,
        choices=[
            ('completion', 'Task Completion'),
            ('quality', 'Quality Work'),
            ('speed', 'Fast Completion'),
            ('streak', 'Consistency'),
            ('collaboration', 'Team Player'),
            ('special', 'Special Achievement')
        ]
    )
    points_reward = models.IntegerField(default=10)
    requirement = models.JSONField()  # Criteria for earning the badge
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class UserBadge(models.Model):
    """Badges earned by users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'badge']
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.name} - {self.badge.name}"


class ActivityLog(models.Model):
    """Comprehensive activity logging for audit trail"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=50)  # task, submission, user, etc.
    entity_id = models.IntegerField(null=True, blank=True)
    details = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['entity_type', 'entity_id']),
        ]
    
    def __str__(self):
        return f"{self.user.name if self.user else 'System'} - {self.action} - {self.timestamp}"
