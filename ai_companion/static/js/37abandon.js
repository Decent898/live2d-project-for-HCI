// 动画参数变化

function animateParameter(paramName, startValue, endValue, duration, callback) {
    console.log(`开始动画: ${paramName} 从 ${startValue} 到 ${endValue} 持续 ${duration}秒`);
    if (!cubism3Model) return;
    
    try {
        if (cubism3Model.internalModel && cubism3Model.internalModel.parameters) {
            const model = cubism3Model.internalModel;
            const paramIndex = model.parameters.ids.indexOf(paramName);
            
            if (paramIndex < 0) {
                console.warn(`找不到参数: ${paramName}`);
                if (callback) callback();
                return;
            }
            
            const startTime = performance.now();
            const animate = () => {
                const elapsed = (performance.now() - startTime) / 1000;
                const t = Math.min(elapsed / duration, 1);
                const value = startValue + (endValue - startValue) * t;
                
                model.parameters.values[paramIndex] = value;
                
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else if (callback) {
                    callback();
                }
            };
            
            animate();
        } else if (cubism3Model.parameters) {
            // 备选结构
            const paramIndex = cubism3Model.parameters.ids.indexOf(paramName);
            if (paramIndex < 0) {
                console.warn(`找不到参数: ${paramName}`);
                if (callback) callback();
                return;
            }
            
            const startTime = performance.now();
            const animate = () => {
                const elapsed = (performance.now() - startTime) / 1000;
                const t = Math.min(elapsed / duration, 1);
                const value = startValue + (endValue - startValue) * t;
                
                cubism3Model.parameters.values[paramIndex] = value;
                
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else if (callback) {
                    callback();
                }
            };
            
            animate();
        } else {
            console.warn('无法找到模型参数结构');
            if (callback) callback();
        }
    } catch (e) {
        console.error('参数动画失败:', e);
        if (callback) callback();
    }
}


// 尝试获取更多诊断信息
            try {
                const response = await fetch(modelPath);
                if (!response.ok) {
                    console.error(`模型文件请求失败: ${response.status} ${response.statusText}`);
                    showErrorMessage(`无法加载模型文件(HTTP ${response.status})`);
                } else {
                    try {
                        const modelJson = await response.json();
                        console.log('模型JSON内容:', modelJson);
                        
                        // 检查纹理文件
                        if (modelJson.FileReferences && modelJson.FileReferences.Textures) {
                            for (const texture of modelJson.FileReferences.Textures) {
                                try {
                                    const textureResponse = await fetch('/static/live2d/march_seven/' + texture);
                                    if (!textureResponse.ok) {
                                        console.error(`纹理文件 ${texture} 请求失败: ${textureResponse.status}`);
                                        showErrorMessage(`无法加载纹理文件: ${texture}`);
                                    } else {
                                        console.log(`纹理文件 ${texture} 请求成功`);
                                    }
                                } catch (textureError) {
                                    console.error(`检查纹理文件 ${texture} 失败:`, textureError);
                                }
                            }
                        }
                        
                        // 检查MOC文件
                        if (modelJson.FileReferences && modelJson.FileReferences.Moc) {
                            try {
                                const mocResponse = await fetch('/static/live2d/march_seven/' + modelJson.FileReferences.Moc);
                                if (!mocResponse.ok) {
                                    console.error(`MOC文件请求失败: ${mocResponse.status}`);
                                    showErrorMessage(`无法加载MOC文件`);
                                } else {
                                    console.log(`MOC文件请求成功`);
                                }
                            } catch (mocError) {
                                console.error('检查MOC文件失败:', mocError);
                            }
                        }
                    } catch (jsonError) {
                        console.error('解析模型JSON失败:', jsonError);
                        showErrorMessage('模型JSON解析失败');
                    }
                }
            } catch (fetchError) {
                console.error('获取模型JSON失败:', fetchError);
                showErrorMessage('无法访问模型文件');
            }
            
            throw modelError;



// 映射表情名称到Live2D Cubism 3表情
        // const expressionMapping = {
        //     '1': '1',     // 映射到1.exp3.json
        //     'sad': '2',       // 映射到2.exp3.json
        //     'angry': '3',     // 映射到3.exp3.json
        //     'surprise': '5',  // 映射到5.exp3.json
        //     'confused': '6',  // 映射到6.exp3.json
        //     'cute': '7',      // 映射到7.exp3.json
        //     'thinking': '8',  // 映射到8.exp3.json
        //     'normal': 8     // 映射到9.exp3.json
        // };
        
        const expId = expressionMapping[expressionName] || '1';
        
        // 尝试直接应用表情
        if (cubism3Model.expressions && cubism3Model.expressions.length > 0) {
            // 查找匹配的表情
            const expressionIndex = cubism3Model.expressions.findIndex(exp => 
                exp.name === expId || exp.name.includes(expId));
            
            if (expressionIndex >= 0) {
                cubism3Model.expression(expressionIndex);
                console.log(`表情已应用: ${expressionIndex}`);
                return true;
            }
        }
        
        // 尝试通过参数应用表情（备选方案）
        console.log("尝试通过参数应用表情");
        switch(expressionName) {
            case 'happy':
                setFaceParameter('ParamMouthForm', 1); // 嘴角上扬
                setFaceParameter('ParamEyeLSmile', 1); // 左眼微笑
                setFaceParameter('ParamEyeRSmile', 1); // 右眼微笑
                break;
            case 'sad':
                setFaceParameter('ParamMouthForm', -1); // 嘴角下垂
                setFaceParameter('ParamBrowLY', -1); // 左眉下垂
                setFaceParameter('ParamBrowRY', -1); // 右眉下垂
                break;
            case 'angry':
                setFaceParameter('ParamBrowLY', -1); // 左眉下垂
                setFaceParameter('ParamBrowRY', -1); // 右眉下垂
                setFaceParameter('ParamBrowLX', -1); // 左眉皱起
                setFaceParameter('ParamBrowRX', 1); // 右眉皱起
                break;
            case 'surprise':
                setFaceParameter('ParamBrowLY', 1); // 左眉上扬
                setFaceParameter('ParamBrowRY', 1); // 右眉上扬
                setFaceParameter('ParamEyeLOpen', 1.5); // 左眼睁大
                setFaceParameter('ParamEyeROpen', 1.5); // 右眼睁大
                break;
            case 'confused':
                setFaceParameter('ParamBrowLY', 0.5); // 左眉微上扬
                setFaceParameter('ParamBrowRY', -0.5); // 右眉微下垂
                setFaceParameter('ParamAngleZ', 5); // 头微倾斜
                break;
            case 'cute':
                setFaceParameter('ParamEyeLSmile', 0.8); // 左眼微笑
                setFaceParameter('ParamEyeRSmile', 0.8); // 右眼微笑
                setFaceParameter('ParamMouthForm', 0.8); // 嘴角上扬
                setFaceParameter('ParamCheek', 1); // 脸红
                break;
            case 'thinking':
                setFaceParameter('ParamBrowLY', -0.2); // 左眉微下垂
                setFaceParameter('ParamBrowRY', -0.2); // 右眉微下垂
                setFaceParameter('ParamEyeLOpen', 0.7); // 左眼微闭
                setFaceParameter('ParamEyeROpen', 0.7); // 右眼微闭
                setFaceParameter('ParamAngleZ', 10); // 头倾斜
                break;
            case 'normal':
                resetFaceParameters();
                break;
        }
        
        updateStatus('March Seven表情: ' + expressionName);
        return true;
    } catch (e) {
        console.error('播放表情失败:', e);
        return false;
    }


           // // 添加窗口大小变化的监听器
            // function resizeHandler() {
            //     if (model && app) {
            //         // 更新应用程序尺寸
            //         app.renderer.resize(canvas.width, canvas.height);

            //         // 重新计算和应用最佳缩放比例
            //         const newOptimalScale = calculateOptimalScale(model, canvas, finalScale);
            //         const newFinalScale = isNaN(newOptimalScale) || newOptimalScale <= 0 ? finalScale : newOptimalScale;


            //         // 应用新的缩放和位置
            //         model.scale.set(newFinalScale);
            //         model.position.set(canvas.width / 2, canvas.height / 2);

            //         console.log("窗口大小调整 - 新缩放比例:", newFinalScale);
            //     }
            // }

            // // 监听窗口大小变化事件
            // window.addEventListener('resize', resizeHandler);

            // // 添加简单交互
            // canvas.addEventListener('click', function(event) {
            //     const rect = canvas.getBoundingClientRect();
            //     const x = event.clientX - rect.left;
            //     const y = event.clientY - rect.top;

            //     // 简单的触摸交互
            //     if (y < rect.height / 2) {
            //         // 点头
            //         playMarchSevenMotion('nod');
            //     } else {
            //         // 头摇晃
            //         playMarchSevenMotion('shake');
            //     }
            // });