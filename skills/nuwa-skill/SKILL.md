---
name: nuwa-skill
description: |
  把某个人物、主题或模糊需求蒸馏成可安装的 OpenCode 原生 skill。适用于“蒸馏XX”“造一个XX视角 skill”“更新XX的 perspective”“我想要一个像XX那样思考的顾问”这类请求；会完成资料收集、框架提炼、生成 OpenCode 兼容的 skill 目录，并在校验通过后安装到本地 skill 目录。
license: MIT
compatibility: OpenCode native skill. Optional Bash + Python 3 for bundled scripts; yt-dlp is only needed for subtitle download.
metadata:
    skill-author: Huashu, adapted for local OpenCode installation
    upstream-source: https://github.com/alchaincyf/nuwa-skill
    upstream-skill-name: huashu-nuwa
    local-install-name: nuwa-skill
    adaptation-target: OpenCode native skill
---

# nuwa-skill

这个技能的目标不是“模仿名人说话”，而是把某个人物或主题蒸馏成一个**可安装、可触发、可继续更新**的 OpenCode 原生 skill。

交付物必须是一个完整的技能目录，而不是一段 prompt 草稿。

## OpenCode 运行契约

- 这是 **OpenCode 原生 skill**，不是 Claude Code skill，不是 plugin，也不是 MCP 服务。
- **不要**假设存在 `.claude/skills/`、`$CLAUDE_SKILL_DIR`、Claude 专属命令或 Claude 专属工具名。
- 生成物的最终安装位置只能是：
  - 全局：`~/.pi/agent/skills/<skill-name>/`
  - 项目：`<project-root>/.agents/skills/<skill-name>/`
- 在校验通过前，**不要直接写入 live skill 目录**；先写 staging 目录，再安装。
- 运行本技能附带脚本时，把 Bash `workdir` 显式设为**本技能根目录**，或使用绝对路径；不要假设宿主会自动切到本目录。
- 外部能力按“能力类型”描述，不绑定专有工具名：网页搜索、网页读取、PDF 读取、视频转录、子 agent 并行、Python 脚本执行都视为可选能力，而不是写死的依赖。

## 何时使用

在以下情况使用本技能：

- 用户明确要求蒸馏某个人物、作者、创始人、投资人、研究者、创作者或主题
- 用户要求“做一个某某视角 skill / perspective / 顾问 / 思维方式”
- 用户要求更新现有的人物视角 skill
- 用户只有模糊需求，但本质上是在寻找“应该借用谁的思维方式”

典型触发语句：

- “蒸馏芒格”
- “造一个乔布斯视角 skill”
- “更新 Naval 的 perspective”
- “我想要一个像 Paul Graham 那样思考的顾问”
- “有没有一种思维方式能帮我判断产品战略”

## 输出契约

你的输出必须是一个**可安装的 OpenCode 技能目录**，而不是只给用户一份 markdown 文本。

### Staging 目录

优先使用 staging 目录构建生成物：

- 项目内构建：`<project-root>/.pi/nuwa-build/<skill-name>/`
- 无项目上下文时：`~/tmp/nuwa-build/<skill-name>/`

### 生成物目录结构

```text
<build-root>/<skill-name>/
├── SKILL.md
├── references/
│   ├── research/
│   │   ├── 01-writings.md
│   │   ├── 02-conversations.md
│   │   ├── 03-expression-dna.md
│   │   ├── 04-external-views.md
│   │   ├── 05-decisions.md
│   │   └── 06-timeline.md
│   └── sources/
│       ├── books/
│       ├── transcripts/
│       └── articles/
└── scripts/
```

如果最终 skill 不需要自带额外脚本，可以不创建生成物内的 `scripts/`；但 `references/research/` 必须完整存在。

### 安装位置

校验通过后，再把生成物安装到：

- 全局：`~/.pi/agent/skills/<skill-name>/`
- 项目：`<project-root>/.agents/skills/<skill-name>/`

优先用本技能的安装脚本完成这一步：

```bash
python "./scripts/install_generated_skill.py" "<build-root>/<skill-name>" --scope global
```

或：

```bash
python "./scripts/install_generated_skill.py" "<build-root>/<skill-name>" --scope project --project-root "<project-root>"
```

## 工作流

### Phase 0: 入口分流

先判断用户输入属于哪一类：

- **明确目标**：已经给出人名或主题，直接进入 Phase 1
- **模糊需求**：用户只说困惑或目标，先用最多 1-2 个追问定位，再推荐 2-3 个候选人物或主题

如果用户最终没有选定目标，只问一个精确问题后停止，不要无限追问。

### Phase 1: 确认目标与安装范围

在继续之前确认四件事：

1. 蒸馏对象是谁，是否需要聚焦某个维度
2. 是新建 skill 还是更新已有 skill
3. 最终安装到全局还是项目目录
4. 用户是否提供本地一手素材（PDF、字幕、访谈 transcript、博客导出、内部文档）

默认策略：

- 未特别说明时，生成**全局 skill**
- 未提供素材时，走网络资料调研
- 未特别指定维度时，做完整人物画像

### Phase 2: 创建 staging 目录

立即创建 staging 目录和 research 子目录。不要把半成品写进 live skill 目录。

如果是更新已有 skill：

- 先读取现有 skill 的 `SKILL.md`
- 识别当前调研日期、已有心智模型、最近动态 section
- 只刷新必要维度，而不是默认整份重写

### Phase 3: 资料采集

优先级固定如下：

1. 用户提供的一手素材
2. 本人著作、长文、论文、newsletter
3. 长访谈、播客、演讲 transcript
4. 决策记录、时间线、公开行动
5. 他人分析、传记、批评

信息源黑名单保持严格：

- 知乎
- 微信公众号
- 百度百科 / 百度知道

如果环境支持子 agent，并且多个调研维度彼此独立，可以并行；否则串行完成。无论是否并行，**每个维度都必须落盘到 `references/research/*.md`**。

标准六维：

- `01-writings.md`：著作、长文、系统性表达
- `02-conversations.md`：播客、访谈、AMA、问答
- `03-expression-dna.md`：碎片表达、社交媒体、风格信号
- `04-external-views.md`：批评、传记、第三方观察
- `05-decisions.md`：重大决策、转折点、行为记录
- `06-timeline.md`：完整时间线与最近动态

### Phase 4: 调研 Review

调研完成后，如果需要快速汇总，运行：

```bash
python "./scripts/merge_research.py" "<build-root>/<skill-name>"
```

用它检查三件事：

- 维度是否缺失
- 来源数量是否过低
- 有没有明显矛盾需要在成品里保留

当资料明显不足时，不要硬编；应该在最终 skill 的诚实边界里显式承认薄弱维度。

### Phase 5: 提炼

读取 `references/extraction-framework.md`，只把真正稳定、可迁移、可生成新判断的内容提炼为心智模型。

最低要求：

- 3-7 个核心心智模型
- 5-10 条决策启发式
- 明确的表达 DNA
- 明确的价值观与反模式
- 明确的诚实边界
- 保留矛盾与内在张力，不要抹平

如果一个观点只有单一来源、没有跨场景复现、对新问题没有生成力，就把它降级成启发式或直接丢弃。

### Phase 6: 生成 OpenCode 原生 skill

读取 `references/skill-template.md` 生成最终 `SKILL.md`。

生成时必须遵守下面几条规则：

- frontmatter `name` 使用 kebab-case
- frontmatter `description` 必须是**触发导向**，明确说明“什么时候用”，而不是只写标题
- 生成的 skill 必须是 OpenCode 原生目录结构，不得引用 `.claude/skills`
- 生成的角色视角 skill 在激活后默认直接以第一人称回应，但必须保留诚实边界
- 如果问题依赖最新事实，生成的下游 skill 必须先研究再回答，而不是凭记忆编造

### Phase 7: 校验

生成完 `SKILL.md` 后，运行：

```bash
python "./scripts/quality_check.py" "<build-root>/<skill-name>/SKILL.md"
```

如果不通过：

- 不要安装
- 回到提炼或模板填充阶段修复

通过后再进入安装步骤。

### Phase 8: 安装

优先使用安装脚本完成最终落地：

```bash
python "./scripts/install_generated_skill.py" "<build-root>/<skill-name>" --scope global
```

或：

```bash
python "./scripts/install_generated_skill.py" "<build-root>/<skill-name>" --scope project --project-root "<project-root>"
```

如果目标已存在：

- 没有明确要求时不要覆盖
- 只有在用户确认更新/替换时才使用 `--force`

## 模糊需求的推荐规则

当用户只给需求、没给人物时，你的任务不是硬猜，而是用最少追问帮助用户定位。

推荐格式：

```markdown
### 候选 1: [人物或主题]
**核心镜片**：[一句话说清楚这个视角怎么看世界]
**为什么适合**：[直接映射到用户的需求]
**局限**：[这个视角帮不了什么]
```

推荐数量控制在 2-3 个。不要堆太多候选。

## 更新模式

当用户要求更新已有 skill：

- 读取现有 `SKILL.md`
- 读取现有 `references/research/`（如果在）
- 优先刷新最近 12 个月动态、重大决策、表达变化、公开立场变化
- 只有在新证据足够强时，才改写心智模型本体
- 完成后重新跑一次 `quality_check.py`

## 可选增强

这些能力是增强，不是硬依赖：

- 视频字幕下载：`scripts/download_subtitles.sh`
- SRT/VTT 转 transcript：`scripts/srt_to_transcript.py`
- PDF 阅读、网页抓取、网页搜索、子 agent 并行：按当前宿主能提供的能力使用

如果宿主没有某项能力，就降级到当前环境可用的方式，不要因为缺少某个专有工具名而中断。

## 何时停止

任务在以下条件全部满足后才算完成：

- 目标人物或主题已明确
- research 文件已落盘
- 最终 `SKILL.md` 已生成
- `quality_check.py` 通过
- 已按用户要求安装到全局或项目 skill 目录
- 向用户报告了安装位置、更新方式和已知边界

## Bundled Resources

### References

- `references/extraction-framework.md`
  - 在 Phase 5 提炼时读取
  - 用来判断什么才算真正的心智模型、怎么处理张力与信息不足

- `references/skill-template.md`
  - 在 Phase 6 生成最终 skill 时读取
  - 这是 OpenCode 版下游人物/主题 skill 模板

### Scripts

- `scripts/merge_research.py`
  - 汇总 research 目录，生成调研 review 摘要

- `scripts/quality_check.py`
  - 检查最终 `SKILL.md` 是否满足最小质量要求

- `scripts/install_generated_skill.py`
  - 把通过校验的 staging 目录安装到 OpenCode 的 live skill 目录

- `scripts/package_generated_skill.py`
  - 当用户要求导出或分发 `.skill` 包时使用
  - 包装 `skill-creator` 的打包器，避免直接文件调用导致的 Python 导入问题

- `scripts/srt_to_transcript.py`
  - 清洗字幕文件

- `scripts/download_subtitles.sh`
  - 尝试从 YouTube 下载字幕；只有当环境中存在 `yt-dlp` 时才使用
