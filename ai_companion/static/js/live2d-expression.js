/**
 * Live2D表情触发器
 * 
 * 此脚本提供了一个通用的表情触发函数，可以适用于不同类型的Live2D模型
 */

// 当前模型类型
let currentModelType = 'march-seven'; // 可以是 'standard' 或 'march-seven'

// 全局函数：触发Live2D表情
function triggerLive2DExpression(emotion) {
    console.log(`触发Live2D表情: ${emotion}, 当前模型类型: ${currentModelType}`);
    
    // 根据当前模型类型选择合适的表情函数
    if (currentModelType === 'march-seven') {
        // 使用March Seven模型的表情函数
        if (typeof playMarchSevenExpression === 'function') {
            console.log(`调用March Seven表情: ${emotion}`);
            playMarchSevenExpression(emotion);
            return true;
        } else {
            console.error('找不到playMarchSevenExpression函数');
        }
    }
    console.warn('当前模型类型不支持此表情函数');
    return false;
}

// 设置当前模型类型（可由其他脚本调用）
function setCurrentModelType(modelType) {
    if (modelType === 'standard' || modelType === 'march-seven') {
        currentModelType = modelType;
        console.log(`已设置当前模型类型为: ${modelType}`);
        return true;
    } else {
        console.error(`不支持的模型类型: ${modelType}`);
        return false;
    }
}

// 初始化检测当前模型类型
document.addEventListener('DOMContentLoaded', function() {
    // 检测March Seven模型
    if (document.getElementById('march-seven-canvas')) {
        setCurrentModelType('march-seven');
    } 
    // 检测标准模型
    else if (document.querySelector('#waifu-toggle') || document.querySelector('#live2d-widget')) {
        setCurrentModelType('standard');
    }
    
    console.log(`Live2D表情触发器初始化完成，当前模型类型: ${currentModelType}`);
});
