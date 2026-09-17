import os
from pathlib import Path

def setup_gmail_smtp():
    """Interactive Gmail SMTP setup"""
    print("="*60)
    print(" GMAIL SMTP SETUP FOR DTMS")
    print("="*60)
    
    print("\n📧 This will configure Gmail to send real emails to users")
    print("   when tasks are assigned in DTMS")
    
    print("\n📋 Prerequisites:")
    print("   1. Gmail account with 2-Factor Authentication enabled")
    print("   2. Gmail App Password (16 characters)")
    
    print("\n🔗 Don't have an App Password?")
    print("   1. Go to: https://myaccount.google.com/security")
    print("   2. Enable 2-Step Verification")
    print("   3. Go to App passwords")
    print("   4. Generate password for 'Mail'")
    print("   5. Copy the 16-character password")
    
    proceed = input("\nDo you have a Gmail App Password ready? (y/n): ").strip().lower()
    
    if proceed != 'y':
        print("\n📖 Please follow the setup guide in GMAIL_SMTP_SETUP.md")
        print("   Then run this script again")
        return
    
    print("\n" + "-"*60)
    gmail_address = input("Enter your Gmail address: ").strip()
    
    if not gmail_address or '@gmail.com' not in gmail_address:
        print("❌ Please provide a valid Gmail address")
        return
    
    print("\n💡 Tip: The App Password is 16 characters (usually shown with spaces)")
    print("   Example: abcd efgh ijkl mnop")
    app_password = input("Enter your Gmail App Password: ").strip()
    
    if not app_password:
        print("❌ App Password is required")
        return
    
    # Remove spaces from app password
    app_password = app_password.replace(" ", "")
    
    if len(app_password) < 16:
        print(f"⚠️  Warning: App Password seems short ({len(app_password)} characters)")
        print("   App Passwords are usually 16 characters")
        confirm = input("Continue anyway? (y/n): ").strip().lower()
        if confirm != 'y':
            return
    
    # Update .env file
    env_path = Path('.env')
    
    if not env_path.exists():
        print("❌ .env file not found!")
        return
    
    with open(env_path, 'r') as f:
        content = f.read()
    
    # Update email configuration
    lines = content.split('\n')
    updated_lines = []
    
    for line in lines:
        if line.startswith('EMAIL_BACKEND='):
            updated_lines.append('EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend')
        elif line.startswith('EMAIL_HOST_USER='):
            updated_lines.append(f'EMAIL_HOST_USER={gmail_address}')
        elif line.startswith('EMAIL_HOST_PASSWORD='):
            updated_lines.append(f'EMAIL_HOST_PASSWORD={app_password}')
        elif line.startswith('DEFAULT_FROM_EMAIL='):
            updated_lines.append(f'DEFAULT_FROM_EMAIL="DTMS Notifications <{gmail_address}>"')
        else:
            updated_lines.append(line)
    
    # Write updated configuration
    with open(env_path, 'w') as f:
        f.write('\n'.join(updated_lines))
    
    print("\n✅ Gmail SMTP configuration updated!")
    print(f"   Email Account: {gmail_address}")
    print(f"   Password Length: {len(app_password)} characters")
    
    # Test the configuration
    print("\n🧪 Testing email configuration...")
    
    try:
        import django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
        django.setup()
        
        from django.core.mail import send_mail
        from django.conf import settings
        
        # Force reload settings
        from importlib import reload
        from django.conf import settings as django_settings
        reload(django_settings)
        
        send_mail(
            subject='🎯 DTMS Setup Test',
            message='''Congratulations! Your DTMS email system is configured correctly.

This test email confirms that:
✅ Gmail SMTP is working
✅ App Password is valid
✅ Email notifications are ready

When admins assign tasks to users, they will now receive real email notifications in their Gmail inbox.

Best regards,
DTMS System''',
            from_email=f'DTMS Notifications <{gmail_address}>',
            recipient_list=[gmail_address],
            fail_silently=False,
        )
        
        print("✅ Test email sent successfully!")
        print(f"📧 Check your Gmail inbox: {gmail_address}")
        print("   (Email should arrive within a few seconds)")
        
    except Exception as e:
        print(f"\n❌ Test email failed: {e}")
        print("\n🔧 Possible issues:")
        print("   - App Password might be incorrect")
        print("   - 2FA not enabled on Gmail")
        print("   - Less secure app access blocked")
        print("\n💡 Try:")
        print("   1. Generate a new App Password")
        print("   2. Run this script again")
        return
    
    print("\n" + "="*60)
    print(" ✅ GMAIL SMTP SETUP COMPLETE")
    print("="*60)
    
    print("\n🚀 Next Steps:")
    print("   1. Restart Django server: python manage.py runserver")
    print("   2. Login as admin in DTMS dashboard")
    print("   3. Create and assign a task to a user")
    print("   4. User will receive email notification in Gmail!")
    
    print("\n📧 What users will receive:")
    print("   - Professional email with DTMS branding")
    print("   - Complete task description")
    print("   - Deadline information")
    print("   - Link to dashboard")
    print("   - Any attached files")

if __name__ == '__main__':
    setup_gmail_smtp()