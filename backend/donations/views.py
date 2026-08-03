from django.db import transaction
from django.db.models import F
from rest_framework import generics, permissions

from accounts.permissions import IsAdmin
from campaigns.models import Campaign

from .models import Donation
from .serializers import DonationSerializer


class DonationCreateView(generics.CreateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        campaign = Campaign.objects.select_for_update().get(
            pk=serializer.validated_data["campaign"].pk
        )
        donation = serializer.save(donor=self.request.user, campaign=campaign)
        Campaign.objects.filter(pk=campaign.pk).update(
            amount_raised=F("amount_raised") + donation.amount
        )


class MyDonationListView(generics.ListAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Donation.objects.filter(donor=self.request.user).select_related(
            "donor", "campaign", "campaign__owner"
        )


class AdminDonationListView(generics.ListAPIView):
    serializer_class = DonationSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Donation.objects.select_related("donor", "campaign", "campaign__owner")
