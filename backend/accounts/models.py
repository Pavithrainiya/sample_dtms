from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('User', 'User'),
    )
    AVAILABILITY_CHOICES = (
        ('Available', 'Available'),
        ('Occupied', 'Occupied'),
        ('On Leave', 'On Leave'),
    )
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='User')
    bio = models.TextField(null=True, blank=True)
    skills = models.CharField(max_length=500, null=True, blank=True)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    experience = models.TextField(null=True, blank=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    
    # Extended Enterprise Talent Profile Fields
    education = models.TextField(null=True, blank=True)
    certifications = models.TextField(null=True, blank=True)
    availability_status = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='Available')
    weekly_capacity_hours = models.IntegerField(default=40)
    department = models.CharField(max_length=100, null=True, blank=True, default='Engineering')
    designation = models.CharField(max_length=100, null=True, blank=True, default='Talent Specialist')
    skill_levels = models.JSONField(null=True, blank=True, default=dict)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

    def __str__(self):
        return self.email

