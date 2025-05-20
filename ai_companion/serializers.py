from rest_framework import serializers
from .models import Conversation, Message, Companion

class CompanionSerializer(serializers.ModelSerializer):
    """AI角色序列化器"""
    class Meta:
        model = Companion
        fields = ['id', 'name', 'description', 'avatar', 'personality']

class MessageSerializer(serializers.ModelSerializer):
    """消息序列化器"""
    class Meta:
        model = Message
        fields = ['id', 'is_user', 'content', 'created_at']

class ConversationSerializer(serializers.ModelSerializer):
    """对话序列化器"""
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'created_at', 'updated_at', 'messages']
