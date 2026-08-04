#!/bin/bash
# Pi 配置一键恢复脚本
set -e

AGENT_DIR="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"
MCP_DIR="$HOME/.config/mcp"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> 1/5 创建目录"
mkdir -p "$AGENT_DIR/extensions/pi-permission-system" "$MCP_DIR" "$AGENT_DIR/skills"

echo "==> 2/5 安装扩展包"
for pkg in \
	pi-mcp-adapter pi-subagents @juicesharp/rpiv-ask-user-question \
	@juicesharp/rpiv-todo @gotgenes/pi-permission-system pi-lens \
	pi-web-access pi-rtk-optimizer pi-cache-optimizer pi-deepseek-search; do
	echo "  - $pkg"
	pi install "npm:$pkg" >/dev/null 2>&1 || echo "  ! 安装失败: $pkg"
done

# Synthwave 美化包（本地打包，含自研定制）
echo "  - pi-sakura-cyberdeck (synthwave 定制版)"
pi install "$SCRIPT_DIR/packages/pi-sakura-cyberdeck" >/dev/null 2>&1 || echo "  ! 安装失败: pi-sakura-cyberdeck"

echo "==> 3/5 复制配置文件"
cp "$SCRIPT_DIR/settings.json" "$AGENT_DIR/settings.json"
cp "$SCRIPT_DIR/models.json" "$AGENT_DIR/models.json"
cp "$SCRIPT_DIR/mcp.json" "$MCP_DIR/mcp.json"
cp "$SCRIPT_DIR/extensions/pi-permission-system/config.json" \
	"$AGENT_DIR/extensions/pi-permission-system/config.json"

echo "==> 4/5 复制技能库"
cp -r "$SCRIPT_DIR/skills/"* "$AGENT_DIR/skills/"

echo "==> 5/5 完成"
echo ""
echo "下一步："
echo "  1. cp auth.json.example $AGENT_DIR/auth.json && vim $AGENT_DIR/auth.json  # 填入密钥"
echo "  2. 安装 Trellis（可选）: npm install -g @mindfoldhq/trellis"
echo "  3. 启动: pi"
