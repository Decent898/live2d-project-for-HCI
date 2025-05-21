from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/chat/', views.chat_api, name='chat_api'),
    path('api/speech/', views.speech_api, name='speech_api'),
    path('guide/live2d/', views.live2d_guide, name='live2d_guide'),
    path('test/live2d/', views.live2d_test, name='live2d_test'),
]
