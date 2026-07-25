from django.urls import path

from . import views

urlpatterns = [
    path("", views.CampaignListCreateView.as_view(), name="campaign-list"),
    path("mine/", views.MyCampaignListView.as_view(), name="my-campaigns"),
    path("pending/", views.PendingCampaignListView.as_view(), name="pending-campaigns"),
    path("<uuid:pk>/", views.CampaignDetailView.as_view(), name="campaign-detail"),
    path("<uuid:pk>/review/", views.CampaignReviewView.as_view(), name="campaign-review"),
]
