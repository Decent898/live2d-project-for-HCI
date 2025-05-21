import requests
import json

# --- 配置信息 ---
# 重要：请将 "YOUR_API_BASE_URL_HERE" 替换为您的实际 API 基础 URL
# 例如："https://your-actual-api-domain.com"
API_BASE_URL = "https://agent.bit.edu.cn"
APP_ID = "d0lehe3ha6ps73975920"  # 用户提供的 AppID
API_KEY = "d0leitbha6ps73975980" # 用户提供的 ApiKey

# --- 辅助函数 ---
def make_api_request(endpoint, method="POST", data=None):
    """
    执行 API 请求并返回 JSON 响应。
    :param endpoint: API 路径，例如 "/api/proxy/api/v1/create_conversation"
    :param method: HTTP 方法 (POST, GET等)
    :param data: 请求体数据 (对于 POST) 或查询参数 (对于 GET)
    :return: API 响应的 JSON 对象，如果失败则返回 None
    """
    url = f"{API_BASE_URL}{endpoint}"
    headers = {
        "Apikey": API_KEY,
        "Content-Type": "application/json"
    }
    try:
        # print(f"正在请求: {method} {url}") # 调试信息：打印请求的URL
        # print(f"请求头: {headers}") # 调试信息：打印请求头
        # if data: print(f"请求体: {json.dumps(data, ensure_ascii=False)}") # 调试信息：打印请求体

        if method.upper() == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=30)
        elif method.upper() == "GET":
            response = requests.get(url, headers=headers, params=data, timeout=30)
        else:
            print(f"不支持的 HTTP 方法: {method}")
            return None

        # print(f"响应状态码: {response.status_code}") # 调试信息：打印状态码
        # print(f"响应内容 (原始文本): {response.text}") # 调试信息：打印原始响应文本

        response.raise_for_status()  # 如果发生 HTTP 错误 (4xx 或 5xx)，则抛出异常
        return response.json()
    except requests.exceptions.Timeout:
        print(f"请求超时: {url}")
        return None
    except requests.exceptions.ConnectionError:
        print(f"连接错误: {url}. 请检查 API_BASE_URL 是否正确以及网络连接。")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"HTTP 错误: {e}")
        # 尝试打印更详细的错误信息（如果响应是JSON格式）
        try:
            error_details = e.response.json()
            print(f"错误详情: {json.dumps(error_details, indent=2, ensure_ascii=False)}")
        except json.JSONDecodeError:
            print(f"响应内容 (非JSON): {e.response.text if e.response is not None else 'N/A'}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"API 请求一般错误 ({url}): {e}")
        if 'response' in locals() and response is not None:
            print(f"响应内容: {response.text}")
        return None
    except json.JSONDecodeError:
        print(f"无法解析 JSON 响应。")
        if 'response' in locals() and response is not None:
            print(f"原始响应内容: {response.text}")
        return None


# --- API 调用实现 ---
def create_conversation(user_id, inputs=None):
    """
    调用 /create_conversation API。
    参考文档：第 2 页
    :param user_id: 用户 ID
    :param inputs: 可选的会话初始输入变量 (字典格式)
    :return: AppConversationID，如果失败则返回 None
    """
    print("\n正在尝试创建新的会话...")
    endpoint = "/api/proxy/api/v1/create_conversation"
    payload = {
        # "AppKey": API_KEY, # 文档说明：AppKey:赋值为{{ApiKey}}(值同header的Apikey),已废弃可不传
        "UserID": user_id
    }
    if inputs: # 如果提供了inputs参数
        payload["Inputs"] = inputs
    else: # 否则，默认为空字典
        payload["Inputs"] = {}

    response_data = make_api_request(endpoint, method="POST", data=payload)

    if response_data and response_data.get("Conversation") and response_data["Conversation"].get("AppConversationID"):
        app_conversation_id = response_data["Conversation"]["AppConversationID"]
        conversation_name = response_data["Conversation"].get("ConversationName", "N/A")
        print(f"会话创建成功！")
        print(f"  AppConversationID: {app_conversation_id}")
        print(f"  会话名称: {conversation_name}")
        return app_conversation_id
    else:
        print("创建会话失败或未能解析 AppConversationID。")
        if response_data:
            print(f"API 返回的完整响应: {json.dumps(response_data, indent=2, ensure_ascii=False)}")
        return None

def chat_query_v2(app_conversation_id, user_id, query, files=None):
    """
    以阻塞模式调用 /chat_query_v2 API。
    参考文档：第 5 页 (ChatQueryV2 定义), 第 7 页 (非流式返回示例)
    :param app_conversation_id: 会话 ID
    :param user_id: 用户 ID
    :param query: 用户输入/提问内容
    :param files: 可选的文件列表 (用于 QueryExtends.Files)
    :return: 模型的回答内容，如果失败则返回 None
    """
    print(f"\n向会话 {app_conversation_id} 发送消息: '{query}'...")
    endpoint = "/api/proxy/api/v1/chat_query_v2"
    payload = {
        # "AppKey": API_KEY, # 文档说明：AppKey:赋值为{{ApiKey}}(值同header的Apikey),已废弃可不传
        "AppConversationID": app_conversation_id,
        "UserID": user_id,
        "Query": query,
        "ResponseMode": "blocking"  # 使用阻塞模式以简化响应处理
    }
    if files: # 如果提供了 files 参数，则添加到请求的 QueryExtends 中
              # 文件结构应遵循文档第6页 ChatQueryV2 的 Files 示例
        payload["QueryExtends"] = {"Files": files}

    response_data = make_api_request(endpoint, method="POST", data=payload)

    if response_data:
        # 根据文档第 7 页 (chat_query_v2 非流式返回示例):
        # 响应是一个包含 "event", "task_id", "id", "answer" 等字段的 JSON 对象。
        # print("收到响应:") # 调试信息
        # print(json.dumps(response_data, indent=2, ensure_ascii=False)) # 打印完整响应以供调试

        answer = response_data.get("answer")
        if answer is not None : # 显式检查 None，因为空字符串可能是一个有效的答案
            print(f"\n助手: {answer}")
            return answer
        else:
            # 如果 'answer' 字段不存在或为 null
            print("响应中未找到 'answer' 字段或其值为 null。")
            print(f"API 返回的完整响应: {json.dumps(response_data, indent=2, ensure_ascii=False)}")
            # 检查是否为已知的失败事件
            if response_data.get("event") == "message_failed":
                 print(f"消息处理失败: {response_data.get('message', '无详细错误信息')}")
            return None # 或者根据具体情况处理为错误或空响应
    else:
        print("未能从 chat_query_v2 获取响应。")
        return None

# --- 主程序 ---
def main():
    print("API 交互程序")
    print("=======================")
    print(f"使用 AppID: {APP_ID}")
    print(f"重要：请确保脚本中的 API_BASE_URL ('{API_BASE_URL}') 已正确设置为您的 API 服务地址。")

    if API_BASE_URL == "YOUR_API_BASE_URL_HERE" or not API_BASE_URL:
        print("\n错误：请在脚本顶部更新 API_BASE_URL 常量后再运行。")
        print("API_BASE_URL 应为您的 API 服务的基础 URL，例如：https://your-actual-api-domain.com")
        return

    user_id = input("请输入您的 UserID (例如: test_user_001): ").strip()
    if not user_id:
        print("UserID 不能为空。程序退出。")
        return

    # 可选：如果您的应用在创建会话时需要初始变量 (Inputs)，可以在此处设置
    # 例如: initial_inputs = {"city": "北京", "language": "中文"}
    initial_inputs = {} # 为简单起见，此处留空。如果您的应用需要，请填充此字典。

    app_conversation_id = create_conversation(user_id, inputs=initial_inputs)

    if not app_conversation_id:
        print("无法启动会话。请检查 API_BASE_URL, API_KEY 及网络连接。程序退出。")
        return

    print(f"\n会话 '{app_conversation_id}' 已启动。输入 'exit' 退出聊天。")
    while True:
        try:
            user_query = input(f"\n您 ({user_id}): ").strip()
        except EOFError: # 处理 Ctrl+D (Linux/macOS) 或 Ctrl+Z+Enter (Windows) 导致的输入结束
            print("\n检测到输入结束。正在退出聊天。")
            break
        if user_query.lower() == 'exit':
            print("正在退出聊天。")
            break
        if not user_query: # 如果用户只输入了回车，则继续等待下一次输入
            continue

        # 如果需要发送文件，可以按如下方式构建 files_to_send 列表：
        # files_to_send = [
        #     {
        #         "Name": "示例图片.jpeg",  # 文件名
        #         "Path": "upload/full/your/file/path/on/obs/图片.jpeg", # 文件在OBS上的路径
        #         "Size": 12345, # 文件大小 (字节)
        #         # Url 通常是API网关提供的文件下载链接，可能需要根据实际情况构建
        #         "Url": f"{API_BASE_URL}/api/proxy/down?Action=Download&Version=2022-01-01&Path=upload%2Ffull%2Fyour%2Ffile%2Fpath%2Fon%2Fobs%2F%E5%9B%BE%E7%89%87.jpeg&IsAnonymous=true"
        #     }
        # ]
        # 然后在调用 chat_query_v2 时传入:
        # chat_query_v2(app_conversation_id, user_id, user_query, files=files_to_send)
        
        # 当前示例不发送文件
        chat_query_v2(app_conversation_id, user_id, user_query, files=None)

if __name__ == "__main__":
    main()
