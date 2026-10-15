from django.contrib import admin

from .models import DemoPayment, Donation

admin.site.register(Donation)
admin.site.register(DemoPayment)
