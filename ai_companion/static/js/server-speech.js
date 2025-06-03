// 导入Gradio客户端
// 注意：需要先安装依赖 npm i -D @gradio/client
// import { Client } from "@gradio/client"; 
// 上面的import语句需要在构建环境中使用，浏览器环境请引入CDN

// 服务器端语音合成功能
let audioPlayer;
let isServerSpeaking = false;
let serverSpeechQueue = [];
let serverSpeechEnabled = true;
let serverSpeechErrorCount = 0; // 记录连续错误次数
let gradioClient = null; // Gradio 客户端实例

// 在DOM加载完成后初始化语音功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化服务器语音功能...');
    initServerSpeech();
});

// 初始化音频播放器
function initServerSpeech() {
    // 创建音频元素
    audioPlayer = new Audio();
    
    // 设置全局引用，供协调器使用
    window.currentServerAudio = audioPlayer;
    
    console.log('服务器语音播放器已初始化');
    
    // 初始化Gradio客户端
    try {
        // 如果在浏览器环境中可以直接访问Client
        if (typeof window.GradioClient !== 'undefined' && window.GradioClient.Client) {
            console.log('检测到全局Gradio客户端，初始化中...');
            initGradioClient();
        }
    } catch (error) {
        console.warn('Gradio客户端初始化失败，将使用服务器API方式:', error);
    }    // 设置事件监听器
    audioPlayer.onplay = () => {
        isServerSpeaking = true;
        console.log('服务器语音开始播放');
        
        // 如果有协调器，通知开始口型同步
        if (typeof window.expressionSyncCoordinator !== 'undefined' && 
            window.expressionSyncCoordinator.isPlaying) {
            console.log('通知协调器开始口型同步');
            // 协调器会在适当时机自动启动口型同步
        } else {
            // 传统的口型同步启动方式
            if (typeof window.startLipSync === 'function') {
                console.log('启动口型同步功能');
                window.startLipSync(audioPlayer, false); // 使用高级模式
            }
        }
    };    audioPlayer.onended = () => {
        isServerSpeaking = false;
        console.log('服务器语音播放结束');
        
        // 如果有协调器在运行，让协调器处理清理和表情恢复
        if (typeof window.expressionSyncCoordinator !== 'undefined' && 
            window.expressionSyncCoordinator.isPlaying) {
            console.log('协调器正在运行，交由协调器处理清理和表情恢复');
            // 协调器会自动处理口型同步的停止和表情恢复
        } else {
            // 传统的口型同步停止方式
            if (typeof window.stopLipSync === 'function') {
                console.log('停止口型同步功能');
                window.stopLipSync();
            }
            
            // 如果没有协调器运行，手动恢复 normal 表情
            if (typeof playMarchSevenExpression === 'function') {
                console.log('手动恢复 normal 表情');
                playMarchSevenExpression('normal');
            }
        }
        
        // 播放队列中的下一条消息
        playNextServerSpeech();
    };      audioPlayer.onerror = (event) => {
        console.error('服务器语音播放错误:', event);
        isServerSpeaking = false;
        
        // 如果有协调器在运行，让协调器处理清理和表情恢复
        if (typeof window.expressionSyncCoordinator !== 'undefined' && 
            window.expressionSyncCoordinator.isPlaying) {
            console.log('播放错误，通知协调器停止');
            if (typeof stopCoordinatedResponse === 'function') {
                stopCoordinatedResponse();
            }
        } else {
            // 传统的口型同步停止方式
            if (typeof window.stopLipSync === 'function') {
                window.stopLipSync();
            }
            
            // 如果没有协调器运行，手动恢复 normal 表情
            if (typeof playMarchSevenExpression === 'function') {
                console.log('播放错误，手动恢复 normal 表情');
                playMarchSevenExpression('normal');
            }
        }
        
        // 尝试播放队列中的下一条
        playNextServerSpeech();
    };
    
    return true;
}

// 停止当前服务器语音播放
function stopServerSpeech() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        isServerSpeaking = false;
        
        // 停止口型同步
        if (typeof window.stopLipSync === 'function') {
            window.stopLipSync();
        }
    }
}

// 播放队列中的下一个服务器语音
function playNextServerSpeech() {
    if (serverSpeechQueue.length > 0 && !isServerSpeaking) {
        const text = serverSpeechQueue.shift();
        playServerSpeech(text, false);
    }
}

// 播放服务器生成的语音
function playServerSpeech(text, queueIfSpeaking = true) {
    console.log('尝试播放服务器语音:', text.substring(0, 50) + '...');
    
    // 如果未启用服务器语音，则直接返回
    if (!serverSpeechEnabled) {
        console.log('服务器语音已禁用，不播放');
        return;
    }
    
    // 如果正在播放且需要排队，则加入队列
    if (isServerSpeaking && queueIfSpeaking) {
        console.log('服务器语音正在播放，将文本加入队列');
        serverSpeechQueue.push(text);
        return;
    }
    
    // 确保音频播放器已初始化
    if (!audioPlayer) {
        console.log('音频播放器未初始化，尝试初始化');
        if (!initServerSpeech()) {
            console.error('音频播放器初始化失败');
            return;
        }
    }
    
    try {
        // 停止当前的播放
        stopServerSpeech();
        
        
        // 构建请求数据
        const requestData = {
            text: text,
            speaker: '三月七_ZH',
            emotion: 'Happy',
            language: 'ZH'
        };
        
        // 在请求中添加一个时间戳，避免浏览器缓存
        const timestamp = new Date().getTime();
        console.log('发送语音合成请求到服务器...');
        
        // 请求服务器语音合成
        fetch(`/api/speech/?t=${timestamp}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            // 检查HTTP状态码
            if (!response.ok) {
                // 先检查是否返回了JSON错误信息
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    // 解析JSON错误信息
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || `服务器语音合成失败: ${response.status}`);
                    });
                }
                throw new Error(`服务器语音合成失败: ${response.status}`);
            }            console.log('收到服务器语音响应，处理音频数据');
            return response.blob();
        })        .then(blob => {            console.log(`收到音频blob数据，大小: ${blob.size} 字节, 类型: ${blob.type}`);
            
            // 创建blob URL
            const audioUrl = URL.createObjectURL(blob);
            console.log('创建音频URL:', audioUrl);
            
            // 设置音频源并播放
            audioPlayer.src = audioUrl;
            console.log('开始播放服务器语音');            audioPlayer.play().then(() => {
                // 成功播放，重置错误计数
                console.log('服务器语音开始播放成功');
                serverSpeechErrorCount = 0;
                
                // 如果有协调器且正在运行，通知音频开始播放
                if (typeof window.expressionSyncCoordinator !== 'undefined' && 
                    window.expressionSyncCoordinator.isPlaying) {
                    console.log('通知协调器：音频开始播放');
                    // 协调器会在适当时机启动口型同步
                    if (typeof window.expressionSyncCoordinator.startDelayedLipSync === 'function') {
                        window.expressionSyncCoordinator.startDelayedLipSync(audioPlayer);
                    }
                }
            }).catch(error => {
                console.error('播放服务器语音失败:', error);
                // 释放 Blob URL
                URL.revokeObjectURL(audioUrl);
                
                // 如果有协调器在运行，通知播放失败
                if (typeof window.expressionSyncCoordinator !== 'undefined' && 
                    window.expressionSyncCoordinator.isPlaying) {
                    if (typeof stopCoordinatedResponse === 'function') {
                        stopCoordinatedResponse();
                    }
                }
                
                // 尝试播放下一个
                isServerSpeaking = false;
                playNextServerSpeech();
            });              // 设置一次性事件监听器来释放Blob URL
            const cleanupUrl = () => {
                URL.revokeObjectURL(audioUrl);
                console.log('已清理音频URL资源');
                audioPlayer.removeEventListener('ended', cleanupUrl);
                audioPlayer.removeEventListener('error', cleanupUrl);
            };
            
            audioPlayer.addEventListener('ended', cleanupUrl);
            audioPlayer.addEventListener('error', cleanupUrl);
        })
        .catch(error => {
            console.error('服务器语音合成请求失败:', error);
            
            // 通知用户出现了问题
            const errorMessage = `服务器语音合成失败: ${error.message}`;
            console.error(errorMessage);
            
            // 如果连续失败次数超过阈值，自动切换到客户端语音
            serverSpeechErrorCount++;
            if (serverSpeechErrorCount >= 3) {
                console.log('服务器语音多次失败，自动切换到客户端语音');
                if (typeof switchToClientSpeech === 'function') {
                    switchToClientSpeech();
                    // 显示切换通知
                    if (typeof showNotification === 'function') {
                        showNotification('服务器语音不可用，已切换到本地语音');
                    } else {
                        alert('服务器语音不可用，已切换到本地语音');
                    }
                }
            }
            
            // 尝试下一个
            isServerSpeaking = false;
            playNextServerSpeech();
        });
    } catch (error) {
        console.error('服务器语音合成错误:', error);
        isServerSpeaking = false;
    }
}

// 切换服务器语音状态
function toggleServerSpeech() {
    serverSpeechEnabled = !serverSpeechEnabled;
    
    if (!serverSpeechEnabled) {
        stopServerSpeech();
        // 清空队列
        serverSpeechQueue = [];
    }
    
    return serverSpeechEnabled;
}

// 页面卸载时的清理
window.addEventListener('beforeunload', () => {
    console.log('页面即将卸载，清理音频资源');
    
    // 停止音频播放
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
    }
    
    // 停止口型同步
    if (typeof window.stopLipSync === 'function') {
        window.stopLipSync();
    }
    
    // 清理所有音频源
    if (typeof window.clearAllAudioSources === 'function') {
        window.clearAllAudioSources();
    }
});
