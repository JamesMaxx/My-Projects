from django.contrib import admin
from .models import Teacher
from .models import Teacher, Assignment
admin.site.register(Teacher)
admin.site.register(Assignment)
