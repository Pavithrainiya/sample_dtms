# DTMS Migration & Setup Instructions

## Summary of Changes

### ✅ Completed:
1. **Fixed Theme Toggle** - Dark/Light mode now works properly with Tailwind v4
2. **Redesigned UI** - Modern, professional dashboards for both admin and user roles
3. **PostgreSQL Configuration** - Backend configured to use PostgreSQL database
4. **Setup Documentation** - Comprehensive guides created

---

## 🎨 UI Changes

### New Components Created:
- **ModernSidebar** - Clean sidebar navigation with icons
- **ModernTopBar** - Search bar, notifications, and user profile
- **StatsCard** - Beautiful metric cards with trends
- **AdminDashboardNew** - Complete admin dashboard redesign
- **UserDashboardNew** - Complete user dashboard redesign

### Features:
- Modern card-based layouts
- Responsive design (mobile-friendly)
- Dark/Light theme support
- Interactive charts and graphs
- Clean typography and spacing
- Smooth animations and transitions

### Accessing the New UI:
- Login at `http://localhost:5173/login`
- Admin users see the new AdminDashboardNew
- Regular users see the new UserDashboardNew
- Old dashboards still available at:
  - `/dashboard/admin/old`
  - `/dashboard/user/old`

---

## 🗄️ PostgreSQL Migration Steps

### Step 1: Install PostgreSQL (if not installed)

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the postgres superuser password
- Default port: 5432

**Or using Chocolatey:**
```powershell
choco install postgresql
```

### Step 2: Create the Database

**Option A: Using psql Command Line**

```powershell
# Open PowerShell and connect to PostgreSQL
psql -U postgres

# Then run these SQL commands:
```

```sql
-- Create the database
CREATE DATABASE dtms;

-- Create a dedicated user
CREATE USER dtms_user WITH PASSWORD 'dtms_secure_password_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dtms TO dtms_user;

-- Connect to the new database
\c dtms

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO dtms_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dtms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dtms_user;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dtms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dtms_user;

-- Exit
\q
```

**Option B: Using pgAdmin GUI**
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `dtms`
4. Owner: `postgres` (or create `dtms_user` role first)
5. Save

Then create the user:
1. Right-click "Login/Group Roles" → Create → Login/Group Role
2. General tab: Name: `dtms_user`
3. Definition tab: Password: `dtms_secure_password_2024`
4. Privileges tab: Check all privileges
5. Save

### Step 3: Verify PostgreSQL is Running

```powershell
# Check if PostgreSQL service is running
Get-Service postgresql*

# If not running, start it:
Start-Service postgresql-x64-16  # Adjust version number if different
```

### Step 4: Update Environment Variables

The `.env` file has already been updated with:
```
DATABASE_URL=postgresql://dtms_user:dtms_secure_password_2024@localhost:5432/dtms
```

**⚠️ IMPORTANT:** If you used a different password, update it in `backend/.env`

### Step 5: Install Python Dependencies

```powershell
# Navigate to backend directory
cd backend

# Make sure psycopg2 is installed
pip install psycopg2-binary

# Or install all requirements
pip install -r requirements.txt
```

### Step 6: Run Migrations

**Option A: Using the Helper Script (Recommended)**

```powershell
cd backend
python migrate_to_postgresql.py
```

This script will:
- Check PostgreSQL connection
- Display connection details
- Ask for confirmation
- Run all migrations
- Show next steps

**Option B: Manual Migration**

```powershell
cd backend

# Apply all migrations
python manage.py migrate

# You should see output like:
# Running migrations:
#   Applying contenttypes.0001_initial... OK
#   Applying accounts.0001_initial... OK
#   Applying tasks.0001_initial... OK
#   ... etc
```

### Step 7: Create Superuser

```powershell
# Create admin account for Django admin panel
python manage.py createsuperuser

# Follow prompts:
# Username: admin
# Email: admin@dtms.com
# Password: (your choice)
```

### Step 8: Restart Backend Server

```powershell
# Stop the current Django server (Ctrl+C if running)

# Start fresh with PostgreSQL
python manage.py runserver 127.0.0.1:8000
```

### Step 9: Verify Migration Success

**Check in PostgreSQL:**
```powershell
# Connect to the database
psql -U dtms_user -d dtms

# List all tables
\dt

# You should see tables like:
# accounts_user
# tasks_task
# tasks_submission
# django_migrations
# django_session
# etc.

# Check if tables have data structure
\d accounts_user

# Exit
\q
```

**Check in Django:**
```powershell
# In backend directory
python manage.py shell
```

```python
# In Python shell:
from accounts.models import User
from tasks.models import Task

# Check if models work
User.objects.count()
Task.objects.count()

# Exit
exit()
```

---

## 🧪 Testing the Application

### Step 1: Start Both Servers

**Terminal 1 - Backend:**
```powershell
cd backend
python manage.py runserver 127.0.0.1:8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Step 2: Test New UI

1. Open browser: `http://localhost:5173`
2. Register a new user or login with existing credentials
3. **Test Theme Toggle:**
   - Click the theme toggle button (Moon/Sun icon)
   - UI should switch between dark and light mode smoothly
   - Refresh page - theme should persist

4. **Test Admin Dashboard (if admin user):**
   - View stats cards
   - Check charts rendering
   - Create a new task
   - Assign task to users
   - View team members

5. **Test User Dashboard (if regular user):**
   - View assigned tasks
   - Submit work for a task
   - Check activity chart
   - View stats

### Step 3: Verify PostgreSQL is Working

1. Create a new task in the UI
2. Check in PostgreSQL:
   ```powershell
   psql -U dtms_user -d dtms
   SELECT * FROM tasks_task ORDER BY id DESC LIMIT 1;
   \q
   ```
3. The newly created task should appear

---

## 🔄 Data Migration (Optional)

If you want to migrate existing data from SQLite to PostgreSQL:

```powershell
cd backend

# Export data from SQLite
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 2 > data_backup.json

# Switch DATABASE_URL in .env to PostgreSQL

# Run migrations
python manage.py migrate

# Import data
python manage.py loaddata data_backup.json
```

---

## 🐛 Troubleshooting

### Error: "connection to server failed"
- **Fix:** Check if PostgreSQL service is running
  ```powershell
  Get-Service postgresql*
  Start-Service postgresql-x64-16
  ```

### Error: "password authentication failed"
- **Fix:** Verify username and password in `.env` match what you set in PostgreSQL
- **Fix:** Check `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\16\data\`)
  - Look for line: `host all all 127.0.0.1/32 md5`
  - Change `md5` to `trust` temporarily for testing (not recommended for production)

### Error: "database does not exist"
- **Fix:** Create the database first:
  ```powershell
  psql -U postgres
  CREATE DATABASE dtms;
  \q
  ```

### Error: "psycopg2 not found"
- **Fix:** Install the PostgreSQL adapter:
  ```powershell
  pip install psycopg2-binary
  ```

### Theme Toggle Not Working
- **Fix:** Clear browser cache and refresh
- **Fix:** Check browser console for errors
- **Fix:** Verify `tailwind.config.js` exists with `darkMode: 'class'`

### Charts Not Displaying
- **Fix:** Ensure recharts is installed: `npm install recharts`
- **Fix:** Check browser console for errors

---

## 📊 Key Files Modified

### Backend:
- `backend/.env` - Updated DATABASE_URL to PostgreSQL
- `backend/POSTGRESQL_SETUP.md` - Complete PostgreSQL setup guide
- `backend/migrate_to_postgresql.py` - Migration helper script

### Frontend:
- `frontend/tailwind.config.js` - Added dark mode configuration
- `frontend/src/index.css` - Tailwind v4 dark mode setup
- `frontend/src/App.jsx` - Routes updated for new dashboards
- `frontend/src/components/ModernSidebar.jsx` - New sidebar component
- `frontend/src/components/ModernTopBar.jsx` - New top bar component
- `frontend/src/components/StatsCard.jsx` - New stats card component
- `frontend/src/pages/AdminDashboardNew.jsx` - Redesigned admin dashboard
- `frontend/src/pages/UserDashboardNew.jsx` - Redesigned user dashboard

---

## 🚀 Next Steps After Setup

1. **Security:**
   - Change default PostgreSQL password in production
   - Update `SECRET_KEY` in `.env`
   - Never commit `.env` to Git

2. **Performance:**
   - Add database indexes for frequently queried fields
   - Enable PostgreSQL connection pooling for production

3. **Features:**
   - Implement the enterprise features (analytics, AI, gamification)
   - Add real-time notifications with WebSockets
   - Integrate email notifications (Gmail SMTP or alternative)

4. **Testing:**
   - Write unit tests for backend APIs
   - Add integration tests for frontend components
   - Test all user flows thoroughly

5. **Deployment:**
   - Configure for production environment
   - Set up SSL certificates
   - Deploy to cloud platform (AWS, Heroku, Railway, etc.)

---

## 📞 Support

If you encounter issues:
1. Check the `POSTGRESQL_SETUP.md` file for detailed PostgreSQL setup
2. Verify all prerequisites are installed
3. Check Django server logs for errors
4. Check browser console for frontend errors

## 🎉 Success Criteria

You'll know everything is working when:
- ✅ Theme toggle switches between dark and light mode
- ✅ New modern UI displays correctly for both admin and user
- ✅ Can create tasks and they appear in PostgreSQL database
- ✅ Users can submit work and it saves to PostgreSQL
- ✅ Charts and statistics display properly
- ✅ No console errors in browser or Django server

---

**Created:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Database:** PostgreSQL (dtms)
**Status:** Configuration Complete - Ready for Migration
