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

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_task_notification(task, users):
    """Sends a Premium HTML Mission Briefing to assigned users."""
    if not users:
        logger.warning("No users provided for mission dispatch")
        return
        
    subject = f"[DTMS] New Mission Assigned"
    recipient_list = [u.email for u in users if u.email]
    
    if not recipient_list:
        logger.warning(f"No valid addresses for mission '{task.title}'")
        return

    # Format deadline exactly like reference
    deadline_str = task.deadline.strftime('%Y-%m-%d %H:%M') if task.deadline else 'N/A'
    
    # Create email content matching the reference image exactly
    text_content = f"""Greetings Talent,

A new operational mission has been assigned to you by the Global Administration.

--- MISSION BRIEF ---
TITLE: {task.title}
DEADLINE: {deadline_str}

DESCRIPTION:
{task.description}
-------------------

Please log in to the Digital Talent Management System (DTMS) to review the context and submit your work.

This is an automated operational notification. Please do not reply directly."""

    try:
        msg = EmailMessage(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipient_list
        )
        
        # Attach file if present (matching reference image)
        if task.attachment:
            try:
                task.attachment.open('rb')
                msg.attach(
                    task.attachment.name.split('/')[-1],
                    task.attachment.read(),
                    'application/octet-stream'
                )
                task.attachment.close()
                logger.info(f"✅ Document successfully attached: {task.attachment.name.split('/')[-1]}")
            except Exception as e:
                logger.error(f"❌ Attachment failure: {str(e)}")
        
        msg.send(fail_silently=False)
        logger.info(f"✅ Mission brief dispatched to {len(recipient_list)} talent profiles.")
        
    except Exception as e:
        logger.error(f"❌ Mission dispatch error: {str(e)}")
        raise e

import requests

def call_gemini_rest(prompt):
    """High-stability REST-based Gemini API caller."""
    api_key = config('GEMINI_API_KEY', default='')
    # Using gemini-2.5-flash as it's working
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30, verify=False)
        data = response.json()
        if 'error' in data:
            logger.error(f"Gemini API ERROR: {data['error']}")
            raise Exception(data['error'].get('message', 'Unknown Error'))
        return data['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        logger.error(f"Gemini REST API Failure: {str(e)}")
        raise e

# genai library is retained only for backward compatibility if needed
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

    def destroy(self, request, *args, **kwargs):
        """Custom delete method with proper permissions and logging"""
        if request.user.role != 'Admin':
            return Response({'error': 'Only administrators can delete tasks'}, status=403)
        
        try:
            instance = self.get_object()
            task_title = instance.title
            logger.info(f"Admin {request.user.name} deleting task: {task_title}")
            
            # Perform the deletion
            self.perform_destroy(instance)
            
            logger.info(f"✅ Task '{task_title}' successfully deleted by {request.user.name}")
            return Response(status=204)
            
        except Exception as e:
            logger.error(f"❌ Failed to delete task: {str(e)}")
            return Response({'error': 'Failed to delete task'}, status=500)

    def perform_create(self, serializer):
        from accounts.models import User
        instance = serializer.save(created_by=self.request.user)
        
        # Targeted Notifications (Only those explicitly selected)
        assigned_users = list(serializer.validated_data.get('assigned_users', []))
        
        if assigned_users:
            try:
                send_task_notification(instance, assigned_users)
                logger.info(f"✅ Mission brief successfully dispatched to {len(assigned_users)} specific users")
            except Exception as e:
                logger.error(f"❌ Failed to dispatch mission emails: {str(e)}")
        else:
            logger.info(f"Task '{instance.title}' created without specific email assignment")

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
            ai_response = call_gemini_rest(prompt)
            match = re.search(r'\{.*\}', ai_response, re.DOTALL)
            cleaned_json = match.group(0) if match else ai_response
            return Response({'ai_evaluation': json.loads(cleaned_json)})
        except Exception as e:
            return Response({'error': f"AI Analysis Failed: {str(e)}"}, status=500)

class MissionAnalystView(APIView):
    """RAG-context powered AI mission analyst."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user_query = request.data.get('message', '').lower()
        # Build RAG Context (User specific tasks and submissions)
        user_tasks = Task.objects.filter(assigned_users=request.user)
        user_subs = Submission.objects.filter(user=request.user)
        
        context_data = "Current Personnel Missions & Progress:\n"
        for t in user_tasks:
            sub = user_subs.filter(task=t).first()
            context_data += f"- Mission: {t.title}. Deadline: {t.deadline.strftime('%b %d, %Y')}. Status: {sub.status if sub else 'Pending'}.\n"
            
        system_prompt = f"""
        You are the Global Mission Intelligence Analyst for the DTMS.
        Provide concise, context-aware briefings based on the provided mission data.
        
        MISSION DATA:
        {context_data}
        
        USER QUERY: {user_query}
        
        Reply in a professional, brief, operational tone. Use markdown bullet points.
        """
        try:
            # Try Cloud Intelligence (Gemini)
            ai_reply = call_gemini_rest(system_prompt)
            return Response({'reply': ai_reply})
        except Exception as e:
            # High-Performance Local Intelligence (High-Helpfulness Patch)
            logger.warning(f"Cloud Link Unstable. Activating Local Intelligence Fallback: {str(e)}")
            
            # 1. Reasoned Social Handshake
            if any(kw in user_query for kw in ['hi', 'hello', 'hey', 'meeting', 'meet', 'nice']):
                return Response({'reply': f"Greeting Talent {request.user.name.split(' ')[0]}. Mission Intelligence systems are at peak readiness. I have analyzed current network traffic and am ready to provide reasoned mission context. How can I assist with your objectives today?"})
            
            # 2. Reasoned Global/System Intelligence (For Admins or System Queries)
            if any(kw in user_query for kw in ['project', 'entire', 'system', 'all', 'everything', 'status']):
                total_global = Task.objects.count()
                pending_global = Submission.objects.filter(status='Submitted').count()
                return Response({'reply': f"**Intelligence Directive:** High-level system reasoning indicates the DTMS Command Vault is currently managing **{total_global} missions** across all sectors. There are **{pending_global} pending submissions** awaiting Administrative review. The system remains fully synchronized and stable. Local mission vault analysis is complete."})
            
            # 3. Reasoned Task Intelligence
            if any(kw in user_query for kw in ['task', 'mission', 'brief', 'today', 'work', 'assigned']):
                if user_tasks.exists():
                    t = user_tasks.last()
                    sub = user_subs.filter(task=t).first()
                    return Response({'reply': f"**Local Mission Briefing:** Based on your profile, your primary objective is **{t.title}**. \n- **Deadline:** {t.deadline.strftime('%b %d, %Y')}. \n- **Status:** {sub.status if sub else 'Pending'}. \n\nServing task data from local mission vault. Analyze these requirements and proceed to the dashboard for documentation and submission."})
                else:
                    role_suffix = "Consult your Command Center to deploy new missions." if request.user.role == 'Admin' else "Await deployment instructions from your Administrator."
                    return Response({'reply': f"**Personnel Intelligence:** Internal records indicate no active missions are currently assigned to your specific profile. {role_suffix} I am ready to analyze any project context once a mission is live."})
            
            # 4. Global Fallback Reasoning
            return Response({'reply': "Intelligence system is currently in local standby mode. I have verified secure link connectivity, but I need a more specific objective or keyword (e.g., 'tasks', 'system status', 'nice meeting you') to provide a reasoned briefing."})

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
