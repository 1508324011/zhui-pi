#!/bin/bash
# =============================================================================
# Scan Repository for Sensitive Information
# =============================================================================
# 扫描整个仓库（包括历史）中的敏感信息
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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

echo "=========================================="
echo "🔍 仓库敏感信息扫描"
echo "=========================================="
echo ""
echo "仓库目录：$REPO_ROOT"
echo ""

# API Key 模式
API_KEY_PATTERNS=(
    'sk-sp-[a-f0-9]{32}'
    'sk-[a-zA-Z0-9]{48}'
    'ghp_[a-zA-Z0-9]{36}'
    'AKIA[0-9A-Z]{16}'
)

FOUND_ISSUES=0

# -----------------------------------------------------------------------------
# 扫描当前工作目录
# -----------------------------------------------------------------------------
log_info "扫描当前工作目录..."
echo ""

for pattern in "${API_KEY_PATTERNS[@]}"; do
    results=$(grep -rE "$pattern" --include="*.json" --include="*.jsonc" --include="*.yaml" --include="*.yml" --include="*.toml" --include="*.env" --include="*.py" --include="*.js" --include="*.ts" --include="*.sh" . 2>/dev/null || true)
    
    if [ -n "$results" ]; then
        log_error "检测到 API Key (模式：$pattern)"
        echo "$results" | head -10
        FOUND_ISSUES=1
        echo ""
    fi
done

# -----------------------------------------------------------------------------
# 扫描 Git 历史
# -----------------------------------------------------------------------------
log_info "扫描 Git 历史记录..."
echo ""

if git rev-parse --git-dir > /dev/null 2>&1; then
    for pattern in "${API_KEY_PATTERNS[@]}"; do
        results=$(git log -p --all -S "$pattern" --pretty=format:"%h %s" 2>/dev/null | head -20 || true)
        
        if [ -n "$results" ]; then
            log_error "在 Git 历史中检测到敏感信息 (模式：$pattern)"
            echo "$results"
            FOUND_ISSUES=1
            echo ""
        fi
    done
    
    # 检查当前 HEAD
    results=$(git log -p -1 --pretty=format:"" 2>/dev/null | grep -E 'sk-sp-[a-f0-9]{32}' || true)
    if [ -n "$results" ]; then
        log_error "最新提交中包含 API Key"
        FOUND_ISSUES=1
    fi
else
    log_warning "当前目录不是 Git 仓库，跳过历史扫描"
fi

# -----------------------------------------------------------------------------
# 检查 .gitignore
# -----------------------------------------------------------------------------
echo ""
log_info "检查 .gitignore 配置..."

if [ -f ".gitignore" ]; then
    REQUIRED_PATTERNS=("*.env" "*.local" "*api*key*" "*.pem" "*.key")
    MISSING=()
    
    for pattern in "${REQUIRED_PATTERNS[@]}"; do
        if ! grep -q "$pattern" .gitignore; then
            MISSING+=("$pattern")
        fi
    done
    
    if [ ${#MISSING[@]} -gt 0 ]; then
        log_warning ".gitignore 缺少以下规则:"
        for pattern in "${MISSING[@]}"; do
            echo "   - $pattern"
        done
        log_info "建议运行：cp $SCRIPT_DIR/.gitignore.template .gitignore"
    else
        log_success ".gitignore 配置完整"
    fi
else
    log_warning ".gitignore 文件不存在"
    log_info "建议运行：cp $SCRIPT_DIR/.gitignore.template .gitignore"
fi

# -----------------------------------------------------------------------------
# 总结
# -----------------------------------------------------------------------------
echo ""
echo "=========================================="

if [ $FOUND_ISSUES -eq 1 ]; then
    log_error "发现敏感信息！"
    echo ""
    echo "建议操作:"
    echo "  1. 立即轮换已泄露的 API Key"
    echo "  2. 使用 BFG 或 git-filter-repo 清理历史"
    echo "  3. 更新 .gitignore 防止再次泄露"
    echo ""
    echo "清理工具:"
    echo "  - BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/"
    echo "  - git-filter-repo: https://github.com/newren/git-filter-repo"
    echo "=========================================="
    exit 1
else
    log_success "未发现敏感信息"
    echo "=========================================="
    exit 0
fi
