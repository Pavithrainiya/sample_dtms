# 📧 Get DTMS Emails Working - Step by Step

## Current Issue
The Gmail credentials are not working. You need a fresh Gmail App Password to receive task notification emails like the one in your reference image.

## Solution: Get Gmail App Password (5 minutes)

### Step 1: Go to Google Account
1. Open [myaccount.google.com](https://myaccount.google.com)
2. Sign in with the Gmail account you want to use for DTMS

### Step 2: Enable 2-Factor Authentication (if not enabled)
1. Click **Security** (left sidebar)
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the setup process (use your phone number)

### Step 3: Generate App Password
1. Still in **Security** section
2. Click **App passwords** (appears only after 2FA is enabled)
3. You might need to sign in again
4. Select:
   - **App**: Mail
   - **Device**: Windows Computer
5. Click **Generate**
6. Google shows a 16-character password like: `abcd efgh ijkl mnop`
7. **Copy this password** (remove spaces: `abcdefghijklmnop`)

### Step 4: Update DTMS Configuration
Edit `backend/.env` file and replace these lines:

```env
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-app-password
```

Example:
```env
EMAIL_HOST_USER=john.doe@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
```

### Step 5: Restart Backend
```bash
# Stop current backend (Ctrl+C)
# Then restart:
cd backend
python manage.py runserver
```

### Step 6: Test Email System
```bash
cd backend
python test_email_notification.py
```

## Alternative: Use Different Email Provider

If Gmail doesn't work, you can use:

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@outlook.com
EMAIL_HOST_PASSWORD=your-password
```

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@yahoo.com
EMAIL_HOST_PASSWORD=your-app-password
```

## What You'll Get

Once working, when admin assigns tasks, users will receive emails with:

✅ **Subject**: `[DTMS] OPERATIONAL MISSION: [Task Title]`
✅ **Professional HTML template** (like your reference image)
✅ **All task details**:
- Mission title
- Deadline with date/time
- Full description
- Attached documents
✅ **Direct link to dashboard**

## Quick Test

After setup, create a test task:
1. Login as admin at `http://localhost:5174/`
2. Create new task
3. Assign to a user
4. User should receive email immediately

The email will look exactly like your reference image with professional DTMS branding and all task details!