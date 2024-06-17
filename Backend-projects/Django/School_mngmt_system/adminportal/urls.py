#!/usr/bin/env python3

"""
URLs for the Admin Portal app.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.admin_dashboard, name='admin_dashboard'),
]
