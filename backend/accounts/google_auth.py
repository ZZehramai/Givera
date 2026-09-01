from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google.auth.exceptions import TransportError
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed


class GoogleTokenRequest(google_requests.Request):
    """Keep Google certificate lookups from blocking a login request."""

    def __call__(self, url, method='GET', body=None, headers=None, timeout=10, **kwargs):
        return super().__call__(
            url=url,
            method=method,
            body=body,
            headers=headers,
            timeout=min(timeout or 10, 10),
            **kwargs,
        )


def verify_google_token(token):
    """
    Verifies a Google ID token (sent by the React frontend after
    @react-oauth/google or Google Identity Services sign-in) and
    returns the decoded payload.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise AuthenticationFailed(
            'Google Sign-In is not configured on the server.'
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            token, GoogleTokenRequest(), settings.GOOGLE_CLIENT_ID
        )
        if idinfo.get('aud') != settings.GOOGLE_CLIENT_ID:
            raise AuthenticationFailed('Invalid Google client ID audience.')
        return idinfo
    except ValueError as exc:
        raise AuthenticationFailed(f'Invalid Google token: {exc}')
    except TransportError as exc:
        raise AuthenticationFailed(
            'Google verification is temporarily unavailable. Please try again.'
        ) from exc
