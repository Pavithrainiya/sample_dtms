#!/usr/bin/env python
"""
Interactive Email Configuration for DTMS
Run this script to set up email notifications
"""

def configure_email():
    print("📧 DTMS Email Configuration Setup")
    print("=" * 40)
    
    print("\nTo receive task notification emails like in your reference image,")
    print("you need to provide email credentials.\n")
    
    # Get user input
    email_provider = input("Choose email provider (1=Gmail, 2=Outlook, 3=Yahoo): ").strip()
    email_address = input("Enter your email address: ").strip()
    
    if email_provider == "1":  # Gmail
        print("\n📋 For Gmail, you need an App Password:")
        print("1. Go to myaccount.google.com")
        print("2. Security → 2-Step Verification (enable if needed)")
        print("3. Security → App passwords")
        print("4. Generate password for 'Mail' + 'Windows Computer'")
        print("5. Copy the 16-character password\n")
        
        app_password = input("Enter your Gmail App Password (16 characters): ").strip().replace(" ", "")
        
        config = f"""# DTMS Email Configuration - Gmail
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER={email_address}
EMAIL_HOST_PASSWORD={app_password}
DEFAULT_FROM_EMAIL="DTMS Notifications <{email_address}>"
"""
        
    elif email_provider == "2":  # Outlook
        password = input("Enter your Outlook password: ").strip()
        
        config = f"""# DTMS Email Configuration - Outlook
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER={email_address}
EMAIL_HOST_PASSWORD={password}
DEFAULT_FROM_EMAIL="DTMS Notifications <{email_address}>"
"""
        
    elif email_provider == "3":  # Yahoo
        print("\n📋 For Yahoo, you need an App Password:")
        print("1. Go to Yahoo Account Security")
        print("2. Generate app password for 'Mail'")
        
        app_password = input("Enter your Yahoo App Password: ").strip()
        
        config = f"""# DTMS Email Configuration - Yahoo
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER={email_address}
EMAIL_HOST_PASSWORD={app_password}
DEFAULT_FROM_EMAIL="DTMS Notifications <{email_address}>"
"""
    else:
        print("❌ Invalid choice")
        return
    
    # Read current .env and update email section
    try:
        with open('.env', 'r') as f:
            env_content = f.read()
        
        # Replace email configuration section
        lines = env_content.split('\n')
        new_lines = []
        skip_email_section = False
        
        for line in lines:
            if line.startswith('# DTMS Email Configuration') or line.startswith('# Automated Email Configuration'):
                skip_email_section = True
                new_lines.append(config.strip())
                continue
            elif line.startswith('#') and skip_email_section and not line.startswith('EMAIL_'):
                skip_email_section = False
                new_lines.append(line)
            elif not skip_email_section and not line.startswith('EMAIL_') and not line.startswith('DEFAULT_FROM_EMAIL'):
                new_lines.append(line)
        
        # Write updated .env
        with open('.env', 'w') as f:
            f.write('\n'.join(new_lines))
        
        print(f"\n✅ Email configuration updated!")
        print(f"📧 Using: {email_address}")
        print(f"\n🔄 Next steps:")
        print(f"1. Restart your Django server")
        print(f"2. Test with: python test_email_notification.py")
        print(f"3. Create a task in admin dashboard")
        print(f"4. Users will receive emails like your reference image!")
        
    except Exception as e:
        print(f"❌ Error updating configuration: {e}")
        print("\nManual setup required:")
        print(config)

if __name__ == "__main__":
    configure_email()