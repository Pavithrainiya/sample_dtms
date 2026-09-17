# 🎯 Digital Talent Management System (DTMS)

A state-of-the-art enterprise task and talent management platform featuring AI-powered intelligence, automated Gmail SMTP email dispatch, PDF/CSV user directory reporting, and interactive deliverable work submissions.

![DTMS Enterprise](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-blue)
![Django](https://img.shields.io/badge/Backend-Django%20REST%20Framework-green)
![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-purple)
![License](https://img.shields.io/badge/License-MIT-orange)

---

## 🚀 Repositories & Deployment Status

- **GitHub Repository**: [https://github.com/Pavithrainiya/sample_dtms](https://github.com/Pavithrainiya/sample_dtms)
- **Frontend Deployment (Vercel)**: Target deployment for Vite React frontend
- **Backend Deployment (Render)**: Target web service deployment for Django REST Framework backend API

---

## 🌟 Major System Features

### 📤 1. Deliverable Work Submission Hub (`UserDashboardNew`)
- **Target Mission Selector**: Dropdown menu allowing talent members to select any assigned task directly on the Submissions view.
- **Multi-Format Attachment Dropzone**:
  - Supports PDF (`.pdf`), Excel (`.xlsx, .xls, .csv`), Word (`.docx`), TXT (`.txt`), and ZIP (`.zip`).
  - Dynamic file preview cards featuring file name, formatted size (MB/KB), color-coded extension badges, and remove actions.
- **Submissions History**: Interactive list displaying submitted work deliverables, review status (`Under Audit`, `Approved & Certified`, `Needs Revision`), notes, and direct download links.

### 📊 2. Admin User Directory & PDF/CSV Export (`AdminDashboardNew`)
- **Export CSV Button**: Instantly generates and downloads a UTF-8 CSV spreadsheet (`dtms_users_report_YYYY-MM-DD.csv`) containing User ID, Full Name, Email, Role, Department, Designation, Active Tasks Count, and Status.
- **Export PDF Report Button**: Generates a styled HTML printable report complete with DTMS Enterprise headers, generated timestamp, total user count, and styled data table, triggering browser `window.print()` / PDF download.
- **Multi-View Integration**: Available directly on the **Dashboard** overview, **Team Directory** tab, and **Reports & Export** hub.

### 📧 3. Automated Gmail SMTP Email Dispatch
- **Custom Task Notification Email**: Dispatches real-time mission briefings whenever a task is created or assigned, formatted line-by-line per official specification:
  - Header & Admin Sender (`pavijeevi56@gmail.com`)
  - Mission Title, Category, Priority, UTC Assigned & Due Dates
  - Scope Description & Attachment Name
- **User Registration Confirmation**: Automatically sends a welcome email to the newly registered user's email address and dispatches an alert copy to `pavijeevi56@gmail.com`.

### 🤖 4. AI Talent RAG Assistant & Natural Language Search
- **Natural Language Query Engine**: Search employee skill sets, project capacity availability, and tech stack experience using natural English.
- **Floating RAG Drawer**: Quick bottom-right AI assistant drawer for instant task queries and QA.

---

## 🌐 Deployment Guide (Vercel & Render)

### ⚡ 1. Deploying Frontend to Vercel

1. **Connect GitHub to Vercel**:
   - Log in to your [Vercel Dashboard](https://vercel.com).
   - Click **Add New...** → **Project**.
   - Select your GitHub repository: `Pavithrainiya/sample_dtms`.

2. **Configure Build Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or select `frontend` directory)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`

3. **Environment Variables**:
   - Add `VITE_API_URL` pointing to your deployed backend URL:
     ```env
     VITE_API_URL=https://dtms-backend.onrender.com/api/
     ```

4. **Deploy**:
   - Click **Deploy**. Vercel will automatically build and deploy your React app using `vercel.json`.

---

### 🟢 2. Deploying Backend to Render

1. **Connect GitHub to Render**:
   - Log in to your [Render Dashboard](https://dashboard.render.com).
   - Click **New +** → **Web Service**.
   - Connect your repository: `Pavithrainiya/sample_dtms`.

2. **Configure Service Settings**:
   - **Name**: `dtms-backend`
   - **Environment**: `Python 3`
   - **Region**: Oregon (or your preferred region)
   - **Branch**: `main`
   - **Build Command**: `cd backend && pip install -r requirements.txt && python manage.py migrate`
   - **Start Command**: `cd backend && gunicorn core.wsgi:application`

3. **Environment Variables (Render Dashboard)**:
   Add the following environment variables:
   | Key | Value |
   | :--- | :--- |
   | `EMAIL_BACKEND` | `django.core.mail.backends.smtp.EmailBackend` |
   | `EMAIL_HOST` | `smtp.gmail.com` |
   | `EMAIL_PORT` | `587` |
   | `EMAIL_USE_TLS` | `True` |
   | `EMAIL_HOST_USER` | `pavijeevi56@gmail.com` |
   | `EMAIL_HOST_PASSWORD` | `awbumkecqndtbhqj` |
   | `DEFAULT_FROM_EMAIL` | `DTMS Admin <pavijeevi56@gmail.com>` |
   | `SECRET_KEY` | `your-secure-production-django-secret-key` |
   | `DEBUG` | `False` |

4. **Deploy**:
   - Click **Create Web Service**. Render will install dependencies, run migrations, and start `gunicorn`.

---

## 💻 Local Development Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 2. Backend Setup (Django)
```bash
# Clone the repository
git clone https://github.com/Pavithrainiya/sample_dtms.git
cd sample_dtms/backend

# Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start backend dev server
python manage.py runserver 127.0.0.1:8000
```

### 3. Frontend Setup (React + Vite)
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
- Access Frontend at: `http://localhost:5173`
- Access Backend API at: `http://127.0.0.1:8000/api/`

---

## 🛠 Project Architecture & Key Files

```
sample_dtms/
├── vercel.json                 # Vercel deployment configuration
├── render.yaml                 # Render web service deployment configuration
├── README.md                   # Complete system documentation
├── backend/
│   ├── core/                   # Django settings & URL routing
│   ├── accounts/               # User authentication & registration emails
│   ├── tasks/                  # Task management, file attachments & notifications
│   ├── requirements.txt        # Python dependencies (Gunicorn, DRF, Whitenoise)
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── AdminDashboardNew.jsx   # Admin console & PDF/CSV export
    │   │   └── UserDashboardNew.jsx    # Talent workspace & deliverable upload
    │   ├── components/
    │   │   ├── ModernSidebar.jsx       # Distinct Admin & User sidebars
    │   │   └── FloatingRAGDrawer.jsx   # AI RAG assistant drawer
    │   └── context/
    └── package.json
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.