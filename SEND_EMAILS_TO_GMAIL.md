# 📧 Send Task Assignment Emails to Gmail Accounts

## ✅ Current Status
Your DTMS system is **ready to send emails** to Gmail accounts when admins assign tasks to users!

## 🎯 What You Need To Do

### Step 1: Get Gmail App Password (5 minutes)

1. **Open Google Account Security**
   - Go to: https://myaccount.google.com/security
   - Sign in with: `pavithrakumaranr01062@gmail.com`

2. **Enable 2-Step Verification** (if not already enabled)
   - Click "2-Step Verification"
   - Follow the setup process
   - You'll need your phone for verification

3. **Generate App Password**
   - Go back to Security page
   - Scroll to "2-Step Verification"
   - At the bottom, click "App passwords"
   - You may need to sign in again
   - Select: "Other (Custom name)"
   - Type: `DTMS Email System`
   - Click "Generate"
   - **COPY THE 16-CHARACTER PASSWORD** (looks like: `abcd efgh ijkl mnop`)

### Step 2: Configure DTMS (2 minutes)

Run this command:
```bash
cd backend
python setup_gmail.py
```

Follow the prompts:
1. Enter your Gmail address: `pavithrakumaranr01062@gmail.com`
2. Paste the 16-character App Password
3. Wait for test email confirmation

### Step 3: Restart Django Server

```bash
# Stop current server (Ctrl+C)
# Start again:
python manage.py runserver
```

## 🎉 That's It! Email System is Ready

### ✅ What Happens Now

When an admin assigns a task:
1. **Email automatically sent** to assigned user's Gmail
2. **Email includes:**
   - Task title
   - Complete description with all details
   - Deadline date and time
   - Admin who assigned it
   - Link to DTMS dashboard
   - Any attached files

### 📧 Email Example

```
Subject: [DTMS] New Mission Assigned: Frontend Development

Greetings Talent,

A new operational mission has been assigned to you by the Global Administration.

--- MISSION BRIEF ---
TITLE: Frontend Development Task
ASSIGNED BY: System Administrator (admin@dtms.com)
DEADLINE: September 01, 2026 at 05:00 PM

MISSION DESCRIPTION:
Complete the frontend development for the user dashboard.

Requirements:
- Implement responsive design using Tailwind CSS
- Add user authentication flow
- Create task management interface
- Ensure mobile compatibility

Deliverables:
- Completed React components
- Updated documentation
- Test cases
-------------------

Please log in to the Digital Talent Management System (DTMS) 
to review the context and submit your work.

Dashboard: http://localhost:5173/dashboard

This is an automated operational notification.
```

## 🧪 Testing the System

After setup, test it:

```bash
cd backend
python test_gmail_smtp.py
```

This will:
1. Verify Gmail connection
2. Send a test email
3. Create a test task and email notification

## 🔧 Troubleshooting

### "Username and Password not accepted"
- ✅ **Solution**: Use App Password (not regular Gmail password)
- Make sure you copied all 16 characters
- Remove spaces from the password

### "SMTP Authentication Error"
- ✅ **Solution**: Regenerate App Password
- Make sure 2FA is enabled
- Check Gmail isn't blocking the connection

### Emails not arriving
- ✅ Check spam folder in Gmail
- ✅ Wait 1-2 minutes (sometimes delayed)
- ✅ Run test script: `python test_gmail_smtp.py`

## 📋 Quick Reference

### Test if emails are working:
```bash
cd backend
python test_gmail_smtp.py
```

### Check email configuration:
```bash
cd backend
python -c "from django.conf import settings; print(f'Backend: {settings.EMAIL_BACKEND}'); print(f'User: {settings.EMAIL_HOST_USER}')"
```

### Setup Gmail again:
```bash
cd backend
python setup_gmail.py
```

## 🎯 Usage in DTMS Dashboard

1. **Admin logs in** to DTMS
2. **Creates task** with:
   - Title: Task name
   - Description: Full details
   - Deadline: Due date
   - Assigned users: Select users
3. **Clicks "Deploy" or "Create Task"**
4. **Email automatically sent** to assigned users
5. **Users receive Gmail notification** within seconds

## 🔐 Security Notes

- App Password is specific to DTMS
- Your regular Gmail password is not used
- App Password can be revoked anytime
- Safe to store in .env file (not committed to Git)
- Only DTMS can use this App Password

## ✅ Checklist

Before going live:
- [ ] 2FA enabled on Gmail
- [ ] App Password generated
- [ ] `setup_gmail.py` completed successfully
- [ ] Test email received
- [ ] Django server restarted
- [ ] Test task assignment works

## 💡 Tips

1. **Test first**: Create a test task and assign to yourself
2. **Check spam**: First emails might go to spam
3. **Mark as not spam**: Future emails will go to inbox
4. **Keep App Password safe**: Don't share or commit to Git
5. **One-time setup**: Only need to do this once

## 📞 Need Help?

If stuck:
1. Read GMAIL_SMTP_SETUP.md for detailed steps
2. Run `python test_gmail_smtp.py` to diagnose issues
3. Check Gmail security settings
4. Generate new App Password if needed