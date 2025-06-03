// 高级UI交互效果

document.addEventListener('DOMContentLoaded', function() {
    // 初始化界面美化效果
    initializeUIEffects();
    
    // 添加流星雨效果
    createMeteorShower();
    
    // 添加鼠标跟踪光效
    addMouseTracker();
    
    // 添加点击涟漪效果
    addRippleEffect();
    
    // 添加浮动粒子
    createFloatingParticles();
    
    // 添加消息动画
    enhanceMessageAnimations();
});

// 初始化UI效果
function initializeUIEffects() {
    console.log('🎨 初始化高级UI效果...');
    
    // 为容器添加进入动画
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'scale(0.9) translateY(20px)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            container.style.opacity = '1';
            container.style.transform = 'scale(1) translateY(0)';
        }, 100);
    }
    
    // 为聊天头部添加波浪效果
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) {
        const wave = document.createElement('div');
        wave.className = 'header-wave';
        wave.innerHTML = `
            <svg width="100%" height="50" viewBox="0 0 1200 50" preserveAspectRatio="none">
                <path d="M0,25 Q300,5 600,25 T1200,25 V50 H0 Z" fill="rgba(102, 126, 234, 0.1)">
                    <animate attributeName="d" 
                        values="M0,25 Q300,5 600,25 T1200,25 V50 H0 Z;
                                M0,25 Q300,45 600,25 T1200,25 V50 H0 Z;
                                M0,25 Q300,5 600,25 T1200,25 V50 H0 Z"
                        dur="4s" repeatCount="indefinite"/>
                </path>
            </svg>
        `;
        wave.style.position = 'absolute';
        wave.style.bottom = '0';
        wave.style.left = '0';
        wave.style.width = '100%';
        wave.style.height = '50px';
        wave.style.pointerEvents = 'none';
        chatHeader.appendChild(wave);
    }
}

// 创建流星雨效果
function createMeteorShower() {
    const meteorShower = document.createElement('div');
    meteorShower.className = 'meteor-shower';
    document.body.appendChild(meteorShower);
    
    function createMeteor() {
        const meteor = document.createElement('div');
        meteor.className = 'meteor';
        
        // 随机位置和延迟
        const startX = Math.random() * window.innerWidth;
        const delay = Math.random() * 3000;
        
        meteor.style.left = startX + 'px';
        meteor.style.animationDelay = delay + 'ms';
        
        // 随机大小
        const scale = 0.5 + Math.random() * 0.5;
        meteor.style.transform = `scale(${scale})`;
        
        meteorShower.appendChild(meteor);
        
        // 动画结束后移除
        setTimeout(() => {
            if (meteor.parentNode) {
                meteor.parentNode.removeChild(meteor);
            }
        }, 3000 + delay);
    }
    
    // 定期创建流星
    setInterval(createMeteor, 800 + Math.random() * 1500);
}

// 鼠标跟踪光效
function addMouseTracker() {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-light';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(102, 126, 234, 0.6) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease;
        filter: blur(2px);
    `;
    document.body.appendChild(cursor);
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = (cursorX - 10) + 'px';
        cursor.style.top = (cursorY - 10) + 'px';
        
        requestAnimationFrame(updateCursor);
    }
    updateCursor();
    
    // 悬停效果
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
}

// 添加点击涟漪效果
function addRippleEffect() {
    document.addEventListener('click', function(e) {
        // 只在按钮和消息上添加涟漪效果，排除输入框
        const target = e.target.closest('button, .message');
        if (!target) return;
        
        const ripple = document.createElement('div');
        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
            pointer-events: none;
            animation: rippleEffect 0.6s ease-out forwards;
        `;
        
        // 确保目标元素有相对定位
        if (getComputedStyle(target).position === 'static') {
            target.style.position = 'relative';
        }
        target.style.overflow = 'hidden';
        
        target.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    });
    
    // 添加涟漪动画CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            0% {
                transform: scale(0);
                opacity: 0.6;
            }
            100% {
                transform: scale(1);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// 创建浮动粒子
function createFloatingParticles() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const particleContainer = document.createElement('div');
    particleContainer.className = 'floating-particles';
    container.appendChild(particleContainer);
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机属性
        const size = 2 + Math.random() * 4;
        const x = Math.random() * 100;
        const duration = 8 + Math.random() * 8;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            left: ${x}%;
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;
        
        particleContainer.appendChild(particle);
        
        // 清理粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (duration + delay) * 1000);
    }
    
    // 定期创建粒子
    setInterval(createParticle, 300);
    
    // 初始粒子
    for (let i = 0; i < 20; i++) {
        setTimeout(createParticle, i * 100);
    }
}

// 增强消息动画
function enhanceMessageAnimations() {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    // 监听新消息添加
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.classList.contains('message')) {
                    // 添加进入动画
                    node.style.opacity = '0';
                    node.style.transform = 'translateY(30px) scale(0.9)';
                    
                    setTimeout(() => {
                        node.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        node.style.opacity = '1';
                        node.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                    
                    // 添加打字机效果（如果是AI消息）
                    if (node.classList.contains('ai-message')) {
                        addTypingEffect(node);
                    }
                }
            });
        });
    });
    
    observer.observe(chatMessages, { childList: true });
}

// 打字机效果
function addTypingEffect(messageElement) {
    const text = messageElement.textContent;
    if (!text) return;
    
    messageElement.innerHTML = '';
    let i = 0;
    
    function typeChar() {
        if (i < text.length) {
            messageElement.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeChar, 30 + Math.random() * 20);
        }
    }
    
    // 延迟开始打字
    setTimeout(typeChar, 200);
}

// 添加视觉反馈
function addVisualFeedback() {
    // 按钮悬停时的粒子效果
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            createButtonParticles(this);
        });
    });
}

function createButtonParticles(button) {
    const rect = button.getBoundingClientRect();
    const particles = [];
    
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
        `;
        
        document.body.appendChild(particle);
        
        // 动画粒子
        particle.animate([
            { transform: 'translateY(0) scale(1)', opacity: 1 },
            { transform: 'translateY(-20px) scale(0)', opacity: 0 }
        ], {
            duration: 500,
            easing: 'ease-out'
        }).onfinish = () => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        };
    }
}

// 性能优化：在不支持动画的设备上禁用效果
function checkPerformance() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLowPerformance = navigator.hardwareConcurrency < 4;
    
    if (prefersReducedMotion || isLowPerformance) {
        document.body.classList.add('reduce-motion');
        console.log('⚡ 检测到性能限制，已启用简化动画模式');
    }
}

// 添加简化动画的CSS类
const performanceStyle = document.createElement('style');
performanceStyle.textContent = `
    .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
    
    .reduce-motion .meteor-shower,
    .reduce-motion .floating-particles,
    .reduce-motion .cursor-light {
        display: none !important;
    }
`;
document.head.appendChild(performanceStyle);

// 初始化性能检查
checkPerformance();

console.log('✨ 高级UI效果已加载完成！');
