"""
初始化服务模块
"""
from .external_api_service import ExternalAPIService
from .knowledge_base import KnowledgeBase

# 创建AI服务单例，使用外部API服务
ai_service = ExternalAPIService()
