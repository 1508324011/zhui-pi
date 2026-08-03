#!/usr/bin/env python3
"""
检查生成的 SKILL.md 是否满足 nuwa-skill 的最小质量标准。

用法:
    python3 quality_check.py <SKILL.md-path>

示例:
    python3 quality_check.py ~/.opencode/nuwa-build/naval-perspective/SKILL.md
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


def extract_frontmatter(content: str) -> str | None:
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    return match.group(1) if match else None


def extract_level2_section(content: str, *keywords: str) -> str | None:
    joined = "|".join(re.escape(keyword) for keyword in keywords)
    pattern = re.compile(rf"^##\s+.*(?:{joined}).*$", re.MULTILINE | re.IGNORECASE)
    match = pattern.search(content)
    if not match:
        return None

    start = match.end()
    next_section = re.compile(r"^##\s+", re.MULTILINE).search(content, start)
    end = next_section.start() if next_section else len(content)
    return content[start:end]


def check_mental_models(content: str) -> tuple[bool, str]:
    models = re.findall(r"^###\s+(?:模型|Model|心智模型)\s*\d", content, re.MULTILINE)
    if not models:
        in_section = False
        count = 0
        for line in content.splitlines():
            if re.match(r"^##\s+.*(?:心智模型|Mental Model)", line, re.IGNORECASE):
                in_section = True
                continue
            if in_section and re.match(r"^##\s+", line):
                break
            if in_section and re.match(r"^###\s+", line):
                count += 1
        if count == 0:
            return False, "未检测到心智模型 section"
        passed = 3 <= count <= 7
        return passed, f"{count}个心智模型 {'✅' if passed else '❌ (应为3-7个)'}"

    count = len(models)
    passed = 3 <= count <= 7
    return passed, f"{count}个心智模型 {'✅' if passed else '❌ (应为3-7个)'}"


def check_limitations(content: str) -> tuple[bool, str]:
    found = bool(re.search(r"局限|失效|不适用|盲区|limitation|blind spot", content, re.IGNORECASE))
    return found, "有局限性标注 ✅" if found else "❌ 未找到局限性描述"


def check_expression_dna(content: str) -> tuple[bool, str]:
    has_section = bool(re.search(r"表达\s*DNA|Expression\s*DNA|表达风格", content, re.IGNORECASE))
    if not has_section:
        return False, "❌ 未找到表达DNA section"
    markers = len(re.findall(r"句式|词汇|语气|幽默|节奏|确定性|引用|口头禅", content))
    passed = markers >= 3
    return passed, f"表达DNA特征: {markers}项 {'✅' if passed else '❌ (应≥3项)'}"


def check_honest_boundary(content: str) -> tuple[bool, str]:
    boundary_text = extract_level2_section(content, "诚实边界", "Honest Boundary")
    if not boundary_text:
        return False, "❌ 未找到诚实边界 section"
    items = re.findall(r"^[-*]\s+", boundary_text, re.MULTILINE)
    count = len(items)
    passed = count >= 3
    return passed, f"诚实边界: {count}条 {'✅' if passed else '❌ (应≥3条)'}"


def check_tensions(content: str) -> tuple[bool, str]:
    markers = len(re.findall(r"张力|矛盾|tension|paradox|一方面.*另一方面|既.*又", content, re.IGNORECASE))
    passed = markers >= 2
    return passed, f"内在张力: {markers}处 {'✅' if passed else '❌ (应≥2处)'}"


def check_primary_sources(content: str) -> tuple[bool, str]:
    source_text = extract_level2_section(content, "来源", "Source", "Reference")
    if not source_text:
        return True, "未找到来源 section（跳过检查）"
    primary = len(re.findall(r"一手|primary|本人著作|原始", source_text, re.IGNORECASE))
    secondary = len(re.findall(r"二手|secondary|转述|评论", source_text, re.IGNORECASE))
    total = primary + secondary
    if total == 0:
        return True, "未标记来源类型（跳过检查）"
    ratio = primary / total
    passed = ratio > 0.5
    return passed, f"一手来源占比: {primary}/{total} ({ratio:.0%}) {'✅' if passed else '❌ (应>50%)'}"


def check_trigger_description(content: str) -> tuple[bool, str]:
    frontmatter = extract_frontmatter(content)
    if not frontmatter:
        return False, "❌ 未找到 frontmatter"

    block_match = re.search(r"^description:\s*\|\s*$", frontmatter, re.MULTILINE)
    if block_match:
        start = block_match.end()
        remainder = frontmatter[start:]
        lines: list[str] = []
        for line in remainder.splitlines():
            if line.startswith((" ", "\t")):
                lines.append(line.strip())
            elif not line.strip():
                lines.append("")
            else:
                break
        desc = "\n".join(lines)
    else:
        desc_line = re.search(r"^description:\s*(.+)$", frontmatter, re.MULTILINE)
        desc = desc_line.group(1) if desc_line else ""

    markers = ["当用户", "适用于", "用", "视角", "perspective", "模式"]
    hits = sum(1 for marker in markers if marker in desc)
    passed = hits >= 2 and len(desc.strip()) >= 40
    return passed, f"description 触发语义 {'✅' if passed else '❌'}"


def main() -> int:
    if len(sys.argv) < 2:
        print("用法: python3 quality_check.py <SKILL.md-path>")
        return 1

    skill_path = Path(sys.argv[1]).expanduser().resolve()
    if not skill_path.exists():
        print(f"❌ 文件不存在: {skill_path}")
        return 1

    content = skill_path.read_text(encoding="utf-8")
    checks = [
        ("心智模型数量", check_mental_models),
        ("模型局限性", check_limitations),
        ("表达DNA辨识度", check_expression_dna),
        ("诚实边界", check_honest_boundary),
        ("内在张力", check_tensions),
        ("一手来源占比", check_primary_sources),
        ("触发型描述", check_trigger_description),
    ]

    print(f"质量检查: {skill_path.name}")
    print("=" * 50)

    passed_count = 0
    total = len(checks)
    for name, fn in checks:
        passed, detail = fn(content)
        print(f"  {name:<12} {'✅ PASS' if passed else '❌ FAIL'}  {detail}")
        if passed:
            passed_count += 1

    print("=" * 50)
    print(f"结果: {passed_count}/{total} 通过")

    if passed_count == total:
        print("🎉 全部通过，可以安装")
        return 0
    if passed_count >= total - 1:
        print("⚠️ 基本通过，建议修复剩余项后再安装")
        return 1

    print("❌ 多项不通过，建议回到提炼或模板填充阶段")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
