// Live2D 初始化脚本
document.addEventListener('DOMContentLoaded', function() {
    // 确保必要的脚本已加载
    ensureScriptsLoaded().then(() => {
        // 初始化Live2D - 直接加载三月七模型
        loadMarchSevenModelDirectly();
    }).catch(error => {
        console.error("初始化Live2D时发生错误:", error);
    });
});

// 确保必要的脚本已加载
async function ensureScriptsLoaded() {
    // 检查三月七模型脚本是否已加载
    if (typeof loadMarchSevenModel === 'undefined') {
        console.warn("三月七模型脚本未加载，尝试动态加载");
        try {
            await loadScript('/static/js/march-seven-model.js');
            console.log("三月七模型脚本加载成功");
        } catch (err) {
            console.error("加载三月七模型脚本失败:", err);
        }
    }
    
    return Promise.resolve();
}

// 动态加载脚本
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 直接加载三月七模型
function loadMarchSevenModelDirectly() {
    console.log("直接加载三月七模型");
    
    // 确保canvas可见
    const canvas = document.getElementById('live2d');
    if (canvas) {
        canvas.style.display = 'block';
    }
    
    // 如果已存在L2Dwidget，清理它
    if (window.L2Dwidget && document.getElementById('waifu')) {
        console.log("清理现有的L2Dwidget模型");
        try {
            // 尝试隐藏标准模型
            const waifuElement = document.getElementById('waifu');
            if (waifuElement) {
                waifuElement.style.display = 'none';
            }
            
            // 尝试销毁L2Dwidget
            if (typeof L2Dwidget.destroy === 'function') {
                L2Dwidget.destroy();
            }
        } catch (e) {
            console.warn("清理L2Dwidget时出错:", e);
        }
    }
    
    // 加载三月七模型
    if (typeof loadMarchSevenModel === 'function') {
        loadMarchSevenModel().catch(err => {
            console.error("加载三月七模型失败:", err);
        });
    } else {
        console.error('三月七模型加载函数未找到，确保已包含正确的脚本文件');
    }
}

// 在Live2D对话框中显示消息 - 适配三月七模型
function showMessageInLive2D(message) {
    if (typeof showMessageInLive2DMarchSeven === 'function') {
        showMessageInLive2DMarchSeven(message);
    } else {
        console.warn("三月七模型的消息显示函数未找到");
    }
}
