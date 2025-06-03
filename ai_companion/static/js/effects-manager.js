// 特效应用管理器
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎭 正在应用特效...');
    
    // 应用各种特效到现有元素
    applySpecialEffects();
    
    // 设置动态特效切换
    setupDynamicEffects();
    
    // 添加交互特效
    addInteractiveEffects();
});

function applySpecialEffects() {
    // 为容器添加全息效果
    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('holographic-effect');
        container.classList.add('refraction-light');
    }
    
    // 为聊天头部添加霓虹文字效果
    const chatHeader = document.querySelector('.chat-header h2');
    if (chatHeader) {
        chatHeader.classList.add('neon-text');
    }
    
    // 为Live2D容器添加水波纹效果
    const live2dContainer = document.querySelector('.live2d-container');
    if (live2dContainer) {
        live2dContainer.classList.add('water-ripple');
        live2dContainer.classList.add('cosmic-dust');
    }
    
    // 为消息添加3D卡片效果
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        message.classList.add('card-3d');
        message.classList.add('energy-pulse');
    });
    
    // 为按钮添加磁场效果
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.add('magnetic-field');
        button.classList.add('light-speed');
    });
      // 为输入框添加数据流效果 - 已禁用以避免干扰输入体验
    const input = document.querySelector('.chat-input input');
    if (input) {
        // input.classList.add('data-stream');
        // input.classList.add('electromagnetic-wave');
        console.log('输入框特效已禁用以提升用户体验');
    }
    
    // 为聊天消息区域添加电路板纹理
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
        chatMessages.classList.add('circuit-board');
    }
}

function setupDynamicEffects() {
    // 定期切换特效强度
    setInterval(() => {
        const container = document.querySelector('.container');
        if (container) {
            // 随机应用量子效果
            if (Math.random() > 0.7) {
                container.classList.add('quantum-effect');
                setTimeout(() => {
                    container.classList.remove('quantum-effect');
                }, 200);
            }
        }
    }, 5000);
    
    // 状态指示器脉冲效果
    const statusIndicator = document.querySelector('.status-indicator');
    if (statusIndicator) {
        setInterval(() => {
            statusIndicator.classList.add('electromagnetic-wave');
            setTimeout(() => {
                statusIndicator.classList.remove('electromagnetic-wave');
            }, 1000);
        }, 3000);
    }
}

function addInteractiveEffects() {
    // 鼠标悬停时的特效增强
    document.addEventListener('mouseover', function(e) {
        const target = e.target;
        
        // 按钮悬停特效
        if (target.tagName === 'BUTTON') {
            target.style.filter = 'drop-shadow(0 0 20px rgba(102, 126, 234, 0.6))';
            
            // 添加能量波动
            setTimeout(() => {
                target.style.filter = '';
            }, 300);
        }
        
        // 消息悬停特效
        if (target.classList.contains('message')) {
            target.style.boxShadow = `
                0 15px 35px rgba(102, 126, 234, 0.3),
                0 0 30px rgba(118, 75, 162, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.4)
            `;
            
            setTimeout(() => {
                target.style.boxShadow = '';
            }, 500);
        }
    });
    
    // 点击时的冲击波效果
    document.addEventListener('click', function(e) {
        createShockwave(e.clientX, e.clientY);
    });
    
    // 键盘输入时的数据流增强
    const input = document.querySelector('.chat-input input');
    if (input) {
        input.addEventListener('input', function() {
            this.style.background = `
                linear-gradient(90deg, 
                    rgba(102, 126, 234, 0.1), 
                    rgba(118, 75, 162, 0.1), 
                    rgba(79, 172, 254, 0.1)
                ),
                rgba(255, 255, 255, 0.9)
            `;
            this.style.backgroundSize = '200% 100%';
            this.style.animation = 'dataFlow 1s ease-out';
            
            setTimeout(() => {
                this.style.background = '';
                this.style.animation = '';
            }, 1000);
        });
    }
}

function createShockwave(x, y) {
    const shockwave = document.createElement('div');
    shockwave.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border: 2px solid rgba(102, 126, 234, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        animation: shockwaveExpand 0.6s ease-out forwards;
    `;
    
    document.body.appendChild(shockwave);
    
    setTimeout(() => {
        if (shockwave.parentNode) {
            shockwave.parentNode.removeChild(shockwave);
        }
    }, 600);
}

// 添加冲击波动画
const shockwaveStyle = document.createElement('style');
shockwaveStyle.textContent = `
    @keyframes shockwaveExpand {
        0% {
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            width: 100px;
            height: 100px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(shockwaveStyle);

// 监听消息变化并应用特效
function observeMessageChanges() {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.classList.contains('message')) {
                    // 为新消息应用特效
                    node.classList.add('card-3d');
                    node.classList.add('energy-pulse');
                    
                    // 特殊的进入动画
                    node.style.transform = 'scale(0) rotateY(90deg)';
                    node.style.opacity = '0';
                    
                    setTimeout(() => {
                        node.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        node.style.transform = 'scale(1) rotateY(0deg)';
                        node.style.opacity = '1';
                        
                        // 添加闪光效果
                        node.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.8)';
                        setTimeout(() => {
                            node.style.boxShadow = '';
                        }, 500);
                    }, 100);
                }
            });
        });
    });
    
    observer.observe(chatMessages, { childList: true });
}

// 启动消息观察器
observeMessageChanges();

// 添加能量充电效果
function addEnergyCharge() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    setInterval(() => {
        const energy = document.createElement('div');
        energy.style.cssText = `
            position: absolute;
            width: 4px;
            height: 20px;
            background: linear-gradient(to top, 
                rgba(102, 126, 234, 0.8), 
                rgba(255, 255, 255, 0.9));
            border-radius: 2px;
            left: ${Math.random() * 100}%;
            bottom: 0;
            animation: energyRise 2s ease-out forwards;
            pointer-events: none;
            z-index: 1000;
        `;
        
        container.appendChild(energy);
        
        setTimeout(() => {
            if (energy.parentNode) {
                energy.parentNode.removeChild(energy);
            }
        }, 2000);
    }, 3000);
}

// 添加能量上升动画
const energyStyle = document.createElement('style');
energyStyle.textContent = `
    @keyframes energyRise {
        0% {
            transform: translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateY(-200px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(energyStyle);

// 启动能量充电效果
addEnergyCharge();

// 主题色彩动态变化
function setupDynamicColors() {
    const colors = [
        { primary: '#667eea', secondary: '#764ba2' },
        { primary: '#4facfe', secondary: '#00f2fe' },
        { primary: '#fa709a', secondary: '#fee140' },
        { primary: '#a8edea', secondary: '#fed6e3' },
        { primary: '#ff9a9e', secondary: '#fecfef' }
    ];
    
    let currentColorIndex = 0;
    
    setInterval(() => {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
        const color = colors[currentColorIndex];
        
        document.documentElement.style.setProperty('--primary-color', color.primary);
        document.documentElement.style.setProperty('--secondary-color', color.secondary);
        
        console.log(`🎨 切换到颜色主题: ${color.primary} -> ${color.secondary}`);
    }, 30000); // 每30秒切换一次主题色
}

// 启动动态颜色
setupDynamicColors();

console.log('✨ 所有特效已成功应用！');
