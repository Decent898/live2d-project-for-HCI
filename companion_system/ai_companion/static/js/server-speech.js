// 服务器端语音合成功能
let audioPlayer;
let isServerSpeaking = false;
let serverSpeechQueue = [];
let serverSpeechEnabled = true;
let serverSpeechErrorCount = 0; // 记录连续错误次数

// 初始化音频播放器
function initServerSpeech() {
    // 创建音频元素
    audioPlayer = new Audio();
    
    // 设置事件监听器
    audioPlayer.onplay = () => {
        isServerSpeaking = true;
        console.log('服务器语音开始播放');
    };
    
    audioPlayer.onended = () => {
        isServerSpeaking = false;
        console.log('服务器语音播放结束');
        // 播放队列中的下一条消息
        playNextServerSpeech();
    };
    
    audioPlayer.onerror = (event) => {
        console.error('服务器语音播放错误:', event);
        isServerSpeaking = false;
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
    // 如果未启用服务器语音，则直接返回
    if (!serverSpeechEnabled) return;
    
    // 如果正在播放且需要排队，则加入队列
    if (isServerSpeaking && queueIfSpeaking) {
        serverSpeechQueue.push(text);
        return;
    }
    
    // 确保音频播放器已初始化
    if (!audioPlayer) {
        if (!initServerSpeech()) return;
    }
    
    try {
        // 停止当前的播放
        stopServerSpeech();
        
        // 构建请求数据
        const requestData = {
            text: text
        };
        
        // 在请求中添加一个时间戳，避免浏览器缓存
        const timestamp = new Date().getTime();
        
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
            }
            return response.blob();
        })
        .then(blob => {
            // 创建blob URL
            const audioUrl = URL.createObjectURL(blob);
            
            // 设置音频源并播放
            audioPlayer.src = audioUrl;
            audioPlayer.play().then(() => {
                // 成功播放，重置错误计数
                serverSpeechErrorCount = 0;
            }).catch(error => {
                console.error('播放服务器语音失败:', error);
                // 释放 Blob URL
                URL.revokeObjectURL(audioUrl);
                
                // 尝试播放下一个
                isServerSpeaking = false;
                playNextServerSpeech();
            });
            
            // 播放完成后释放Blob URL
            audioPlayer.onended = () => {
                isServerSpeaking = false;
                URL.revokeObjectURL(audioUrl);
                console.log('服务器语音播放结束');
                // 播放队列中的下一条
                playNextServerSpeech();
            };
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
