from django.db import models
from django.contrib.auth.models import User

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    grade = models.CharField(max_length=10)
    # Add other fields like attendance, schedule, etc.

    def __str__(self):
        return self.user.username
