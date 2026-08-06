# web-access for OpenCode

这个目录把上游 `eze-is/web-access` 安装为本地 **OpenCode 原生 skill**，而不是 npm 插件、MCP 服务或 `opencode.json` 里的 plugin 项。

## Source

- Upstream repository: <https://github.com/eze-is/web-access>
- Local install path: `/home/zhurui/.config/opencode/skills/web-access`
- Upstream skill name: `web-access`
- Local install name: `web-access`
- Preserved upstream version reference: `2.4.1`（来自上游 `SKILL.md` frontmatter）

## 为什么按 skill 安装

上游仓库的核心交付物是：

- `SKILL.md`
- `scripts/`
- `references/`

这些内容天然符合 OpenCode 的本地技能目录结构，因此最合适的集成方式是直接放到：

`~/.config/opencode/skills/web-access/`

这样做可以让 OpenCode 直接发现并加载技能，同时保留上游脚本与参考资料的自包含结构。

## 本地适配说明

- `SKILL.md` 已改写为 OpenCode 语义，移除了对 Claude Code `$CLAUDE_SKILL_DIR` 的依赖。
- 在 OpenCode 中执行本技能附带的 shell 命令时，请显式把 Bash `workdir` 设为 `/home/zhurui/.config/opencode/skills/web-access/`；若从其他目录手动运行，请改用实际绝对路径。
- 上游 README 已保留为 `UPSTREAM-README.md`，便于追溯原始说明。
- 上游 `scripts/check-deps.mjs`、`scripts/cdp-proxy.mjs`、`scripts/match-site.mjs` 作为脚本资源保留，未为 OpenCode 做额外逻辑改写。
- `references/site-patterns/` 目录按上游结构保留，并带 `.gitkeep`，避免目录结构在本地看起来“缺失”。

## 运行前提

1. **Node.js 22+ 是推荐且默认支持的路径**
   - 上游脚本优先使用 Node 原生 WebSocket。
   - 如果低于 Node 22，只有在当前运行环境本身已经能解析 `ws` 模块时才可能工作；本地安装不会自动补齐这个依赖。
2. **Chrome 远程调试已允许**
   - 打开 `chrome://inspect/#remote-debugging`
   - 勾选 **Allow remote debugging for this browser instance**
   - 某些情况下需要重启浏览器
3. **本机可访问 `127.0.0.1:3456`**
   - `cdp-proxy.mjs` 默认监听这个端口，可通过 `CDP_PROXY_PORT` 覆盖
4. **OpenCode 会把它当作本地 skill 加载**
   - 不需要改 `opencode.json`
   - 不需要注册 plugin
   - 不需要 npm 安装流程

## 限制与边界

- 这是 **从 Claude Code 技能语境改编** 到 OpenCode 的本地安装，不意味着 Claude 专属的安装流、插件系统或运行时行为在 OpenCode 中完整复刻。
- 本地改编只重写了路径与集成方式；它**不宣称** OpenCode 自动提供 Claude 的 `$CLAUDE_SKILL_DIR` 变量或 Claude 专属 agent / eval 语义。
- `web-access` 的浏览器能力依赖用户本机 Chrome 调试连接是否可用；如果浏览器未授权 remote debugging，脚本不会正常连上。
- 上游仓库没有单独的 `LICENSE` 文件；MIT 许可信息来自上游 `SKILL.md` frontmatter 与 README 描述，已在本地保留引用。

## 目录结构

```text
web-access/
├── README.md                # 本地 OpenCode 安装说明
├── UPSTREAM-README.md       # 上游 README 原文保留
├── SKILL.md                 # OpenCode 适配后的主技能文档
├── scripts/
│   ├── check-deps.mjs
│   ├── cdp-proxy.mjs
│   └── match-site.mjs
└── references/
    ├── cdp-api.md
    └── site-patterns/
        └── .gitkeep
```

## 手动运行示例

在 OpenCode 中，请把 Bash `workdir` 设为 `/home/zhurui/.config/opencode/skills/web-access/` 后再运行：

```bash
node "./scripts/check-deps.mjs"
node "./scripts/cdp-proxy.mjs"
node "./scripts/match-site.mjs" "小红书 登录 上传 图片"
```

## 本地验证预期

重载或重启 OpenCode 后，`web-access` 应能作为本地技能被发现；其脚本文件与参考资料目录应保持完整存在。
