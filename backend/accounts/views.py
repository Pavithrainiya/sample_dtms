from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Dispatch automatic welcome email notification from admin (pavijeevi56@gmail.com)
        try:
            from django.core.mail import EmailMultiAlternatives
            from django.conf import settings

            user_email = user.email
            username = user.first_name or user.username or user_email

            # 1. Welcome email to registered user
            user_subject = "Welcome to DTMS - Registration Confirmation"
            user_text = f"""Hello {username},

Welcome to the Digital Talent Management System (DTMS)!

Your user account has been successfully registered with the following details:
- Email Address: {user_email}
- Account Role: {user.role}
- Registration Date: {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}

You can now log in to the DTMS Portal to manage your assigned missions and submit deliverables.

Best regards,
DTMS Administration
pavijeevi56@gmail.com
"""
            user_html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #334155; border-radius: 16px; background-color: #0f172a; color: #f8fafc;">
              <h2 style="color: #38bdf8; margin-top: 0; border-bottom: 2px solid #0284c7; padding-bottom: 10px;">Welcome to DTMS Talent Portal!</h2>
              <p>Hello <strong>{username}</strong>,</p>
              <p>Your user account has been successfully registered on the Digital Talent Management System.</p>
              <div style="background-color: #1e293b; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #334155;">
                <p style="margin: 6px 0;"><strong>Registered Email:</strong> <span style="color: #38bdf8;">{user_email}</span></p>
                <p style="margin: 6px 0;"><strong>System Role:</strong> <span style="color: #a855f7;">{user.role}</span></p>
                <p style="margin: 6px 0;"><strong>Registration Timestamp:</strong> {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}</p>
              </div>
              <p>You can now log in to access assigned missions, track SLA compliance, and submit work deliverables.</p>
              <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" />
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">Sent automatically from DTMS Admin (pavijeevi56@gmail.com).</p>
            </div>
            """

            msg_user = EmailMultiAlternatives(
                subject=user_subject,
                body=user_text,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'pavijeevi56@gmail.com'),
                to=[user_email]
            )
            msg_user.attach_alternative(user_html, "text/html")
            msg_user.send(fail_silently=True)

            # 2. Alert email to Admin (pavijeevi56@gmail.com)
            admin_email = 'pavijeevi56@gmail.com'
            if user_email.lower() != admin_email.lower():
                admin_subject = f"New User Registration: {username} ({user_email})"
                admin_text = f"""New User Registered on DTMS:

Name: {username}
Email: {user_email}
Role: {user.role}
Date: {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}
"""
                msg_admin = EmailMultiAlternatives(
                    subject=admin_subject,
                    body=admin_text,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'pavijeevi56@gmail.com'),
                    to=[admin_email]
                )
                msg_admin.send(fail_silently=True)

        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send registration email: {e}")

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user, context=self.get_serializer_context()).data
        return Response({
            "user": user_data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=201)

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        from django.db.models import Count, Case, When, IntegerField
        if self.request.user.role == 'Admin':
            return User.objects.all().annotate(
                approved_count=Count(Case(When(my_submissions__status='Reviewed', then=1), output_field=IntegerField())),
                rejected_count=Count(Case(When(my_submissions__status='Rejected', then=1), output_field=IntegerField())),
                pending_count=Count(Case(When(my_submissions__status='Submitted', then=1), output_field=IntegerField())),
            ).order_by('-date_joined')
        return User.objects.filter(id=self.request.user.id)

class TalentDirectoryView(generics.ListAPIView):
    """Enterprise Digital Talent Directory View with filtering by skills and availability."""
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        from django.db.models import Count, Case, When, IntegerField, Q
        queryset = User.objects.filter(role='User').annotate(
            approved_count=Count(Case(When(my_submissions__status='Reviewed', then=1), output_field=IntegerField())),
            rejected_count=Count(Case(When(my_submissions__status='Rejected', then=1), output_field=IntegerField())),
            pending_count=Count(Case(When(my_submissions__status='Submitted', then=1), output_field=IntegerField())),
        )
        
        skill = self.request.query_params.get('skill')
        availability = self.request.query_params.get('availability')
        department = self.request.query_params.get('department')
        search = self.request.query_params.get('search')
        
        if skill:
            queryset = queryset.filter(skills__icontains=skill)
        if availability:
            queryset = queryset.filter(availability_status__iexact=availability)
        if department:
            queryset = queryset.filter(department__icontains=department)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(email__icontains=search) | 
                Q(skills__icontains=search) | 
                Q(experience__icontains=search) |
                Q(department__icontains=search) |
                Q(designation__icontains=search)
            )
            
        return queryset.order_by('-date_joined')

