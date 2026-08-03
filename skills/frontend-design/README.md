# frontend-design for OpenCode

## Source

This skill is adapted from Anthropic's Claude Code plugin:

- Upstream plugin: `plugins/frontend-design`
- Repository: <https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design>

## Adaptation Choice

The upstream plugin is not a runtime tool plugin. Its functional core is a single `skills/frontend-design/SKILL.md` file plus Claude-specific plugin metadata in `.claude-plugin/plugin.json`.

For this local OpenCode environment, the correct integration model is a native skill placed under:

`~/.config/opencode/skills/frontend-design/`

This keeps the behavior faithful to the upstream intent while matching OpenCode's native skill discovery.

## Unsupported Upstream Packaging

The following upstream packaging details are Claude Code specific and are intentionally **not** installed here:

- `.claude-plugin/plugin.json`
- Claude marketplace registration
- Claude `/plugin` installation flow
- Claude settings-based plugin activation

OpenCode does not need those pieces for this skill to work.

## Local Verification Expectations

After restarting or reloading OpenCode, `frontend-design` should appear as an available skill through OpenCode's native skill discovery.
