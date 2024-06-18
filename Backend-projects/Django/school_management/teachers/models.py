from django.db import models
from django.contrib.auth.models import User

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100)
    # Add other fields like classes, schedule, etc.

    def __str__(self):
        return self.user.username
