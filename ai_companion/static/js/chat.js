// 聊天交互脚本
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const fileUpload = document.getElementById('file-upload');
    
    // 用于保存当前选择的文件
    let currentFile = null;
    
    // 监听文件上传控件变化
    fileUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // 检查文件类型
            if (!file.type.startsWith('image/')) {
                alert('请选择图片文件！');
                fileUpload.value = '';
                currentFile = null;
                return;
            }
            
            // 限制文件大小 (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('文件大小不能超过5MB！');
                fileUpload.value = '';
                currentFile = null;
                return;
            }
            
            // 显示文件已选择的提示
            currentFile = file;
            userInput.placeholder = `已选择文件: ${file.name}，请输入消息...`;
            
            // 可以在这里添加预览图片的功能
            // showImagePreview(file);
        } else {
            currentFile = null;
            userInput.placeholder = '请输入您的消息...';
        }
    });
    
    // 添加欢迎消息
    addMessage('你好！我是你的AI助手，有什么我能帮到你的吗111？', false);

    // 发送消息
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message && !currentFile) return;  // 如果没有消息和文件，则不发送

        // 显示用户消息
        addMessage(message + (currentFile ? ` [附件: ${currentFile.name}]` : ''), true);
        
        // 清空输入框
        userInput.value = '';
        
        // 显示加载状态
        const loadingMsg = addMessage('正在思考...', false);
        
        // 准备发送数据
        let requestData;
        let fetchOptions;
        
        if (currentFile) {
            // 使用FormData发送文件
            const formData = new FormData();
            formData.append('message', message);
            formData.append('file', currentFile);
            
            // 添加会话ID（如果有）
            const conversationId = localStorage.getItem('conversation_id');
            if (conversationId) {
                formData.append('conversation_id', conversationId);
            }
            
            // 添加角色ID（如果有）
            const companionId = localStorage.getItem('companion_id');
            if (companionId) {
                formData.append('companion_id', companionId);
            }
            
            fetchOptions = {
                method: 'POST',
                body: formData
            };
        } else {
            // 普通JSON请求
            requestData = {message: message};
            
            // 添加会话ID（如果有）
            const conversationId = localStorage.getItem('conversation_id');
            if (conversationId) {
                requestData.conversation_id = conversationId;
            }
            
            // 添加角色ID（如果有）
            const companionId = localStorage.getItem('companion_id');
            if (companionId) {
                requestData.companion_id = companionId;
            }
            
            fetchOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            };
        }
        
        // 重置文件上传状态
        currentFile = null;
        fileUpload.value = '';
        userInput.placeholder = '请输入您的消息...';
          // 发送到后端API
        fetch('/api/chat/', fetchOptions)
        .then(response => response.json())
        .then(data => {
            // 移除加载消息
            if (loadingMsg) {
                chatMessages.removeChild(loadingMsg);
            }
            
            // 保存会话ID
            if (data.conversation_id) {
                localStorage.setItem('conversation_id', data.conversation_id);
            }
            
            // 解析LLM返回的JSON响应
            let aiMessage = '';
            let emotion = 'normal';
            
            try {
                // 尝试解析message字段中的JSON
                if (data.message) {
                    // 如果message本身就是JSON对象
                    if (typeof data.message === 'object') {
                        aiMessage = data.message.content || data.message.message || '我收到了你的消息';
                        emotion = data.message.emotion || 'normal';
                    } 
                    // 如果message是JSON字符串
                    else if (typeof data.message === 'string') {
                        try {
                            const parsedMessage = JSON.parse(data.message);
                            aiMessage = parsedMessage.content || parsedMessage.message || data.message;
                            emotion = parsedMessage.emotion || 'normal';
                        } catch (parseError) {
                            // 如果解析失败，直接使用原始消息
                            console.log('消息不是JSON格式，使用原始消息:', data.message);
                            aiMessage = data.message;
                            emotion = 'normal';
                        }
                    }
                } else {
                    aiMessage = '抱歉，我没有收到有效的回复';
                    emotion = 'normal';
                }
            } catch (error) {
                console.error('解析AI回复时出错:', error);
                aiMessage = data.message || '抱歉，我遇到了一些问题';
                emotion = 'normal';
            }
            
            console.log('解析后的AI消息:', aiMessage);
            console.log('解析后的情感:', emotion);
            
            // 显示AI回复
            addMessage(aiMessage, false);
            
            // 在Live2D对话框中显示回复
            if (typeof showMessageInLive2D === 'function') {
                showMessageInLive2D(aiMessage);
            }
            
            // 直接使用从LLM返回的情感，触发Live2D表情
            triggerLive2DExpressionFromResponse(emotion);
            
            // 自动播放AI回复的语音
            console.log('开始播放AI回复语音');
            playAIResponseAudio(aiMessage, emotion);
            console.log('AI回复语音播放完成');
        })
        .catch(error => {
            console.error('Error:', error);
            
            // 移除加载消息
            if (loadingMsg) {
                chatMessages.removeChild(loadingMsg);
            }
            
            // 显示错误消息
            addMessage('抱歉，我遇到了一些问题，请稍后再试', false);
        });
    }

    // 添加消息到聊天区域
    function addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user-message' : 'message ai-message';
        
        // 检查是否包含文件附件提示
        if (isUser && content.includes('[附件:')) {
            // 分离消息和附件提示
            const parts = content.split('[附件:');
            const messagePart = parts[0].trim();
            const filenamePart = parts[1].replace(']', '').trim();
            
            // 创建消息元素
            if (messagePart) {
                messageDiv.textContent = messagePart;
            }
            
            // 添加附件指示器
            const attachmentIndicator = document.createElement('div');
            attachmentIndicator.className = 'attachment-indicator';
            attachmentIndicator.innerHTML = `<i class="fa fa-paperclip"></i> 图片附件: ${filenamePart}`;
            messageDiv.appendChild(attachmentIndicator);
        } else {
            messageDiv.textContent = content;
        }
        
        chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv;
    }

    // 新增：直接使用LLM返回的情感触发Live2D表情
    function triggerLive2DExpressionFromResponse(emotion) {
        // 保存最新情感状态到全局变量，供其他地方使用
        window.lastTriggeredEmotion = emotion;
        
        console.log(`从LLM响应中获取的情感: ${emotion}`);
        
        // 触发对应表情
        // triggerLive2DExpression(emotion);
        playMarchSevenExpression(emotion);
        
        // 随机播放动作
        if (window.L2Dwidget && typeof L2Dwidget.showRandomTalk === 'function') {
            setTimeout(() => {
                L2Dwidget.showRandomTalk();
            }, 1000);
        }
    }

    // 保留原有的分析消息内容并触发Live2D表情的函数（作为备用方案）
    function analyzeAndTriggerExpression(message) {
        // 简单情感分析
        const lowerMsg = message.toLowerCase();
        
        // 定义情感关键词 - 扩展更多中文情感词汇
        const happyWords = ['谢谢', '感谢', '不错', '很好', '太棒了', '开心', '高兴', '喜欢', '爱', '笑', '棒', '好的', '嗯', '哈哈', '呵呵', '嘻嘻', '开心', '快乐', '满意', '帮助', '解决', '成功', '好极了', '赞', '厉害', '牛', '太好了', '完美'];
        
        const sadWords = ['难过', '伤心', '痛苦', '悲伤', '可怜', '抱歉', '对不起', '失望', '哭', '遗憾', '无奈', '惭愧', '惆怅', '忧伤', '沮丧', '失落', '郁闷', '叹气', '哎呀', '可惜', '无语', '没办法', '好难', '太难了'];
        
        const angryWords = ['生气', '愤怒', '讨厌', '烦人', '烦躁', '滚', '讨厌', '恨', '不想', '忍不了', '受够了', '别烦我', '恼火', '不满', '抓狂', '气死', '真是的', '过分', '不合理', '不可接受', '无理', '不礼貌'];
        
        const surpriseWords = ['惊讶', '震惊', '不敢相信', '天啊', '哇', '真的吗', '啊', '咦', '竟然', '真没想到', '太意外了', '出乎意料', '没想到', '不会吧', '奇怪', '神奇', '厉害了', '超乎想象'];
        
        const confusedWords = ['困惑', '不明白', '不理解', '疑惑', '什么意思', '没明白', '不太懂', '不确定', '怎么回事', '什么情况', '有点乱', '有点复杂', '搞不清楚', '迷惑', '模糊'];
        
        const cuteWords = ['可爱', '萌', '亲切', '温馨', '甜蜜', '暖心', '温暖', '呆萌', '乖巧', '小可爱', '软萌', '暖暖'];
        
        const thinkingWords = ['思考', '考虑', '分析', '研究', '让我想想', '稍等', '让我查查', '我认为', '我觉得', '我想', '应该是', '可能是', '我理解', '据我所知'];
        
        // 检测情感
        let emotion = 'normal';
        let emotions = {
            happy: 0,
            sad: 0,
            angry: 0,
            surprise: 0,
            confused: 0,
            cute: 0,
            thinking: 0
        };
        
        // 计算各情感词出现次数
        const wordLists = {
            happy: happyWords,
            sad: sadWords,
            angry: angryWords,
            surprise: surpriseWords,
            confused: confusedWords,
            cute: cuteWords,
            thinking: thinkingWords
        };
        
        // 遍历所有情感类别和它们的关键词列表
        for (const [emotionType, wordList] of Object.entries(wordLists)) {
            for (const word of wordList) {
                // 检查单词是否在消息中出现
                if (lowerMsg.includes(word)) {
                    emotions[emotionType]++;
                    
                    // 对于特定的强情感词，增加额外权重
                    const strongEmotionWords = {
                        happy: ['太棒了', '好极了', '太好了', '完美', '非常感谢'],
                        sad: ['非常难过', '特别伤心', '太遗憾了'],
                        angry: ['非常生气', '太过分了', '忍无可忍'],
                        surprise: ['太震惊了', '不敢相信', '超乎想象'],
                        confused: ['完全不理解', '太复杂了'],
                        cute: ['超可爱', '太萌了']
                    };
                    
                    // 如果是强情感词，额外增加权重
                    if (strongEmotionWords[emotionType] && strongEmotionWords[emotionType].includes(word)) {
                        emotions[emotionType] += 2;
                    }
                }
            }
        }
        
        // 确定主要情感
        let maxEmotion = 'normal';
        let maxScore = 0;
        
        for (const [emotionType, score] of Object.entries(emotions)) {
            if (score > maxScore) {
                maxScore = score;
                maxEmotion = emotionType;
            }
        }
        
        // 如果有明显情感，使用它
        if (maxScore > 0) {
            emotion = maxEmotion;
            // 保存最新情感状态到全局变量，供其他地方使用
            window.lastTriggeredEmotion = emotion;
        }
        
        console.log(`情感分析结果: ${emotion}, 评分: ${emotions[emotion]}`);
          // 触发对应表情
        triggerLive2DExpression(emotion);
        
        // 随机播放动作
        if (window.L2Dwidget && typeof L2Dwidget.showRandomTalk === 'function') {
            setTimeout(() => {
                L2Dwidget.showRandomTalk();
            }, 1000);
        }
        
        // 返回检测到的情感，可用于语音合成
        return emotion;
    }
      // 自动播放AI回复的语音
    function playAIResponseAudio(message, emotion) {
        // 将情感映射到TTS API的情感参数
        let ttsEmotion = 'Happy'; // 默认情感
        
        // 情感映射
        const emotionMap = {
            'happy': 'Happy',
            'sad': 'Sad',
            'angry': 'Angry',
            'surprise': 'Surprised',
            'confused': 'Confused', 
            'cute': 'Happy',
            'thinking': 'Happy',
            'normal': 'Happy'
        };
        
        if (emotion in emotionMap) {
            ttsEmotion = emotionMap[emotion];
        }
        
        console.log(`开始播放AI回复语音, 检测到情感: ${emotion}, TTS情感参数: ${ttsEmotion}`);
        
        // 检查是否存在服务器语音功能
        if (typeof window.serverSpeechEnabled !== 'undefined') {
            console.log(`服务器语音状态: ${window.serverSpeechEnabled ? '启用' : '禁用'}`);
        } else {
            console.log('找不到服务器语音状态变量，可能未正确初始化');
        }
        
        // 首先尝试服务器端语音合成
        if (typeof playServerSpeech === 'function') {
            console.log('使用服务器端语音合成播放AI回复');
            
            // 准备要传递的对象，包含情感信息
            const speechData = {
                text: message,
                emotion: ttsEmotion
            };
            
            // 调用服务器语音功能
            playServerSpeech(message);
        } else {
            // 如果服务器语音函数不存在，则使用客户端语音合成
            console.log('服务器语音函数不存在，使用客户端语音合成播放AI回复');
            if (typeof speakText === 'function') {
                speakText(message);
            } else {
                console.error('找不到任何可用的语音合成功能');
            }
        }
    }
    
    // 显示通知消息
    window.showNotification = function(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.classList.add('fadeout');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    };
    
    // 发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);
    
    // 回车键发送消息
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
