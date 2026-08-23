from django.urls import path

from . import views

urlpatterns = [
    path("", views.CampaignListCreateView.as_view(), name="campaign-list"),
    path("mine/", views.MyCampaignListView.as_view(), name="my-campaigns"),
    path("pending/", views.PendingCampaignListView.as_view(), name="pending-campaigns"),
    path("admin/all/", views.AdminCampaignListView.as_view(), name="admin-campaigns"),
    path("recommendations/", views.CampaignRecommendationView.as_view(), name="campaign-recommendations"),
    path("<uuid:pk>/", views.CampaignDetailView.as_view(), name="campaign-detail"),
    path("<uuid:pk>/updates/", views.CampaignUpdateListCreateView.as_view(), name="campaign-updates"),
    path("<uuid:pk>/media/", views.CampaignMediaListCreateView.as_view(), name="campaign-media"),
    path("<uuid:pk>/media/<uuid:media_pk>/", views.CampaignMediaDetailView.as_view(), name="campaign-media-detail"),
    path("<uuid:pk>/donors/", views.CampaignDonorListView.as_view(), name="campaign-donors"),
    path("<uuid:pk>/fund-utilization/", views.FundUtilizationListCreateView.as_view(), name="fund-utilization"),
    path("<uuid:pk>/fund-utilization/<uuid:utilization_pk>/review/", views.FundUtilizationReviewView.as_view(), name="fund-utilization-review"),
    path("<uuid:pk>/review/", views.CampaignReviewView.as_view(), name="campaign-review"),
    path("<uuid:pk>/manage/", views.CampaignManagementView.as_view(), name="campaign-management"),
]
