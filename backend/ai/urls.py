from django.urls import path

from .views import CampaignTrustAssessmentView, CampaignWritingAssistantView, GiveraHelpView


urlpatterns = [
    path("campaign-writing/", CampaignWritingAssistantView.as_view(), name="campaign-writing"),
    path("help/", GiveraHelpView.as_view(), name="givera-help"),
    path("campaign-trust/<uuid:pk>/", CampaignTrustAssessmentView.as_view(), name="campaign-trust"),
]
