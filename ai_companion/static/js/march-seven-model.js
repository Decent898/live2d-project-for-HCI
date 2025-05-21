// 加载三月七Live2D模型（Cubism 3）
let cubism3Model = null;

// 在JS模块中定义updateStatus函数
function updateStatus(text) {
    console.log("状态更新: " + text);
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        statusBar.textContent = '最近操作: ' + text;
    }
}

// 辅助函数：显示错误信息
async function loadMarchSevenModel() {
    try {
        // 更新状态栏
        updateStatus('正在加载March Seven模型...');
        console.log("开始加载March Seven模型");

        // 获取或创建canvas
        let canvas = document.getElementById('live2d');
        if (!canvas) {
            canvas = document.getElementById('march-seven-canvas');
            if (!canvas) {
                showErrorMessage('找不到canvas元素: live2d 或 march-seven-canvas');
                throw new Error('找不到canvas元素');
            }
        }

        canvas.style.display = 'block';

        // 如果已存在L2Dwidget，清理它
        if (window.L2Dwidget && document.getElementById('waifu')) {
            console.log("清理现有的L2Dwidget模型");
            try {
                // 尝试隐藏标准模型
                const waifuElement = document.getElementById('waifu');
                if (waifuElement) {
                    waifuElement.style.display = 'none';
                }
                // 不要完全移除元素，只是隐藏它，避免破坏DOM结构
            } catch (e) {
                console.warn("清理L2Dwidget时出错:", e);
            }
        }

        // 检查PIXI是否可用
        if (typeof PIXI === 'undefined') {
            console.error('PIXI.js 库未加载，正在尝试加载...');
            // 尝试动态加载PIXI
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/pixi.js@5.3.3/dist/pixi.min.js";
                document.head.appendChild(script);
                script.onload = resolve;
                script.onerror = reject;
                setTimeout(reject, 5000); // 5秒超时
            }).catch(() => {
                showErrorMessage('PIXI.js 库加载失败');
                throw new Error('PIXI.js 库加载失败');
            });
        }

        console.log("PIXI.js 库已加载", PIXI.VERSION);

        // 确保PIXI.live2d的可用性
        if (!window.PIXI.live2d) {
            console.log("PIXI.live2d 未找到，尝试初始化...");

            // 检查已加载的库
            if (window.Live2DModel) {
                window.PIXI.live2d = { Live2DModel: window.Live2DModel };
                console.log("使用全局Live2DModel作为PIXI.live2d");
            } else if (window.LIVE2DCUBISMPIXI) {
                window.PIXI.live2d = window.LIVE2DCUBISMPIXI;
                console.log("使用LIVE2DCUBISMPIXI作为PIXI.live2d");
            } else if (window.PIXI.Live2DModel) {
                window.PIXI.live2d = { Live2DModel: window.PIXI.Live2DModel };
                console.log("使用PIXI.Live2DModel作为PIXI.live2d");
            } else {
                // 检查Cubism核心是否可用
                if (!window.Live2DCubismCore) {
                    console.error("Live2DCubismCore 未找到，尝试加载...");
                    // 动态加载 cubism 核心
                    const cubismScript = document.createElement('script');
                    cubismScript.src = "https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js";
                    document.head.appendChild(cubismScript);

                    // 等待加载完成
                    await new Promise((resolve, reject) => {
                        cubismScript.onload = resolve;
                        cubismScript.onerror = () => reject(new Error('加载Cubism核心库失败'));
                        setTimeout(() => reject(new Error('加载Cubism核心库超时')), 5000);
                    });
                }

                console.log("尝试重新加载 pixi-live2d-display 库...");

                // 尝试手动加载库
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.3.1/dist/index.min.js";
                document.head.appendChild(script);

                // 等待库加载完成
                await new Promise((resolve, reject) => {
                    script.onload = () => {
                        console.log("pixi-live2d-display 库加载成功");
                        resolve();
                    };
                    script.onerror = () => reject(new Error('加载PIXI Live2D Display库失败'));
                    setTimeout(() => reject(new Error('加载PIXI Live2D Display库超时')), 5000);
                });

                // 加载完成后重新检查
                if (!window.PIXI.live2d) {
                    // 兜底方案：尝试自己创建一个基本结构
                    console.warn("库加载后PIXI.live2d仍不可用，尝试创建基本结构");
                    if (window.Live2DModel || window.PIXI.Live2DModel) {
                        window.PIXI.live2d = {
                            Live2DModel: window.Live2DModel || window.PIXI.Live2DModel,
                            from: async function (modelPath) {
                                const model = window.Live2DModel ?
                                    await window.Live2DModel.from(modelPath) :
                                    await window.PIXI.Live2DModel.from(modelPath);
                                return model;
                            }
                        };
                    } else {
                        showErrorMessage('无法初始化PIXI Live2D扩展，请尝试刷新页面');
                        throw new Error('PIXI Live2D 扩展初始化失败');
                    }
                }
            }
        }

        // 创建PIXI应用
        const app = new PIXI.Application({
            view: canvas,
            autoStart: true,
            transparent: true,
            backgroundColor: 0x00000000,
            width: canvas.width,
            height: canvas.height,
            resolution: window.devicePixelRatio || 1, // 添加分辨率支持
            autoDensity: true // 自动处理不同设备像素密度
        });

        // 设置模型路径
        const modelPath = '/static/live2d/march_seven/march_seven.model3.json';
        console.log("模型路径:", modelPath);

        // 加载模型
        try {
            console.log("开始加载模型...");
            let model = null;

            // 确保加载前 PIXI.live2d 存在
            if (!window.PIXI.live2d) {
                throw new Error('PIXI.live2d 对象不存在，无法加载模型');
            }

            // 检查不同的加载方法
            if (typeof PIXI.live2d.Live2DModel !== 'undefined' && typeof PIXI.live2d.Live2DModel.from === 'function') {
                console.log("使用 PIXI.live2d.Live2DModel.from 加载模型");
                model = await PIXI.live2d.Live2DModel.from(modelPath);
            } else if (typeof PIXI.live2d.from === 'function') {
                console.log("使用 PIXI.live2d.from 加载模型");
                model = await PIXI.live2d.from(modelPath);
            } else if (typeof Live2DModel !== 'undefined' && typeof Live2DModel.from === 'function') {
                console.log("使用 Live2DModel.from 加载模型");
                model = await Live2DModel.from(modelPath);
            } else {
                // 尝试使用直接初始化的方式
                console.log("尝试使用构造函数直接加载模型");
                if (typeof PIXI.live2d.Live2DModel === 'function') {
                    try {
                        // 尝试直接创建模型实例
                        const modelSettings = await fetch(modelPath).then(response => response.json());
                        model = new PIXI.live2d.Live2DModel(modelSettings);
                    } catch (directError) {
                        console.error("直接创建模型失败:", directError);
                        throw new Error('没有可用的模型加载方法');
                    }
                } else {
                    throw new Error('没有可用的模型加载方法');
                }
            }

            if (!model) {
                throw new Error('模型加载失败，返回值为空');
            }

            console.log("模型加载成功:", model);
            console.log("模型尺寸:", model.width, model.height);
            console.log("Canvas尺寸:", canvas.width, canvas.height);

            // 计算最佳缩放比例，以确保模型完全适应canvas
            function calculateOptimalScale(model, canvas, initialScale = 0.048) {
                // 获取模型的自然尺寸（缩放前）
                const naturalWidth = model.internalModel?.width || model.width / initialScale;
                const naturalHeight = model.internalModel?.height || model.height / initialScale;

                console.log("模型自然尺寸:", naturalWidth, naturalHeight);

                // 计算适应canvas的最佳缩放比例（留出一点边距）
                const marginFactor = 0.9; // 留出10%的边距
                const widthScale = (canvas.width * marginFactor) / naturalWidth;
                const heightScale = (canvas.height * marginFactor) / naturalHeight;

                // 使用较小的缩放比例，确保模型完全适应canvas
                return Math.min(widthScale, heightScale);
            }

            // 尝试自动计算最佳缩放比例
            const optimalScale = calculateOptimalScale(model, canvas);
            console.log("计算的最佳缩放比例:", optimalScale);

            // 使用计算的缩放比例，或者默认值
            const finalScale = isNaN(optimalScale) || optimalScale <= 0 ? 0.048 : optimalScale;

            // 调整模型位置和缩放
            model.scale.set(finalScale); // 使用计算的最佳缩放比例
            model.position.set(canvas.width / 4, canvas.height / 2); // 精确居中
            model.anchor.set(0.5, 0.5); // 锚点设在中心

            // 添加到舞台
            app.stage.addChild(model);
            cubism3Model = model;

            // 添加交互
            if (typeof model.on === 'function') {
                model.on('hit', (hitAreas) => {
                    if (hitAreas.includes('Head')) {
                        playMarchSevenMotion('nod');
                    } else {
                        playMarchSevenMotion('tap_body');
                    }
                });
            } else {
                console.warn("模型不支持hit事件");
            }

 

            updateStatus('March Seven模型加载完成');
            console.log('三月七模型加载完成');

            // 显示欢迎消息
            setTimeout(() => {
                showMessageInLive2DMarchSeven('你好！我是March Seven，很高兴见到你！');
            }, 1000);

            return true;
        } catch (modelError) {
            console.error('加载模型时发生错误:', modelError);
            showErrorMessage('加载模型失败: ' + modelError.message);
        }
    } catch (error) {
        console.error('加载三月七模型失败:', error);
        showErrorMessage(error.message);

        // 加载失败时自动切回标准模型
        // setTimeout(() => {
        //     document.getElementById('standard-model-btn').click();
        // }, 3000);

        return false;
    }
}

// 播放三月七的表情
function playMarchSevenExpression(expressionName) {
    // expressionName:happy, sad, embarrassed, angry, surprise
    if (!cubism3Model) {
        console.warn("三月七模型未加载，无法播放表情");
        return false;
    }

    try {
        console.log("尝试播放表情:", expressionName);
        // setFaceParameter('Param26', 1); // 捂脸
        // setFaceParameter('Param27', 1); // 比耶
        // setFaceParameter('Param28', 1); // 照相
        // setFaceParameter('Param29', 1); // 相机移动
        // setFaceParameter('Param30', 1); // 脸红
        // setFaceParameter('Param31', 1); // 黑脸
        // setFaceParameter('Param32', 1); // 哭
        // setFaceParameter('Param33', 1); // 流汗
        // setFaceParameter('Param37', 1); // 星星
        // setFaceParameter('Param38', 1); // 流星
        if (expressionName === 'normal') {
            resetFaceParameters();
        }
        else if (expressionName === 'happy') {
            // 随机选择比耶或者捂脸
            const randomValue = Math.random();
            if (randomValue < 0.5) {
                setFaceParameter('Param26', 1); // 捂脸
            } else {
                setFaceParameter('Param27', 1); // 比耶
            }
            setFaceParameter('Param37', 1); // 星星
            setFaceParameter('Param38', 1); // 流星
            console.log("表情已应用: happy");
            return true;
        }
        else if (expressionName === 'sad') {
            setFaceParameter('Param32', 1); // 哭
            console.log("表情已应用: sad");
            return true;
        }
        else if (expressionName === 'embarrassed') {
            setFaceParameter('Param30', 1); // 脸红
            console.log("表情已应用: embarrassed");
            return true;
        }
        else if (expressionName === 'angry') {
            setFaceParameter('Param31', 1); // 黑脸
            console.log("表情已应用: angry");
            return true;
        }
        else if (expressionName === 'surprise') {
            setFaceParameter('Param26', 1); // 捂脸
            console.log("表情已应用: surprise");
            return true;
        }
    }
    catch (e) {
        console.error('播放表情失败:', e);
    }
}

// 设置面部参数
function setFaceParameter(paramName, value) {
    try {
        if (cubism3Model && cubism3Model.internalModel) {
            const model = cubism3Model.internalModel;
            const parameter = model.coreModel._parameterIds.indexOf(paramName);
            // cubism3Model.internalModel.coreModel._parameterIds
            if (parameter >= 0) {
                // model.parameters.values[parameter] = value;
                model.coreModel._parameterValues[parameter] = value;
                console.log(`设置参数 ${paramName} = ${value}`);
            } else {
                console.warn(`未找到参数 ${paramName}`);
            }
        }
    } catch (e) {
        console.error('设置面部参数失败:', e);
    }
}

// 重置面部参数到默认值
function resetFaceParameters() {
    if (!cubism3Model || !cubism3Model.internalModel) return;

    try {
        cubism3Model.expression(8); // 8是默认表情
        console.log("表情状态已重置");

        // 直接重置所有参数
        // 全部参数重置为0
        setFaceParameter('ParamAngleX', 0);
        cubism3Model.internalModel.coreModel._parameterValues.fill(0);
        cubism3Model.internalModel.coreModel._parameterValues[10] = 0.05283398553729057;
        cubism3Model.internalModel.coreModel._parameterValues[21] = 1;
        cubism3Model.internalModel.coreModel._parameterValues[23] = 0.9605583548545837;
        cubism3Model.internalModel.coreModel._parameterValues[24] = 0.039441660046577454;

        cubism3Model.expression(8);
        cubism3Model.internalModel.coreModel._parameterValues.fill(0);
        cubism3Model.internalModel.coreModel._parameterValues[10] = 0.05283398553729057;
        cubism3Model.internalModel.coreModel._parameterValues[21] = 1;
        cubism3Model.internalModel.coreModel._parameterValues[23] = 0.9605583548545837;
        cubism3Model.internalModel.coreModel._parameterValues[24] = 0.039441660046577454;

        console.log("面部参数已重置");
    } catch (e) {
        console.error('重置面部参数失败:', e);
    }
}

// 播放三月七的动作
function playMarchSevenMotion(motionType) {
    if (!cubism3Model) return false;

    try {
        console.log("尝试播放动作:", motionType);        // 使用正确的动作调用方法 - 指定组名、索引和优先级
        switch (motionType) {
            case 'zhaoxiang':
                // 'Custom'是组名，1是索引（因为zhaoxiang是Custom组中的第二个动作），3是优先级
                cubism3Model.motion && cubism3Model.motion('Custom', 1, 3);
                break;
            case 'zhaiyan':
                // 'Custom'是组名，0是索引（因为zhaiyan是Custom组中的第一个动作），3是优先级
                cubism3Model.motion && cubism3Model.motion('Custom', 0, 3);
                break;
            case 'nod':
                cubism3Model.motion && cubism3Model.motion('nod', 1, 3);
                break;
            case 'shake':
                cubism3Model.motion && cubism3Model.motion('shake', 1, 3);
                break;
            case 'tap_body':
                cubism3Model.motion && cubism3Model.motion('tap_body', 1, 3);
                break;
            default:
                console.warn('未知动作类型:', motionType);
        }

        updateStatus('March Seven动作: ' + motionType);
        return true;
    } catch (e) {
        console.error('播放动作失败:', e);
        return false;
    }
}



// 显示三月七的对话框
function showMessageInLive2DMarchSeven(message) {
    // 查找提示元素
    let tipsElement = document.getElementById('waifu-tips');

    // 如果不存在，创建一个
    if (!tipsElement) {
        tipsElement = document.createElement('div');
        tipsElement.id = 'waifu-tips';
        tipsElement.className = 'waifu-tips';
        document.body.appendChild(tipsElement);

        // 添加样式
        if (!document.getElementById('waifu-tips-style')) {
            const style = document.createElement('style');
            style.id = 'waifu-tips-style';
            style.innerHTML = `
                .waifu-tips {
                    position: absolute;
                    padding: 10px;
                    background-color: rgba(255, 255, 255, 0.9);
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
                    font-size: 14px;
                    line-height: 1.5;
                    z-index: 1000;
                    pointer-events: none;
                    opacity: 0;
                    transform: translateY(-20px);
                    transition: opacity 0.3s, transform 0.3s;
                    max-width: 250px;
                }
                .waifu-tips-active {
                    opacity: 1;
                    transform: translateY(0);
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 设置文本
    tipsElement.innerHTML = message;
    // 添加活动类
    tipsElement.classList.add('waifu-tips-active');

    // 调整对话框位置，根据内容长度调整位置
    const live2dArea = document.querySelector('.live2d-test-area');
    if (live2dArea) {
        const rect = live2dArea.getBoundingClientRect();
        // 确保对话框在Live2D角色附近
        tipsElement.style.left = (rect.left + 150 - 125) + 'px'; // 居中对齐
        tipsElement.style.top = (rect.top + 150) + 'px'; // 从live2d-test-area顶部偏移150px
    }

    // 设置超时以隐藏提示
    setTimeout(function () {
        tipsElement.classList.remove('waifu-tips-active');
    }, 5000); // 5秒后隐藏

    updateStatus('显示对话: ' + message.substring(0, 30) + (message.length > 30 ? '...' : ''));
}

// 切换模型显示
function toggleModelDisplay(modelType) {
    console.log("切换模型显示:", modelType);

    const standardCanvas = document.getElementById('live2d');
    const marchSevenCanvas = document.getElementById('march-seven-canvas');

    if (modelType === 'march-seven') {
        // 显示March Seven模型
        if (standardCanvas) standardCanvas.style.display = 'none';
        if (marchSevenCanvas) marchSevenCanvas.style.display = 'block';

        // 如果March Seven模型还未加载，则加载
        if (!cubism3Model) {
            console.log("需要加载March Seven模型");
            loadMarchSevenModel().then(success => {
                if (success) {
                    console.log("March Seven模型加载成功");
                } else {
                    console.error("March Seven模型加载失败");
                    // 切回标准模型
                    document.getElementById('standard-model-btn').click();
                }
            });
        }
    } else {
        // 显示原始模型
        if (standardCanvas) standardCanvas.style.display = 'block';
        if (marchSevenCanvas) marchSevenCanvas.style.display = 'none';
    }
}

// 添加调试函数
function debugModelState() {
    console.log("=== 模型状态调试信息 ===");

    const standardCanvas = document.getElementById('live2d');
    const marchSevenCanvas = document.getElementById('march-seven-canvas');

    console.log("标准模型Canvas:", standardCanvas ?
        "存在" + (standardCanvas.style.display === 'none' ? " (隐藏)" : " (显示)") :
        "不存在");

    console.log("三月七模型Canvas:", marchSevenCanvas ?
        "存在" + (marchSevenCanvas.style.display === 'none' ? " (隐藏)" : " (显示)") :
        "不存在");

    console.log("March Seven模型对象:", cubism3Model ? "已加载" : "未加载");

    // 检查依赖库
    console.log("PIXI.js:", typeof PIXI !== 'undefined' ? "已加载 (版本: " + PIXI.VERSION + ")" : "未加载");
    console.log("Live2D Cubism Core:", typeof Live2DCubismCore !== 'undefined' ? "已加载" : "未加载");
    console.log("PIXI Live2D Display:", typeof PIXI.live2d !== 'undefined' ? "已加载" : "未加载");

    // 显示当前模型类型
    const standardBtn = document.getElementById('standard-model-btn');
    const marchSevenBtn = document.getElementById('march-seven-btn');

    console.log("当前激活的模型按钮:",
        standardBtn && standardBtn.classList.contains('active') ? "标准模型" :
            marchSevenBtn && marchSevenBtn.classList.contains('active') ? "March Seven" :
                "未知");

    console.log("====================");
}

// 在模型切换函数中添加调试
const oldToggleModelDisplay = toggleModelDisplay;
toggleModelDisplay = function (modelType) {
    console.log("切换模型开始:", modelType);
    debugModelState();
    const result = oldToggleModelDisplay(modelType);
    setTimeout(debugModelState, 100); // 短暂延迟后再次检查状态
    return result;
};
