from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'role', 'phone_number', 'country', 'skills', 'experience', 'resume', 'education', 'certifications', 'availability_status', 'weekly_capacity_hours', 'department', 'designation', 'skill_levels')
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            name=validated_data.get('name', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'User'),
            phone_number=validated_data.get('phone_number', ''),
            country=validated_data.get('country', ''),
            skills=validated_data.get('skills', ''),
            experience=validated_data.get('experience', ''),
            resume=validated_data.get('resume', None),
            education=validated_data.get('education', ''),
            certifications=validated_data.get('certifications', ''),
            availability_status=validated_data.get('availability_status', 'Available'),
            weekly_capacity_hours=validated_data.get('weekly_capacity_hours', 40),
            department=validated_data.get('department', 'Engineering'),
            designation=validated_data.get('designation', 'Talent Specialist'),
            skill_levels=validated_data.get('skill_levels', {})
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    approved_count = serializers.IntegerField(required=False, read_only=True)
    rejected_count = serializers.IntegerField(required=False, read_only=True)
    pending_count = serializers.IntegerField(required=False, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'role', 'bio', 'skills', 'phone_number', 'country', 'experience', 'resume', 'education', 'certifications', 'availability_status', 'weekly_capacity_hours', 'department', 'designation', 'skill_levels', 'date_joined', 'approved_count', 'rejected_count', 'pending_count')
        read_only_fields = ('approved_count', 'rejected_count', 'pending_count')

