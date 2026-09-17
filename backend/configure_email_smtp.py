#!/usr/bin/env python3
"""
DTMS Email Configuration Script
This script helps you set up email notifications for task assignments
"""

import os
import sys
from pathlib import Path

def update_env_file(email_config):
    """Update the .env file with email configuration"""
    env_path = Path('.env')
    
    if not env_path.exists():
        print("❌ .env file not found!")
        return False
    
    # Read current content
    with open(env_path, 'r') as f:
        content = f.read()
    
    # Update email configuration
    lines = content.split('\n')
    updated_lines = []
    
    for line in lines:
        if line.startswith('EMAIL_BACKEND='):
            updated_lines.append(f"EMAIL_BACKEND={email_config['backend']}")
        elif line.startswith('EMAIL_HOST_USER='):
            updated_lines.append(f"EMAIL_HOST_USER={email_config['user']}")
        elif line.startswith('EMAIL_HOST_PASSWORD='):
            updated_lines.append(f"EMAIL_HOST_PASSWORD={email_config['password']}")
        elif line.startswith('DEFAULT_FROM_EMAIL='):
            updated_lines.append(f'DEFAULT_FROM_EMAIL="DTMS Notifications <{email_config["user"]}>"')
        else:
            updated_lines.append(line)
    
    # Write updated content
    with open(env_path, 'w') as f:
        f.write('\n'.join(updated_lines))
    
    print("✅ .env file updated successfully!")
    return True

def setup_console_email():
    """Set up console email backend for testing"""
    print("\n=== Setting up Console Email (Testing Mode) ===")
    
    config = {
        'backend': 'django.core.mail.backends.console.EmailBackend',
        'user': 'test@example.com',
        'password': 'not-needed-for-console'
    }
    
    if update_env_file(config):
        print("✅ Console email configured!")
        print("📧 Emails will be displayed in the Django console")
        print("💡 This is perfect for testing task assignments")
        return True
    return False

def setup_gmail_smtp():
    """Set up Gmail SMTP for real email sending"""
    print("\n=== Setting up Gmail SMTP (Production Mode) ===")
    print("📋 You'll need:")
    print("1. A Gmail account with 2-Factor Authentication enabled")
    print("2. An App Password generated from Gmail Security settings")
    
    gmail_user = input("\nEnter your Gmail address: ").strip()
    if not gmail_user or '@gmail.com' not in gmail_user:
        print("❌ Please provide a valid Gmail address")
        return False
    
    app_password = input("Enter your 16-character App Password (from Gmail): ").strip()
    if not app_password or len(app_password) < 16:
        print("❌ App Password should be 16 characters")
        print("💡 Generate one at: https://myaccount.google.com/security")
        return False
    
    config = {
        'backend': 'django.core.mail.backends.smtp.EmailBackend',
        'user': gmail_user,
        'password': app_password
    }
    
    if update_env_file(config):
        print("✅ Gmail SMTP configured!")
        print("📧 Real emails will be sent to users")
        return True
    return False

def test_email_system():
    """Test the current email configuration"""
    print("\n=== Testing Email System ===")
    
    try:
        import django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
        django.setup()
        
        from django.core.mail import send_mail
        from django.conf import settings
        
        print(f"Current backend: {settings.EMAIL_BACKEND}")
        print(f"Email user: {settings.EMAIL_HOST_USER}")
        
        # Send test email
        send_mail(
            subject='DTMS Email System Test',
            message='This is a test email from DTMS. If you receive this, email is working!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],
            fail_silently=False,
        )
        
        print("✅ Test email sent successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Email test failed: {e}")
        return False

def create_email_guide():
    """Create a guide for email setup"""
    guide = """
# DTMS Email Setup Guide

## For Testing (Console Output)
Run: python configure_email_smtp.py
Choose option 1 for console output

## For Production (Real Emails)
1. Enable 2-Factor Authentication on Gmail:
   - Go to myaccount.google.com
   - Security > 2-Step Verification
   
2. Generate App Password:
   - Go to Security > App passwords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
   
3. Run: python configure_email_smtp.py
   Choose option 2 and enter your credentials

## Test Email System
After setup, test with:
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Hello', 'from@example.com', ['to@example.com'])

## Automatic Task Assignment Emails
When an admin creates and assigns a task:
1. Email is automatically sent to assigned users
2. Contains task title, description, deadline
3. Includes any attachments
4. Professional HTML formatting
"""
    
    with open('EMAIL_SETUP_GUIDE.md', 'w') as f:
        f.write(guide)
    
    print("📝 Email setup guide saved to EMAIL_SETUP_GUIDE.md")

def main():
    """Main configuration menu"""
    print("🎯 DTMS Email Configuration Tool")
    print("="*40)
    
    print("\nChoose email configuration:")
    print("1. Console Email (Testing - shows emails in terminal)")
    print("2. Gmail SMTP (Production - sends real emails)")
    print("3. Test current configuration")
    print("4. Create setup guide")
    print("5. Exit")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    if choice == '1':
        setup_console_email()
    elif choice == '2':
        setup_gmail_smtp()
    elif choice == '3':
        test_email_system()
    elif choice == '4':
        create_email_guide()
    elif choice == '5':
        print("👋 Goodbye!")
        sys.exit(0)
    else:
        print("❌ Invalid choice")
        return
    
    # Ask if they want to restart Django
    restart = input("\n🔄 Restart Django server to apply changes? (y/n): ").strip().lower()
    if restart == 'y':
        print("💡 Please restart your Django server:")
        print("   Ctrl+C to stop, then: python manage.py runserver")

if __name__ == '__main__':
    main()