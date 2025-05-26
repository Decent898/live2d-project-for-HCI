from gradio_client import Client, handle_file
import os
import uuid
from django.conf import settings
import logging

# 配置日志
logger = logging.getLogger(__name__)

class SpeechService:
    """将文本转换为语音的服务类"""

    def __init__(self, tts_api_url="http://127.0.0.1:7860/"):
        """初始化语音合成服务
        
        Args:
            tts_api_url: TTS API的URL
        """
        self.tts_api_url = tts_api_url
        self.client = None
        try:
            self.client = Client(tts_api_url)
            logger.info(f"语音合成客户端初始化成功: {tts_api_url}")
        except Exception as e:
            logger.error(f"语音合成客户端初始化失败: {e}")
            
    def text_to_speech(self, text, speaker="三月七_ZH", language="ZH", emotion="Happy"):
        """将文本转换为语音
        
        Args:
            text: 要转换的文本
            speaker: 说话人
            language: 语言
            emotion: 情感
            
        Returns:
            str: 生成的音频文件路径
        """        
        if not self.client:
            try:
                self.client = Client(self.tts_api_url)
                logger.info("重新初始化语音合成客户端成功")
            except Exception as e:
                logger.error(f"重新初始化语音合成客户端失败: {e}")
                return None
        
        try:
            logger.info(f"开始转换文本: '{text[:50]}...' 为语音, 使用说话人: {speaker}, 情感: {emotion}")
            print(f"开始转换文本: '{text[:50]}...' 为语音, 使用说话人: {speaker}, 情感: {emotion}")
            
            # 确保上传目录存在
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'speech')
            os.makedirs(upload_dir, exist_ok=True)
            
            # 生成唯一文件名
            unique_filename = f"{uuid.uuid4()}.wav"
            output_file_path = os.path.join(upload_dir, unique_filename)
            
            print(f"输出文件路径: {output_file_path}")
            
            # 调用API生成语音
            print(f"调用TTS API: {self.tts_api_url}")
            try:
                result = self.client.predict(
                    text=text,
                    speaker=speaker,
                    sdp_ratio=0.2,
                    noise_scale=0.6,
                    noise_scale_w=0.8,
                    length_scale=1.2,
                    language=language,
                    reference_audio=None,  # 可以省略或提供参考音频
                    emotion=emotion,
                    prompt_mode="Text prompt",
                    style_text=None,
                    style_weight=0.7,
                    api_name="/tts_fn"
                )
                print(f"TTS API调用成功，结果类型: {type(result)}")
                print(f"TTS API调用成功，结果: {result}")
                # ('Success', 'C:\\Users\\12776\\AppData\\Local\\Temp\\gradio\\2e4240dc5add146f623f255c420fd1763131cec5f698aad4021e30000e49e809\\audio.wav')
                result = result[1]  # 获取返回的音频文件路径
            except Exception as api_e:
                print(f"TTS API调用失败: {api_e}")
                logger.error(f"TTS API调用失败: {api_e}")
                raise
            
            # 结果可能是直接返回的文件路径
            if isinstance(result, str):
                source_file_path = result
                # 复制文件到输出目录
                import shutil
                shutil.copy(source_file_path, output_file_path)
            else:
                # 否则，我们需要从结果中获取文件并保存
                logger.warning("未获取到直接的文件路径，尝试从结果中获取并保存文件")
                return None
            
            logger.info(f"语音文件生成成功: {output_file_path}")
            return output_file_path
        except Exception as e:
            logger.error(f"文本转语音失败: {e}")
            import traceback
            traceback.print_exc()
            return None

# 创建单例实例
speech_service = SpeechService()
