# Gmail SMTP Setup for DTMS Email Notifications

## 📧 How to Get Gmail App Password

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on **"2-Step Verification"**
3. Enable 2-Step Verification if not already enabled
4. Follow the setup process (you'll need your phone)

### Step 2: Generate App Password
1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Scroll down to **"2-Step Verification"**
3. Scroll down to **"App passwords"** (at the bottom)
4. Click on **"App passwords"**
5. You may need to sign in again
6. Select **"Other (Custom name)"**
7. Type: `DTMS Email System`
8. Click **"Generate"**
9. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)
10. **Important**: Save this password somewhere safe!

### Step 3: Update .env File
Replace these lines in your `.env` file:

```env
# Change this line from:
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# To this:
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend

# Update this with your actual App Password:
EMAIL_HOST_PASSWORD=your-16-character-app-password-here
```

### Step 4: Restart Django Server
After updating the .env file:
1. Stop the Django server (Ctrl+C)
2. Start it again: `python manage.py runserver`

## 🧪 Testing Email Setup

Run this test script:
```bash
cd backend
python test_gmail_smtp.py
```

## ✅ What Happens When Admin Assigns a Task

When an admin assigns a task to a user:

1. **Email is automatically triggered**
2. **Sent to user's Gmail address**
3. **Contains:**
   - Task title
   - Task description (full details)
   - Deadline information
   - Admin who assigned it
   - Link to DTMS dashboard
   - Any attached files

## 📧 Email Template Preview

```
Subject: [DTMS] New Mission Assigned: Task Title

Greetings Talent,

A new operational mission has been assigned to you by the Global Administration.

--- MISSION BRIEF ---
TITLE: Frontend Development Task
ASSIGNED BY: Admin Name (admin@example.com)
DEADLINE: September 01, 2026 at 05:00 PM

MISSION DESCRIPTION:
[Full task description with all requirements and details]
-------------------

Please log in to the Digital Talent Management System (DTMS) to review 
the context and submit your work.

Dashboard: http://localhost:5173/dashboard

This is an automated operational notification. Please do not reply directly.
```

## 🔧 Troubleshooting

### Error: "Username and Password not accepted"
- Make sure 2FA is enabled
- Generate a new App Password
- Use the App Password (not your regular Gmail password)
- Remove any spaces from the App Password in .env file

### Error: "SMTP Authentication Error"
- Check that EMAIL_HOST_USER matches the Gmail account
- Verify the App Password is correct
- Make sure EMAIL_USE_TLS=True
- Check EMAIL_PORT=587

### Error: "Connection refused"
- Check your internet connection
- Make sure Gmail isn't blocked by firewall
- Try using port 465 with EMAIL_USE_SSL=True instead

## 📞 Support

If you continue having issues:
1. Check Gmail security settings
2. Verify 2FA is enabled
3. Generate a new App Password
4. Double-check .env file configuration