#!/usr/bin/env python
"""
Setup working email system for DTMS
This script will help you configure email notifications properly
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_email_providers():
    """Test different email providers to find one that works"""
    
    print("🔧 Testing Email Providers for DTMS...")
    print("=" * 50)
    
    # Test configurations
    providers = [
        {
            'name': 'Gmail (Current)',
            'host': 'smtp.gmail.com',
            'port': 587,
            'user': 'pavijeevi56@gmail.com',
            'password': 'tozahdwzwyaewuyv'
        },
        {
            'name': 'Gmail Alternative Port',
            'host': 'smtp.gmail.com', 
            'port': 465,
            'user': 'pavijeevi56@gmail.com',
            'password': 'tozahdwzwyaewuyv',
            'use_ssl': True
        }
    ]
    
    working_config = None
    
    for config in providers:
        print(f"\n🧪 Testing {config['name']}...")
        try:
            if config.get('use_ssl'):
                server = smtplib.SMTP_SSL(config['host'], config['port'], timeout=10)
            else:
                server = smtplib.SMTP(config['host'], config['port'], timeout=10)
                server.starttls()
            
            server.login(config['user'], config['password'])
            print(f"✅ {config['name']} - Connection successful!")
            
            # Send test email
            msg = MIMEMultipart()
            msg['From'] = config['user']
            msg['To'] = config['user']
            msg['Subject'] = "[DTMS] Email Test - SUCCESS!"
            
            body = f"""
🎉 Email Configuration Working!

Provider: {config['name']}
Host: {config['host']}
Port: {config['port']}

Your DTMS system can now send task notifications!

- DTMS Email System
"""
            msg.attach(MIMEText(body, 'plain'))
            server.send_message(msg)
            server.quit()
            
            print(f"✅ Test email sent successfully!")
            working_config = config
            break
            
        except Exception as e:
            print(f"❌ {config['name']} failed: {str(e)}")
            continue
    
    if working_config:
        print(f"\n🎯 Working Configuration Found: {working_config['name']}")
        print("=" * 50)
        
        # Update .env file
        env_content = f"""# DTMS Security Configuration
# AI Intelligence Configuration
GEMINI_API_KEY=AIzaSyDOklM9V76uQiRi3l2p05dUDoaHdRpXo_s

# Working Email Configuration - {working_config['name']}
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST={working_config['host']}
EMAIL_PORT={working_config['port']}
EMAIL_USE_TLS={'False' if working_config.get('use_ssl') else 'True'}
EMAIL_USE_SSL={'True' if working_config.get('use_ssl') else 'False'}
EMAIL_HOST_USER={working_config['user']}
EMAIL_HOST_PASSWORD={working_config['password']}
DEFAULT_FROM_EMAIL="DTMS Notifications <{working_config['user']}>"

# System Security
SECRET_KEY=django-insecure-mission-critical-dtms-system-vault-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
"""
        
        with open('.env', 'w') as f:
            f.write(env_content)
        
        print("✅ .env file updated with working configuration")
        print("🔄 Please restart your Django server")
        print("📧 Email notifications will now work!")
        
    else:
        print("\n❌ No working email configuration found")
        print("📋 Manual setup required:")
        print("1. Get a Gmail App Password")
        print("2. Or use a different email provider")
        print("3. Update the .env file manually")

if __name__ == "__main__":
    test_email_providers()