# 📧 Complete Email Setup for DTMS Task Notifications

## What Happens When Admin Assigns Tasks:

When an admin creates a task and assigns it to users, the system automatically:

1. ✅ **Sends email to each assigned user's Gmail address**
2. ✅ **Includes all task details:**
   - **Title**: Task name
   - **Description**: Full task description  
   - **Deadline**: Formatted date and time
   - **Document**: Attached file (if uploaded)
3. ✅ **Professional HTML email template**
4. ✅ **Direct link to user dashboard**

## Current Issue: Gmail Authentication

The system is ready but needs proper Gmail credentials.

## Solution 1: Gmail App Password (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account](https://myaccount.google.com)
2. Click **Security** → **2-Step Verification**
3. Follow setup if not enabled

### Step 2: Create App Password
1. In **Security**, click **App passwords**
2. Select **Mail** and **Windows Computer**
3. Click **Generate**
4. Copy the 16-character password (like: `abcd efgh ijkl mnop`)

### Step 3: Update Configuration
Edit `backend/.env`:
```env
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
```

## Solution 2: Alternative Email Service

If Gmail doesn't work, you can use other services:

### Option A: Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@outlook.com
EMAIL_HOST_PASSWORD=your-password
```

### Option B: Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@yahoo.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Solution 3: For Testing (Current Setup)

I can set it back to console mode so you can see the emails in terminal:

```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

## How the System Works:

### 1. Admin Creates Task
- Go to Admin Dashboard
- Fill in: Title, Description, Deadline
- Upload document (optional)
- Select users to assign
- Click "Create Task"

### 2. System Sends Emails
- Automatically sends to each assigned user's email
- Beautiful HTML template with all details
- Document attached if uploaded
- Users get notification immediately

### 3. Users Receive Email
- Professional mission briefing style
- All task details clearly displayed
- Direct link to dashboard
- Attached document ready to download

## Test the Complete Flow:

1. **Start both servers:**
   ```bash
   # Backend
   cd backend
   python manage.py runserver
   
   # Frontend  
   cd frontend
   npm run dev
   ```

2. **Login as Admin:**
   - Go to `http://localhost:5174/`
   - Login with admin account

3. **Create and Assign Task:**
   - Click "Create Task"
   - Fill all details
   - Select users
   - Submit

4. **Check Email:**
   - Users will receive email at their registered Gmail
   - Or check backend terminal if using console mode

## Email Template Includes:

✅ **Subject**: `[DTMS] OPERATIONAL MISSION: [Task Title]`
✅ **Title**: Prominently displayed
✅ **Description**: Full task description in styled box
✅ **Deadline**: Color-coded deadline with date/time
✅ **Document**: Attached file + filename shown in email
✅ **Dashboard Link**: Direct access to user dashboard
✅ **Professional Design**: Mission briefing style template

The system is 100% ready - just needs working email credentials!