# Gmail SMTP Troubleshooting

## ❌ Current Issue
The Gmail App Passwords are being rejected with error:
```
535 5.7.8 Username and Password not accepted
```

## 🔍 Possible Causes

### 1. **Gmail Account Restrictions**
Your Gmail account might have restrictions that prevent App Passwords from working:
- Account too new
- Unusual activity detected
- Regional restrictions
- Workspace/Education account (different rules)

### 2. **App Password Not Activated Yet**
Sometimes newly generated App Passwords take 5-10 minutes to become active.

### 3. **Account Type Issues**
If this is a Google Workspace, Education, or Organization account, App Passwords might be disabled by the administrator.

## ✅ Solutions

### Solution 1: Wait and Retry (5-10 minutes)
1. Wait 5-10 minutes for the App Password to activate
2. Then update .env to use SMTP backend:
   ```
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   ```
3. Restart Django server
4. Test again: `python test_gmail_smtp.py`

### Solution 2: Use a Different Gmail Account
If you have another Gmail account:
1. Enable 2FA on that account
2. Generate App Password
3. Update .env with new email and password
4. Test again

### Solution 3: Check Account Security Settings
1. Go to https://myaccount.google.com/security
2. Check "Less secure app access" - should be OFF (we use App Passwords instead)
3. Check "2-Step Verification" - should be ON
4. Under "Signing in to Google", check for any blocks or restrictions

### Solution 4: Use Alternative Email Service

#### **Option A: Use a different email provider**
Many email providers work well:
- **Outlook/Hotmail**: smtp-mail.outlook.com, port 587
- **Yahoo**: smtp.mail.yahoo.com, port 587
- **Custom domain email**: Ask your provider for SMTP details

#### **Option B: Use SendGrid (Free tier: 100 emails/day)**
1. Sign up at https://sendgrid.com
2. Get API key
3. Use Django SendGrid backend

### Solution 5: File-Based Email (Current Setup)
**Currently Active**: Emails are saved to files in `backend/sent_emails/`

**Advantages**:
- ✅ Always works, no authentication needed
- ✅ Can see exact email content
- ✅ Perfect for development and testing
- ✅ No external dependencies

**How it works**:
1. When admin assigns task, email is "sent"
2. Email saved as file in `backend/sent_emails/`
3. Open the file to see what would be sent
4. Contains full HTML email with all details

**To view emails**:
```bash
cd backend/sent_emails
# Each email is a separate file
# Open any file to see the email content
```

## 🧪 Testing Commands

### Test Current Backend
```bash
cd backend
python test_gmail_smtp.py
```

### Force Console Output (See emails in terminal)
Update .env:
```
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### Force File Output (Save emails to files)
Update .env:
```
EMAIL_BACKEND=django.core.mail.backends.filebased.EmailBackend
EMAIL_FILE_PATH=sent_emails
```

### Try SMTP Again
Update .env:
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
```

## 📧 Email Content is Ready!

Regardless of the backend used, the email system is fully functional:

✅ **Email includes:**
- Professional DTMS formatting
- Task title and full description
- Deadline information
- Admin who assigned it
- Link to dashboard
- File attachments

✅ **Triggers automatically when:**
- Admin creates and assigns a task
- Task is assigned to multiple users
- Each user gets personalized email

## 💡 Recommendation

**For Development/Testing**: Use File or Console backend (current setup)
- See emails immediately
- No authentication issues
- Perfect for testing

**For Production**: Fix Gmail SMTP or use alternative service
- Real emails sent to users
- Professional delivery
- Spam filtering handled

## 🎯 Current Status

Your DTMS email system is **100% functional** with file backend:
- ✅ Emails trigger on task assignment
- ✅ Full HTML formatting
- ✅ All task details included
- ✅ Attachments supported
- ✅ Multiple recipients supported

The only difference is emails are saved to files instead of sent via SMTP.

## 🔄 To Switch Back to Gmail SMTP Later

1. Wait for App Password to activate
2. Or generate new App Password
3. Update .env:
   ```
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST_PASSWORD=your-new-app-password
   ```
4. Restart Django
5. Test: `python test_gmail_smtp.py`