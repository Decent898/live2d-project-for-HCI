// 音频口型同步功能
class LipSyncController {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.animationFrame = null;
        this.isAnalyzing = false;
        this.currentAudio = null;
        this.audioSource = null; // 保存音频源节点的引用
        this.audioSourceMap = new Map(); // 存储音频元素和对应的源节点映射
          // 口型参数配置 - 仅适配三月七模型的可用参数
        this.lipSyncParams = {
            // 嘴巴开合度参数
            mouthOpenY: 'ParamMouthOpenY',
            // 嘴型形状参数（用于不同元音形状）
            mouthForm: 'ParamMouthForm'
        };
        
        // 频率阈值配置
        this.frequencyThresholds = {
            low: 300,    // 低频 - 对应 A、O 音素
            mid: 1000,   // 中频 - 对应 E、I 音素  
            high: 2000   // 高频 - 对应 U 音素
        };
        
        // 音量阈值
        this.volumeThreshold = 0.01;
        
        // 平滑化参数
        this.smoothing = 0.8;
        this.lastMouthValue = 0;
    }
    
    // 初始化音频上下文
    async initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 512;
            this.analyser.smoothingTimeConstant = 0.8;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            console.log('音频上下文初始化成功');
            return true;
        } catch (error) {
            console.error('音频上下文初始化失败:', error);
            return false;
        }
    }    // 开始分析音频并同步口型
    async startLipSync(audioElement) {
        if (!audioElement) {
            console.error('音频元素不存在');
            return false;
        }
        
        // 如果已经在分析同一个音频元素，直接返回
        if (this.currentAudio === audioElement && this.isAnalyzing) {
            console.log('音频元素已在分析中，跳过重复启动');
            return true;
        }
        
        // 停止之前的分析
        this.stopLipSync();
        
        // 初始化音频上下文
        if (!this.audioContext && !await this.initAudioContext()) {
            return false;
        }
        
        try {
            // 如果音频上下文被暂停，则恢复
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // 获取或创建音频源
            let source = this.audioSourceMap.get(audioElement);
            
            if (!source) {
                // 创建新的音频源
                try {
                    source = this.audioContext.createMediaElementSource(audioElement);
                    this.audioSourceMap.set(audioElement, source);
                    console.log('创建新的音频源节点');
                } catch (error) {
                    if (error.name === 'InvalidStateError') {
                        console.error('音频元素已连接到其他AudioContext，无法创建新的源节点');
                        // 尝试使用简化模式
                        console.log('降级到简化口型同步模式');
                        return this.startSimpleLipSync(audioElement);
                    } else {
                        throw error;
                    }
                }
            } else {
                console.log('重用现有的音频源节点');
            }
            
            // 确保分析器存在
            if (!this.analyser) {
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 512;
                this.analyser.smoothingTimeConstant = 0.8;
                
                const bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(bufferLength);
            }
            
            // 断开之前的连接
            try {
                source.disconnect();
            } catch (e) {
                // 忽略断开连接的错误
            }
            
            // 连接音频源到分析器和目标
            source.connect(this.analyser);
            source.connect(this.audioContext.destination);
            this.audioSource = source;
            
            this.currentAudio = audioElement;
            this.isAnalyzing = true;
            
            // 开始分析循环
            this.analyzeLipSync();
            
            // 监听音频结束事件
            const endHandler = () => {
                this.stopLipSync();
            };
            
            const pauseHandler = () => {
                this.stopLipSync();
            };
            
            audioElement.addEventListener('ended', endHandler);
            audioElement.addEventListener('pause', pauseHandler);
            
            // 保存事件处理器的引用以便清理
            this.endHandler = endHandler;
            this.pauseHandler = pauseHandler;
            
            console.log('口型同步开始');
            return true;
            
        } catch (error) {
            console.error('启动口型同步失败:', error);
            console.log('降级到简化口型同步模式');
            return this.startSimpleLipSync(audioElement);
        }
    }
    
    // 分析音频频谱并更新口型
    analyzeLipSync() {
        // console.log('开始音频分析');
        if (!this.isAnalyzing || !this.analyser) {
            return;
        }
        
        // 获取频谱数据
        this.analyser.getByteFrequencyData(this.dataArray);
        // console.log('获取频谱数据:', this.dataArray);
        
        // 计算不同频段的能量
        const frequencies = this.calculateFrequencyEnergies();
        
        // 计算总音量
        const volume = this.calculateVolume();
        
        // 根据频谱分析确定口型
        const lipSyncData = this.calculateLipSyncParameters(frequencies, volume);
        
        // 应用口型参数到Live2D模型
        this.applyLipSyncToModel(lipSyncData);
        
        // 继续分析
        this.animationFrame = requestAnimationFrame(() => this.analyzeLipSync());
    }
    
    // 计算不同频段的能量
    calculateFrequencyEnergies() {
        const bufferLength = this.dataArray.length;
        const sampleRate = this.audioContext.sampleRate;
        const freqBinSize = sampleRate / (2 * bufferLength);
        
        let lowEnergy = 0, midEnergy = 0, highEnergy = 0;
        let lowCount = 0, midCount = 0, highCount = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const frequency = i * freqBinSize;
            const amplitude = this.dataArray[i] / 255.0;
            
            if (frequency < this.frequencyThresholds.low) {
                lowEnergy += amplitude;
                lowCount++;
            } else if (frequency < this.frequencyThresholds.mid) {
                midEnergy += amplitude;
                midCount++;
            } else if (frequency < this.frequencyThresholds.high) {
                highEnergy += amplitude;
                highCount++;
            }
        }
        
        return {
            low: lowCount > 0 ? lowEnergy / lowCount : 0,
            mid: midCount > 0 ? midEnergy / midCount : 0,
            high: highCount > 0 ? highEnergy / highCount : 0
        };
    }
    
    // 计算总音量
    calculateVolume() {
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / (this.dataArray.length * 255.0);
    }
    
    // 根据频谱分析计算口型参数
    calculateLipSyncParameters(frequencies, volume) {
        // 如果音量太低，闭嘴
        if (volume < this.volumeThreshold) {
            return {
                mouthOpenY: 0,
                mouthForm: 0,
                vowelType: 'closed'
            };
        }
        
        // 基于音量计算嘴巴开合度
        let mouthOpenY = Math.min(volume * 3, 1.0);
        
        // 平滑化处理
        mouthOpenY = this.lastMouthValue * this.smoothing + mouthOpenY * (1 - this.smoothing);
        this.lastMouthValue = mouthOpenY;
          // 根据频谱分布判断元音类型并设置嘴型形状
        let vowelType = 'A';
        let mouthForm = 0;
        
        const totalEnergy = frequencies.low + frequencies.mid + frequencies.high;
        if (totalEnergy > 0) {
            const lowRatio = frequencies.low / totalEnergy;
            const midRatio = frequencies.mid / totalEnergy;
            const highRatio = frequencies.high / totalEnergy;
            
            // 根据频谱分布确定元音类型和嘴型形状
            if (lowRatio > 0.45) {
                vowelType = 'A'; // 低频主导 - A音，嘴巴张开
                mouthForm = 0.7;  // 正值表示嘴巴偏圆形
            } else if (midRatio > 0.4) {
                vowelType = 'E'; // 中频主导 - E音，嘴巴扁平
                mouthForm = -0.6; // 负值表示嘴巴扁平
            } else if (highRatio > 0.35) {
                vowelType = 'I'; // 高频主导 - I音，嘴巴小而扁
                mouthForm = -0.8; // 更扁平的形状
            } else if (lowRatio > 0.3 && midRatio > 0.3) {
                vowelType = 'O'; // 中低频混合 - O音，嘴巴圆形
                mouthForm = 0.9;  // 最圆的形状
            } else {
                vowelType = 'U'; // 其他情况 - U音，嘴巴小圆
                mouthForm = 0.4;  // 中等圆形
            }
            
            // 根据音量调整形状强度
            mouthForm *= Math.min(volume * 2, 1.0);
        }
        
        return {
            mouthOpenY: mouthOpenY,
            mouthForm: mouthForm,
            vowelType: vowelType,
            volume: volume
        };
    }
      // 将口型参数应用到Live2D模型
    applyLipSyncToModel(lipSyncData) {
        if (!cubism3Model) {
            console.log('Live2D模型未加载');
            return;
        }
        
        try {
            // 应用嘴巴开合度和形状参数
            if (typeof setFaceParameter === 'function') {
                // 设置嘴巴开合度 (0.0 - 1.0)
                setFaceParameter(this.lipSyncParams.mouthOpenY, lipSyncData.mouthOpenY);
                
                // 设置嘴型形状，根据元音类型调整 (-1.0 - 1.0)
                setFaceParameter(this.lipSyncParams.mouthForm, lipSyncData.mouthForm);
                
                // 调试输出
                console.log(`口型同步: 开合度=${lipSyncData.mouthOpenY.toFixed(2)}, 形状=${lipSyncData.mouthForm.toFixed(2)}, 元音=${lipSyncData.vowelType}`);
            }
            
        } catch (error) {
            console.error('应用口型参数失败:', error);
        }
    }      // 停止口型同步
    stopLipSync() {
        this.isAnalyzing = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // 清理事件监听器
        if (this.currentAudio) {
            if (this.endHandler) {
                this.currentAudio.removeEventListener('ended', this.endHandler);
                this.endHandler = null;
            }
            if (this.pauseHandler) {
                this.currentAudio.removeEventListener('pause', this.pauseHandler);
                this.pauseHandler = null;
            }
        }
        
        // 断开音频源连接（但保留源节点以便重用）
        if (this.audioSource) {
            try {
                this.audioSource.disconnect();
            } catch (e) {
                // 忽略断开连接的错误
            }
        }
          // 重置嘴巴到闭合状态
        if (typeof setFaceParameter === 'function' && (window.cubism3Model || cubism3Model)) {
            setFaceParameter(this.lipSyncParams.mouthOpenY, 0);
            setFaceParameter(this.lipSyncParams.mouthForm, 0);
        }
        
        // 如果没有协调器在运行，恢复 normal 表情
        if (typeof window.expressionSyncCoordinator === 'undefined' || 
            !window.expressionSyncCoordinator.isPlaying) {
            if (typeof playMarchSevenExpression === 'function') {
                console.log('口型同步结束，恢复 normal 表情');
                playMarchSevenExpression('normal');
            }
        }
        
        this.currentAudio = null;
        this.audioSource = null;
        this.lastMouthValue = 0;
        
        console.log('口型同步已停止');
    }
    
    // 清理所有音频源（在不需要时调用）
    clearAllAudioSources() {
        this.audioSourceMap.forEach((source, audioElement) => {
            try {
                source.disconnect();
            } catch (e) {
                // 忽略断开连接的错误
            }
        });
        this.audioSourceMap.clear();
        console.log('所有音频源已清理');
    }
    
    // 简化版本的口型同步 - 基于音频波形
    startSimpleLipSync(audioElement) {
        if (!audioElement) return false;
        
        let lastTime = 0;
        const updateInterval = 50; // 50ms更新一次
        
        const updateMouth = () => {
            if (!this.isAnalyzing) return;
            
            const currentTime = Date.now();
            if (currentTime - lastTime < updateInterval) {
                requestAnimationFrame(updateMouth);
                return;
            }
            lastTime = currentTime;
            
            // 获取当前播放时间
            const currentPlayTime = audioElement.currentTime;
            
            // 简单的周期性口型变化
            const frequency = 8; // 每秒8次口型变化
            const phase = (currentPlayTime * frequency) % 1;
            
            // 生成平滑的口型开合
            let mouthValue = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
            
            // 添加随机变化使其更自然
            mouthValue *= 0.3 + Math.random() * 0.4;
            
            // 应用到模型
            if (typeof setFaceParameter === 'function' && window.cubism3Model) {
                setFaceParameter(this.lipSyncParams.mouthOpenY, mouthValue);
                
                // 随机改变嘴型
                const formValue = (Math.sin(phase * Math.PI * 4) * 0.3);
                setFaceParameter(this.lipSyncParams.mouthForm, formValue);
            }
            
            requestAnimationFrame(updateMouth);
        };
        
        this.isAnalyzing = true;
        updateMouth();
        
        // 监听音频结束
        audioElement.addEventListener('ended', () => {
            this.stopLipSync();
        });
        
        audioElement.addEventListener('pause', () => {
            this.stopLipSync();
        });
        
        console.log('简化口型同步开始');
        return true;
    }
}

// 创建全局口型同步控制器实例
window.lipSyncController = new LipSyncController();

// 导出口型同步函数供其他模块使用
window.startLipSync = function(audioElement, useSimpleMode = false) {
    if (useSimpleMode) {
        return window.lipSyncController.startSimpleLipSync(audioElement);
    } else {
        return window.lipSyncController.startLipSync(audioElement);
    }
};

window.stopLipSync = function() {
    window.lipSyncController.stopLipSync();
};

// 清理所有音频源的全局函数
window.clearAllAudioSources = function() {
    window.lipSyncController.clearAllAudioSources();
};

console.log('口型同步控制器已加载');
