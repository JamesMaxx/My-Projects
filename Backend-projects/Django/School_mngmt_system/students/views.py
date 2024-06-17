#!/usr/bin/env python3

"""
Views for the Students app.
"""

from django.shortcuts import render
from .models import Student, AcademicRecord

def student_dashboard(request):
    students = Student.objects.all()
    return render(request, 'students/dashboard.html', {'students': students})

def student_academic_records(request, student_id):
    records = AcademicRecord.objects.filter(student_id=student_id)
    return render(request, 'students/records.html', {'records': records})
