import os
import django
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User
from tasks.models import Task, Submission
from django.db.models import Count, Q
from django.utils import timezone

def print_separator(title):
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)

def query_user_registration_details():
    """Query all user registration details"""
    print_separator("USER REGISTRATION DETAILS")
    
    users = User.objects.all().order_by('date_joined')
    print(f"Total Registered Users: {users.count()}")
    print("\nUser Details:")
    print("-" * 80)
    
    for user in users:
        print(f"ID: {user.id}")
        print(f"Name: {user.name}")
        print(f"Email: {user.email}")
        print(f"Username: {user.username}")
        print(f"Role: {user.role}")
        print(f"Registration Date: {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Last Login: {user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else 'Never'}")
        print(f"Active: {user.is_active}")
        print(f"Staff: {user.is_staff}")
        print(f"Superuser: {user.is_superuser}")
        
        # Additional fields if they exist
        if hasattr(user, 'bio') and user.bio:
            print(f"Bio: {user.bio}")
        if hasattr(user, 'skills') and user.skills:
            print(f"Skills: {user.skills}")
        if hasattr(user, 'experience') and user.experience:
            print(f"Experience: {user.experience}")
        if hasattr(user, 'phone_number') and user.phone_number:
            print(f"Phone: {user.phone_number}")
        if hasattr(user, 'country') and user.country:
            print(f"Country: {user.country}")
            
        print("-" * 80)

def query_task_assignments():
    """Query all task assignments"""
    print_separator("TASK ASSIGNMENT DETAILS")
    
    tasks = Task.objects.all().prefetch_related('assigned_users', 'created_by')
    print(f"Total Tasks: {tasks.count()}")
    print("\nTask Assignment Details:")
    print("-" * 80)
    
    for task in tasks:
        print(f"Task ID: {task.id}")
        print(f"Title: {task.title}")
        print(f"Description: {task.description[:100]}{'...' if len(task.description) > 100 else ''}")
        print(f"Created By: {task.created_by.name} ({task.created_by.email})")
        print(f"Created Date: {task.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Deadline: {task.deadline.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Status: {'Active' if task.deadline > timezone.now() else 'Overdue'}")
        
        # Show assigned users
        assigned_users = task.assigned_users.all()
        print(f"Assigned Users ({assigned_users.count()}):")
        if assigned_users:
            for user in assigned_users:
                print(f"  - {user.name} ({user.email}) - {user.role}")
        else:
            print("  - No users assigned")
            
        # Show attachment if exists
        if hasattr(task, 'attachment') and task.attachment:
            print(f"Attachment: {task.attachment}")
            
        print("-" * 80)

def query_task_submissions():
    """Query all task submissions"""
    print_separator("TASK SUBMISSION DETAILS")
    
    submissions = Submission.objects.all().select_related('user', 'task').order_by('-submitted_at')
    print(f"Total Submissions: {submissions.count()}")
    print("\nSubmission Details:")
    print("-" * 80)
    
    for submission in submissions:
        print(f"Submission ID: {submission.id}")
        print(f"Task: {submission.task.title}")
        print(f"User: {submission.user.name} ({submission.user.email})")
        print(f"Status: {submission.status}")
        print(f"Submitted Date: {submission.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Updated Date: {submission.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Show submission content
        if submission.content:
            content_preview = submission.content[:150] + "..." if len(submission.content) > 150 else submission.content
            print(f"Content: {content_preview}")
        else:
            print("Content: No content provided")
            
        # Show attachment if exists
        if hasattr(submission, 'attachment') and submission.attachment:
            print(f"Attachment: {submission.attachment}")
        else:
            print("Attachment: No file attached")
            
        # Show AI evaluation if exists
        if hasattr(submission, 'ai_feedback') and submission.ai_feedback:
            print(f"AI Feedback: {submission.ai_feedback}")
        if hasattr(submission, 'ai_score') and submission.ai_score:
            print(f"AI Score: {submission.ai_score}")
            
        print("-" * 80)

def query_completed_tasks():
    """Query completed tasks (tasks with submissions)"""
    print_separator("COMPLETED TASKS ANALYSIS")
    
    # Tasks with at least one submission
    tasks_with_submissions = Task.objects.filter(
        submission__isnull=False
    ).distinct().prefetch_related('submission_set__user')
    
    print(f"Tasks with Submissions: {tasks_with_submissions.count()}")
    print(f"Tasks without Submissions: {Task.objects.filter(submission__isnull=True).count()}")
    
    print("\nCompleted Task Details:")
    print("-" * 80)
    
    for task in tasks_with_submissions:
        submissions = task.submission_set.all()
        print(f"Task: {task.title}")
        print(f"Total Submissions: {submissions.count()}")
        print(f"Submission Statuses:")
        
        # Count submissions by status
        status_counts = submissions.values('status').annotate(count=Count('status'))
        for status_info in status_counts:
            print(f"  - {status_info['status']}: {status_info['count']}")
            
        # Show latest submissions
        latest_submissions = submissions.order_by('-submitted_at')[:3]
        print("Recent Submissions:")
        for sub in latest_submissions:
            print(f"  - {sub.user.name}: {sub.status} ({sub.submitted_at.strftime('%Y-%m-%d %H:%M')})")
            
        print("-" * 80)

def query_user_task_statistics():
    """Query statistics for each user"""
    print_separator("USER TASK STATISTICS")
    
    users = User.objects.filter(role='User')  # Focus on regular users
    
    for user in users:
        print(f"User: {user.name} ({user.email})")
        
        # Tasks assigned to this user
        assigned_tasks = Task.objects.filter(assigned_users=user)
        print(f"  Assigned Tasks: {assigned_tasks.count()}")
        
        # Submissions by this user
        user_submissions = Submission.objects.filter(user=user)
        print(f"  Total Submissions: {user_submissions.count()}")
        
        # Submissions by status
        for status in ['Pending', 'Submitted', 'Reviewed']:
            count = user_submissions.filter(status=status).count()
            print(f"  {status} Submissions: {count}")
            
        # Completion rate
        if assigned_tasks.count() > 0:
            completion_rate = (user_submissions.count() / assigned_tasks.count()) * 100
            print(f"  Completion Rate: {completion_rate:.1f}%")
        else:
            print("  Completion Rate: N/A (No assigned tasks)")
            
        # Overdue tasks
        overdue_tasks = assigned_tasks.filter(
            deadline__lt=timezone.now()
        ).exclude(
            id__in=user_submissions.values_list('task_id', flat=True)
        )
        print(f"  Overdue Tasks: {overdue_tasks.count()}")
        
        print("-" * 80)

def query_system_overview():
    """Query system overview statistics"""
    print_separator("SYSTEM OVERVIEW")
    
    print("SYSTEM STATISTICS:")
    print(f"  Total Users: {User.objects.count()}")
    print(f"  Admin Users: {User.objects.filter(role='Admin').count()}")
    print(f"  Regular Users: {User.objects.filter(role='User').count()}")
    print(f"  Active Users: {User.objects.filter(is_active=True).count()}")
    
    print(f"\n  Total Tasks: {Task.objects.count()}")
    print(f"  Tasks with Assignments: {Task.objects.filter(assigned_users__isnull=False).distinct().count()}")
    print(f"  Tasks without Assignments: {Task.objects.filter(assigned_users__isnull=True).count()}")
    
    # Current date for overdue calculation
    now = timezone.now()
    overdue_tasks = Task.objects.filter(deadline__lt=now)
    active_tasks = Task.objects.filter(deadline__gte=now)
    
    print(f"  Active Tasks: {active_tasks.count()}")
    print(f"  Overdue Tasks: {overdue_tasks.count()}")
    
    print(f"\n  Total Submissions: {Submission.objects.count()}")
    
    # Submissions by status
    for status in ['Pending', 'Submitted', 'Reviewed']:
        count = Submission.objects.filter(status=status).count()
        print(f"  {status} Submissions: {count}")
    
    # Recent activity
    recent_registrations = User.objects.filter(
        date_joined__gte=timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    ).count()
    print(f"\n  Today's Registrations: {recent_registrations}")
    
    recent_submissions = Submission.objects.filter(
        submitted_at__gte=timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    ).count()
    print(f"  Today's Submissions: {recent_submissions}")

def run_all_queries():
    """Run all queries"""
    print("DTMS COMPREHENSIVE DATABASE ANALYSIS")
    print(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    query_system_overview()
    query_user_registration_details()
    query_task_assignments()
    query_task_submissions()
    query_completed_tasks()
    query_user_task_statistics()
    
    print("\n" + "=" * 60)
    print(" ANALYSIS COMPLETE")
    print("=" * 60)

if __name__ == '__main__':
    run_all_queries()