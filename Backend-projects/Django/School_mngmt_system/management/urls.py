#!/usr/bin/env python3

"""
URLs for the Management app.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.management_dashboard, name='management_dashboard'),
    path('reports/', views.management_reports, name='management_reports'),
]
