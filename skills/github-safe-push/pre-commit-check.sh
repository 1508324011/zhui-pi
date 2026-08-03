#!/bin/bash
# =============================================================================
# GitHub Safe Push - Pre-commit Check Script
# =============================================================================
# 提交前安全检查脚本 - 防止敏感信息泄露
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATTERNS_DIR="$SCRIPT_DIR/patterns"

# =============================================================================
# 检查函数
# =============================================================================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# -----------------------------------------------------------------------------
# 检查 Git 状态
# -----------------------------------------------------------------------------
check_git_status() {
    log_info "检查 Git 状态..."
    
    # 检查是否在 git 仓库中
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "当前目录不是 Git 仓库"
        exit 1
    fi
    
    # 检查是否有暂存的更改
    if [ -z "$(git diff --cached --name-only)" ]; then
        log_warning "没有暂存的更改"
    fi
    
    # 检查本地是否落后于远程
    local branch=$(git rev-parse --abbrev-ref HEAD)
    if git remote | grep -q "origin"; then
        git fetch origin --quiet 2>/dev/null || true
        local local_commit=$(git rev-parse HEAD 2>/dev/null)
        local remote_commit=$(git rev-parse @{u} 2>/dev/null || echo "")
        
        if [ -n "$remote_commit" ] && [ "$local_commit" != "$remote_commit" ]; then
            # 检查是否是ahead/behind状态
            local ahead=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "0")
            local behind=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")
            
            if [ "$behind" -gt 0 ]; then
                log_error "本地分支落后于远程 $behind 个提交"
                log_info "请先执行：git pull --rebase origin $branch"
                exit 1
            fi
        fi
    fi
    
    log_success "Git 状态检查通过"
}

# -----------------------------------------------------------------------------
# 检查 .gitignore 配置
# -----------------------------------------------------------------------------
check_gitignore() {
    log_info "检查 .gitignore 配置..."
    
    if [ ! -f ".gitignore" ]; then
        log_warning ".gitignore 文件不存在，将创建默认配置"
        cp "$SCRIPT_DIR/.gitignore.template" .gitignore
        log_success "已创建 .gitignore 文件"
        return
    fi
    
    # 检查是否包含必要的忽略规则
    local required_patterns=(
        "*.env"
        "*.local"
        "*api*key*"
        "*.pem"
        "*.key"
    )
    
    local missing=()
    for pattern in "${required_patterns[@]}"; do
        if ! grep -q "$pattern" .gitignore; then
            missing+=("$pattern")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_warning ".gitignore 缺少以下规则:"
        for pattern in "${missing[@]}"; do
            echo "   - $pattern"
        done
        log_info "建议手动更新 .gitignore 文件"
    else
        log_success ".gitignore 配置完整"
    fi
}

# -----------------------------------------------------------------------------
# 检查暂存文件中的敏感信息
# -----------------------------------------------------------------------------
check_staged_files() {
    log_info "扫描暂存文件中的敏感信息..."
    
    local staged_files=$(git diff --cached --name-only)
    local has_secrets=0
    local found_files=()
    
    # API Key 模式
    local api_key_patterns=(
        'sk-sp-[a-f0-9]{32}'
        'sk-[a-zA-Z0-9]{48}'
        'ghp_[a-zA-Z0-9]{36}'
        'gho_[a-zA-Z0-9]{36}'
        'api[_-]?key\s*[=:]\s*['\''"][a-zA-Z0-9]{16,}['\''"]'
        'secret[_-]?key\s*[=:]\s*['\''"][a-zA-Z0-9]{16,}['\''"]'
        'password\s*[=:]\s*['\''"][^'\''"]+['\''"]'
    )
    
    for file in $staged_files; do
        if [ ! -f "$file" ]; then
            continue
        fi
        
        # 检查文件名
        if [[ "$file" =~ \.env ]] || [[ "$file" =~ \.local ]] || [[ "$file" =~ secret ]] || [[ "$file" =~ credential ]]; then
            log_error "检测到敏感文件：$file"
            has_secrets=1
            found_files+=("$file")
            continue
        fi
        
        # 检查文件内容
        for pattern in "${api_key_patterns[@]}"; do
            if grep -qE "$pattern" "$file" 2>/dev/null; then
                log_error "在 $file 中检测到 API Key 或敏感信息"
                log_info "匹配模式：$pattern"
                grep -nE "$pattern" "$file" | head -3
                has_secrets=1
                found_files+=("$file")
                break
            fi
        done
    done
    
    if [ $has_secrets -eq 1 ]; then
        log_error "发现 ${#found_files[@]} 个文件包含敏感信息，已阻止提交"
        log_info "解决方案:"
        log_info "  1. 使用占位符替换真实 API Key"
        log_info "  2. 将敏感文件添加到 .gitignore"
        log_info "  3. 使用环境变量存储凭证"
        exit 1
    fi
    
    log_success "暂存文件检查通过"
}

# -----------------------------------------------------------------------------
# 检查敏感文件类型
# -----------------------------------------------------------------------------
check_sensitive_extensions() {
    log_info "检查敏感文件扩展名..."
    
    local sensitive_exts=(
        "\.pem$"
        "\.key$"
        "\.p12$"
        "\.pfx$"
        "\.jks$"
        "\.env$"
        "\.env\."
    )
    
    local staged_files=$(git diff --cached --name-only)
    local has_sensitive=0
    
    for file in $staged_files; do
        for ext in "${sensitive_exts[@]}"; do
            if [[ "$file" =~ $ext ]]; then
                log_error "检测到敏感扩展名文件：$file"
                has_sensitive=1
            fi
        done
    done
    
    if [ $has_sensitive -eq 1 ]; then
        log_error "发现敏感扩展名文件，已阻止提交"
        exit 1
    fi
    
    log_success "文件扩展名检查通过"
}

# =============================================================================
# 主函数
# =============================================================================
main() {
    echo "=========================================="
    echo "🔒 GitHub Safe Push - 提交前安全检查"
    echo "=========================================="
    echo ""
    
    local failed=0
    
    check_git_status || failed=1
    if [ $failed -eq 0 ]; then
        check_gitignore || failed=1
        check_staged_files || failed=1
        check_sensitive_extensions || failed=1
    fi
    
    echo ""
    echo "=========================================="
    
    if [ $failed -eq 0 ]; then
        log_success "所有安全检查通过！可以安全提交"
        echo "=========================================="
        exit 0
    else
        log_error "安全检查失败，已阻止提交"
        echo "=========================================="
        exit 1
    fi
}

main "$@"
