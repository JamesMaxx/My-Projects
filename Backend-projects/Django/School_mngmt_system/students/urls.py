#!/usr/bin/env python3

"""
URLs for the Students app.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.student_dashboard, name='student_dashboard'),
    path('<int:student_id>/records/', views.student_academic_records, name='student_records'),
]
