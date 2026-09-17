# 📧 DTMS Email Setup Complete Guide

## Current Status
- ✅ **Gemini API**: Working with key `AIzaSyDOklM9V76uQiRi3l2p05dUDoaHdRpXo_s`
- ✅ **RAG System**: Fully functional Mission Intelligence Analyst
- ❌ **Email Notifications**: Needs proper Gmail App Password

## Email Setup Instructions

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **App passwords**
3. Select **Mail** and **Windows Computer**
4. Click **Generate**
5. Copy the 16-character password (no spaces)

### Step 3: Update Environment Variables
Edit `backend/.env` file:

```env
# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-app-password
DEFAULT_FROM_EMAIL="DTMS Notifications <noreply@dtms.com>"
```

### Step 4: Test Email System
Run the test script:
```bash
cd backend
python test_email_notification.py
```

## Current System Features

### 1. Automated Task Notifications ✅
- **Trigger**: When tasks are assigned to users
- **Content**: Title, description, deadline, attachments
- **Format**: Premium HTML email template
- **Recipients**: Only assigned users (targeted notifications)

### 2. RAG-Powered Mission Intelligence ✅
- **Location**: User Dashboard (bottom-right floating button)
- **Features**: 
  - Context-aware responses based on user's tasks
  - Real-time task status and deadline information
  - Fallback to local intelligence if Gemini API fails
- **Model**: Gemini 2.5 Flash

### 3. Email Template Features ✅
- Professional HTML design
- Mission briefing style
- Attachment handling
- Deadline highlighting
- Direct dashboard link

## Testing the Complete System

### Test Email Notifications:
```bash
cd backend
python test_email_notification.py
```

### Test Gemini API:
```bash
cd backend
python test_gemini.py
```

### Test RAG System:
1. Open frontend at `http://localhost:5174/`
2. Login to user dashboard
3. Click "Mission Intelligence" button (bottom-right)
4. Ask questions about your tasks

## Troubleshooting

### Email Issues:
- Ensure 2FA is enabled on Gmail
- Use App Password, not regular password
- Check spam folder for test emails
- Verify EMAIL_HOST_USER matches the Gmail account

### Gemini API Issues:
- Verify API key is correct
- Check internet connection
- Monitor backend logs for errors

### RAG System Issues:
- Check if user has assigned tasks
- Verify Gemini API is working
- Check browser console for frontend errors

## System Architecture

```
Frontend (React) → Backend (Django) → Gemini API
                ↓
            Email System (SMTP)
```

The system provides:
1. **Task Assignment** → **Email Notification** → **User Dashboard**
2. **User Questions** → **RAG Context** → **Gemini Response**
3. **File Attachments** → **Email Attachments** → **Download Links**