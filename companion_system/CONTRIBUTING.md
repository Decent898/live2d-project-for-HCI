# 贡献指南

感谢您对AI智能陪伴系统项目的关注！我们欢迎各种形式的贡献，包括功能建议、错误报告、代码贡献、文档改进等。

## 如何贡献

### 报告Bug

1. 确保该Bug尚未在[GitHub Issues](https://github.com/yourusername/ai-companion-system/issues)中被报告
2. 使用清晰的标题和详细描述创建一个新的Issue
3. 尽可能提供复现步骤、错误日志和截图
4. 说明您的操作环境（操作系统、浏览器版本等）

### 提交新功能建议

1. 创建一个新的Issue，描述您的建议
2. 说明该功能的用途和价值
3. 如果可能，提供实现思路或设计方案

### 提交代码

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个Pull Request

### 代码规范

- 遵循PEP 8 Python代码规范
- 为新功能编写测试
- 保持代码风格一致
- 提交前确保所有测试通过

## 开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/yourusername/ai-companion-system.git
cd ai-companion-system
```

2. 创建并激活虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # 在Windows上使用 venv\Scripts\activate
```

3. 安装开发依赖
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # 如果有的话
```

4. 运行测试
```bash
python manage.py test
```

## Live2D模型开发

如果您希望为项目增加或优化Live2D模型功能：

1. 确保您了解Live2D Cubism SDK的使用
2. 请注意模型版权问题，只使用您有权使用的模型
3. 遵循现有的模型加载和初始化流程
4. 对模型的表情和动作进行充分测试

## 代码审查流程

所有提交的代码都会经过以下审查流程：

1. 自动化测试检查（CI/CD通过GitHub Actions）
2. 代码风格检查
3. 至少一名项目维护者的代码审查
4. 根据反馈进行修改
5. 合并到主分支

## 联系方式

如有任何问题，可以通过以下方式联系项目维护者：

- GitHub Issues
- 电子邮件: [您的邮箱]

感谢您对项目的贡献！
