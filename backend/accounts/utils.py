import random
from django.core.mail import send_mail
from django.conf import settings


def generate_otp():
    return f'{random.randint(0, 999999):06d}'


def send_password_reset_email(user, code):
    subject = 'Givera - Password Reset Code'
    message = (
        f'Hi {user.first_name or user.username},\n\n'
        f'Your password reset code is: {code}\n'
        f'This code expires in 15 minutes.\n\n'
        f'If you did not request this, you can ignore this email.\n\n'
        f'- The Givera Team'
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)


def send_welcome_email(user):
    subject = 'Welcome to Givera!'
    message = (
        f'Hi {user.first_name or user.username},\n\n'
        f'Thanks for joining Givera. Start exploring campaigns and make an impact today.\n\n'
        f'- The Givera Team'
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
