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

def print_header(title):
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

def query_user_registrations():
    """Query all user registration details"""
    print_header("USER REGISTRATION DETAILS")
    
    users = User.objects.all().order_by('date_joined')
    print(f"Total Registered Users: {users.count()}")
    
    print(f"\nUser Breakdown:")
    print(f"  👥 Total Users: {users.count()}")
    print(f"  🛡️  Admin Users: {users.filter(role='Admin').count()}")
    print(f"  👤 Regular Users: {users.filter(role='User').count()}")
    print(f"  ✅ Active Users: {users.filter(is_active=True).count()}")
    print(f"  📅 Today's Registrations: {users.filter(date_joined__date=timezone.now().date()).count()}")
    
    print(f"\nDetailed User Information:")
    print("-" * 80)
    
    for user in users:
        print(f"ID: {user.id}")
        print(f"Name: {user.name}")
        print(f"Email: {user.email}")
        print(f"Username: {user.username}")
        print(f"Role: {user.role}")
        print(f"Registration Date: {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Last Login: {user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else 'Never logged in'}")
        print(f"Status: {'Active' if user.is_active else 'Inactive'}")
        print(f"Permissions: {'Staff' if user.is_staff else 'Regular'} | {'Superuser' if user.is_superuser else 'Standard'}")
        
        # Additional profile information
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
    """Query all task assignment details"""
    print_header("TASK ASSIGNMENT DETAILS")
    
    tasks = Task.objects.all().prefetch_related('assigned_users', 'created_by').order_by('-created_at')
    
    print(f"Task Statistics:")
    print(f"  📋 Total Tasks: {tasks.count()}")
    print(f"  🎯 Active Tasks: {tasks.filter(deadline__gt=timezone.now()).count()}")
    print(f"  ⏰ Overdue Tasks: {tasks.filter(deadline__lt=timezone.now()).count()}")
    print(f"  👥 Tasks with Assignments: {tasks.filter(assigned_users__isnull=False).distinct().count()}")
    print(f"  📝 Tasks without Assignments: {tasks.filter(assigned_users__isnull=True).count()}")
    
    print(f"\nDetailed Task Information:")
    print("-" * 80)
    
    for task in tasks:
        deadline_status = "Active" if task.deadline > timezone.now() else "Overdue"
        deadline_color = "🟢" if deadline_status == "Active" else "🔴"
        
        print(f"Task ID: {task.id}")
        print(f"Title: {task.title}")
        print(f"Description: {task.description[:100]}{'...' if len(task.description) > 100 else ''}")
        print(f"Created By: {task.created_by.name} ({task.created_by.email}) - {task.created_by.role}")
        print(f"Created Date: {task.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Deadline: {task.deadline.strftime('%Y-%m-%d %H:%M:%S')} {deadline_color} {deadline_status}")
        
        # Show assigned users
        assigned_users = task.assigned_users.all()
        print(f"Assigned Users ({assigned_users.count()}):")
        if assigned_users:
            for user in assigned_users:
                print(f"  - {user.name} ({user.email}) - {user.role}")
        else:
            print("  - No users assigned")
            
        # Show attachments
        if hasattr(task, 'attachment') and task.attachment:
            print(f"Attachment: {task.attachment.name}")
        else:
            print("Attachment: None")
            
        print("-" * 80)

def query_task_submissions():
    """Query all task submission details"""
    print_header("TASK SUBMISSION DETAILS")
    
    submissions = Submission.objects.all().select_related('user', 'task').order_by('-submitted_at')
    
    print(f"Submission Statistics:")
    print(f"  📄 Total Submissions: {submissions.count()}")
    
    # Submissions by status
    for status_choice in Submission.STATUS_CHOICES:
        status = status_choice[0]
        count = submissions.filter(status=status).count()
        print(f"  📊 {status} Submissions: {count}")
    
    if submissions.exists():
        print(f"\nDetailed Submission Information:")
        print("-" * 80)
        
        for submission in submissions:
            print(f"Submission ID: {submission.id}")
            print(f"Task: {submission.task.title}")
            print(f"User: {submission.user.name} ({submission.user.email})")
            print(f"Status: {submission.status}")
            print(f"Submitted Date: {submission.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}")
            
            if submission.content:
                content_preview = submission.content[:150] + "..." if len(submission.content) > 150 else submission.content
                print(f"Content: {content_preview}")
            else:
                print("Content: No content provided")
                
            if hasattr(submission, 'attachment') and submission.attachment:
                print(f"Attachment: {submission.attachment.name}")
            else:
                print("Attachment: No file attached")
                
            print("-" * 80)
    else:
        print("\nNo submissions found.")

def query_completed_tasks():
    """Query completed tasks analysis"""
    print_header("COMPLETED TASKS ANALYSIS")
    
    # Tasks with submissions
    tasks_with_submissions = Task.objects.filter(submissions__isnull=False).distinct()
    tasks_without_submissions = Task.objects.filter(submissions__isnull=True)
    
    print(f"Task Completion Overview:")
    print(f"  ✅ Tasks with Submissions: {tasks_with_submissions.count()}")
    print(f"  ❌ Tasks without Submissions: {tasks_without_submissions.count()}")
    
    if tasks_with_submissions.exists():
        print(f"\nCompleted Tasks Details:")
        print("-" * 80)
        
        for task in tasks_with_submissions:
            submissions = task.submissions.all()
            print(f"Task: {task.title}")
            print(f"Created By: {task.created_by.name}")
            print(f"Deadline: {task.deadline.strftime('%Y-%m-%d %H:%M')}")
            print(f"Total Submissions: {submissions.count()}")
            
            # Submission status breakdown
            for status_choice in Submission.STATUS_CHOICES:
                status = status_choice[0]
                count = submissions.filter(status=status).count()
                if count > 0:
                    print(f"  - {status}: {count}")
            
            # Recent submissions
            recent_submissions = submissions.order_by('-submitted_at')[:3]
            if recent_submissions:
                print("Recent Submissions:")
                for sub in recent_submissions:
                    print(f"  - {sub.user.name}: {sub.status} ({sub.submitted_at.strftime('%Y-%m-%d %H:%M')})")
            
            print("-" * 80)

def query_user_statistics():
    """Query user-specific task statistics"""
    print_header("USER TASK STATISTICS")
    
    users = User.objects.filter(role='User')  # Focus on regular users
    
    for user in users:
        print(f"User: {user.name} ({user.email})")
        print(f"Registration: {user.date_joined.strftime('%Y-%m-%d')}")
        
        # Tasks assigned to this user
        assigned_tasks = Task.objects.filter(assigned_users=user)
        print(f"  📋 Assigned Tasks: {assigned_tasks.count()}")
        
        # Submissions by this user
        user_submissions = Submission.objects.filter(user=user)
        print(f"  📄 Total Submissions: {user_submissions.count()}")
        
        # Submissions by status
        for status_choice in Submission.STATUS_CHOICES:
            status = status_choice[0]
            count = user_submissions.filter(status=status).count()
            if count > 0:
                print(f"  📊 {status} Submissions: {count}")
        
        # Completion rate
        if assigned_tasks.count() > 0:
            completion_rate = (user_submissions.count() / assigned_tasks.count()) * 100
            print(f"  🎯 Submission Rate: {completion_rate:.1f}%")
        else:
            print("  🎯 Submission Rate: N/A (No assigned tasks)")
        
        # Overdue tasks (not submitted)
        submitted_task_ids = user_submissions.values_list('task_id', flat=True)
        overdue_tasks = assigned_tasks.filter(
            deadline__lt=timezone.now()
        ).exclude(id__in=submitted_task_ids)
        print(f"  ⏰ Overdue Tasks: {overdue_tasks.count()}")
        
        print("-" * 80)

def query_system_summary():
    """Query system overview"""
    print_header("SYSTEM SUMMARY")
    
    current_time = timezone.now()
    
    print(f"📊 DTMS System Overview (Generated: {current_time.strftime('%Y-%m-%d %H:%M:%S')})")
    print(f"")
    
    # User statistics
    total_users = User.objects.count()
    admin_users = User.objects.filter(role='Admin').count()
    regular_users = User.objects.filter(role='User').count()
    active_users = User.objects.filter(is_active=True).count()
    
    print(f"👥 USER STATISTICS:")
    print(f"   Total Users: {total_users}")
    print(f"   Admin Users: {admin_users}")
    print(f"   Regular Users: {regular_users}")
    print(f"   Active Users: {active_users}")
    
    # Task statistics
    total_tasks = Task.objects.count()
    active_tasks = Task.objects.filter(deadline__gt=current_time).count()
    overdue_tasks = Task.objects.filter(deadline__lt=current_time).count()
    assigned_tasks = Task.objects.filter(assigned_users__isnull=False).distinct().count()
    
    print(f"\n📋 TASK STATISTICS:")
    print(f"   Total Tasks: {total_tasks}")
    print(f"   Active Tasks: {active_tasks}")
    print(f"   Overdue Tasks: {overdue_tasks}")
    print(f"   Assigned Tasks: {assigned_tasks}")
    
    # Submission statistics
    total_submissions = Submission.objects.count()
    print(f"\n📄 SUBMISSION STATISTICS:")
    print(f"   Total Submissions: {total_submissions}")
    
    for status_choice in Submission.STATUS_CHOICES:
        status = status_choice[0]
        count = Submission.objects.filter(status=status).count()
        print(f"   {status} Submissions: {count}")
    
    # Recent activity
    today = current_time.date()
    recent_registrations = User.objects.filter(date_joined__date=today).count()
    recent_tasks = Task.objects.filter(created_at__date=today).count()
    recent_submissions = Submission.objects.filter(submitted_at__date=today).count()
    
    print(f"\n📅 TODAY'S ACTIVITY:")
    print(f"   New Registrations: {recent_registrations}")
    print(f"   New Tasks Created: {recent_tasks}")
    print(f"   New Submissions: {recent_submissions}")

def run_all_queries():
    """Run all database queries"""
    print("🎯 DTMS COMPREHENSIVE DATABASE ANALYSIS")
    print(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    query_system_summary()
    query_user_registrations()
    query_task_assignments()
    query_task_submissions()
    query_completed_tasks()
    query_user_statistics()
    
    print("\n" + "="*60)
    print(" ✅ ANALYSIS COMPLETE")
    print("="*60)

if __name__ == '__main__':
    run_all_queries()