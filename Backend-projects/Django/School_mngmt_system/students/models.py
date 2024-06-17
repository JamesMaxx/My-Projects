#!/usr/bin/env python3
"""
Models for the Students app.
"""

from django.db import models

class Student(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    grade = models.CharField(max_length=10)
    attendance = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class AcademicRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course_name = models.CharField(max_length=200)
    grade = models.CharField(max_length=2)
    
    def __str__(self):
        return f"{self.student.first_name} {self.course_name}"
