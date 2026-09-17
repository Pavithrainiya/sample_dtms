import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def test_email_configuration():
    """Test email configuration and send a test email"""
    print("=== DTMS Email Configuration Test ===")
    
    print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    
    # Test sending email
    try:
        print("\n--- Sending Test Email ---")
        send_mail(
            subject='DTMS Email Configuration Test',
            message='''This is a test email from DTMS (Digital Talent Management System).

If you receive this email, the SMTP configuration is working correctly.

Test Details:
- System: DTMS Task Assignment System
- Purpose: Email notification verification
- Time: Automated test

Best regards,
DTMS System''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],  # Send test to self
            fail_silently=False,
        )
        print("✅ Test email sent successfully!")
        print(f"Check your inbox at: {settings.EMAIL_HOST_USER}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send test email: {e}")
        print("\n--- Troubleshooting Tips ---")
        print("1. Make sure you have enabled 2-Factor Authentication on Gmail")
        print("2. Generate an App Password in Gmail Security settings")
        print("3. Use the App Password (16 characters) as EMAIL_HOST_PASSWORD")
        print("4. Check your Gmail security settings")
        return False

def create_proper_env_file():
    """Create a properly configured .env file"""
    print("\n=== Creating Email Configuration Guide ===")
    
    env_template = '''# DTMS Environment Configuration

# Database (SQLite for development)
DATABASE_URL=sqlite:///db.sqlite3

# AI Intelligence Configuration
GEMINI_API_KEY=

# Email Configuration (Gmail SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-gmail-address@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-app-password
DEFAULT_FROM_EMAIL="DTMS Notifications <your-gmail-address@gmail.com>"

# System Security
SECRET_KEY=django-insecure-development-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,testserver
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
'''
    
    print("To set up email notifications:")
    print("1. Go to your Google Account (myaccount.google.com)")
    print("2. Navigate to Security > 2-Step Verification")
    print("3. Enable 2-Step Verification if not already enabled")
    print("4. Go to Security > App passwords")
    print("5. Generate a new App password for 'Mail'")
    print("6. Update your .env file with the following template:")
    print("\n" + "="*50)
    print(env_template)
    print("="*50)
    
    return env_template

def simulate_task_assignment_email():
    """Simulate sending task assignment email"""
    print("\n=== Testing Task Assignment Email ===")
    
    from accounts.models import User
    from tasks.models import Task
    from tasks.views import send_task_notification
    
    try:
        # Get a user and task for testing
        users = User.objects.filter(role='User')
        if not users.exists():
            print("❌ No users found for testing")
            return False
            
        tasks = Task.objects.all()
        if not tasks.exists():
            print("❌ No tasks found for testing")
            return False
            
        test_user = users.first()
        test_task = tasks.first()
        
        print(f"Testing email to: {test_user.email}")
        print(f"For task: {test_task.title}")
        
        # Send test email
        send_task_notification(test_task, [test_user])
        print("✅ Task assignment email sent successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send task assignment email: {e}")
        return False

if __name__ == '__main__':
    print("DTMS Email Setup and Testing Tool")
    print("="*40)
    
    # Test current configuration
    if test_email_configuration():
        print("\n--- Email is working! Testing task assignment email ---")
        simulate_task_assignment_email()
    else:
        print("\n--- Setting up email configuration ---")
        create_proper_env_file()
        
    print("\n" + "="*40)
    print("Email setup complete!")