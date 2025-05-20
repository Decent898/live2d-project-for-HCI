from langchain_openai import ChatOpenAI
from django.conf import settings
from .knowledge_base import KnowledgeBase

class AIService:
    """AI对话服务类"""
    
    def __init__(self):
        """初始化AI服务"""
        self.llm = ChatOpenAI(
            model_name="gpt-3.5-turbo",
            temperature=0.7,
            openai_api_key=settings.OPENAI_API_KEY
        )
        self.knowledge_base = KnowledgeBase()
    
    def chat(self, query, conversation_history=None, companion=None):
        """
        生成AI回复
        
        Args:
            query (str): 用户输入的消息
            conversation_history (list): 对话历史列表，每个元素包含'is_user'和'content'
            companion (Companion): AI角色配置
            
        Returns:
            str: AI的回复内容
        """
        # 获取相关知识
        knowledge_docs = self.knowledge_base.search(query)
        knowledge_context = ""
        if knowledge_docs:
            knowledge_context = "\n\n相关知识：\n" + "\n---\n".join(
                [doc.page_content for doc in knowledge_docs]
            )
        
        # 构建系统提示
        system_prompt = "你是一个友好的智能助手。"
        if companion:
            system_prompt = companion.system_prompt + f"\n\n你的名字是{companion.name}，你的性格是{companion.personality}"
        
        system_prompt += knowledge_context
        
        # 构建消息历史
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # 添加对话历史
        if conversation_history:
            for msg in conversation_history:
                role = "user" if msg['is_user'] else "assistant"
                messages.append({"role": role, "content": msg['content']})
        
        # 添加当前用户消息
        messages.append({"role": "user", "content": query})
        
        # 调用AI生成回复
        try:
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            print(f"AI响应生成错误: {e}")
            return "抱歉，我遇到了一些问题，请稍后再试。"
