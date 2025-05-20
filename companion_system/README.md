# AI 智能陪伴系统

![三月七 Live2D 模型](https://i.imgur.com/XTtpPVX.png)

这是一个基于Django开发的AI智能陪伴系统，集成了Live2D动画角色作为用户界面的一部分，提供智能对话和互动体验。目前系统使用"三月七"(March Seven)作为默认Live2D角色模型。

## 功能特点

- **实时对话**: 通过AI模型提供自然、流畅的对话体验
- **Live2D动画角色**: 集成三月七Live2D模型，提供视觉互动体验
- **表情与动作**: 角色可以根据对话内容显示不同的表情和动作
- **文件上传**: 支持图片上传进行分析和交流
- **响应式设计**: 适配不同设备屏幕尺寸

## 技术栈

- **后端**: Django
- **前端**: HTML, CSS, JavaScript
- **动画**: Live2D Cubism SDK
- **AI对话**: 集成外部AI服务API

## 安装指南

1. 克隆仓库
```
git clone https://github.com/yourusername/ai-companion-system.git
cd ai-companion-system
```

2. 安装依赖
```
pip install -r requirements.txt
```

3. 运行开发服务器
```
python manage.py runserver
```

4. 访问系统
在浏览器中访问 http://127.0.0.1:8000/

## Live2D模型使用说明

本项目使用的三月七(March Seven)模型仅用于学术研究和个人学习目的。如需将本项目用于其他用途，请确保遵守相关版权规定，并替换为您拥有使用权的Live2D模型。

## 贡献指南

欢迎通过Issue和Pull Request的形式参与项目建设。在提交代码前，请确保：

1. 新功能或修复有对应的测试
2. 所有测试都已通过
3. 代码风格符合项目规范

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。
