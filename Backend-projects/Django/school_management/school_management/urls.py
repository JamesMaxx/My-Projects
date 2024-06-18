"""
URL configuration for school_management project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .views import home

"""
The URL patterns for the school management system. This includes the following routes:

- `admin/`: The Django admin site.
- `students/`: Routes related to student management, defined in the `students.urls` module.
- `teachers/`: Routes related to teacher management, defined in the `teachers.urls` module.
- `management/`: Routes related to school management, defined in the `management.urls` module.
- `admin-portal/`: Routes related to the admin portal, defined in the `admin_portal.urls` module.
"""
urlpatterns = [
    path('admin', admin.site.urls),
    path('students', include('students.urls')),
    path('teachers', include('teachers.urls')),
    path('management/', include('management.urls')),
    path('admin-portal', include('admin_portal.urls')),
    path('', home, name='home'),
]
