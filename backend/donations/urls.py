from django.urls import path

from . import views

urlpatterns = [
    path("", views.DonationCreateView.as_view(), name="donation-create"),
    path("mine/", views.MyDonationListView.as_view(), name="my-donations"),
]
