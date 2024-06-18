from django.shortcuts import render
from .models import Staff

def dashboard(request):
    staff = Staff.objects.all()
    return render(request, 'management/dashboard.html', {'staff': staff})
