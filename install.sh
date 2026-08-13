#!/bin/bash
# Pi 配置一键恢复脚本
set -e

AGENT_DIR="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"
MCP_DIR="$HOME/.config/mcp"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> 1/7 创建目录"
mkdir -p "$AGENT_DIR/extensions/pi-permission-system" "$MCP_DIR" "$AGENT_DIR/skills" "$AGENT_DIR/agents"

echo "==> 2/7 安装扩展包"
for pkg in \
	pi-mcp-adapter pi-subagents @juicesharp/rpiv-ask-user-question \
	@juicesharp/rpiv-todo @gotgenes/pi-permission-system pi-lens \
	pi-web-access pi-cache-optimizer pi-deepseek-search \
	@cortexkit/pi-magic-context; do
	echo "  - $pkg"
	pi install "npm:$pkg" >/dev/null 2>&1 || echo "  ! 安装失败: $pkg"
done

# Synthwave 美化包（本地打包，含自研定制）
echo "  - pi-sakura-cyberdeck (synthwave 定制版)"
pi install "$SCRIPT_DIR/packages/pi-sakura-cyberdeck" >/dev/null 2>&1 || echo "  ! 安装失败: pi-sakura-cyberdeck"

# Pi npm 插件运行在独立 node_modules 下，需要把 Pi core peer 包暴露出来。
# 同时修复 pi-subagents watchdog 在 Trellis/Pi 集成里的已知本地环境问题：
# - 子进程 watchdog 警告必须用 followUp 投递，避免 agent_end 后触发 streamingBehavior 异常。
# - 子代理 changed-files watchdog 不应把项目级 .pi/ 平台资产当作业务变更扫描。
# - 发布包源码需要最小 tsconfig，避免 LSP 用低版本 inferred project 误报。
node "$SCRIPT_DIR/scripts/patch-pi-subagents.mjs" "$AGENT_DIR"

echo "==> 3/7 安装嵌入模型（离线可用）"
EMBED_SRC="$SCRIPT_DIR/models/embedding/Xenova/bge-small-zh-v1.5"
EMBED_DST="$HOME/.local/share/cortexkit/magic-context/models/Xenova/bge-small-zh-v1.5"
if [ -d "$EMBED_SRC/onnx" ]; then
	mkdir -p "$(dirname "$EMBED_DST")"
	cp -r "$EMBED_SRC" "$EMBED_DST"
	echo "  - Xenova/bge-small-zh-v1.5 → $EMBED_DST"
else
	echo "  - 模型文件不存在，跳过（需先 git clone 仓库）"
fi

echo "==> 4/7 复制配置文件"
cp "$SCRIPT_DIR/settings.json" "$AGENT_DIR/settings.json"
cp "$SCRIPT_DIR/models.json" "$AGENT_DIR/models.json"
cp "$SCRIPT_DIR/mcp.json" "$MCP_DIR/mcp.json"
# Magic Context 配置（仅当目标不存在时从模板生成，避免覆盖已有配置）
if [ ! -f "$HOME/.config/cortexkit/magic-context.jsonc" ]; then
	mkdir -p "$HOME/.config/cortexkit"
	cp "$SCRIPT_DIR/magic-context.jsonc.example" "$HOME/.config/cortexkit/magic-context.jsonc"
	echo "  - magic-context.jsonc (已从模板生成)"
else
	echo "  - magic-context.jsonc (已存在，跳过)"
fi
cp "$SCRIPT_DIR/extensions/pi-permission-system/config.json" \
	"$AGENT_DIR/extensions/pi-permission-system/config.json"

echo "==> 5/7 复制技能库与 agents"
cp -r "$SCRIPT_DIR/skills/"* "$AGENT_DIR/skills/"
if [ -d "$SCRIPT_DIR/agents" ]; then
	cp -r "$SCRIPT_DIR/agents/"* "$AGENT_DIR/agents/"
fi

echo "==> 6/7 合并 pi-lens 全局策略"
node "$SCRIPT_DIR/scripts/install-pi-lens-config.mjs"

echo "==> 7/7 完成"
echo ""
echo "下一步："
echo "  1. cp auth.json.example $AGENT_DIR/auth.json && vim $AGENT_DIR/auth.json  # 填入密钥"
echo "  2. 安装 Trellis（可选）: npm install -g @mindfoldhq/trellis"
echo "  3. 启动: pi"
