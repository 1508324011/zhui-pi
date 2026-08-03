#!/bin/bash
# =============================================================================
# Check Single File for Sensitive Information
# =============================================================================
# 检查单个文件是否包含敏感信息
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

if [ $# -eq 0 ]; then
    echo "用法：$0 <file-path> [file-path2] ..."
    echo ""
    echo "检查指定文件是否包含敏感信息"
    exit 1
fi

# API Key 正则表达式
API_KEY_PATTERNS=(
    'sk-sp-[a-f0-9]{32}'           # 阿里云百炼
    'sk-[a-zA-Z0-9]{48}'           # OpenAI
    'ghp_[a-zA-Z0-9]{36}'          # GitHub Personal Token
    'gho_[a-zA-Z0-9]{36}'          # GitHub OAuth
    'ghu_[a-zA-Z0-9]{36}'          # GitHub User-to-Server
    'ghs_[a-zA-Z0-9]{36}'          # GitHub Server-to-Server
    'ghr_[a-zA-Z0-9]{36}'          # GitHub Refresh Token
    'xox[baprs]-[0-9a-zA-Z]{10,}'  # Slack
    'AKIA[0-9A-Z]{16}'             # AWS Access Key
    'AIza[0-9A-Za-z\-_]{35}'       # Google API Key
)

# 敏感关键词
SENSITIVE_KEYWORDS=(
    'password\s*[=:]\s*['\''"][^'\''"]+['\''"]'
    'secret[_-]?key\s*[=:]\s*['\''"][^'\''"]+['\''"]'
    'api[_-]?key\s*[=:]\s*['\''"][^'\''"]+['\''"]'
    'private[_-]?key\s*[=:]\s*['\''"][^'\''"]+['\''"]'
)

EXIT_CODE=0

for FILE in "$@"; do
    if [ ! -f "$FILE" ]; then
        log_error "文件不存在：$FILE"
        EXIT_CODE=1
        continue
    fi
    
    echo "=========================================="
    log_info "检查文件：$FILE"
    echo "=========================================="
    
    FOUND_ISSUES=0
    
    # 检查文件名
    if [[ "$FILE" =~ \.env$ ]] || [[ "$FILE" =~ \.env\. ]]; then
        log_warning "检测到 .env 文件"
        FOUND_ISSUES=1
    fi
    
    if [[ "$FILE" =~ \.local$ ]] || [[ "$FILE" =~ \.local\. ]]; then
        log_warning "检测到 .local 文件"
        FOUND_ISSUES=1
    fi
    
    if [[ "$FILE" =~ (secret|credential|password|passwd) ]]; then
        log_warning "文件名包含敏感关键词"
        FOUND_ISSUES=1
    fi
    
    # 检查文件内容 - API Keys
    for pattern in "${API_KEY_PATTERNS[@]}"; do
        if grep -qE "$pattern" "$FILE" 2>/dev/null; then
            log_error "检测到 API Key (模式：$pattern)"
            grep -nE "$pattern" "$FILE" | head -5
            FOUND_ISSUES=1
        fi
    done
    
    # 检查文件内容 - 敏感关键词
    for pattern in "${SENSITIVE_KEYWORDS[@]}"; do
        if grep -qiE "$pattern" "$FILE" 2>/dev/null; then
            log_warning "检测到敏感关键词 (模式：$pattern)"
            grep -niE "$pattern" "$FILE" | head -3
            # 关键词不一定会阻止提交，但会警告
        fi
    done
    
    echo ""
    
    if [ $FOUND_ISSUES -eq 1 ]; then
        log_error "文件 $FILE 包含敏感信息"
        EXIT_CODE=1
    else
        log_success "文件 $FILE 检查通过"
    fi
    
    echo ""
done

if [ $EXIT_CODE -eq 0 ]; then
    echo "=========================================="
    log_success "所有文件检查通过"
    echo "=========================================="
else
    echo "=========================================="
    log_error "发现敏感信息，请处理后再提交"
    echo "=========================================="
fi

exit $EXIT_CODE
