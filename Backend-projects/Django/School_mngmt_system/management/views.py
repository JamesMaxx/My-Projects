#!/usr/bin/env python3

"""
Views for the Management app.
"""

from django.shortcuts import render
from .models import Staff, Report

def management_dashboard(request):
    staff = Staff.objects.all()
    return render(request, 'management/dashboard.html', {'staff': staff})

def management_reports(request):
    reports = Report.objects.all()
    return render(request, 'management/reports.html', {'reports': reports})
