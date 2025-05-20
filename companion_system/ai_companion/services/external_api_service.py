import requests
import json
import uuid
import os
import base64
from django.conf import settings
import time
import traceback
from .knowledge_base import KnowledgeBase
from urllib.parse import quote

class ExternalAPIService:
    """外部API服务类"""
    
    def __init__(self):
        """初始化API服务"""
        # API配置
        self.api_base_url = "https://agent.bit.edu.cn"
        self.app_id = "d0lirjbha6ps73975cl0"  # 使用与api_test2.py相同的AppID
        self.api_key = "d0ljqvinj0bs73a9p00g"  # 使用与api_test2.py相同的ApiKey
        
        # API请求通用头部
        self.headers = {
            "Apikey": self.api_key,
            "Content-Type": "application/json"
        }
        
        # 默认用户ID - 可以在请求时覆盖
        self.default_user_id = "web_user"
        
        # 默认会话ID - 首次调用chat方法时会创建新的会话
        self.app_conversation_id = None
        
        # 知识库
        self.knowledge_base = KnowledgeBase()

    def make_api_request(self, endpoint, method="POST", data=None, files=None):
        """
        执行API请求并返回JSON响应
        
        Args:
            endpoint: API路径，例如"/api/proxy/api/v1/create_conversation"
            method: HTTP方法(POST, GET等)
            data: 请求体数据(POST)或查询参数(GET)
            files: 文件数据(用于multipart请求)
            
        Returns:
            API响应的JSON对象，如果失败则返回None
        """
        url = f"{self.api_base_url}{endpoint}"
        
        try:
            if method.upper() == "POST":
                if files:
                    # 如果有文件，使用multipart形式请求
                    headers_without_content_type = {k: v for k, v in self.headers.items() if k != 'Content-Type'}
                    response = requests.post(
                        url, 
                        headers=headers_without_content_type,
                        data=data,
                        files=files,
                        timeout=60
                    )
                else:
                    # 普通JSON请求
                    print(f"发送JSON请求 URL: {url}")
                    if isinstance(data, dict) and "UserID" in data:
                        print(f"JSON请求包含UserID: {data['UserID']}")
                    
                    response = requests.post(
                        url, 
                        headers=self.headers, 
                        json=data, 
                        timeout=60
                    )
            elif method.upper() == "GET":
                response = requests.get(
                    url, 
                    headers=self.headers, 
                    params=data, 
                    timeout=60
                )
            else:
                print(f"不支持的HTTP方法: {method}")
                return None
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.HTTPError as e:
            print(f"HTTP错误: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"响应状态码: {e.response.status_code}")
                try:
                    print(f"响应内容: {e.response.text[:500]}")
                except:
                    print("无法打印响应内容")
            return None
        except requests.exceptions.RequestException as e:
            print(f"请求错误: {e}")
            return None
        except json.JSONDecodeError:
            print(f"无法解析JSON响应")
            if 'response' in locals() and response is not None:
                print(f"原始响应内容: {response.text[:500]}")
            return None
        except Exception as e:
            print(f"未知错误: {e}")
            traceback.print_exc()
            return None
        
    def create_conversation(self, user_id=None, inputs=None):
        """
        创建新会话
        
        Args:
            user_id (str): 用户ID，如果未提供则使用默认ID
            inputs (dict): 可选的会话初始输入变量
            
        Returns:
            str: 会话ID，如果失败则返回None
        """
        print("\n正在创建新会话...")
        endpoint = "/api/proxy/api/v1/create_conversation"
        
        if not user_id:
            user_id = self.default_user_id
            
        payload = {
            "UserID": user_id
        }
        
        if inputs:
            payload["Inputs"] = inputs
        else:
            payload["Inputs"] = {}
            
        response_data = self.make_api_request(endpoint, method="POST", data=payload)
        
        if response_data and response_data.get("Conversation") and response_data["Conversation"].get("AppConversationID"):
            self.app_conversation_id = response_data["Conversation"]["AppConversationID"]
            conversation_name = response_data["Conversation"].get("ConversationName", "N/A")
            print(f"会话创建成功! AppConversationID: {self.app_conversation_id}")
            return self.app_conversation_id
        else:
            print("创建会话失败")
            return None
            
    def prepare_files(self, file_paths):
        """
        准备文件数据用于发送到API
        
        Args:
            file_paths (list): 文件路径列表
            
        Returns:
            tuple: (prepared_files, files_data) - API格式的文件信息列表和multipart格式的文件数据
        """
        if not file_paths:
            return [], None
            
        prepared_files = []
        files_data = {}
        
        # 使用API服务提供的上传机制
        endpoint_upload = "/api/proxy/upload"
        
        for i, file_path in enumerate(file_paths):
            if not os.path.exists(file_path):
                print(f"文件不存在: {file_path}")
                continue
                
            file_name = os.path.basename(file_path)
            file_size = os.path.getsize(file_path)
            
            # 检查文件MIME类型
            import mimetypes
            mime_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"
            
            # 首先，上传文件到API服务器
            print(f"上传文件: {file_name}")
            try:
                with open(file_path, 'rb') as f:
                    file_content = f.read()
                    upload_files = {'file': (file_name, file_content, mime_type)}
                    
                    # 上传请求
                    headers_without_content_type = {k: v for k, v in self.headers.items() if k != 'Content-Type'}
                    upload_url = f"{self.api_base_url}{endpoint_upload}"
                    
                    upload_response = requests.post(
                        upload_url,
                        headers=headers_without_content_type,
                        files=upload_files,
                        timeout=60
                    )
                    
                    if upload_response.status_code == 200:
                        # 解析上传响应
                        upload_result = upload_response.json()
                        print(f"文件上传成功: {json.dumps(upload_result, ensure_ascii=False)}")
                        
                        # 从上传响应中获取文件路径和URL
                        if upload_result.get("Path") and upload_result.get("Url"):
                            file_path_on_server = upload_result["Path"]
                            file_url = upload_result["Url"]
                            
                            # 为API请求准备文件信息
                            file_info = {
                                "Name": file_name,
                                "Size": file_size,
                                "Type": mime_type,
                                "Path": file_path_on_server,
                                "Url": file_url
                            }
                            
                            prepared_files.append(file_info)
                            print(f"文件已准备: {file_name}, URL: {file_url}")
                        else:
                            print(f"上传响应缺少Path或Url: {upload_result}")
                            
                            # 退回到本地生成文件信息
                            # 生成一个唯一的路径
                            unique_path = f"upload/temp/{uuid.uuid4()}/{file_name}"
                            encoded_path = quote(unique_path)
                            
                            # 构建URL
                            file_url = f"{self.api_base_url}/api/proxy/down?Action=Download&Version=2022-01-01&Path={encoded_path}&IsAnonymous=true"
                            
                            # 准备文件信息
                            file_info = {
                                "Name": file_name,
                                "Size": file_size,
                                "Type": mime_type,
                                "Path": unique_path,
                                "Url": file_url,
                                "Content": base64.b64encode(file_content).decode('utf-8')
                            }
                            
                            prepared_files.append(file_info)
                            print(f"已回退到本地生成文件信息: {file_name}")
                    else:
                        print(f"文件上传失败，状态码: {upload_response.status_code}")
                        print(f"响应内容: {upload_response.text[:200]}")
                        
                        # 退回到本地生成文件信息，包含Base64内容
                        unique_path = f"upload/temp/{uuid.uuid4()}/{file_name}"
                        file_info = {
                            "Name": file_name,
                            "Size": file_size,
                            "Type": mime_type,
                            "Path": unique_path,
                            "Content": base64.b64encode(file_content).decode('utf-8')
                        }
                        prepared_files.append(file_info)
                        print(f"已回退到本地生成文件信息（包含Base64内容）: {file_name}")
            except Exception as e:
                print(f"上传文件时出错: {e}")
                traceback.print_exc()
                
                # 错误处理，跳过这个文件
                continue
                
            # 为multipart请求准备文件数据（备用）
            try:
                with open(file_path, 'rb') as f:
                    files_data[f'file{i}'] = (file_name, f.read(), mime_type)
            except Exception as e:
                print(f"准备文件数据时出错: {e}")
            
        return prepared_files, files_data
        
    def chat(self, query, conversation_history=None, companion=None, files=None):
        """
        生成API回复
        
        Args:
            query (str): 用户输入的消息
            conversation_history (list): 对话历史列表，每个元素包含'is_user'和'content'
            companion (Companion): AI角色配置
            files (list): 文件路径列表，用于上传图片等
            
        Returns:
            str: AI的回复内容
        """
        # 如果还没有会话ID，先创建一个会话
        if not self.app_conversation_id:
            if not self.create_conversation(self.default_user_id):
                return "抱歉，无法创建会话，请稍后再试"
                
        # 获取相关知识
        knowledge_docs = self.knowledge_base.search(query)
        knowledge_context = ""
        if knowledge_docs:
            knowledge_context = "\n\n相关知识：\n" + "\n---\n".join(
                [doc.page_content for doc in knowledge_docs]
            )
            
        # 构建系统提示
        system_prompt = ""
        if companion:
            system_prompt = f"你是{companion.name}，你的性格是{companion.personality}。请提供简洁友好的回答，适合语音朗读。"
            if hasattr(companion, 'system_prompt') and companion.system_prompt:
                system_prompt = companion.system_prompt + f"\n\n你的名字是{companion.name}，你的性格是{companion.personality}。请提供简洁友好的回答，适合语音朗读。"
        
        if knowledge_context:
            system_prompt += f"\n请基于以下知识回答：{knowledge_context}"
            
        # 确定最终查询内容
        final_query = query
        if system_prompt:
            final_query = f"{system_prompt}\n\n用户问题：{query}"
            
        # 准备文件数据 (如果有)
        if files and len(files) > 0:
            print(f"正在处理{len(files)}个文件")
            
        # 调用chat_query_v2 API
        return self.chat_query_v2(self.app_conversation_id, self.default_user_id, final_query, files)
    
    def chat_query_v2(self, app_conversation_id, user_id, query, files=None):
        """
        调用 chat_query_v2 API以阻塞模式
        
        Args:
            app_conversation_id (str): 会话ID
            user_id (str): 用户ID
            query (str): 查询/消息内容
            files (list): 可选的文件路径列表
            
        Returns:
            str: AI的回复内容，如果失败则返回错误消息
        """
        print(f"\n向会话 {app_conversation_id} 发送消息")
        endpoint = "/api/proxy/api/v1/chat_query_v2"
        
        payload = {
            "AppConversationID": app_conversation_id,
            "UserID": user_id,
            "Query": query,
            "ResponseMode": "blocking"  # 使用阻塞模式以简化响应处理
        }
        
        if files:
            try:
                # 准备文件数据
                prepared_files, _ = self.prepare_files(files)
                
                if prepared_files:
                    # 直接添加文件信息到 payload 的 QueryExtends 字段
                    payload["QueryExtends"] = {"Files": prepared_files}
                    print(f"正在发送包含文件的请求，UserID: {user_id}, AppConversationID: {app_conversation_id}")
                    print(f"文件数量: {len(prepared_files)}")
                    
                    # 打印请求的关键部分（不包括文件内容）
                    debug_payload = payload.copy()
                    if "QueryExtends" in debug_payload and "Files" in debug_payload["QueryExtends"]:
                        for file_info in debug_payload["QueryExtends"]["Files"]:
                            if "Content" in file_info:
                                file_info["Content"] = f"[Base64编码数据，长度: {len(file_info['Content'])}]"
                    print(f"请求载荷: {json.dumps(debug_payload, ensure_ascii=False, indent=2)}")
                    
                    # 明确指定头部和使用json参数而不是data
                    headers_with_content_type = self.headers.copy()
                    headers_with_content_type["Content-Type"] = "application/json"
                    
                    # 直接使用requests而不是通过make_api_request
                    url = f"{self.api_base_url}{endpoint}"
                    
                    print(f"直接发送请求到: {url}")
                    response = requests.post(
                        url,
                        headers=headers_with_content_type,
                        json=payload,  # 使用json参数
                        timeout=60
                    )
                    
                    # 处理响应
                    response.raise_for_status()
                    response_data = response.json()
                else:
                    # 没有成功准备的文件，退回到普通请求
                    print("没有成功准备的文件，使用普通请求")
                    response_data = self.make_api_request(endpoint, method="POST", data=payload)
            except Exception as e:
                print(f"处理文件时出错: {e}")
                traceback.print_exc()
                # 文件处理出错，退回到普通请求
                response_data = self.make_api_request(endpoint, method="POST", data=payload)
        else:
            # 普通JSON请求
            response_data = self.make_api_request(endpoint, method="POST", data=payload)
        
        if response_data:
            answer = response_data.get("answer")
            if answer is not None:
                print(f"收到正常回复, 长度: {len(answer)}")
                return answer
            else:
                print("响应中未找到'answer'字段")
                print(f"完整响应: {json.dumps(response_data, ensure_ascii=False)}")
                if response_data.get("event") == "message_failed":
                    print(f"消息处理失败: {response_data.get('message', '无详细错误信息')}")
                return "抱歉，AI响应出错，请稍后再试"
        else:
            return "抱歉，无法获取AI回复，请稍后再试"
