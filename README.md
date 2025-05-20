# AI 智能虚拟陪伴系统

![三月七 Live2D 模型](https://i.imgur.com/XTtpPVX.png)

**GitHub仓库：** [https://github.com/Decent898/live2d-project-for-HCI](https://github.com/Decent898/live2d-project-for-HCI)

这是一个基于Django开发的AI智能虚拟陪伴系统，集成了Live2D动画角色作为用户界面的一部分，提供智能对话和互动体验。目前系统使用"三月七"(March Seven)作为默认Live2D角色模型。智能虚拟陪伴系统

![三月七 Live2D 模型](https://i.imgur.com/XTtpPVX.png)

这是一个基于Django开发的AI智能虚拟陪伴系统，集成了Live2D动画角色作为用户界面的一部分，提供智能对话和互动体验。目前系统使用"三月七"作为默认Live2D角色模型。

## 项目背景

本项目是人机交互课程设计的成果，主题为**虚拟陪伴智能体设计与实现**。

虚拟陪伴智能体是一类面向人类长期互动需求、具备基本社会认知和情感表达能力的人工智能系统。借助近年来人工智能技术的飞跃，尤其是在大语言模型、多模态感知、AIGC等方面的技术进展，虚拟陪伴智能体可以展现出更多样的能力和形式，可以具备人格特征、情绪响应、自适应交互能力的拟人化数字智能体的存在。

本项目提出了一个创意性设计方案，探讨如何基于当前前沿技术，构建一个具备基本"同理心"和"适应性"的虚拟陪伴体，提升用户的交互满意度与主观亲密感。该系统可服务于普通用户，也可以针对特定群体（如独居老人、压力较大的学生、儿童等）定制。

系统的对话功能通过北京理工大学智能体网站自研的API接口实现，该API基于LLM，提供了对话生成和理解能力。完整API文档可在项目目录中的`v1.5.0-chat_api_doc-v4.pdf`中查阅。

## Live2D模型版权声明

本项目使用的三月七(March Seven)模型来源于B站UP主的作品：https://www.bilibili.com/video/BV1Pu41187JT/

**版权声明**：本项目中使用的三月七Live2D模型仅用于学术研究和人机交互课程设计项目展示，不用于任何商业用途。原始模型的版权归属于米哈游及其授权方所有。如需将本项目用于其他用途，请确保遵守相关版权规定，并替换为您拥有使用权的Live2D模型。

## 功能特点

- **实时对话**: 通过北京理工大学智能体API提供自然、流畅的对话体验
- **情感适应**: 系统能够识别用户情绪，并给予适当回应
- **Live2D动画角色**: 集成三月七Live2D模型，提供视觉互动体验
- **表情与动作**: 角色可以根据对话内容显示不同的表情和动作
- **文件上传**: 支持图片上传进行分析和交流
- **响应式设计**: 适配不同设备屏幕尺寸

## 技术栈

- **后端**: Django, Django REST Framework
- **前端**: HTML, CSS, JavaScript
- **动画**: Live2D Cubism SDK
- **AI对话**: 基于北京理工大学智能体网站API的大语言模型
- **情感分析**: 自然语言处理和情感识别算法

## 项目结构

```
companion_system/
├── ai_companion/              # 主应用目录
│   ├── migrations/            # 数据库迁移文件
│   ├── services/              # 业务逻辑服务
│   │   ├── ai_service.py      # AI服务接口
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
└── docs/                      # 项目文档
```

## 安装指南

1. 克隆仓库
```
git clone https://github.com/Decent898/live2d-project-for-HCI.git
cd live2d-project-for-HCI
```

2. 安装依赖
```
pip install -r requirements.txt
```

3. 创建.env文件并设置必要的环境变量
```
SECRET_KEY=your_secret_key
DEBUG=True
BIT_API_KEY=your_bit_api_key
```

4. 运行数据库迁移
```
python manage.py migrate
```

5. 运行开发服务器
```
python manage.py runserver
```

6. 访问系统
在浏览器中访问 http://127.0.0.1:8000/

## 人机交互实验

本项目作为人机交互课程设计的一部分，包含以下实验内容：

1. **用户需求预实验**: 通过问卷和访谈收集用户对虚拟陪伴系统的需求和期望
2. **系统有效性实验**: 测试系统的对话能力、情感识别准确性和互动流畅度
3. **用户体验评估**: 测量用户满意度、亲密感和长期使用意愿

实验数据和分析结果详见`docs/PROJECT_DOCUMENTATION.md`文件。

## 课程设计成果

作为人机交互课程设计的成果，本项目包含：

1. **实验报告**: 包括动机、技术综述、设计思路、实验设计、数据分析和结论
2. **实验视频**: 记录系统运行和用户测试过程
3. **核心代码**: 本仓库包含系统的核心实现代码

## Live2D模型使用说明

本项目使用的三月七(March Seven)模型仅用于学术研究和个人学习目的。如需将本项目用于其他用途，请确保遵守相关版权规定，并替换为您拥有使用权的Live2D模型。

## 贡献指南

欢迎通过Issue和Pull Request的形式参与项目建设。在提交代码前，请确保：

1. 新功能或修复有对应的测试
2. 所有测试都已通过
3. 代码风格符合项目规范

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。
