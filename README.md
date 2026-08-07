# Pi 配置同步仓库

将 Pi 编码代理的配置同步到多设备。**不含任何 API 密钥**（密钥请手动配置在各设备的 `~/.pi/agent/auth.json`）。

## 内容

| 文件/目录 | 说明 | 目标位置 |
| ----------- | ------ | --------- |
| `settings.json` | 全局设置（默认模型/**synthwave 主题**/已装包） | `~/.pi/agent/settings.json` |
| `models.json` | zhui provider 配置（5 个模型+思考级别映射） | `~/.pi/agent/models.json` |
| `mcp.json` | MCP 服务器（chrome-devtools + context7） | `~/.config/mcp/mcp.json` |
| `extensions/` | 扩展配置（permission-system 权限规则） | `~/.pi/agent/extensions/` |
| `agents/` | 全局 Trellis agents 模板 | `~/.pi/agent/agents/` |
| `packages/pi-sakura-cyberdeck/` | **synthwave 美化包**（自研定制：滚动条/拖拽/持久化历史/Pi logo 启动页） | `pi install` 本地路径 |
| `skills/` | 96 个技能（superpowers 方法论 + 科学计算 + 写作） | `~/.pi/agent/skills/` |
| `auth.json.example` | 凭据模板（**手动填写**） | `~/.pi/agent/auth.json` |
| `install.sh` | 一键恢复脚本 | - |

## Trellis 工作流框架

本机额外配置了 [Trellis](https://github.com/mindfold-ai/Trellis)（任务驱动开发框架）：

- **CLI**: 全局安装 `@mindfoldhq/trellis`
  ```bash
  npm install -g @mindfoldhq/trellis@latest
  ```
  > ⚠️ **注意包名**：npm 上存在同名 `trellis` 包（TrellisVCS 语义版本控制），那是**另一个项目**。
  > 正确的工作流框架包名是 **`@mindfoldhq/trellis`**（scoped package），安装时务必带 `@mindfoldhq/` 前缀。
  > 如果误装了错误的包，先 `npm uninstall -g trellis` 再安装正确的。
- **项目初始化**: 当前 Trellis CLI `0.4.0-beta.8` 没有 `--pi` 初始化器。先用官方支持的平台模板初始化（如 `trellis init --opencode -u <用户名>`），再把项目级 `.pi/` 资产放入项目：`settings.json`、`prompts/trellis-*`、`agents/trellis-*`、`extensions/trellis/index.ts`。
- **产物**: 项目内 `.trellis/` 管 specs/tasks/workspace；项目级 `.pi/` 管 Pi 平台资产：`trellis-start/continue/finish-work` 提示词、`trellis-implement/check/research` agents、`trellis` extension。
- **与 Pi 集成**: 项目级 Trellis extension 注册 `trellis_subagent` 和 `trellis_artifact` 工具。`trellis_subagent` 负责把完整 Trellis task context 注入子代理，并把子代理 raw 输出落到 `.trellis/.runtime/pi-subagents/<runId>/`；父 session 只接收结构化 handoff，必要时再用 `trellis_artifact` 按需读取完整 artifact。
- 首次进入已初始化的项目目录时，Pi 会提示信任项目（`.pi/` 资源），选择 Trust 即可

> 注意：`.trellis/` 与项目内 `.pi/` 属于**项目目录**，不在本同步仓库中（按项目独立管理）。

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
