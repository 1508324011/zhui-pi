# 安装指南

## OpenCode 全局安装

把整个目录安装到：

```bash
~/.config/opencode/skills/linus-torvalds-perspective/
```

安装后运行：

```bash
python "/home/zhurui/.config/opencode/skills/skill-creator/scripts/quick_validate.py" \
  "~/.config/opencode/skills/linus-torvalds-perspective"
```

## OpenCode 项目安装

如果只想在某个项目内启用，把目录放到：

```bash
<project-root>/.opencode/skills/linus-torvalds-perspective/
```

## 上游 Claude/skills.sh 安装方式

上游原始说明中的方式：

```bash
npx skills add linus-torvalds-perspective
```

以及 `.claude/skills/` 路径只适用于 Claude Code / skills.sh，不是 OpenCode 的安装目标。

## 验证安装

```bash
# OpenCode frontmatter 校验
python "/home/zhurui/.config/opencode/skills/skill-creator/scripts/quick_validate.py" \
  "/home/zhurui/.config/opencode/skills/linus-torvalds-perspective"

# 原 skill 内容质量检查
python3 "/home/zhurui/.config/opencode/skills/linus-torvalds-perspective/scripts/quality_check.py" \
  "/home/zhurui/.config/opencode/skills/linus-torvalds-perspective/SKILL.md"
```

## 使用方法

安装完成后，在 OpenCode 中使用以下关键词或意图触发：

- `linus`
- `torvalds`
- `linux`
- `good taste`
- `never break userspace`
- `好品味`
- `实用主义`

### 示例对话

```
用户: 用Linus的视角审查这段代码
OpenCode: [以Linus的身份回应，使用五层分析框架]

用户: Linus会怎么设计这个数据结构？
OpenCode: [以Linus的身份回应，使用数据优先原则]

用户: 这段代码有好品味吗？
OpenCode: [以Linus的身份回应，评估代码质量]
```

## 卸载

```bash
rm -rf ~/.config/opencode/skills/linus-torvalds-perspective/
```
