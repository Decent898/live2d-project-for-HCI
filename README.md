# AI 智能陪伴系统


这是一个基于Django开发的AI智能陪伴系统，集成了Live2D动画角色作为用户界面的一部分，提供智能对话和互动体验。系统使用"三月七"(March Seven)作为默认Live2D角色模型，支持表情变化和动作交互。

## 功能特点

- **智能对话**: 通过集成先进AI模型提供自然、流畅的多轮对话体验
- **Live2D动态角色**: 集成三月七Live2D模型，支持丰富的表情和动作系统
- **情感表达**: 角色可根据对话内容和情境，展示开心、伤心、惊讶等多种表情
- **触摸互动**: 支持点击模型不同部位触发特定动作和反应
- **文件处理**: 支持图片上传进行分析和交流
- **语音交互**: 集成语音识别和合成功能，支持语音对话（实验性功能）
- **响应式设计**: 适配不同设备屏幕尺寸，提供流畅的用户体验

## 技术栈

- **后端**: Django 5.2.x + Django REST Framework
- **前端**: HTML5, CSS3, JavaScript
- **动画**: Live2D Cubism SDK 4.x
- **AI对话**: OpenAI API (可配置其他API)
- **数据存储**: SQLite (开发环境) / 可扩展至PostgreSQL
- **语音处理**: 集成第三方语音识别和合成服务

## 安装指南

1. 克隆仓库

    ```bash
    git clone https://github.com/yourusername/ai-companion-system.git
    cd ai-companion-system
    ```

2. 配置环境变量
   
    创建`.env`文件并设置必要的环境变量:    ```
    # OpenAI API密钥
    OPENAI_API_KEY=your_openai_api_key
    
    # Django密钥
    SECRET_KEY=django-insecure-key-replace-this-in-production
    
    # 调试模式
    DEBUG=True
    ```

3. 安装依赖

    ```bash
    pip install -r requirements.txt
    ```

4. 运行数据库迁移

    ```bash
    python manage.py migrate
    ```

5. 运行开发服务器

    ```bash
    python manage.py runserver
    ```

6. 公网访问（可选）
   
    如需通过公网访问，请运行:

    ```bash
    python manage.py runserver 0.0.0.0:8000
    ```
    
    然后在浏览器中访问 `http://your_ip_address:8000/`

    注意：公网访问时请确保适当配置安全选项和防火墙规则

## 项目结构

```
ai_companion/              # 主应用目录
├── static/                # 静态资源文件
│   ├── css/               # CSS样式文件
│   ├── js/                # JavaScript脚本
│   └── live2d/           # Live2D模型资源
├── templates/             # HTML模板
├── services/              # 服务层代码
├── views.py               # 视图函数
└── urls.py                # URL路由配置
companion_project/         # 项目配置目录
docs/                      # 项目文档
```

## Live2D模型使用说明

本项目使用的三月七(March Seven)模型仅用于学术研究和个人学习目的。该模型具有以下功能：

- **表情系统**: 支持多种表情切换，包括开心、伤心、惊讶、困惑等
- **动作响应**: 内置点头、摇头、眨眼等基本动作
- **互动触发**: 支持通过点击不同区域触发反应

如需将本项目用于其他用途，请确保遵守相关版权规定，并替换为您拥有使用权的Live2D模型。

## 自定义配置

系统提供了多种自定义选项：

- **AI模型**: 可在`.env`文件中配置不同的AI服务提供商和API密钥
- **角色设定**: 可在对话系统中自定义角色人设和行为模式
- **UI定制**: 可通过修改CSS和HTML模板定制界面外观

## 贡献指南

欢迎通过Issue和Pull Request的形式参与项目建设。在提交代码前，请确保：

1. 新功能或修复有对应的测试
2. 所有测试都已通过
3. 代码风格符合项目规范
4. 更新相关文档

## 待实现功能

- [ ] 完整的用户账号系统
- [ ] 多语言支持
- [ ] 更多Live2D模型集成
- [ ] 跨平台客户端支持
- [ ] 离线模式支持

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过GitHub Issues或Pull Requests与我们联系。
