import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User
from tasks.models import Task  
from tasks.views import send_task_notification
from datetime import datetime, timedelta

def demo_task_assignment_email():
    """Demonstrate the complete task assignment email workflow"""
    
    print('🎯 DTMS Task Assignment Email Demo')
    print('='*50)
    
    # Show system status
    print('\n👥 System Users:')
    for user in User.objects.all():
        role_icon = '🛡️' if user.role == 'Admin' else '👤'
        print(f'  {role_icon} {user.name} ({user.email}) - {user.role}')
    
    print(f'\n📊 Current System Status:')
    print(f'  Users: {User.objects.count()}')
    print(f'  Tasks: {Task.objects.count()}')
    print(f'  Admins: {User.objects.filter(role="Admin").count()}')
    
    # Get admin and user for demo
    admin = User.objects.filter(role='Admin').first()
    regular_user = User.objects.filter(role='User').first()
    
    if not admin or not regular_user:
        print('❌ Need both admin and regular users for demo')
        return
    
    print(f'\n📧 Email System Demo:')
    print(f'  Admin: {admin.name} ({admin.email})')
    print(f'  User: {regular_user.name} ({regular_user.email})')
    
    # Create a sample task
    print('\n📝 Creating Sample Task...')
    demo_task = Task.objects.create(
        title='Email Demo Task - Full Stack Development',
        description="""Develop a complete full-stack web application using Django and React.

🎯 OBJECTIVES:
- Create a responsive user interface using React and Tailwind CSS
- Implement secure user authentication and authorization
- Design and implement RESTful API endpoints
- Set up proper database relationships and migrations
- Implement file upload functionality
- Add comprehensive error handling

📋 DELIVERABLES:
- Complete React frontend with modern UI/UX
- Django backend with REST API
- Database schema and migrations
- User authentication system
- File upload/download features
- Documentation and deployment guide
- Unit tests for critical components

⚡ TECHNICAL REQUIREMENTS:
- Use Django 4.2+ for backend
- Use React 19+ for frontend  
- Implement JWT authentication
- Use PostgreSQL for production
- Follow REST API best practices
- Ensure mobile responsiveness
- Include proper error handling

📞 SUPPORT:
Contact your project administrator if you need clarification on any requirements.

Good luck with your development work!""",
        deadline=datetime.now() + timedelta(days=10),
        created_by=admin
    )
    
    # Assign task to user
    demo_task.assigned_users.add(regular_user)
    
    print(f'✅ Task Created: "{demo_task.title}"')
    print(f'📅 Deadline: {demo_task.deadline.strftime("%B %d, %Y at %I:%M %p")}')
    print(f'👤 Assigned to: {regular_user.name}')
    
    # Send email notification
    print('\n📬 Sending Email Notification...')
    print('-' * 50)
    
    try:
        send_task_notification(demo_task, [regular_user])
        print('✅ Email sent successfully!')
        print('\n💡 Email content displayed above (console mode)')
        print('🔧 To send real emails, configure Gmail SMTP using:')
        print('   python configure_email_smtp.py')
        
    except Exception as e:
        print(f'❌ Email failed: {e}')
    
    print('\n' + '='*50)
    print('Demo Complete!')
    print('\n🚀 How to use in production:')
    print('1. Admin logs in to DTMS dashboard')
    print('2. Creates a new task with title, description, deadline')
    print('3. Assigns task to one or more users')
    print('4. Email is automatically sent to assigned users')
    print('5. Users receive professional email with all task details')

if __name__ == '__main__':
    demo_task_assignment_email()