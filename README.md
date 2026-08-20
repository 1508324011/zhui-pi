# Pi 配置同步仓库

将 Pi 编码代理的配置同步到多设备。**不含任何 API 密钥**（密钥请手动配置在各设备的 `~/.pi/agent/auth.json`）。

## 内容

| 文件/目录 | 说明 | 目标位置 |
| ----------- | ------ | --------- |
| `settings.json` | 全局设置（默认模型/**synthwave 主题**/已装包） | `~/.pi/agent/settings.json` |
| `models.json` | deepseek、zhui 与 SCNet Token Plan provider 配置（含模型窗口和思考级别映射） | `~/.pi/agent/models.json` |
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
- **本地 Pi watchdog 补丁**: `install.sh` 会执行 `scripts/patch-pi-subagents.mjs`，补齐 Pi core peer symlink、给 `pi-subagents` 发布包源码加入最小 `tsconfig`，并修复 Trellis/Pi 集成里子进程 watchdog 裸 `sendMessage`、`.pi/` 平台资产误入 changed-files watchdog 的问题。
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
# 编辑 auth.json，按需填入 deepseek、zhui 和 scnet 的密钥

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

## 项目 Trellis 模板

`zhui-pi` 是 Pi agent 定义、模型选择、Trellis 项目扩展模板和安装策略的持久所有者。目标仓库的 `.pi` 是同步产物；缓存、日志、运行 artifact 以及其他项目自有 `.pi` 文件不属于模板。

`templates/project-trellis/` 包含扩展、三个 Trellis agent、三个项目 prompt 和 `settings.json`。同步命令：

```bash
node scripts/sync-project-trellis.mjs --dry-run --target /path/to/repository
node scripts/sync-project-trellis.mjs --target /path/to/repository --receipt /path/to/receipt.json
node scripts/sync-project-trellis.mjs --check --target /path/to/repository
```

命令拒绝非仓库根目录、根目录符号链接、符号链接 `.pi` 和越界模板路径，不删除目标 `.pi` 中不受模板管理的资产。stdout 与可选 `--receipt` 都是 JSON，记录 source revision（脏树带 `-dirty`）、copied/unchanged/rejected/deleted 清单。对未变化目标重复执行不会写文件。

agent 中现有的 `deepseek/deepseek-v4-pro` 与 `zhui/gpt-5.6-sol` 选择是明确配置，安装器不会根据历史 provider 故障重写它们。扩展在每次 spawn 前检查实际 agent/model/provider、Pi model catalog、可执行文件、认证和有界实时 readiness；失败直接阻止 spawn，不跨 provider fallback。execution 与 acceptance 结果分别写入运行 manifest，只有有效 fenced `acceptance-report` 才能形成 accepted completion。

## pi-lens 全局策略

`templates/pi-lens/config.json` 只声明 pi-lens 3.8.74 支持的 `tests.enabled=false`。`install.sh` 通过结构化 JSON 深合并安装它，并保留 `~/.pi-lens/config.json` 的其他键。独立命令：

```bash
node scripts/install-pi-lens-config.mjs --dry-run
node scripts/install-pi-lens-config.mjs --check
node scripts/install-pi-lens-config.mjs
```

验证：

```bash
npm install
npm test
npm run typecheck:trellis
```
