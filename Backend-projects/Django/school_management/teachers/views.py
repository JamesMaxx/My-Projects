from django.shortcuts import render
from .models import Teacher

def dashboard(request):
    teacher = Teacher.objects.get(user=request.user)
    return render(request, 'teachers/dashboard.html', {'teacher': teacher})
