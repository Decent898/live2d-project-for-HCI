import requests
import json
import os

# 文件路径
file_path = "/Users/xuhaochen/Documents/My_Project/HCI_prj/companion_system/test_image.jpg"
if not os.path.exists(file_path):
    print(f"测试文件不存在: {file_path}")
    exit(1)

# API配置
API_BASE_URL = "https://agent.bit.edu.cn"
API_KEY = "d0leitbha6ps73975980"
USER_ID = "web_user"
APP_CONVERSATION_ID = "请替换为你的会话ID"  # 请替换为实际的会话ID

# 文件信息
file_name = os.path.basename(file_path)
file_size = os.path.getsize(file_path)
import mimetypes
mime_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"

# 上传文件
print(f"上传文件: {file_name}")
with open(file_path, 'rb') as f:
    file_content = f.read()

# 创建请求载荷
headers = {
    "Apikey": API_KEY
}

# 1. 先尝试上传文件
upload_url = f"{API_BASE_URL}/api/proxy/upload"
upload_files = {'file': (file_name, file_content, mime_type)}
headers_without_content_type = {k: v for k, v in headers.items() if k != 'Content-Type'}

upload_response = requests.post(
    upload_url,
    headers=headers_without_content_type,
    files=upload_files,
    timeout=60
)

if upload_response.status_code == 200:
    upload_result = upload_response.json()
    print(f"文件上传成功: {json.dumps(upload_result, ensure_ascii=False)}")
    
    # 从上传响应中获取文件路径和URL
    file_path_on_server = upload_result.get("Path", "")
    file_url = upload_result.get("Url", "")
    
    # 2. 接下来发送聊天请求
    chat_url = f"{API_BASE_URL}/api/proxy/api/v1/chat_query_v2"
    chat_payload = {
        "AppConversationID": APP_CONVERSATION_ID,
        "UserID": USER_ID,
        "Query": "请分析一下这张图片",
        "ResponseMode": "blocking",
        "QueryExtends": {
            "Files": [{
                "Name": file_name,
                "Size": file_size,
                "Type": mime_type,
                "Path": file_path_on_server,
                "Url": file_url
            }]
        }
    }
    
    print(f"发送聊天请求: {json.dumps(chat_payload, ensure_ascii=False)}")
    
    headers_with_content_type = headers.copy()
    headers_with_content_type["Content-Type"] = "application/json"
    
    chat_response = requests.post(
        chat_url,
        headers=headers_with_content_type,
        json=chat_payload,
        timeout=60
    )
    
    if chat_response.status_code == 200:
        chat_result = chat_response.json()
        print(f"收到回复: {json.dumps(chat_result, ensure_ascii=False)}")
    else:
        print(f"聊天请求失败: {chat_response.status_code}")
        print(f"错误详情: {chat_response.text}")
else:
    print(f"文件上传失败: {upload_response.status_code}")
    print(f"错误详情: {upload_response.text}")
