from django.db import models
from django.contrib.auth.models import User

class Conversation(models.Model):
    """对话记录模型"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="用户")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    
    class Meta:
        verbose_name = "对话"
        verbose_name_plural = "对话记录"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.username}的对话 - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class Message(models.Model):
    """消息模型"""
    conversation = models.ForeignKey(Conversation, related_name="messages", on_delete=models.CASCADE, verbose_name="对话")
    is_user = models.BooleanField(default=True, verbose_name="是否用户消息")
    content = models.TextField(verbose_name="内容")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="发送时间")
    
    class Meta:
        verbose_name = "消息"
        verbose_name_plural = "消息记录"
        ordering = ['created_at']
    
    def __str__(self):
        sender = "用户" if self.is_user else "AI"
        return f"{sender}: {self.content[:30]}..."

class Companion(models.Model):
    """AI角色模型"""
    name = models.CharField(max_length=50, verbose_name="名称")
    description = models.TextField(verbose_name="描述")
    avatar = models.CharField(max_length=255, verbose_name="形象资源路径")
    personality = models.TextField(verbose_name="性格特点")
    system_prompt = models.TextField(verbose_name="系统提示词")
    
    class Meta:
        verbose_name = "AI角色"
        verbose_name_plural = "AI角色"
    
    def __str__(self):
        return self.name
