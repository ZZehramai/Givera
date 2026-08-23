from requests import RequestException
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CampaignWritingRequestSerializer, GiveraHelpRequestSerializer
from .services import answer_givera_question, improve_campaign_writing


class CampaignWritingAssistantView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CampaignWritingRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            suggestion, provider = improve_campaign_writing(serializer.validated_data)
        except (RequestException, ValueError):
            return Response(
                {"detail": "The writing assistant is temporarily unavailable. Your original text has not changed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"suggestion": suggestion, "provider": provider})


class GiveraHelpView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GiveraHelpRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            answer, provider = answer_givera_question(serializer.validated_data)
        except (RequestException, ValueError):
            return Response(
                {"detail": "Givera Help is temporarily unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"answer": answer, "provider": provider})
