# Pi 配置同步仓库

将 Pi 编码代理的配置同步到多设备。**不含任何 API 密钥**（密钥请手动配置在各设备的 `~/.pi/agent/auth.json`）。

## 内容

| 文件/目录 | 说明 | 目标位置 |
| ----------- | ------ | --------- |
| `settings.json` | 全局设置（默认模型/主题/已装包） | `~/.pi/agent/settings.json` |
| `models.json` | zhui provider 配置（5 个模型+思考级别映射） | `~/.pi/agent/models.json` |
| `mcp.json` | MCP 服务器（chrome-devtools + context7） | `~/.config/mcp/mcp.json` |
| `extensions/` | 扩展配置（permission-system 权限规则） | `~/.pi/agent/extensions/` |
| `skills/` | 96 个技能（superpowers 方法论 + 科学计算 + 写作） | `~/.pi/agent/skills/` |
| `auth.json.example` | 凭据模板（**手动填写**） | `~/.pi/agent/auth.json` |
| `install.sh` | 一键恢复脚本 | - |

## 新设备恢复步骤

```bash
# 1. 安装 pi
npm install -g --ignore-scripts @earendil-works/pi-coding-agent

# 2. 克隆本仓库
git clone https://github.com/1508324011/zhui-pi.git ~/zhui-pi

# 3. 运行恢复脚本
cd ~/zhui-pi && bash install.sh

# 4. 手动填入 API 密钥
cp auth.json.example ~/.pi/agent/auth.json
# 编辑 auth.json，填入 deepseek 和 zhui 的密钥

# 5. 启动 pi
pi
```

## 安全说明

- `auth.json`（真实密钥）**永远不提交**，由 `.gitignore` 排除
- 仓库公开：不要往 `settings.json`/`models.json` 里塞任何密钥
- 若添加新配置，先在本地确认无敏感信息再推送

## 更新同步

```bash
cd ~/zhui-pi
# 手动更新配置文件（或从 ~/.pi/agent 复制）
git add -A && git commit -m "update config" && git push
```
