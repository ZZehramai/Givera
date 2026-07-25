from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin

from .models import Campaign
from .serializers import CampaignReviewSerializer, CampaignSerializer


class CampaignListCreateView(generics.ListCreateAPIView):
    serializer_class = CampaignSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Campaign.objects.filter(status=Campaign.Status.APPROVED).select_related("owner")
        query = self.request.query_params.get("q", "").strip()
        category = self.request.query_params.get("category", "").strip()
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(summary__icontains=query)
                | Q(story__icontains=query)
                | Q(location__icontains=query)
            )
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, status=Campaign.Status.PENDING)


class CampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CampaignSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Campaign.objects.select_related("owner")
        user = self.request.user
        if user.is_authenticated:
            if user.is_admin_role or user.is_staff:
                return queryset
            return queryset.filter(
                Q(status=Campaign.Status.APPROVED) | Q(owner=user)
            ).distinct()
        return queryset.filter(status=Campaign.Status.APPROVED)

    def perform_update(self, serializer):
        campaign = self.get_object()
        if campaign.owner != self.request.user:
            raise PermissionDenied("Only the campaign owner can edit this campaign.")
        if campaign.status not in {Campaign.Status.DRAFT, Campaign.Status.PENDING, Campaign.Status.REJECTED}:
            raise ValidationError("Approved or completed campaigns cannot be edited.")
        serializer.save(status=Campaign.Status.PENDING, rejection_reason="")

    def perform_destroy(self, instance):
        if (
            instance.owner != self.request.user
            and not self.request.user.is_admin_role
            and not self.request.user.is_staff
        ):
            raise PermissionDenied("Only the campaign owner can delete this campaign.")
        if (
            not self.request.user.is_admin_role
            and not self.request.user.is_staff
            and instance.status not in {
            Campaign.Status.DRAFT,
            Campaign.Status.PENDING,
            Campaign.Status.REJECTED,
            }
        ):
            raise ValidationError("Approved or completed campaigns cannot be deleted.")
        instance.delete()


class MyCampaignListView(generics.ListAPIView):
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Campaign.objects.filter(owner=self.request.user).select_related("owner")


class PendingCampaignListView(generics.ListAPIView):
    serializer_class = CampaignSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Campaign.objects.filter(status=Campaign.Status.PENDING).select_related("owner")


class CampaignReviewView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        campaign = get_object_or_404(Campaign, pk=pk)
        serializer = CampaignReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        decision = serializer.validated_data["status"]

        if decision == Campaign.Status.APPROVED:
            campaign.status = Campaign.Status.APPROVED
            campaign.rejection_reason = ""
            campaign.approved_at = timezone.now()
        else:
            campaign.status = Campaign.Status.REJECTED
            campaign.rejection_reason = serializer.validated_data["rejection_reason"]
            campaign.approved_at = None

        campaign.save(
            update_fields=["status", "rejection_reason", "approved_at", "updated_at"]
        )
        return Response(CampaignSerializer(campaign).data, status=status.HTTP_200_OK)
