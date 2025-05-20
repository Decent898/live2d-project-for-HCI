# AI智能陪伴系统 - 项目文档

![系统架构图](https://i.imgur.com/IK9b7nE.png)

## 项目简介

AI智能陪伴系统是一个结合了先进AI技术和Live2D动画技术的交互式平台。系统以可爱的动画形象"三月七"(March Seven)为界面，提供智能对话、情感陪伴和信息查询等功能，旨在为用户创造一个友好、有趣的AI互动体验。

## 系统架构

系统采用了前后端分离的架构设计：

### 前端

- **界面呈现**: HTML, CSS, JavaScript
- **动画实现**: Live2D Cubism SDK
- **交互逻辑**: 基于AJAX的实时通信

### 后端

- **Web框架**: Django
- **API设计**: Django REST Framework
- **AI服务**: 集成北京理工大学智能体网站API
- **数据存储**: SQLite (开发) / PostgreSQL (生产)

## 核心功能

### 1. 智能对话

系统能够理解用户的自然语言输入，并给出相应的回复。对话功能通过北京理工大学智能体网站自研API实现，支持多轮上下文理解，使交流更加自然流畅。API详细文档位于项目根目录的`v1.5.0-chat_api_doc-v4.pdf`文件中。

### 2. Live2D动画交互

- **表情变化**: 根据对话内容展示不同表情（开心、困惑、思考等）
- **动作响应**: 支持点头、摇头、挥手等基本动作
- **触摸互动**: 用户可以通过鼠标点击模型不同部位触发互动

### 3. 文件处理

系统支持用户上传图片，AI可以识别图片内容并进行相关讨论。

### 4. 用户会话管理

- 保存用户对话历史
- 会话上下文管理
- 个性化交互体验

## 目录结构说明

```
companion_system/
├── ai_companion/              # 主应用目录
│   ├── migrations/            # 数据库迁移文件
│   ├── services/              # 业务逻辑服务
│   │   ├── ai_service.py      # AI处理服务
│   │   └── knowledge_base.py  # 知识库服务
│   ├── static/                # 静态资源
│   │   ├── css/               # 样式文件
│   │   ├── js/                # JavaScript文件
│   │   └── live2d/           # Live2D模型资源
│   ├── templates/             # HTML模板
│   ├── models.py              # 数据模型
│   ├── views.py               # 视图函数
│   └── urls.py                # URL路由
├── companion_project/         # 项目配置
│   ├── settings.py            # 项目设置
│   └── urls.py                # 主URL路由
├── manage.py                  # Django管理脚本
└── requirements.txt           # 项目依赖
```

## Live2D模型详解

系统默认使用的"三月七"Live2D模型位于`/static/live2d/march_seven/`目录下，主要包含以下文件：

- `march_seven.model3.json`: 模型配置文件
- `march_seven.moc3`: 模型数据文件
- `march_seven.physics3.json`: 物理效果配置
- `texture_xx.png`: 贴图文件
- `exp/`: 表情文件目录
- `motions/`: 动作文件目录

模型的加载和初始化主要通过`march-seven-model.js`文件实现，该文件定义了模型的加载、表情控制、动作执行等功能。

## API接口

### 对话接口

```
POST /api/chat/
```

请求参数:
```json
{
  "message": "用户输入的消息",
  "session_id": "会话ID"
}
```

响应:
```json
{
  "response": "AI的回复",
  "emotion": "情感类型"
}
```

### 文件上传接口

```
POST /api/upload/
```

请求参数:
- `file`: 文件数据
- `session_id`: 会话ID

响应:
```json
{
  "file_url": "文件URL",
  "analysis": "文件分析结果"
}
```

## 部署指南

详细的部署步骤请参考系统根目录下的[README.md](README.md)文件。

## 注意事项

1. Live2D模型版权：本项目中使用的模型仅用于学术研究和演示目的，如需商用请替换为您拥有授权的模型
2. API密钥安全：在生产环境中，请确保所有API密钥都通过环境变量或安全存储方式管理
3. 浏览器兼容性：系统已在Chrome、Firefox、Edge最新版本测试通过，旧版浏览器可能不支持部分功能

## 后续开发计划

- [ ] 支持更多Live2D模型选择
- [ ] 添加语音交互功能
- [ ] 实现更丰富的表情和动作
- [ ] 多语言支持
- [ ] 移动端适配优化

## 联系方式

项目维护者：[您的姓名]
邮箱：[您的邮箱]
GitHub：[您的GitHub主页]
