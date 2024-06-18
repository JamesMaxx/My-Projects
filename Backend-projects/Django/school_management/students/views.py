from django.shortcuts import render
from .models import Student

def dashboard(request):
    student = Student.objects.get(user=request.user)
    return render(request, 'students/dashboard.html', {'student': student})
