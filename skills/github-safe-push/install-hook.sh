#!/bin/bash
# =============================================================================
# Install Git Pre-commit Hook
# =============================================================================
# 安装 Git 预提交钩子
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

echo "=========================================="
echo "🔧 安装 Git Pre-commit Hook"
echo "=========================================="
echo ""

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 错误：当前目录不是 Git 仓库"
    exit 1
fi

# 创建 hooks 目录（如果不存在）
mkdir -p "$HOOKS_DIR"

# 备份现有的 pre-commit 钩子
if [ -f "$HOOKS_DIR/pre-commit" ] && [ ! -f "$HOOKS_DIR/pre-commit.backup" ]; then
    echo "ℹ️  备份现有的 pre-commit 钩子..."
    cp "$HOOKS_DIR/pre-commit" "$HOOKS_DIR/pre-commit.backup"
fi

# 安装新的 pre-commit 钩子
HOOK_SCRIPT="$HOOKS_DIR/pre-commit"

cat > "$HOOK_SCRIPT" << 'HOOK_EOF'
#!/bin/bash
# =============================================================================
# Git Pre-commit Hook - Security Checks
# =============================================================================
# 自动生成的预提交钩子 - 由 github-safe-push 技能创建
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

echo "=========================================="
echo "🔒 运行提交前安全检查..."
echo "=========================================="

# 获取暂存文件列表
STAGED_FILES=$(git diff --cached --name-only)

if [ -z "$STAGED_FILES" ]; then
    log_warning "没有暂存的更改"
    exit 0
fi

HAS_SECRETS=0

# 检查 1: 检测 .env 文件
for file in $STAGED_FILES; do
    if [[ "$file" =~ \.env$ ]] || [[ "$file" =~ \.env\. ]]; then
        log_error "检测到 .env 文件：$file"
        HAS_SECRETS=1
    fi
done

# 检查 2: 检测 API Key (阿里云百炼)
for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        if grep -qE 'sk-sp-[a-f0-9]{32}' "$file" 2>/dev/null; then
            log_error "在 $file 中检测到阿里云 API Key"
            HAS_SECRETS=1
        fi
        
        # 检查其他常见 API Key
        if grep -qE 'sk-[a-zA-Z0-9]{48}' "$file" 2>/dev/null; then
            log_error "在 $file 中检测到 OpenAI API Key"
            HAS_SECRETS=1
        fi
        
        if grep -qE 'ghp_[a-zA-Z0-9]{36}' "$file" 2>/dev/null; then
            log_error "在 $file 中检测到 GitHub Token"
            HAS_SECRETS=1
        fi
        
        # 检查通用密钥模式
        if grep -qiE 'password\s*[=:]\s*['\''"][^'\''"]+['\''"]' "$file" 2>/dev/null; then
            log_error "在 $file 中检测到密码"
            HAS_SECRETS=1
        fi
    fi
done

# 检查 3: 检测敏感文件扩展名
for file in $STAGED_FILES; do
    if [[ "$file" =~ \.(pem|key|p12|pfx|jks)$ ]]; then
        log_error "检测到证书/密钥文件：$file"
        HAS_SECRETS=1
    fi
done

echo ""

if [ $HAS_SECRETS -eq 1 ]; then
    log_error "安全检查失败，已阻止提交"
    echo ""
    echo "=========================================="
    echo "解决方案:"
    echo "  1. 使用占位符替换 API Key"
    echo "  2. 将敏感文件添加到 .gitignore"
    echo "  3. 使用环境变量存储凭证"
    echo "=========================================="
    exit 1
fi

log_success "所有安全检查通过！"
echo "=========================================="
exit 0
HOOK_EOF

# 添加执行权限
chmod +x "$HOOK_SCRIPT"

echo "✅ Pre-commit hook 已安装到：$HOOK_SCRIPT"
echo ""
echo "验证安装:"
echo "  ls -la $HOOK_SCRIPT"
echo ""
echo "测试运行:"
echo "  $HOOK_SCRIPT"
echo ""
echo "=========================================="
