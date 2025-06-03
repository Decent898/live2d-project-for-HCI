/**
 * 表情和同步协调器
 * 负责协调文字显示、音频播放、表情动画和口型同步的时序
 */

class ExpressionSyncCoordinator {
    constructor() {
        // 状态管理
        this.isPlaying = false;
        this.currentEmotion = 'normal';
        this.expressionStartTime = null;
        this.expressionDuration = 2000; // 表情持续2秒
        
        // 文字显示配置
        this.textDisplaySpeed = 50; // 每字符显示间隔(ms)
        this.wordDelay = 200; // 词间延迟(ms)
        
        // 定时器管理
        this.expressionTimer = null;
        this.textDisplayTimer = null;
        this.lipSyncDelayTimer = null;
        
        // 绑定方法上下文
        this.playCoordinatedSequence = this.playCoordinatedSequence.bind(this);
        this.displayTextProgressively = this.displayTextProgressively.bind(this);
        this.startDelayedLipSync = this.startDelayedLipSync.bind(this);
        this.resetToNormalExpression = this.resetToNormalExpression.bind(this);
        
        console.log('表情同步协调器已初始化');
    }    /**
     * 播放协调序列：先显示表情2秒，同时逐字显示文字，然后开始口型同步
     * @param {string} text - 要显示的文字
     * @param {string} emotion - 表情类型
     * @param {HTMLAudioElement} audioElement - 音频元素（可选，用于客户端语音）
     */
    async playCoordinatedSequence(text, emotion = 'normal', audioElement = null) {
        console.log(`开始协调播放序列: 文字="${text}", 表情="${emotion}"`);
        
        // 如果正在播放，先停止
        if (this.isPlaying) {
            this.stopCurrentSequence();
        }
        
        this.isPlaying = true;
        this.currentEmotion = emotion;
        this.expressionStartTime = Date.now();
        
        try {
            // 1. 立即触发表情
            await this.triggerExpression(emotion);
            
            // 2. 检查是否需要等待音频准备（服务器语音的情况）
            if (!audioElement) {
                // 服务器语音情况：显示"思考中..."然后等待音频准备好
                this.showThinkingStatus();
                
                // 设置一个检查音频准备状态的定时器
                this.waitForAudioReady(text);
            } else {
                // 客户端语音情况：立即开始文本显示
                this.startTextDisplay(text, audioElement);
            }
            
        } catch (error) {
            console.error('协调播放序列失败:', error);
            this.isPlaying = false;
        }
    }    /**
     * 显示思考状态
     */
    showThinkingStatus() {
        console.log('显示思考状态');
        // 显示"思考中..."消息
        this.updateChatMessage('思考中...');
    }/**
     * 等待音频准备就绪
     * @param {string} text - 要显示的文字
     */
    waitForAudioReady(text) {
        console.log('等待服务器音频准备就绪...');
        
        let checkCount = 0;
        const maxChecks = 30; // 减少到6秒（30次 * 200ms）避免卡死太久
        const startTime = Date.now();
        
        // 设置一个安全超时，确保最终会显示文本
        const safetyTimeout = setTimeout(() => {
            if (this.isPlaying) {
                console.warn('安全超时触发：强制显示文本');
                this.handleAudioTimeout(text);
            }
        }, 8000); // 8秒安全超时
        
        // 检查全局音频元素是否可用
        const checkAudioReady = () => {
            if (!this.isPlaying) {
                clearTimeout(safetyTimeout);
                return; // 如果已停止，不再检查
            }
            
            checkCount++;
            const elapsedTime = Date.now() - startTime;
            console.log(`检查音频状态第 ${checkCount} 次，已用时 ${elapsedTime}ms`);
            
            // 检查是否有可用的音频元素
            let audioElement = null;
            let audioReady = false;
            
            try {
                // 尝试获取服务器音频元素
                if (window.currentServerAudio) {
                    const audio = window.currentServerAudio;
                    console.log(`音频状态: readyState=${audio.readyState}, src=${audio.src ? '已设置' : '未设置'}, error=${audio.error ? '有错误' : '无错误'}`);
                    
                    // 检查音频是否出错
                    if (audio.error) {
                        console.error('音频加载出错:', audio.error);
                        clearTimeout(safetyTimeout);
                        this.handleAudioError(text, audio.error);
                        return;
                    }
                    
                    // 检查音频是否有源且准备就绪
                    if (audio.src && audio.readyState >= 1) { // HAVE_METADATA 或更高
                        audioElement = audio;
                        audioReady = true;
                        console.log('服务器音频已准备就绪');
                    } else if (audio.src && audio.readyState === 0) {
                        // 音频源已设置但还在加载，继续等待
                        console.log('音频源已设置，继续等待加载...');
                    } else {
                        console.log('音频源尚未设置或未准备好');
                    }
                } else {
                    console.log('全局音频对象不存在');
                }
                
                if (audioReady && audioElement) {
                    // 音频准备好了，清理安全超时并开始文本显示
                    clearTimeout(safetyTimeout);
                    this.startTextDisplay(text, audioElement);
                } else if (checkCount >= maxChecks) {
                    // 超时，强制开始文本显示（无音频）
                    clearTimeout(safetyTimeout);
                    this.handleAudioTimeout(text);
                } else {
                    // 继续等待，200ms后再检查
                    setTimeout(checkAudioReady, 200);
                }
            } catch (error) {
                console.error('检查音频状态时出错:', error);
                clearTimeout(safetyTimeout);
                this.handleAudioError(text, error);
            }
        };
        
        // 开始检查
        setTimeout(checkAudioReady, 100); // 100ms后开始检查，给音频加载一些时间
    }

    /**
     * 处理音频超时
     * @param {string} text - 要显示的文字
     */
    handleAudioTimeout(text) {
        console.warn('音频等待超时，开始仅文本显示');
        this.startTextDisplay(text, null);
        
        // 发送通知
        if (typeof window.showNotification === 'function') {
            window.showNotification('语音加载超时，仅显示文本');
        }
    }

    /**
     * 处理音频错误
     * @param {string} text - 要显示的文字
     * @param {Error} error - 错误对象
     */
    handleAudioError(text, error) {
        console.error('音频加载失败:', error);
        this.startTextDisplay(text, null);
        
        // 发送通知
        if (typeof window.showNotification === 'function') {
            window.showNotification('语音播放失败，仅显示文本');
        }
    }

    /**
     * 开始文本显示和音频播放
     * @param {string} text - 要显示的文字
     * @param {HTMLAudioElement} audioElement - 音频元素
     */
    startTextDisplay(text, audioElement) {
        console.log('开始文本显示和音频同步');
        
        // 3. 开始逐字显示文字（与表情同时进行）
        this.displayTextProgressively(text);
        
        // 4. 如果有音频元素，延迟启动口型同步（在表情动画后）
        if (audioElement) {
            this.startDelayedLipSync(audioElement);
        }
        
        // 5. 2秒后重置为普通表情
        this.expressionTimer = setTimeout(() => {
            this.resetToNormalExpression();
        }, this.expressionDuration);
    }
    
    /**
     * 触发表情动画
     * @param {string} emotion - 表情类型
     */
    async triggerExpression(emotion) {
        console.log(`触发表情: ${emotion}`);
        
        try {
            // 使用现有的表情函数
            if (typeof playMarchSevenExpression === 'function') {
                const success = playMarchSevenExpression(emotion);
                if (success) {
                    console.log(`表情 ${emotion} 应用成功`);
                } else {
                    console.warn(`表情 ${emotion} 应用失败，尝试备用方法`);
                    // 备用方法
                    if (typeof triggerLive2DExpression === 'function') {
                        triggerLive2DExpression(emotion);
                    }
                }
            } else {
                console.warn('playMarchSevenExpression函数不存在');
            }
        } catch (error) {
            console.error('触发表情失败:', error);
        }
    }
    
    /**
     * 逐字显示文字
     * @param {string} text - 要显示的文字
     */
    displayTextProgressively(text) {
        console.log(`开始逐字显示文字: "${text}"`);
        
        // 清理现有的显示定时器
        if (this.textDisplayTimer) {
            clearTimeout(this.textDisplayTimer);
        }
        
        // 分词处理
        const words = this.segmentText(text);
        let currentText = '';
        let wordIndex = 0;
        
        const displayNextWord = () => {
            if (wordIndex >= words.length || !this.isPlaying) {
                console.log('文字显示完成');
                return;
            }
            
            const word = words[wordIndex];
            let charIndex = 0;
            
            const displayNextChar = () => {
                if (charIndex >= word.length || !this.isPlaying) {
                    // 当前词显示完成，准备下一个词
                    wordIndex++;
                    this.textDisplayTimer = setTimeout(displayNextWord, this.wordDelay);
                    return;
                }
                
                currentText += word[charIndex];
                
                // 更新显示的文字
                this.updateDisplayedText(currentText);
                
                charIndex++;
                this.textDisplayTimer = setTimeout(displayNextChar, this.textDisplaySpeed);
            };
            
            displayNextChar();
        };
        
        // 立即显示第一个字符，避免延迟
        displayNextWord();
    }
    
    /**
     * 文字分段处理
     * @param {string} text - 原始文字
     * @returns {Array} 分段后的词组数组
     */
    segmentText(text) {
        // 简单的中文分词：按标点符号和空格分割
        const segments = text.split(/([，。！？；：、\s]+)/).filter(seg => seg.trim().length > 0);
        
        // 进一步细分长段落
        const words = [];
        segments.forEach(segment => {
            if (segment.length > 10 && !/[，。！？；：、\s]/.test(segment)) {
                // 长句子按5字符分段
                for (let i = 0; i < segment.length; i += 5) {
                    words.push(segment.substring(i, i + 5));
                }
            } else {
                words.push(segment);
            }
        });
        
        return words;
    }
      /**
     * 更新显示的文字
     * @param {string} text - 当前要显示的文字
     */
    updateDisplayedText(text) {
        try {
            // 更新主聊天区域中最后一条AI消息的内容
            this.updateChatMessage(text);
        } catch (error) {
            console.error('更新显示文字失败:', error);
        }
    }    /**
     * 更新聊天区域中的AI消息
     * @param {string} text - 要显示的文字内容
     */
    updateChatMessage(text) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            console.warn('找不到聊天消息容器');
            return;
        }

        // 查找最后一条AI消息
        const aiMessages = chatMessages.querySelectorAll('.ai-message');
        let lastAiMessage = aiMessages[aiMessages.length - 1];

        // 如果没有AI消息或者最后的消息不是我们要更新的，创建新的消息
        if (!lastAiMessage) {
            lastAiMessage = document.createElement('div');
            lastAiMessage.className = 'message ai-message';
            lastAiMessage.textContent = text;
            chatMessages.appendChild(lastAiMessage);
            console.log('创建新的AI消息:', text);
        } else {
            // 更新现有的最后一条AI消息
            lastAiMessage.textContent = text;
            console.log('更新AI消息为:', text);
        }

        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * 延迟启动口型同步
     * @param {HTMLAudioElement} audioElement - 音频元素
     */
    startDelayedLipSync(audioElement) {
        console.log('准备延迟启动口型同步');
        
        // 计算表情显示的剩余时间
        const elapsedTime = Date.now() - this.expressionStartTime;
        const remainingExpressionTime = Math.max(0, this.expressionDuration - elapsedTime);
        
        // 在表情显示完成后启动口型同步
        this.lipSyncDelayTimer = setTimeout(() => {
            if (this.isPlaying && audioElement) {
                console.log('开始口型同步');
                this.startLipSync(audioElement);
            }
        }, remainingExpressionTime);
    }
    
    /**
     * 启动口型同步
     * @param {HTMLAudioElement} audioElement - 音频元素
     */
    startLipSync(audioElement) {
        try {
            // 使用现有的口型同步功能
            if (typeof window.startLipSync === 'function') {
                window.startLipSync(audioElement, false); // 使用高级模式
                console.log('口型同步已启动');
                  // 监听音频结束事件
                const onAudioEnd = () => {
                    console.log('音频播放结束，停止口型同步并恢复 normal 表情');
                    
                    // 停止口型同步
                    if (typeof window.stopLipSync === 'function') {
                        window.stopLipSync();
                    }
                    
                    // 恢复到 normal 表情
                    this.resetToNormalExpression();
                    
                    // 清理状态
                    this.isPlaying = false;
                    
                    // 移除事件监听器
                    audioElement.removeEventListener('ended', onAudioEnd);
                };
                
                audioElement.addEventListener('ended', onAudioEnd);
                
            } else {
                console.warn('口型同步功能不可用');
            }
        } catch (error) {
            console.error('启动口型同步失败:', error);
        }
    }
    
    /**
     * 重置为普通表情
     */
    resetToNormalExpression() {
        console.log('重置为普通表情');
        
        try {
            // 触发普通表情
            this.triggerExpression('normal');
            
            // 清理定时器
            if (this.expressionTimer) {
                clearTimeout(this.expressionTimer);
                this.expressionTimer = null;
            }
            
        } catch (error) {
            console.error('重置表情失败:', error);
        }
    }    /**
     * 停止当前播放序列
     */
    stopCurrentSequence() {
        console.log('停止当前播放序列');
        
        this.isPlaying = false;
        
        // 清理所有定时器
        if (this.expressionTimer) {
            clearTimeout(this.expressionTimer);
            this.expressionTimer = null;
        }
        
        if (this.textDisplayTimer) {
            clearTimeout(this.textDisplayTimer);
            this.textDisplayTimer = null;
        }
        
        if (this.lipSyncDelayTimer) {
            clearTimeout(this.lipSyncDelayTimer);
            this.lipSyncDelayTimer = null;
        }
        
        // 停止口型同步
        if (typeof window.stopLipSync === 'function') {
            window.stopLipSync();
        }
        
        // 恢复到 normal 表情
        this.resetToNormalExpression();
    }

    /**
     * 强制清理所有状态（紧急停止）
     */
    emergencyStop() {
        console.warn('紧急停止所有协调器活动');
        this.stopCurrentSequence();
        
        // 清理可能卡住的"思考中"状态
        this.clearThinkingStatus();
        
        // 发送通知
        if (typeof window.showNotification === 'function') {
            window.showNotification('系统已重置，请重新发送消息');
        }
    }

    /**
     * 清理思考中状态
     */
    clearThinkingStatus() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        // 查找并清理"思考中..."消息
        const aiMessages = chatMessages.querySelectorAll('.ai-message');
        const lastAiMessage = aiMessages[aiMessages.length - 1];
        
        if (lastAiMessage && 
            (lastAiMessage.textContent.includes('思考中...') || 
             lastAiMessage.textContent.includes('正在思考...'))) {
            // 替换为错误消息
            lastAiMessage.textContent = '抱歉，处理超时，请重新发送消息';
            lastAiMessage.style.color = '#ff6b6b';
            console.log('已清理思考中状态');
        }
    }
    
    /**
     * 设置表情持续时间
     * @param {number} duration - 持续时间(毫秒)
     */
    setExpressionDuration(duration) {
        this.expressionDuration = Math.max(1000, duration); // 最小1秒
        console.log(`表情持续时间设置为: ${this.expressionDuration}ms`);
    }
    
    /**
     * 设置文字显示速度
     * @param {number} speed - 每字符显示间隔(毫秒)
     */
    setTextDisplaySpeed(speed) {
        this.textDisplaySpeed = Math.max(10, speed); // 最小10ms
        console.log(`文字显示速度设置为: ${this.textDisplaySpeed}ms/字符`);
    }
    
    /**
     * 获取当前状态
     * @returns {Object} 当前状态信息
     */
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            currentEmotion: this.currentEmotion,
            expressionDuration: this.expressionDuration,
            textDisplaySpeed: this.textDisplaySpeed
        };
    }
}

// 创建全局实例
window.expressionSyncCoordinator = new ExpressionSyncCoordinator();

// 导出便捷函数
window.playCoordinatedResponse = function(text, emotion = 'normal', audioElement = null) {
    return window.expressionSyncCoordinator.playCoordinatedSequence(text, emotion, audioElement);
};

window.stopCoordinatedResponse = function() {
    return window.expressionSyncCoordinator.stopCurrentSequence();
};

console.log('表情同步协调器模块已加载');
