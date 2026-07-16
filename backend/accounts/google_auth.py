from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed


def verify_google_token(token):
    """
    Verifies a Google ID token (sent by the React frontend after
    @react-oauth/google or Google Identity Services sign-in) and
    returns the decoded payload.
    """
    try:
        idinfo = id_token.verify_oauth2_token(
            token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        if idinfo.get('aud') != settings.GOOGLE_CLIENT_ID:
            raise AuthenticationFailed('Invalid Google client ID audience.')
        return idinfo
    except ValueError as exc:
        raise AuthenticationFailed(f'Invalid Google token: {exc}')
