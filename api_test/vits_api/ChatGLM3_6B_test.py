import requests
import json
import pygame
from io import BytesIO

base_url = "http://localhost:6006"  # 把这里改成你的IP地址

def create_chat_completion(model, messages, use_stream=False):
    data = {
        "model": model,  # 模型名称
        "messages": messages,  # 会话历史
        "stream": use_stream,  # 是否流式响应
        "max_tokens": 100,  # 最多生成字数
        "temperature": 0.8,  # 温度
        "top_p": 0.8,  # 采样概率
    }

    response = requests.post(f"{base_url}/v1/chat/completions", json=data, stream=use_stream)
    if response.status_code == 200:
        if use_stream:
            # 处理流式响应
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')[6:]
                    try:
                        response_json = json.loads(decoded_line)
                        content = response_json.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        print(content, end='')
                    except:
                        print("Special Token:", decoded_line)
        else:
            # 处理非流式响应
            decoded_line = response.json()
            content = decoded_line.get("choices", [{}])[0].get("message", "").get("content", "")
            return content
    else:
        print("Error:", response.status_code)
        return None


if __name__ == "__main__":
    chat_messages = [
        {
            "role": "system",
            "content": "从现在开始扮演原神里的甘雨",
        }
    ]

    while True:
        # user_input = input("请输入您的问题: ")
        # chat_messages.append({"role": "user", "content": user_input})
        # glm_response = create_chat_completion("chatglm3-6b", chat_messages, use_stream=False)
        # print("回复:", glm_response)
        
        glm_response = "你好，我是甘雨，有什么可以帮助你的吗？"  # 模拟的响应

        payload = {
            "data": [glm_response, "甘雨_ZH", 0.5, 0.6, 0.9, 1.2, "ZH",
                     None, "Happy", "Text prompt", "", 0.7],
            "event_data": None,
            "fn_index": 0
        }

        payload_json = json.dumps(payload)

        url = "https://127.0.0.1:7860/queue/join?"

        response = requests.post(url, data=payload_json, headers={"Content-Type": "application/json"})

        print(response.status_code)
        response_data = json.loads(response.text)
        url_from_response = response_data["data"][1]["name"]
        music_length = response_data["duration"]
        print(url_from_response)

        # audio_response = requests.get("https://v2.genshinvoice.top/file=" + url_from_response)
        # audio_data = BytesIO(audio_response.content)
        # pygame.mixer.init()
        # pygame.mixer.music.load(audio_data)
        # pygame.mixer.music.play()
        # pygame.time.wait(int(music_length * 40000))
        # pygame.mixer.quit()