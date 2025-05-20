// 模型列表
const LIVE2D_MODELS = [
    {
        name: "三月七",
        id: "march_seven",
        path: "/static/live2d/march_seven/march_seven.model3.json",
        type: "cubism3", // 标识这是一个Cubism 3模型
        customLoader: true // 使用自定义加载器
    }
];

// 当前模型索引
let currentModelIndex = 0; // 只有三月七模型

// 初始化Live2D模型
function initModelSelector() {
    // 直接加载三月七模型，不创建选择器
    loadModel(LIVE2D_MODELS[0].path);
}

// 加载指定路径的模型
function loadModel(modelPath) {
    // 查找当前选择的模型对象
    const selectedModel = LIVE2D_MODELS.find(model => model.path === modelPath);
    
    // 如果是 Cubism3 模型 (三月七)
    if (selectedModel && selectedModel.type === "cubism3" && selectedModel.customLoader) {
        console.log("加载三月七模型:", modelPath);
        
        // 先清理已有的L2Dwidget模型
        if (window.L2Dwidget && typeof window.L2Dwidget.destroy === 'function') {
            try {
                window.L2Dwidget.destroy();
                console.log("已销毁现有的L2Dwidget模型");
            } catch (e) {
                console.warn("销毁L2Dwidget模型时出错:", e);
            }
        }
        
        // 如果已存在waifu元素，先隐藏
        const waifuElement = document.getElementById('waifu');
        if (waifuElement) {
            waifuElement.style.display = 'none';
        }
        
        // 显示三月七的Canvas
        const canvas = document.getElementById('live2d');
        if (canvas) {
            canvas.style.display = 'block';
        }
        
        // 调用 march-seven-model.js 中的加载函数
        if (typeof loadMarchSevenModel === 'function') {
            loadMarchSevenModel().catch(err => {
                console.error("加载三月七模型失败:", err);
            });
        } else {
            console.error('三月七模型加载函数未找到，确保已包含正确的脚本文件');
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 设置一个延迟，确保所有脚本都已加载
    setTimeout(initModelSelector, 500);
});
