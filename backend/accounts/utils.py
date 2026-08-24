from django.core.mail import send_mail
from django.conf import settings


def send_password_reset_email(user, reset_url):
    subject = 'Reset your Givera password'
    message = (
        f'Hi {user.first_name or user.username},\n\n'
        f'We received a request to reset your Givera password.\n\n'
        f'Reset your password: {reset_url}\n\n'
        f'This secure link expires in 30 minutes and can only be used once.\n\n'
        f'If you did not request this, you can ignore this email.\n\n'
        f'- The Givera Team'
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)


def send_welcome_email(user):
    subject = 'Welcome to Givera!'
    message = (
        f'Hi {user.first_name or user.username},\n\n'
        f'Thanks for joining Givera. Start exploring campaigns and make an impact today.\n\n'
        f'- The Givera Team'
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
