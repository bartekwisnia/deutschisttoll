"""LernenDe URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic.base import TemplateView
from django.contrib.auth.views import LoginView, LogoutView
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from user_profile.views import RegisterView, change_password

urlpatterns = [
    path('exercise/', include('exercises.urls', namespace='exercises-namespace')),
    #
    # path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('', include('frontend.urls')),
    path('blog/', include('frontend.urls')),
    path('kontakt/', include('frontend.urls')),
    re_path(r'^teaching/[0-9]*', include('frontend.urls')),
    path('content/', include('frontend.urls')),
    path('students/', include('frontend.urls')),
    path('learning/', include('frontend.urls')),
    path('self-learning/', include('frontend.urls')),
    #
    path('admin/', admin.site.urls),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('change-password/', change_password, name='change-password'),
]
urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
