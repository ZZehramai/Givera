from django.urls import path

from . import views

urlpatterns = [
    path("dashboard/", views.AdminDashboardReportView.as_view(), name="admin-dashboard-report"),
    path("export/<str:resource>/", views.AdminDataExportView.as_view(), name="admin-data-export"),
]
