import os
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from django.conf import settings

class KnowledgeBase:
    """知识库服务类"""
    
    def __init__(self, knowledge_dir="knowledge"):
        """初始化知识库服务"""
        self.knowledge_dir = knowledge_dir
        self.embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
        self.db = None
        
        # 加载知识库文档
        self.load_knowledge()
    
    def load_knowledge(self):
        """加载知识库中的所有文档"""
        documents = []
        knowledge_path = os.path.join(settings.BASE_DIR, self.knowledge_dir)
        
        # 检查目录是否存在
        if not os.path.exists(knowledge_path):
            os.makedirs(knowledge_path)
            
            # 创建一个示例文档
            with open(os.path.join(knowledge_path, 'example.txt'), 'w', encoding='utf-8') as f:
                f.write("这是一个示例知识文档。你可以在这里添加有关AI助手的知识。")
        
        # 遍历知识库目录加载文档
        for root, _, files in os.walk(knowledge_path):
            for file in files:
                file_path = os.path.join(root, file)
                try:
                    if file.lower().endswith('.txt'):
                        loader = TextLoader(file_path, encoding='utf-8')
                        documents.extend(loader.load())
                    elif file.lower().endswith('.pdf'):
                        loader = PyPDFLoader(file_path)
                        documents.extend(loader.load())
                except Exception as e:
                    print(f"加载文档 {file_path} 时出错: {e}")
                    continue
        
        if not documents:
            print("警告: 没有加载任何知识文档!")
            return
        
        # 分割文档
        text_splitter = CharacterTextSplitter(
            separator="\n",
            chunk_size=1000,
            chunk_overlap=200
        )
        texts = text_splitter.split_documents(documents)
        
        # 创建向量存储
        if texts:
            try:
                self.db = FAISS.from_documents(texts, self.embeddings)
                print(f"成功加载 {len(texts)} 个文档片段到知识库")
            except Exception as e:
                print(f"创建向量存储时出错: {e}")
    
    def search(self, query, k=3):
        """根据查询搜索知识库，返回最相关的k个文档片段"""
        if not self.db:
            return []
        
        try:
            docs = self.db.similarity_search(query, k=k)
            return docs
        except Exception as e:
            print(f"搜索知识库时出错: {e}")
            return []
