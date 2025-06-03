// 语音合成相关功能
let speechSynthesis;
let speechUtterance;
let isSpeaking = false;
let speechQueue = [];

// 在DOM加载完成后初始化客户端语音功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化客户端语音功能...');
    initSpeechSynthesis();
});

// 初始化语音合成
function initSpeechSynthesis() {
    // 检查浏览器是否支持语音合成
    if ('speechSynthesis' in window) {
        speechSynthesis = window.speechSynthesis;
        console.log('客户端语音合成功能已初始化');
        return true;
    } else {
        console.error('当前浏览器不支持语音合成');
        return false;
    }
}

// 获取可用的语音
function getVoices() {
    return new Promise((resolve) => {
        let voices = speechSynthesis.getVoices();
        if (voices.length) {
            resolve(voices);
        } else {
            // Chrome等浏览器可能需要等待voiceschanged事件
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
                resolve(voices);
            };
        }
    });
}

// 选择中文语音
async function selectChineseVoice() {
    const voices = await getVoices();
    // 尝试查找中文语音
    const chineseVoice = voices.find(voice => 
        voice.lang.includes('zh') || 
        voice.name.includes('Chinese') || 
        voice.name.includes('普通话')
    );
    return chineseVoice || voices[0]; // 如果找不到中文语音，使用第一个可用的语音
}

// 停止当前正在播放的语音
function stopSpeech() {
    if (speechSynthesis) {
        speechSynthesis.cancel();
        isSpeaking = false;
        
        // 停止口型同步
        if (typeof window.stopLipSync === 'function') {
            window.stopLipSync();
        }
    }
}

// 播放下一个语音队列中的内容
function playNextInQueue() {
    if (speechQueue.length > 0 && !isSpeaking) {
        const text = speechQueue.shift();
        speakText(text, false);
    }
}

// 文本转语音
async function speakText(text, queueIfSpeaking = true) {
    // 如果正在讲话且需要排队，则加入队列
    if (isSpeaking && queueIfSpeaking) {
        speechQueue.push(text);
        return;
    }
    
    if (!speechSynthesis) {
        if (!initSpeechSynthesis()) return;
    }
      try {
        // 停止当前的语音
        stopSpeech();
        
        // 创建新的语音实例
        speechUtterance = new SpeechSynthesisUtterance(text);
        console.log(`创建客户端语音合成对象，文本: ${text.substring(0, 50)}...`);
        
        // 选择中文语音
        const voice = await selectChineseVoice();
        speechUtterance.voice = voice;
        speechUtterance.lang = 'zh-CN';
        console.log(`设置客户端语音: ${voice ? voice.name : '默认'}, 语言: zh-CN`);
        
        // 设置语速和音调
        speechUtterance.rate = 1.0;  // 语速 (0.1 到 10)
        speechUtterance.pitch = 1.0; // 音调 (0 到 2)
        speechUtterance.volume = 1.0; // 音量 (0 到 1)
          // 设置事件监听器
        speechUtterance.onstart = () => {
            isSpeaking = true;
            console.log('语音开始播放');
            
            // 对于客户端语音合成，我们无法直接获取音频元素
            // 所以使用简化的口型同步模式
            if (typeof window.startLipSync === 'function') {
                console.log('启动简化口型同步功能');
                // 创建一个虚拟的音频元素来模拟播放时长
                const dummyAudio = new Audio();
                dummyAudio.currentTime = 0;
                dummyAudio.duration = text.length * 0.1; // 根据文本长度估算时长
                window.startLipSync(dummyAudio, true); // 使用简化模式
            }
        };
        
        speechUtterance.onend = () => {
            isSpeaking = false;
            console.log('语音播放结束');
            
            // 停止口型同步
            if (typeof window.stopLipSync === 'function') {
                window.stopLipSync();
            }
            
            // 播放队列中的下一条消息
            playNextInQueue();
        };
        
        speechUtterance.onerror = (event) => {
            console.error('语音播放错误:', event.error);
            isSpeaking = false;
            
            // 停止口型同步
            if (typeof window.stopLipSync === 'function') {
                window.stopLipSync();
            }
            
            // 尝试播放队列中的下一条
            playNextInQueue();
        };
        
        // 开始播放
        speechSynthesis.speak(speechUtterance);
    } catch (error) {
        console.error('语音合成错误:', error);
    }
}
