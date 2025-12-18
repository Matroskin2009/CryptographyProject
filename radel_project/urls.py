
from django.contrib import admin
from django.urls import path
from django.views.generic import detail

from radel_app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('main/', views.main, name='main'),
]
