# GitHub Safe Push Skill

**Created**: 2026-02-28  
**Version**: 1.0.0

## Purpose

此技能解决 GitHub 提交时的两个关键安全问题：

1. **API Key 泄露** - 防止将敏感凭证（如阿里云百炼 API Key）提交到公共仓库
2. **Git 操作规范** - 确保正确的提交流程（先 pull 再合并，避免覆盖原有内容）

## 安装

```bash
# 技能已位于
skills/github-safe-push/

# 安装预提交钩子到当前仓库
./skills/github-safe-push/install-hook.sh
```

## 使用方法

### 1. 提交前检查

```bash
# 运行完整检查
./skills/github-safe-push/pre-commit-check.sh

# 检查特定文件
./skills/github-safe-push/check-file.sh config.jsonc

# 扫描整个仓库
./skills/github-safe-push/scan-repo.sh

# 搜索敏感信息
./skills/github-safe-push/grep-secrets.sh "sk-sp-"
```

### 2. 正确的 Git 提交流程

```bash
# 步骤 1: 获取远程更新
git fetch origin

# 步骤 2: 合并远程更改（关键！）
git pull --rebase origin main

# 步骤 3: 解决冲突（如果有）
git rebase --continue

# 步骤 4: 运行安全检查
./skills/github-safe-push/pre-commit-check.sh

# 步骤 5: 提交和推送
git add .
git commit -m "your message"
git push origin main
```

### 3. 自动检查（推荐）

安装 pre-commit 钩子后，每次提交会自动运行安全检查：

```bash
./skills/github-safe-push/install-hook.sh
```

## 检测的敏感信息

### API Key 模式

- 阿里云百炼：`sk-sp-[a-f0-9]{32}`
- OpenAI: `sk-[a-zA-Z0-9]{48}`
- GitHub Token: `ghp_[a-zA-Z0-9]{36}`
- AWS Key: `AKIA[0-9A-Z]{16}`

### 敏感文件

- `*.env`, `*.env.*`
- `*.local`, `*.local.*`
- `*.pem`, `*.key`, `*.p12`, `*.pfx`
- 包含 `secret`, `credential`, `password` 的文件

## 如果已经泄露了 API Key

1. **立即轮换凭证**（最重要！）
2. 清理 Git 历史：
   ```bash
   git clone --mirror <repo-url>
   cd <repo>.git
   bfg --delete-files '*.env'
   git push --force
   ```
3. 更新 `.gitignore` 防止再次泄露

## 文件结构

```
skills/github-safe-push/
├── SKILL.md              # 完整技能文档
├── pre-commit-check.sh   # 提交前检查脚本
├── check-file.sh         # 单文件检查
├── scan-repo.sh          # 仓库扫描
├── install-hook.sh       # 钩子安装
├── grep-secrets.sh       # 敏感信息搜索
└── .gitignore.template   # .gitignore 模板
```

## 配置示例

### config.jsonc (安全做法)

```jsonc
{
  // ❌ 错误：直接写真实 API Key
  // "apiKey": "sk-YOUR_ZHUI_API_KEY_HERE"

  // ✅ 正确：使用环境变量
  "apiKey": "${ZHUI_API_KEY}"
}
```

### ~/.bashrc

```bash
export ZHUI_API_KEY="sk-YOUR_ZHUI_API_KEY_HERE"
```

### .gitignore

```gitignore
# API Keys
*api*key*
*.env
*.env.*
*.local

# Certificates
*.pem
*.key
*.p12
```

## 相关资源

- [GitHub 移除敏感数据指南](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [OWASP 密钥管理指南](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

*此技能已集成到 Zhui-s-opencode-skills 仓库*
