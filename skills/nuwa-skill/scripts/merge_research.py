#!/usr/bin/env python3
"""
合并 6 个 research 文件，生成调研 Review 摘要。

用法:
    python3 merge_research.py <generated-skill-dir>

示例:
    python3 merge_research.py ~/.opencode/nuwa-build/paul-graham-perspective
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import cast

AGENTS = {
    "01-writings": "著作",
    "02-conversations": "对话",
    "03-expression-dna": "表达",
    "04-external-views": "他者",
    "05-decisions": "决策",
    "06-timeline": "时间线",
}


def count_sources(content: str) -> dict[str, int]:
    urls = re.findall(r"https?://[^\s\)]+", content)
    primary = len(re.findall(r"一手|primary|本人|原文|原始|直接引用", content, re.IGNORECASE))
    secondary = len(re.findall(r"二手|secondary|转述|总结|评论|分析", content, re.IGNORECASE))
    source_like_lines = 0

    keywords = [
        "source type",
        "http://",
        "https://",
        "一手",
        "二手",
        "primary",
        "secondary",
        "essay",
        "interview",
        "article",
        "podcast",
        "transcript",
        "book",
        "paper",
        "talk",
        "newsletter",
        "video",
        "著作",
        "访谈",
        "文章",
        "播客",
        "论文",
        "演讲",
    ]

    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line.startswith("-"):
            continue
        lowered = line.lower()
        if "note" in lowered or "notes:" in lowered:
            continue
        if any(keyword in lowered for keyword in keywords):
            source_like_lines += 1

    estimated_sources = max(len(set(urls)), source_like_lines, primary + secondary)
    return {
        "unique_urls": len(set(urls)),
        "primary_markers": primary,
        "secondary_markers": secondary,
        "estimated_sources": estimated_sources,
    }


def extract_key_findings(content: str, max_items: int = 3) -> list[str]:
    headings = re.findall(r"^##\s+(.+)$", content, re.MULTILINE)
    if headings:
        return headings[:max_items]

    bold_items = re.findall(r"\*\*(.+?)\*\*", content)
    if bold_items:
        return bold_items[:max_items]

    lines = [line.strip() for line in content.splitlines() if line.strip() and not line.startswith("#")]
    result: list[str] = []
    for line in lines[:max_items]:
        result.append(f"{line[:50]}..." if len(line) > 50 else line)
    return result


def find_contradictions(files: dict[str, str]) -> list[str]:
    contradictions: list[str] = []
    for name, content in files.items():
        matches = cast(list[str], re.findall(r"(?:矛盾|相反|但实际上|然而.*?不同|争议).{0,100}", content))
        for match in matches:
            contradictions.append(f"{AGENTS.get(name, name)}: {match[:80]}")
    return contradictions[:5]


def main() -> int:
    if len(sys.argv) < 2:
        print("用法: python3 merge_research.py <generated-skill-dir>")
        return 1

    skill_dir = Path(sys.argv[1]).expanduser().resolve()
    research_dir = skill_dir / "references" / "research"

    if not research_dir.exists():
        print(f"❌ 目录不存在: {research_dir}")
        return 1

    files: dict[str, str] = {}
    rows: list[str] = []
    total_sources = 0
    total_primary = 0
    total_secondary = 0
    missing: list[str] = []

    for key, label in AGENTS.items():
        md_file = research_dir / f"{key}.md"
        if not md_file.exists():
            missing.append(label)
            rows.append(f"│ {label:<12} │ {'❌ 缺失':<8} │ {'—':<24} │")
            continue

        content = md_file.read_text(encoding="utf-8")
        files[key] = content
        stats = count_sources(content)
        findings = extract_key_findings(content)

        total_sources += stats["estimated_sources"]
        total_primary += stats["primary_markers"]
        total_secondary += stats["secondary_markers"]

        findings_str = ", ".join(findings) if findings else "—"
        if len(findings_str) > 40:
            findings_str = findings_str[:37] + "..."

        rows.append(f"│ {label:<12} │ {stats['estimated_sources']:<8} │ {findings_str:<24} │")

    contradictions = find_contradictions(files)

    print("┌──────────────┬──────────┬──────────────────────────┐")
    print("│ Agent        │ 来源数量  │ 关键发现                  │")
    print("├──────────────┼──────────┼──────────────────────────┤")
    for row in rows:
        print(row)
    print("├──────────────┼──────────┼──────────────────────────┤")

    if total_primary + total_secondary > 0:
        ratio = f"{total_primary}/{total_primary + total_secondary}"
    else:
        ratio = "未标记"

    print(f"│ 总来源数      │ {total_sources:<8} │ 一手占比: {ratio:<15} │")

    if contradictions:
        print(f"│ 矛盾点        │ {len(contradictions)}处      │ {contradictions[0][:24]:<24} │")
    else:
        print(f"│ 矛盾点        │ 0处      │ {'—':<24} │")

    if missing:
        print(f"│ 信息不足维度   │ {len(missing)}个      │ {', '.join(missing):<24} │")
    else:
        print(f"│ 信息不足维度   │ 无       │ {'—':<24} │")

    print("└──────────────┴──────────┴──────────────────────────┘")

    if total_sources < 10:
        print("\n⚠️ 总来源数 <10，建议降低期望或补充调研")
    if missing:
        print(f"\n⚠️ 缺失维度: {', '.join(missing)}，建议补充或在诚实边界中标注")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
