from django.urls import path

from .views import CampaignWritingAssistantView, GiveraHelpView


urlpatterns = [
    path("campaign-writing/", CampaignWritingAssistantView.as_view(), name="campaign-writing"),
    path("help/", GiveraHelpView.as_view(), name="givera-help"),
]
