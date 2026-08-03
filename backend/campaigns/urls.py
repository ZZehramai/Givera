from django.urls import path

from . import views

urlpatterns = [
    path("", views.CampaignListCreateView.as_view(), name="campaign-list"),
    path("mine/", views.MyCampaignListView.as_view(), name="my-campaigns"),
    path("pending/", views.PendingCampaignListView.as_view(), name="pending-campaigns"),
    path("admin/all/", views.AdminCampaignListView.as_view(), name="admin-campaigns"),
    path("<uuid:pk>/", views.CampaignDetailView.as_view(), name="campaign-detail"),
    path("<uuid:pk>/updates/", views.CampaignUpdateListCreateView.as_view(), name="campaign-updates"),
    path("<uuid:pk>/review/", views.CampaignReviewView.as_view(), name="campaign-review"),
]
