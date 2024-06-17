#!/usr/bin/env python3

"""
Views for the Teachers app.
"""

from django.shortcuts import render
from .models import Teacher, Assignment

def teacher_dashboard(request):
    teachers = Teacher.objects.all()
    return render(request, 'teachers/dashboard.html', {'teachers': teachers})

def teacher_assignments(request, teacher_id):
    assignments = Assignment.objects.filter(teacher_id=teacher_id)
    return render(request, 'teachers/assignments.html', {'assignments': assignments})
