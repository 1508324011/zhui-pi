# nuwa-skill for OpenCode

这个目录把上游 `alchaincyf/nuwa-skill` 适配为本地 **OpenCode 原生 skill**。

它不是 plugin，不是 MCP 服务，也不需要往 `opencode.json` 里注册条目。只要目录存在于 `~/.config/opencode/skills/nuwa-skill/`，OpenCode 就会把它当作本地 skill 发现。

## Source

- Upstream repository: <https://github.com/alchaincyf/nuwa-skill>
- Local install path: `/home/zhurui/.config/opencode/skills/nuwa-skill`
- Upstream skill name: `huashu-nuwa`
- Local install name: `nuwa-skill`
- License: MIT

## 这次适配做了什么

这不是“把文件原样拷过来”，而是把一个强绑定 Claude/skills.sh 宿主假设的 meta-skill，改造成了 OpenCode 可直接加载的本地技能。

核心改动：

- 把主技能 frontmatter 改成 OpenCode 可发现的本地 skill 形式
- 移除了对 `.claude/skills/` 和 `$CLAUDE_SKILL_DIR` 的依赖
- 把生成目标改成 OpenCode 的 skill 安装目录约定
- 引入 staging -> validate -> install 的两段式流程，避免半成品直接污染 live skills
- 保留上游方法论文档与核心 Python 脚本，并把脚本 usage 改成 OpenCode 语义
- 修补了 `download_subtitles.sh` 的 marker 缺陷，并把它降级为可选增强
- 重写了下游 `skill-template.md`，使生成物的 `description` 以“何时使用”为中心，更符合 OpenCode 的触发方式

## 目录内容

```text
nuwa-skill/
├── README.md
├── UPSTREAM-README.md
├── LICENSE
├── SKILL.md
├── references/
│   ├── extraction-framework.md
│   └── skill-template.md
└── scripts/
    ├── download_subtitles.sh
    ├── install_generated_skill.py
    ├── merge_research.py
    ├── quality_check.py
    └── srt_to_transcript.py
```

## 为什么没有把上游 examples/ 和 assets/ 一起打进来

这次迁移的目标是**把 skill 本体完美适配到 OpenCode**，不是把整个营销型仓库镜像到本机。

对运行真正有影响的是：

- `SKILL.md`
- `references/`
- `scripts/`
- `LICENSE`

上游 `examples/` 和展示型 `assets/` 对 skill 的触发、生成、安装都不是必需品，因此没有作为本地运行时依赖一并复制。需要查阅示例时，直接参考上游仓库即可。

## OpenCode 语义下的关键差异

- **技能落点**：
  - 全局 skill：`~/.config/opencode/skills/<name>/`
  - 项目 skill：`<project-root>/.opencode/skills/<name>/`
- **生成流程**：
  - 先在 staging 目录构建生成物
  - 跑质量检查
  - 再安装到最终 skill 目录
- **脚本执行**：
  - 运行 bundled scripts 时，把 Bash `workdir` 设为技能根目录
  - 或显式使用绝对路径
- **工具能力**：
  - 不再写死 `WebSearch`、`agent-reach`、`gemini-video` 等工具名
  - 改为按当前 OpenCode 环境提供的等价能力执行

## 本地验证

可用以下方式验证这个 skill 目录是健康的：

```bash
python "/home/zhurui/.config/opencode/skills/skill-creator/scripts/quick_validate.py" \
  "/home/zhurui/.config/opencode/skills/nuwa-skill"
```

如需打包成 `.skill`，不要直接用 `python /.../package_skill.py` 的文件路径调用方式；那个脚本依赖以模块方式运行。优先使用本技能附带的包装脚本：

```bash
python3 "/home/zhurui/.config/opencode/skills/nuwa-skill/scripts/package_generated_skill.py" \
  "/home/zhurui/.config/opencode/skills/nuwa-skill" \
  "/tmp/nuwa-skill-dist"
```

如果你就是想直接调用 `skill-creator` 的打包器，也要用模块方式：

```bash
python3 -m scripts.package_skill \
  "/home/zhurui/.config/opencode/skills/nuwa-skill" \
  "/tmp/nuwa-skill-dist"
```

执行这条命令时，`workdir` 应设为：

```text
/home/zhurui/.config/opencode/skills/skill-creator
```

## 使用方式

在 OpenCode 中，用户现在可以直接提出：

- `蒸馏一个 Paul Graham skill`
- `帮我做一个张一鸣视角 skill`
- `更新现有的 Naval perspective`
- `我想找一个适合产品战略判断的思维顾问`

skill 会负责：

1. 确认目标
2. 建立 staging 目录
3. 收集 research 文件
4. 提炼心智模型
5. 生成 OpenCode 原生 skill
6. 校验并安装

如果用户还要求导出分发包，再额外把最终 skill 打包成 `.skill`。

## 上游说明保留

上游 README 原文已保留为 `UPSTREAM-README.md`，用于：

- 回溯原始设计意图
- 后续与 upstream 同步差异
- 检查功能是否偏离原始仓库目标
