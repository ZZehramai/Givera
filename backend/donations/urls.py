from django.urls import path

from . import views

urlpatterns = [
    path("", views.DonationCreateView.as_view(), name="donation-create"),
    path("demo-checkout/", views.DemoPaymentCreateView.as_view(), name="demo-payment-create"),
    path("demo-checkout/mine/", views.MyDemoPaymentListView.as_view(), name="demo-payment-list"),
    path("demo-checkout/<uuid:pk>/confirm/", views.DemoPaymentConfirmView.as_view(), name="demo-payment-confirm"),
    path("demo-checkout/<uuid:pk>/simulate/", views.DemoPaymentSimulateView.as_view(), name="demo-payment-simulate"),
    path("demo-checkout/<uuid:pk>/certificate/", views.DemoPaymentCertificateView.as_view(), name="demo-payment-certificate"),
    path("mine/", views.MyDonationListView.as_view(), name="my-donations"),
    path("admin/all/", views.AdminDonationListView.as_view(), name="admin-donations"),
]
