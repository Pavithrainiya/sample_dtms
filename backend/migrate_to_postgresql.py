"""
Migration Helper Script for PostgreSQL
Run this after setting up PostgreSQL database
"""

import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.management import call_command
from django.db import connection

def check_postgresql_connection():
    """Check if PostgreSQL connection is working"""
    print("=" * 60)
    print("DTMS PostgreSQL Migration Helper")
    print("=" * 60)
    
    try:
        db_settings = connection.settings_dict
        print(f"\n✓ Database Engine: {db_settings['ENGINE']}")
        print(f"✓ Database Name: {db_settings['NAME']}")
        print(f"✓ Database Host: {db_settings['HOST']}")
        print(f"✓ Database Port: {db_settings['PORT']}")
        print(f"✓ Database User: {db_settings['USER']}")
        
        # Test connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"\n✓ PostgreSQL Connection Successful!")
            print(f"✓ PostgreSQL Version: {version.split(',')[0]}")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Connection Failed: {str(e)}")
        print("\nPlease ensure:")
        print("1. PostgreSQL is running")
        print("2. Database 'dtms' exists")
        print("3. User 'dtms_user' has proper privileges")
        print("4. .env file has correct DATABASE_URL")
        return False

def run_migrations():
    """Run Django migrations"""
    print("\n" + "=" * 60)
    print("Running Django Migrations...")
    print("=" * 60 + "\n")
    
    try:
        # Run migrations
        call_command('migrate', '--verbosity', '2')
        print("\n✓ All migrations completed successfully!")
        return True
    except Exception as e:
        print(f"\n✗ Migration failed: {str(e)}")
        return False

def show_next_steps():
    """Display next steps"""
    print("\n" + "=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print("\n1. Create a superuser account:")
    print("   python manage.py createsuperuser")
    print("\n2. Load demo data (optional):")
    print("   python setup_demo_data.py")
    print("\n3. Start the development server:")
    print("   python manage.py runserver 127.0.0.1:8000")
    print("\n4. Check your data in PostgreSQL:")
    print("   psql -U dtms_user -d dtms")
    print("   \\dt  (list tables)")
    print("=" * 60)

if __name__ == '__main__':
    print("\nStarting PostgreSQL migration process...\n")
    
    # Step 1: Check connection
    if not check_postgresql_connection():
        print("\n✗ Please fix the connection issues before proceeding.")
        print("See POSTGRESQL_SETUP.md for setup instructions.")
        sys.exit(1)
    
    # Step 2: Ask for confirmation
    response = input("\n✓ Connection successful! Proceed with migrations? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("Migration cancelled.")
        sys.exit(0)
    
    # Step 3: Run migrations
    if run_migrations():
        show_next_steps()
        print("\n✓ PostgreSQL migration completed successfully!")
    else:
        print("\n✗ Migration failed. Please check the errors above.")
        sys.exit(1)
