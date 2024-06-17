#!/usr/bin/env python3

"""
Main URL configuration for the School Management System.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('students/', include('students.urls')),
    path('teachers/', include('teachers.urls')),
    path('management/', include('management.urls')),
    path('admin_portal/', include('adminportal.urls')),
]
