import requests
import json
import uuid # 用于生成新的 MessageID (如果需要)

# API的URL (根据您提供的新信息更新)
url = "https://agent.bit.edu.cn/api/bypass/app/chat/v2/chat_query" # <--- 已更新

# 请求头部信息 (基本保持不变，但请确保Cookie和CSRF Token是当前有效的)
headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Accept": "application/json, text/event-stream", # 告诉服务器我们可以接受JSON或流
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Site": "same-origin",
    "Accept-Language": "zh",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Fetch-Mode": "cors",
    "Origin": "https://agent.bit.edu.cn",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
    "Referer": "https://agent.bit.edu.cn/product/llm/chat/d0leijrha6ps73975970",
    "Connection": "keep-alive",
    # 确保 Cookie 和 x-csrf-token 是最新的、有效的!
    "Cookie": "i18next=zh; tenant=s%3ADZJBDabOJDWwi5Vf45Fb2tDkwcRqU6ou.cgEy1zlYl19HhEWdkW7hDoI%2BkXA2SQprhyO8E72OT5A; app-visitor-key=d0leimci78ks739bq6dg; x-csrf-token=ljgOAwfl-NMxBGqCuYMxy9WXlrgVZRR1vWfs; _csrf=30WYTuee3N2L3XUP7ngX0Qce",
    "timeout": "300000", # 这个看起来像自定义头部，通常timeout在requests库中设置
    "Priority": "u=3, i", # 这个也像自定义或浏览器内部头部
    "x-csrf-token": "ljgOAwfl-NMxBGqCuYMxy9WXlrgVZRR1vWfs",
    "app-visitor-key": "d0leimci78ks739bq6dg"
}

# ==============================================================================
# 关键：请在这里填充您从浏览器开发者工具中找到的实际 JSON 请求体
# ==============================================================================
your_question = "我说：1234567" # <--- 将这里替换成您想问的问题

# 这是一个 *示例* payload 结构，您需要根据实际情况修改
# 特别是 MessageID (通常需要新生成) 和 AppConversationID (如何获取或是否需要)
payload_to_send = {
    "query": your_question,
    "AppKey": "d0leijrha6ps73975970", # 这个AppKey来自您的Referer URL和之前的payload
    "MessageID": str(uuid.uuid4()), # 为每条消息生成一个新的唯一ID
    "AppConversationID": "d0lekaci78ks739bq6e0", # <<-- 这个ID可能需要从之前的交互中获取，或者对于新对话有不同的处理方式。请检查您找到的实际payload。
                                               # 如果是全新的对话，这个字段可能不存在，或者为空，或者有特定的初始值。
    # "stream": True, # 有些API通过payload参数控制是否流式返回，但通常由Accept头部决定
    # ... 其他您在实际请求体中看到的参数 ...
}

print(f"发送的URL: {url}")
print(f"发送的Headers: {json.dumps(headers, indent=2)}")
print(f"发送的Payload: {json.dumps(payload_to_send, indent=2, ensure_ascii=False)}") # ensure_ascii=False 用于正确显示中文
print("-" * 30)

try:
    full_answer = []
    # 注意：requests库中的timeout参数单位是秒
    with requests.post(url, headers=headers, json=payload_to_send, stream=True, timeout=300) as response:
        response.raise_for_status()
        print(f"连接成功，状态码: {response.status_code}")
        print("开始接收并解析流式响应:")
        response.encoding = 'utf-8'

        for line in response.iter_lines(decode_unicode=True):
            if line:
                if line.startswith("event:"):
                    pass
                elif line.startswith("data:"):
                    content_part = line[len("data:"):].strip()
                    if content_part.startswith("data:"): # 处理 "data: data: {...}"
                        json_str = content_part[len("data:"):].strip()
                        try:
                            data_json = json.loads(json_str)
                            event_type = data_json.get("event")

                            if event_type == "message":
                                answer_part = data_json.get("answer", "")
                                print(answer_part, end="", flush=True)
                                full_answer.append(answer_part)
                            elif event_type == "message_end":
                                print("\n--- 回答结束 ---")
                            elif event_type == "message_cost":
                                print(f"\n--- 消息成本信息 ---")
                                print(f"  输入Token: {data_json.get('input_tokens')}")
                                print(f"  输出Token: {data_json.get('output_tokens')}")
                                print(f"  总延迟 (秒): {data_json.get('latency')}")
                            # else:
                            #     print(f"其他事件: {event_type}, 数据: {data_json}")

                        except json.JSONDecodeError as e:
                            print(f"\n[错误] JSON 解析失败: {e} - problematic string: '{json_str}'")
                    # else: # 如果是 "data: {...}"
                    #     try:
                    #         data_json = json.loads(content_part)
                    #         # ... 类似解析 ...
                    #     except json.JSONDecodeError as e:
                    #         print(f"\n[错误] JSON 解析失败 (单层data): {e} - problematic string: '{content_part}'")
        
        print("\n\n--- 完整回答 ---")
        print("".join(full_answer))

except requests.exceptions.HTTPError as e:
    print(f"HTTP错误: {e}")
    print(f"响应内容: {e.response.text}")
except requests.exceptions.RequestException as e:
    print(f"请求过程中发生错误: {e}")
except Exception as e:
    print(f"处理响应时发生其他错误: {e}")