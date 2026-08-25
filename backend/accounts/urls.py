from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('google/', views.GoogleLoginView.as_view(), name='google-login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', views.TokenRefreshView.as_view(), name='token-refresh'),

    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('newsletter/subscribe/', views.NewsletterSubscriptionView.as_view(), name='newsletter-subscribe'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<uuid:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/read-all/', views.NotificationMarkAllReadView.as_view(), name='notification-read-all'),
    path('notifications/<uuid:pk>/read/', views.NotificationReadView.as_view(), name='notification-read'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
]
