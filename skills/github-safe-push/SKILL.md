---
name: github-safe-push
description: 确保 GitHub 提交安全规范：防止 API Key、密码、凭证等敏感信息被意外提交，遵循先 pull 再合并的正确 Git 操作流程。当用户要提交代码、push 到 GitHub、检查敏感信息泄露时使用。
---

# github-safe-push

**GitHub 安全提交技能** - 防止敏感信息泄露，确保 Git 操作规范

---

## 概述

此技能确保在提交代码到 GitHub 仓库时遵循严格的安全规范，防止 API Key、密码、凭证等敏感信息被意外提交，并确保正确的 Git 操作流程（先 pull 再合并，避免覆盖原有内容）。

**适用场景**:

- 准备提交代码到 GitHub/GitLab 等远程仓库
- 需要检查文件中是否包含敏感信息
- 首次配置新仓库的 Git 安全策略
- 修复已提交的敏感信息

---

## 核心功能

### 1. 提交前安全检查

在每次 `git commit` 之前自动执行以下检查：

#### 1.1 API Key 检测

检测以下常见 API Key 格式：

```bash
# 阿里云百炼 API Key
sk-sp-[a-f0-9]{32}

# OpenAI API Key
sk-[a-zA-Z0-9]{48}

# GitHub Token
ghp_[a-zA-Z0-9]{36}
gho_[a-zA-Z0-9]{36}
ghu_[a-zA-Z0-9]{36}
ghs_[a-zA-Z0-9]{36}
ghr_[a-zA-Z0-9]{36}

# 通用 API Key 模式
api[_-]?key\s*[=:]\s*['"]?[a-zA-Z0-9]{16,}['"]?
secret[_-]?key\s*[=:]\s*['"]?[a-zA-Z0-9]{16,}['"]?
password\s*[=:]\s*['"].+['"]
```

#### 1.2 敏感文件检测

检查是否尝试提交以下类型的文件：

```
*.env
*.env.*
*.local
*.local.*
*.pem
*.key
*.p12
*.pfx
*credentials*
*secret*
*password*
```

#### 1.3 .gitignore 验证

确保 `.gitignore` 包含必要的忽略规则：

```gitignore
# API Keys - 绝对不要提交
*api*key*
*apikey*
*.env
*.env.*
*.local
*.local.*

# 证书和密钥
*.pem
*.key
*.p12
*.pfx

# 凭证文件
*credentials*
*secret*
*password*

# 用户特定配置
*.local.jsonc
*.local.json
config.local.*
```

---

### 2. Git 操作规范

#### 2.1 标准提交流程

```bash
# 步骤 1: 获取最新远程代码
git fetch origin

# 步骤 2: 检查本地状态
git status

# 步骤 3: 如果有远程更新，先合并
git pull --rebase origin <branch-name>

# 步骤 4: 解决冲突（如果有）
# ... 解决冲突后 ...
git rebase --continue

# 步骤 5: 执行提交前检查
./skills/github-safe-push/pre-commit-check.sh

# 步骤 6: 提交更改
git add <files>
git commit -m "<message>"

# 步骤 7: 推送到远程
git push origin <branch-name>
```

#### 2.2 禁止的操作

```bash
# ❌ 禁止直接 force push 到主分支
git push --force origin main

# ❌ 禁止在未 pull 的情况下直接 push（可能导致覆盖）
git push origin main  # 如果本地落后于远程

# ❌ 禁止提交包含敏感信息的文件
git add .env
git commit -m "add config"

# ❌ 禁止使用 --no-verify 跳过检查
git commit --no-verify -m "skip checks"
```

---

## 使用方法

### 快速检查

```bash
# 运行提交前检查
./skills/github-safe-push/pre-commit-check.sh

# 检查特定文件是否包含敏感信息
./skills/github-safe-push/check-file.sh <file-path>

# 扫描整个仓库的敏感信息
./skills/github-safe-push/scan-repo.sh
```

### 安装预提交钩子

```bash
# 安装 pre-commit hook
./skills/github-safe-push/install-hook.sh

# 验证安装
ls -la .git/hooks/pre-commit
```

### 手动检查命令

```bash
# 检查暂存区文件
git diff --cached --name-only | xargs ./skills/github-safe-push/check-file.sh

# 检查特定模式
./skills/github-safe-push/grep-secrets.sh "sk-sp-"
```

---

## 检查清单

### 提交前必须完成

- [ ] 已运行 `git pull --rebase` 获取最新代码
- [ ] 已运行提交前检查脚本，无警告
- [ ] 确认没有 API Key、密码等敏感信息
- [ ] 确认 `.gitignore` 已正确配置
- [ ] 确认提交信息清晰描述更改内容
- [ ] 如果是敏感配置，已使用占位符替换真实值

### 配置检查

- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 配置文件使用 `*.local` 或 `*.example` 模式
- [ ] API Key 使用环境变量或占位符
- [ ] 凭证文件未纳入版本控制

---

## 文件结构

```
skills/github-safe-push/
├── SKILL.md                    # 此文档
├── pre-commit-check.sh         # 提交前检查脚本
├── check-file.sh               # 单文件检查脚本
├── scan-repo.sh                # 仓库扫描脚本
├── install-hook.sh             # 预提交钩子安装脚本
├── grep-secrets.sh             # 敏感信息搜索脚本
├── .gitignore.template         # .gitignore 模板
└── patterns/
    ├── api-keys.txt            # API Key 正则表达式
    ├── sensitive-files.txt     # 敏感文件模式
    └── keywords.txt            # 敏感关键词
```

---

## 脚本说明

### pre-commit-check.sh

**功能**: 完整的提交前检查

**检查项**:

1. 检测暂存文件中的 API Key
2. 验证 .gitignore 配置
3. 检查敏感文件名
4. 确认 Git 分支状态

**使用**:

```bash
./skills/github-safe-push/pre-commit-check.sh
```

**输出**:

- ✅ 通过检查，可以提交
- ❌ 发现安全问题，阻止提交

### check-file.sh

**功能**: 检查单个文件是否包含敏感信息

**使用**:

```bash
./skills/github-safe-push/check-file.sh path/to/file.json
```

### scan-repo.sh

**功能**: 扫描整个仓库历史中的敏感信息

**使用**:

```bash
./skills/github-safe-push/scan-repo.sh
```

### install-hook.sh

**功能**: 安装 Git pre-commit 钩子

**使用**:

```bash
./skills/github-safe-push/install-hook.sh
```

### grep-secrets.sh

**功能**: 使用正则表达式搜索敏感信息

**使用**:

```bash
./skills/github-safe-push/grep-secrets.sh "pattern"
```

---

## 最佳实践

### 1. 配置模板化

```bash
# 创建示例文件
cp config.json config.json.example

# 清理示例文件中的敏感信息
sed -i 's/"api_key": ".*/"api_key": "YOUR_KEY_HERE"/' config.json.example

# 添加到 .gitignore
echo "config.json.local" >> .gitignore

# 实际配置使用 .local 文件
cp config.json.example config.json.local
# 编辑 config.json.local，添加真实 Key（不会被 Git 跟踪）
```

### 2. 使用环境变量

```bash
# ~/.bashrc 或 ~/.zshrc
export ZHUI_API_KEY="sk-YOUR_ZHUI_API_KEY_HERE"
export DATABASE_URL="postgresql://..."

# 代码中读取
import os
api_key = os.environ.get("ZHUI_API_KEY")
```

### 3. 配置环境变量

```jsonc
// config.jsonc
{
  "apiKey": "${ZHUI_API_KEY}"  // 从环境变量读取
}
```

### 4. 使用密钥管理服务

对于生产环境，使用：

- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- GitHub Secrets (用于 CI/CD)

---

## 如果已经提交了敏感信息

### 立即执行

1. **轮换凭证**（最紧急）

   ```
   - 立即删除/禁用泄露的 API Key
   - 生成新的凭证
   - 更新所有使用该凭证的地方
   ```

2. **清理 Git 历史**

   **方法 1: 使用 BFG Repo-Cleaner**（推荐）

   ```bash
   git clone --mirror <repo-url>
   cd <repo>.git
   bfg --delete-files '*.env'
   bfg --replace-text password-remover.txt
   git push --force
   ```

   **方法 2: 使用 git filter-repo**

   ```bash
   pip3 install git-filter-repo
   git filter-repo --replace-text replacements.txt --force
   git push --force
   ```

   **方法 3: 使用 git filter-branch**

   ```bash
   git filter-branch --force --tree-filter '
     if [ -f .env ]; then
       rm .env
     fi
   ' --prune-empty HEAD
   git push --force
   ```

3. **通知相关方**
   - 检查仓库的 Fork 列表
   - 如有必要，发布安全通知

---

## 常见错误

### 错误 1: "检测到大模型 API Key"

```
❌ 错误：检测到 API Key
   文件：config.jsonc:5
   内容："apiKey": "<real-key-value>"

解决方案:
1. 立即轮换 API Key
2. 使用占位符替换： "sk-YOUR_ZHUI_API_KEY_HERE"
3. 或使用环境变量： "${ZHUI_API_KEY}"
```

### 错误 2: "尝试提交 .env 文件"

```
❌ 错误：检测到敏感文件
   文件：.env
   类型：环境变量文件

解决方案:
1. git rm --cached .env
2. 将 .env 添加到 .gitignore
3. 创建 .env.example 作为模板
```

### 错误 3: "本地落后于远程"

```
❌ 错误：本地分支落后于远程
   提示：先执行 git pull --rebase

解决方案:
1. git fetch origin
2. git pull --rebase origin main
3. 解决冲突（如果有）
4. 重新提交
```

---

## 配置示例

### .gitignore 完整配置

```gitignore
# =====================
# API Keys & Secrets
# =====================
*api*key*
*apikey*
*secret*
*credentials*
*password*
*.env
*.env.*
*.local
*.local.*

# =====================
# Certificates & Keys
# =====================
*.pem
*.key
*.p12
*.pfx
*.jks
*.crt
*.cer

# =====================
# IDE & Editor
# =====================
.idea/
.vscode/
*.swp
*.swo
*~
.DS_Store

# =====================
# Logs & Temp
# =====================
*.log
logs/
tmp/
temp/

# =====================
# User Configs
# =====================
*.local.jsonc
*.local.json
config.local.*
settings.local.*
```

### pre-commit 钩子示例

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔒 Running security checks..."

# Check for API keys
if git diff --cached --name-only | xargs grep -l "sk-sp-[a-f0-9]\{32\}" 2>/dev/null; then
    echo "❌ ERROR: Detected API Key in staged files"
    exit 1
fi

# Check for .env files
if git diff --cached --name-only | grep -q "\.env"; then
    echo "❌ ERROR: Attempting to commit .env file"
    exit 1
fi

echo "✅ Security checks passed"
exit 0
```

---

## 相关资源

- [GitHub 移除敏感数据指南](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-filter-repo](https://htmlpreview.github.io/?https://github.com/newren/git-filter-repo/blob/docs/html/git-filter-repo.html)
- [Git Hooks 文档](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [OWASP 密钥管理指南](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

## 更新日志

- **2026-02-28**: 初始版本创建
  - 添加 API Key 检测
  - 添加 .gitignore 模板
  - 添加预提交钩子
  - 添加 Git 操作规范

---

*创建时间：2026-02-28*  
*最后更新：2026-02-28*
