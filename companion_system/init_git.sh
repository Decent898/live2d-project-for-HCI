#!/bin/bash

# 初始化Git仓库
echo "正在初始化Git仓库..."
git init

# 添加所有文件到暂存区
echo "添加文件到暂存区..."
git add .

# 创建初始提交
echo "创建初始提交..."
git commit -m "初始提交：AI智能陪伴系统"

echo "Git仓库已初始化完成。接下来请执行以下步骤:"
echo "1. 在GitHub创建一个新仓库（不要初始化README、LICENSE等文件）"
echo "2. 添加远程仓库:"
echo "   git remote add origin https://github.com/Decent898/live2d-project-for-HCI.git"
echo "3. 推送到GitHub:"
echo "   git push -u origin main"
echo ""
echo "备注：在上传前请确保已将个人密钥、API密钥等敏感信息从代码中移除"