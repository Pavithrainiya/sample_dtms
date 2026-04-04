from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Task, Submission
from .serializers import TaskSerializer, SubmissionSerializer
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
import google.generativeai as genai
import os
import json
from django.core.mail import EmailMessage
from django.conf import settings
import logging
from decouple import config
import re

logger = logging.getLogger(__name__)

def send_task_notification(task, users):
    """Sends email notification to assigned users with the task attachment."""
    if not users:
        logger.warning("No users provided for task notification")
        return
        
    subject = f"[DTMS] New Mission Assigned: {task.title}"
    body = f"Greetings Talent,\n\n" \
           f"A new operational mission has been assigned to you by the Global Administration.\n\n" \
           f"--- MISSION BRIEF ---\n" \
           f"TITLE: {task.title}\n" \
           f"DEADLINE: {task.deadline.strftime('%Y-%m-%d %H:%M') if task.deadline else 'N/A'}\n\n" \
           f"DESCRIPTION:\n{task.description}\n" \
           f"---------------------\n\n" \
           f"Please log in to the Digital Talent Management System (DTMS) to review the context and submit your work.\n\n" \
           f"This is an automated operational notification. Please do not reply directly."
           
    recipient_list = [u.email for u in users if u.email]
    if not recipient_list:
        logger.warning(f"No valid email addresses found for task '{task.title}'")
        return

    logger.info(f"Attempting to send task notification to: {recipient_list}")

    try:
        email = EmailMessage(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            recipient_list,
        )
        
        if task.attachment and hasattr(task.attachment, 'path'):
            try:
                email.attach_file(task.attachment.path)
                logger.info(f"Attached file: {task.attachment.path}")
            except Exception as e:
                logger.error(f"Failed to attach file to email: {str(e)}")
        
        # Send with fail_silently=False to catch errors
        sent_count = email.send(fail_silently=False)
        logger.info(f"✅ Task notification sent successfully to {sent_count} recipients: {recipient_list}")
        
    except Exception as e:
        logger.error(f"❌ Failed to send task notification: {str(e)}")
        logger.exception("Full traceback:")
        # Re-raise to make the error visible
        raise

genai.configure(api_key=config('GEMINI_API_KEY', default=''))

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'Admin'

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    serializer_class = TaskSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        if self.request.user.role == 'Admin':
            return Task.objects.all().order_by('-created_at')
        return Task.objects.filter(assigned_users=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        from accounts.models import User
        instance = serializer.save(created_by=self.request.user)
        
        # If no users are explicitly assigned, assign to all non-admin users
        if not instance.assigned_users.exists():
            all_users = User.objects.filter(role='User')
            instance.assigned_users.set(all_users)
            logger.info(f"Auto-assigned task '{instance.title}' to {all_users.count()} users")
        
        # Send notifications to all assigned users
        assigned_users = instance.assigned_users.all()
        if assigned_users:
            send_task_notification(instance, assigned_users)
            logger.info(f"Sent email notifications for task '{instance.title}' to {assigned_users.count()} users")

    def perform_update(self, serializer):
        # We need to track who was already assigned to avoid duplicate emails
        original_instance = self.get_object()
        old_user_ids = set(original_instance.assigned_users.values_list('id', flat=True))
        
        instance = serializer.save()
        
        # Find newly added users
        new_assigned_users = instance.assigned_users.exclude(id__in=old_user_ids)
        if new_assigned_users.exists():
            send_task_notification(instance, new_assigned_users)

class SubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SubmissionSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        if self.request.user.role == 'Admin':
            return Submission.objects.all().order_by('-submitted_at')
        return Submission.objects.filter(user=self.request.user).order_by('-submitted_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='Submitted')

    def perform_update(self, serializer):
        serializer.save(status='Submitted')

    @action(detail=True, methods=['put'], permission_classes=[IsAdminOrReadOnly])
    def review(self, request, pk=None):
        submission = self.get_object()
        status = request.data.get('status')
        if status in ['Pending', 'Submitted', 'Reviewed', 'Rejected']:
            submission.status = status
            submission.save()
            return Response({'status': 'Status updated'})
        return Response({'error': 'Invalid status'}, status=400)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrReadOnly])
    def evaluate(self, request, pk=None):
        submission = self.get_object()
        task = submission.task
        api_key = config('GEMINI_API_KEY', default=None)
        if not api_key:
            return Response({'error': 'Gemini API Key not configured in environment variables.'}, status=500)
            
        prompt = f"""
        You are an expert Talent Evaluator AI.
        Evaluate this user's submission against the task instructions.
        
        TASK TITLE: {task.title}
        TASK DESCRIPTION: {task.description}
        
        USER SUBMISSION CONTENT:
        {submission.content}
        
        Provide a JSON response strictly exactly matching this format with no markdown wrappers:
        {{
            "score": 85,
            "feedback": "Detailed constructive feedback here...",
            "recommended_status": "Reviewed"
        }}
        """
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            
            # Extract JSON more robustly using regex
            text = response.text
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                cleaned_json = match.group(0)
            else:
                cleaned_json = text
                
            return Response({'ai_evaluation': json.loads(cleaned_json)})
        except Exception as e:
            logger.error(f"Gemini Evaluation Error: {str(e)}")
            return Response({'error': str(e)}, status=500)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from accounts.models import User
        if request.user.role == 'Admin':
            total_tasks = Task.objects.count()
            completed_tasks = Submission.objects.filter(status='Reviewed').count()
            pending_tasks = Submission.objects.filter(status='Submitted').count()
            
            # Chart Data for Admin
            total_users = User.objects.filter(role='User').count()
            
            # 1. Task Completion Data (Bar Chart)
            # How many completed each task
            task_completion_data = []
            for task in Task.objects.all().order_by('-created_at')[:5]: # Top 5 recent tasks
                # Get the number of users assigned to this task
                assigned_count = task.assigned_users.count()
                # Get the number of assigned users who completed the task
                task_completed = Submission.objects.filter(task=task, status='Reviewed', user__in=task.assigned_users.all()).count()
                # Calculate percentage based on assigned users, not all users
                task_completion_percent = round((task_completed / assigned_count * 100)) if assigned_count > 0 else 0
                task_completion_data.append({
                    'name': task.title[:15] + ('...' if len(task.title)>15 else ''),
                    'completedPercentage': task_completion_percent,
                    'usersCompleted': task_completed,
                    'totalAssigned': assigned_count
                })
                
            # 2. Submitted Task Data (Pie Chart)
            rejected_tasks = Submission.objects.filter(status='Rejected').count()
            # Calculate total expected submissions based on actual task assignments
            total_expected_submissions = sum(task.assigned_users.count() for task in Task.objects.all())
            total_actual_submissions = completed_tasks + pending_tasks + rejected_tasks
            submission_status_data = [
                {'name': 'Approved', 'value': completed_tasks, 'color': '#10b981'},
                {'name': 'Pending Review', 'value': pending_tasks, 'color': '#f59e0b'},
                {'name': 'Rejected', 'value': rejected_tasks, 'color': '#ef4444'},
                {'name': 'Not Submitted', 'value': max(0, total_expected_submissions - total_actual_submissions), 'color': '#64748b'}
            ]
            
            # 3. Assigned task data (Line Graph)
            assignment_metrics = []
            for task in Task.objects.all().order_by('created_at'):
                assignment_metrics.append({
                    'taskName': task.title[:10],
                    'assignedUsers': task.assigned_users.count()
                })
            
        else:
            # User stats
            # Get tasks assigned to this user
            assigned_tasks = Task.objects.filter(assigned_users=request.user)
            total_tasks = assigned_tasks.count()
            
            # Count completed tasks (approved submissions)
            completed_tasks = Submission.objects.filter(user=request.user, status='Reviewed').count()
            
            # Count pending tasks (submitted but not reviewed + not submitted yet)
            submitted_pending = Submission.objects.filter(user=request.user, status='Submitted').count()
            not_submitted = total_tasks - Submission.objects.filter(user=request.user).exclude(status='Pending').count()
            pending_tasks = submitted_pending + not_submitted
            
            task_completion_data = []
            submission_status_data = []
            assignment_metrics = []
            
        completion_rate = round((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
        
        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'completion_rate': completion_rate,
            'task_completion_data': task_completion_data,
            'submission_status_data': submission_status_data,
            'assignment_metrics': assignment_metrics
        })
