import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
from datetime import datetime

logger = logging.getLogger(__name__)

def send_task_assignment_email(task, assigned_users):
    """
    Send email notification when a task is assigned to users
    """
    if not assigned_users:
        logger.warning("No users to notify for task assignment")
        return False

    try:
        # Email template content
        subject = f"[DTMS] New Mission Assigned: {task.title}"
        
        # Create HTML email content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ padding: 30px; }}
                .mission-brief {{ background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 0 5px 5px 0; }}
                .details {{ background-color: #fff; border: 1px solid #e1e5e9; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .deadline {{ color: #e74c3c; font-weight: bold; font-size: 18px; }}
                .footer {{ background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
                .warning {{ color: #e67e22; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎯 DTMS - Digital Talent Management System</h1>
                    <h2>MISSION ASSIGNMENT NOTIFICATION</h2>
                </div>
                
                <div class="content">
                    <p><strong>Greetings Talent,</strong></p>
                    
                    <p>A new operational mission has been assigned to you by the <strong>Global Administration</strong>.</p>
                    
                    <div class="mission-brief">
                        <h3>📋 MISSION BRIEF</h3>
                        <p><strong>TITLE:</strong> {task.title}</p>
                        <p><strong>ASSIGNED BY:</strong> {task.created_by.name} ({task.created_by.email})</p>
                        <p class="deadline"><strong>⏰ DEADLINE:</strong> {task.deadline.strftime('%B %d, %Y at %I:%M %p')}</p>
                    </div>
                    
                    <div class="details">
                        <h3>📝 MISSION DESCRIPTION</h3>
                        <p>{task.description}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/dashboard" class="button">🚀 ACCESS MISSION DASHBOARD</a>
                    </div>
                    
                    <div class="warning">
                        <p><strong>⚠️ IMPORTANT NOTES:</strong></p>
                        <ul>
                            <li>Please log in to the DTMS to review complete mission details</li>
                            <li>Submit your work before the deadline to ensure successful completion</li>
                            <li>Contact your administrator if you need clarification</li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>Digital Talent Management System</strong></p>
                    <p>This is an automated operational notification. Please do not reply directly to this email.</p>
                    <p>📧 System Email: {settings.DEFAULT_FROM_EMAIL}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version for email clients that don't support HTML
        text_content = f"""
DTMS - MISSION ASSIGNMENT NOTIFICATION

Greetings Talent,

A new operational mission has been assigned to you by the Global Administration.

--- MISSION BRIEF ---
TITLE: {task.title}
ASSIGNED BY: {task.created_by.name} ({task.created_by.email})
DEADLINE: {task.deadline.strftime('%B %d, %Y at %I:%M %p')}

MISSION DESCRIPTION:
{task.description}

IMPORTANT:
- Please log in to the Digital Talent Management System (DTMS) to review the complete mission context
- Submit your work before the deadline
- Access your dashboard at: http://localhost:5173/dashboard

This is an automated operational notification. Please do not reply directly to this email.

Digital Talent Management System
        """

        # Send email to each assigned user
        success_count = 0
        total_users = len(assigned_users)
        
        for user in assigned_users:
            try:
                # Create the email message
                msg = EmailMultiAlternatives(
                    subject=subject,
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email]
                )
                msg.attach_alternative(html_content, "text/html")
                
                # Add task attachment if exists
                if task.attachment:
                    try:
                        msg.attach_file(task.attachment.path)
                        logger.info(f"Attached file {task.attachment.name} to email for {user.email}")
                    except Exception as e:
                        logger.warning(f"Could not attach file to email for {user.email}: {e}")
                
                # Send the email
                msg.send()
                success_count += 1
                logger.info(f"Task assignment email sent successfully to {user.email}")
                
            except Exception as e:
                logger.error(f"Failed to send task assignment email to {user.email}: {e}")
                continue
        
        if success_count == total_users:
            logger.info(f"All task assignment emails sent successfully for task: {task.title}")
            return True
        elif success_count > 0:
            logger.warning(f"Partial success: {success_count}/{total_users} emails sent for task: {task.title}")
            return True
        else:
            logger.error(f"Failed to send any task assignment emails for task: {task.title}")
            return False
            
    except Exception as e:
        logger.error(f"Unexpected error in send_task_assignment_email: {e}")
        return False

def send_task_deadline_reminder(task, user):
    """
    Send reminder email for approaching task deadline
    """
    try:
        subject = f"[DTMS] ⏰ Mission Deadline Approaching: {task.title}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background-color: #fff3cd; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #ffc107; }}
                .header {{ background-color: #ffc107; color: #212529; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ padding: 30px; }}
                .urgent {{ background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .deadline {{ color: #dc3545; font-weight: bold; font-size: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⏰ DEADLINE REMINDER</h1>
                </div>
                <div class="content">
                    <div class="urgent">
                        <h2>Mission: {task.title}</h2>
                        <p class="deadline">Deadline: {task.deadline.strftime('%B %d, %Y at %I:%M %p')}</p>
                        <p>Please complete and submit your work as soon as possible.</p>
                    </div>
                    <div style="text-align: center;">
                        <a href="http://localhost:5173/dashboard" style="display: inline-block; background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">SUBMIT NOW</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
DTMS - DEADLINE REMINDER

Mission: {task.title}
Deadline: {task.deadline.strftime('%B %d, %Y at %I:%M %p')}

Please complete and submit your work as soon as possible.
Access your dashboard at: http://localhost:5173/dashboard
        """
        
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        logger.info(f"Deadline reminder sent to {user.email} for task: {task.title}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send deadline reminder to {user.email}: {e}")
        return False

def test_email_configuration():
    """
    Test if email configuration is working
    """
    try:
        from django.core.mail import send_mail
        
        send_mail(
            subject='DTMS Email Configuration Test',
            message='This is a test email to verify DTMS email configuration is working correctly.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Email configuration test failed: {e}")
        return False