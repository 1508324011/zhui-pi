# skill-creator

This directory installs Anthropic's upstream `skill-creator` skill into the local OpenCode skill library.

## Source

- Upstream: https://github.com/anthropics/skills/tree/main/skills/skill-creator
- Installed at: `/home/zhurui/.config/opencode/skills/skill-creator`

## OpenCode adaptation

- The skill name remains `skill-creator` because there was no local naming collision.
- `SKILL.md` has been adapted to explain the OpenCode-native workflow and to clearly mark Claude-Code-specific trigger optimization scripts as upstream reference utilities.
- The bundled `scripts/quick_validate.py` and `scripts/package_skill.py` remain directly usable here.
- The bundled `scripts/run_eval.py`, `scripts/run_loop.py`, and `scripts/improve_description.py` are preserved for completeness but still target Claude Code internals and are not the default OpenCode path.

## Bundled upstream assets

The original agents, assets, references, eval viewer, and scripts were copied into this local installation so the upstream skill remains inspectable and self-contained.
