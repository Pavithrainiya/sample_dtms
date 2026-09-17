#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from tasks.models import Task

def list_and_delete_tasks():
    print("📋 Current Tasks:")
    print("=" * 50)
    
    tasks = Task.objects.all().order_by('-created_at')
    
    if not tasks:
        print("No tasks found.")
        return
    
    for i, task in enumerate(tasks, 1):
        print(f"{i}. ID: {task.id} - {task.title}")
        print(f"   Created: {task.created_at.strftime('%Y-%m-%d %H:%M')}")
        print(f"   By: {task.created_by.name}")
        print()
    
    try:
        choice = input("Enter task number to delete (or 'q' to quit): ").strip()
        
        if choice.lower() == 'q':
            return
            
        task_num = int(choice)
        if 1 <= task_num <= len(tasks):
            task_to_delete = tasks[task_num - 1]
            
            confirm = input(f"Delete '{task_to_delete.title}'? (y/N): ").strip().lower()
            
            if confirm == 'y':
                task_to_delete.delete()
                print(f"✅ Task '{task_to_delete.title}' deleted successfully!")
            else:
                print("❌ Delete cancelled.")
        else:
            print("❌ Invalid task number.")
            
    except ValueError:
        print("❌ Invalid input.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    list_and_delete_tasks()