#!/usr/bin/env python3

"""
Views for the Admin Portal app.
"""

from django.shortcuts import render
from .models import SystemUser

def admin_dashboard(request):
    users = SystemUser.objects.all()
    return render(request, 'adminportal/dashboard.html', {'users': users})
