#!/usr/bin/env python3

"""
URLs for the Teachers app.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.teacher_dashboard, name='teacher_dashboard'),
    path('<int:teacher_id>/assignments/', views.teacher_assignments, name='teacher_assignments'),
]
