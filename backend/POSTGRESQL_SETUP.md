# PostgreSQL Setup Guide for DTMS

## Step 1: Install PostgreSQL (if not already installed)

### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` superuser
4. Default port is `5432`

### Using Chocolatey (Windows Package Manager):
```powershell
choco install postgresql
```

## Step 2: Create Database and User

Open **pgAdmin** or **psql** command line tool.

### Using psql Command Line:
```powershell
# Connect to PostgreSQL as superuser
psql -U postgres
```

### SQL Commands to Execute:

```sql
-- Create the database
CREATE DATABASE dtms;

-- Create a dedicated user for DTMS
CREATE USER dtms_user WITH PASSWORD 'dtms_secure_password_2024';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE dtms TO dtms_user;

-- Connect to the dtms database
\c dtms

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO dtms_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dtms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dtms_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dtms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dtms_user;

-- Exit psql
\q
```

## Step 3: Verify Database Creation

```sql
-- List all databases
\l

-- You should see 'dtms' in the list

-- Connect to dtms database
\c dtms

-- Check connection
SELECT current_database();
```

## Step 4: Test Connection

```powershell
# Test connection with the new user
psql -U dtms_user -d dtms -h localhost
```

## Alternative: Using pgAdmin GUI

1. Open pgAdmin
2. Right-click on "Databases" → Create → Database
3. Name: `dtms`
4. Owner: Create new role `dtms_user` or use postgres
5. Save

## Step 5: Update Django Settings

The `.env` file needs to be updated with the PostgreSQL connection string.

**Format:**
```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

**Example for DTMS:**
```
DATABASE_URL=postgresql://dtms_user:dtms_secure_password_2024@localhost:5432/dtms
```

## Step 6: Install Python PostgreSQL Adapter

```powershell
# Make sure you're in the backend directory
cd backend

# Install psycopg2 (already in requirements.txt)
pip install psycopg2-binary
```

## Step 7: Run Django Migrations

```powershell
# Apply all migrations to PostgreSQL
python manage.py migrate

# Create a superuser for admin access
python manage.py createsuperuser

# Load demo data (optional)
python setup_demo_data.py
```

## Step 8: Verify Migration

```sql
-- In psql, connect to dtms database
\c dtms

-- List all tables
\dt

-- You should see tables like:
-- accounts_user
-- tasks_task
-- tasks_submission
-- django_migrations
-- etc.

-- Check user count
SELECT COUNT(*) FROM accounts_user;

-- Check tasks count
SELECT COUNT(*) FROM tasks_task;
```

## Connection String Examples

### Local Development:
```
DATABASE_URL=postgresql://dtms_user:dtms_secure_password_2024@localhost:5432/dtms
```

### Production (Heroku/Render):
```
DATABASE_URL=postgresql://user:pass@hostname:5432/dbname
```

### With SSL (Production):
```
DATABASE_URL=postgresql://user:pass@hostname:5432/dbname?sslmode=require
```

## Troubleshooting

### Error: "connection to server failed"
- Check if PostgreSQL service is running: `Get-Service postgresql*`
- Start service: `Start-Service postgresql-x64-16` (adjust version)

### Error: "FATAL: password authentication failed"
- Verify username and password
- Check `pg_hba.conf` authentication settings

### Error: "permission denied for schema public"
- Re-run the GRANT commands from Step 2

### Error: "psycopg2 not installed"
- Run: `pip install psycopg2-binary`

## Useful PostgreSQL Commands

```sql
-- List all databases
\l

-- List all tables in current database
\dt

-- Describe table structure
\d table_name

-- List all users/roles
\du

-- Show current database
SELECT current_database();

-- Show current user
SELECT current_user;

-- Drop database (careful!)
DROP DATABASE dtms;

-- Backup database
pg_dump -U dtms_user -d dtms > dtms_backup.sql

-- Restore database
psql -U dtms_user -d dtms < dtms_backup.sql
```

## Next Steps

After PostgreSQL is set up:
1. Update `backend/.env` with DATABASE_URL
2. Run `python manage.py migrate`
3. Create admin user: `python manage.py createsuperuser`
4. Restart Django server
5. Test login and functionality

## Security Notes

**IMPORTANT:** 
- Change the default password `dtms_secure_password_2024` to something stronger
- Never commit `.env` file with real credentials to Git
- Use environment variables in production
- Enable SSL for production databases
- Restrict PostgreSQL access by IP in `pg_hba.conf`
