from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import os
import uuid
import traceback
from .services import ai_service
from .services.speech_service import speech_service
from .models import Conversation, Message, Companion
from django.contrib.auth.models import User

# 暂时简化视图，只提供基本功能
def index(request):
    """首页视图"""
    return render(request, 'ai_companion/index.html')

def live2d_guide(request):
    """Live2D指南页面"""
    return render(request, 'ai_companion/live2d_guide.html')

def live2d_test(request):
    """Live2D测试页面"""
    return render(request, 'ai_companion/live2d_test.html')

@csrf_exempt
def speech_api(request):
    """语音合成API"""
    if request.method == 'POST':
        try:
            print("收到语音合成请求")
            data = json.loads(request.body)
            text = data.get('text', '')
            speaker = data.get('speaker', '派蒙_ZH')
            emotion = data.get('emotion', 'Happy')
            language = data.get('language', 'ZH')
            
            print(f"语音合成参数: text={text[:30]}..., speaker={speaker}, emotion={emotion}, language={language}")
            
            if not text:
                print("错误: 没有提供文本内容")
                return JsonResponse({'error': '请提供文本内容'}, status=400)
            
            # 调用语音服务生成音频
            print("调用语音服务生成音频...")
            audio_file_path = speech_service.text_to_speech(
                text=text, 
                speaker=speaker,
                language=language,
                emotion=emotion
            )
            
            if not audio_file_path or not os.path.exists(audio_file_path):
                print(f"错误: 语音合成失败, 文件路径: {audio_file_path}")
                return JsonResponse({'error': '语音合成失败'}, status=500)
            
            print(f"语音合成成功, 文件路径: {audio_file_path}, 大小: {os.path.getsize(audio_file_path)} 字节")
            
            # 返回音频文件
            response = FileResponse(open(audio_file_path, 'rb'), content_type='audio/wav')
            print("生成FileResponse响应成功")
            
            # 请求完成后删除临时文件
            def cleanup_file(file_path):
                try:
                    os.remove(file_path)
                    print(f"临时语音文件已删除: {file_path}")
                except Exception as e:
                    print(f"删除临时语音文件失败: {e}")
                    pass
            
            # 设置关闭连接时的回调函数
            response.close = lambda: cleanup_file(audio_file_path)
            
            return response
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': '只接受POST请求'}, status=405)

@csrf_exempt
def chat_api(request):
    """聊天API视图"""
    if request.method == 'POST':
        try:
            # 解析请求数据
            if request.content_type and 'multipart/form-data' in request.content_type:
                # 处理包含文件的请求
                user_message = request.POST.get('message', '')
                conversation_id = request.POST.get('conversation_id')
                companion_id = request.POST.get('companion_id')
                
                # 处理上传的文件
                files = []
                if request.FILES:
                    print(f"接收到{len(request.FILES)}个文件")
                    for file_key in request.FILES:
                        uploaded_file = request.FILES[file_key]
                        
                        # 打印文件信息
                        print(f"处理文件: {uploaded_file.name}, 大小: {uploaded_file.size}字节, 类型: {uploaded_file.content_type}")
                        
                        # 确保上传目录存在
                        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
                        os.makedirs(upload_dir, exist_ok=True)
                        
                        # 生成唯一文件名
                        file_ext = os.path.splitext(uploaded_file.name)[1]
                        unique_filename = f"{uuid.uuid4()}{file_ext}"
                        file_path = os.path.join(upload_dir, unique_filename)
                        
                        # 保存文件
                        with open(file_path, 'wb+') as destination:
                            for chunk in uploaded_file.chunks():
                                destination.write(chunk)
                        
                        # 添加更多调试信息
                        print(f"文件已保存: {file_path}, 大小: {os.path.getsize(file_path)} 字节")
                        
                        files.append(file_path)
                else:
                    print("请求中没有文件")
            else:
                # 处理普通JSON请求
                data = json.loads(request.body)
                user_message = data.get('message', '')
                conversation_id = data.get('conversation_id')
                companion_id = data.get('companion_id')
                files = None
            
            # 获取或创建默认用户（这是一个临时解决方案）
            user, created = User.objects.get_or_create(username='default_user')
            
            # 获取或创建对话
            conversation = None
            if conversation_id:
                try:
                    conversation = Conversation.objects.get(id=conversation_id)
                    print(f"找到会话: ID={conversation.id}")
                except Conversation.DoesNotExist:
                    print(f"会话不存在，创建新会话，请求的会话ID: {conversation_id}")
                    conversation = Conversation.objects.create(user=user)
            else:
                print("没有会话ID，创建新会话")
                conversation = Conversation.objects.create(user=user)
            
            # 获取角色配置
            companion = None
            if companion_id:
                try:
                    companion = Companion.objects.get(id=companion_id)
                    print(f"使用AI角色: {companion.name}")
                except Companion.DoesNotExist:
                    print(f"AI角色不存在，请求的角色ID: {companion_id}")
                    pass
                    
            # 获取对话历史
            history = []
            for msg in conversation.messages.all().order_by('created_at')[:20]:  # 限制历史记录数
                history.append({
                    'is_user': msg.is_user,
                    'content': msg.content
                })
            
            # 创建用户消息
            Message.objects.create(conversation=conversation, content=user_message, is_user=True)
            
            # 调用AI服务生成回复，传入文件参数
            print(f"调用AI服务，发送消息: '{user_message}'")
            if files:
                print(f"包含{len(files)}个文件: {files}")
                for file_path in files:
                    if os.path.exists(file_path):
                        print(f"文件验证成功: {file_path}, 大小: {os.path.getsize(file_path)} 字节")
                    else:
                        print(f"警告: 文件不存在: {file_path}")
            
            try:
                ai_response = ai_service.chat(user_message, history, companion, files)
                print(f"收到AI回复: '{ai_response[:100]}...'")
            except Exception as e:
                print(f"AI服务调用失败: {e}")
                traceback.print_exc()
                ai_response = "抱歉，AI服务暂时不可用，请稍后再试。"
            
            # 创建AI回复消息
            Message.objects.create(conversation=conversation, content=ai_response, is_user=False)
            
            # 删除临时文件
            if files:
                print("清理临时文件")
                for file_path in files:
                    try:
                        os.remove(file_path)
                        print(f"已删除: {file_path}")
                    except Exception as e:
                        print(f"删除临时文件失败: {file_path}, 错误: {e}")
            
            return JsonResponse({
                'message': ai_response,
                'conversation_id': conversation.id
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': '只接受POST请求'}, status=405)
