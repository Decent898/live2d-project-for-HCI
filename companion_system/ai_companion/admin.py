from django.contrib import admin
from .models import Conversation, Message, Companion

@admin.register(Companion)
class CompanionAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at', 'updated_at')
    list_filter = ('user', 'created_at')
    search_fields = ('user__username',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'is_user', 'short_content', 'created_at')
    list_filter = ('is_user', 'created_at')
    search_fields = ('content',)
    
    def short_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    
    short_content.short_description = '内容预览'
