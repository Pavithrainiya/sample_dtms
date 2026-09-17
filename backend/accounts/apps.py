from django.apps import AppConfig
from django.db.models.signals import post_migrate

def seed_default_users(sender, **kwargs):
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()

        default_users = [
            {
                'email': 'admin@example.com',
                'username': 'admin',
                'password': 'admin123',
                'name': 'System Administrator',
                'role': 'Admin',
                'is_staff': True,
                'is_superuser': True,
                'department': 'Administration',
                'designation': 'Chief Technology Officer'
            },
            {
                'email': 'pavijeevi56@gmail.com',
                'username': 'pavijeevi56',
                'password': 'admin123',
                'name': 'Pavithra Admin',
                'role': 'Admin',
                'is_staff': True,
                'is_superuser': True,
                'department': 'Administration',
                'designation': 'Lead Administrator'
            },
            {
                'email': 'pavithrakumaran1405@gmail.com',
                'username': 'pavithrakumaran1405',
                'password': '12345678',
                'name': 'Pavithra Kumaran',
                'role': 'User',
                'is_staff': False,
                'is_superuser': False,
                'department': 'Engineering',
                'designation': 'Full Stack Developer',
                'skills': 'React, Python, Django, REST API, Tailwind'
            }
        ]

        for data in default_users:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'username': data['username'],
                    'name': data['name'],
                    'role': data['role'],
                    'is_staff': data.get('is_staff', False),
                    'is_superuser': data.get('is_superuser', False),
                    'department': data.get('department', 'Engineering'),
                    'designation': data.get('designation', 'Talent Specialist'),
                    'skills': data.get('skills', 'React, Python')
                }
            )
            if created:
                user.set_password(data['password'])
                user.save()
                print(f"Auto-seeded user account: {user.email}")
            else:
                # Ensure password is set if user exists
                user.set_password(data['password'])
                user.save()
    except Exception as e:
        print(f"User seeding warning: {e}")

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        post_migrate.connect(seed_default_users, sender=self)

