#!/usr/bin/env python3
"""
把通过校验的 staging 目录安装到 OpenCode skill 目录。

用法:
    python3 install_generated_skill.py <generated-skill-dir> [--scope global|project] [--project-root PATH] [--destination PATH] [--force] [--dry-run]
"""

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path
from typing import cast


def read_skill_name(skill_md: Path) -> str:
    content = skill_md.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        raise ValueError("SKILL.md 缺少 YAML frontmatter")

    frontmatter = match.group(1)
    name_match = re.search(r"^name:\s*(.+)$", frontmatter, re.MULTILINE)
    if not name_match:
        raise ValueError("frontmatter 中缺少 name")

    name = name_match.group(1).strip().strip('"').strip("'")
    if not re.fullmatch(r"[a-z0-9-]+", name):
        raise ValueError(f"非法 skill 名称: {name}")
    return name


def build_destination(args: argparse.Namespace, skill_name: str) -> Path:
    destination = cast(str | None, args.destination)
    if destination:
        return Path(destination).expanduser().resolve()

    scope = cast(str, args.scope)
    project_root = cast(str | None, args.project_root)
    if scope == "project":
        if not project_root:
            raise ValueError("--scope project 时必须提供 --project-root")
        return Path(project_root).expanduser().resolve() / ".opencode" / "skills" / skill_name

    return Path.home() / ".config" / "opencode" / "skills" / skill_name


def install(source: Path, destination: Path, force: bool, dry_run: bool) -> None:
    if source.resolve() == destination.resolve():
        raise ValueError("源目录与目标目录相同，无需安装")

    if destination.exists() and not force:
        raise FileExistsError(f"目标目录已存在: {destination}，如需覆盖请加 --force")

    if dry_run:
        print(f"[dry-run] source      : {source}")
        print(f"[dry-run] destination : {destination}")
        print(f"[dry-run] force       : {force}")
        return

    destination.parent.mkdir(parents=True, exist_ok=True)

    if destination.exists():
        shutil.rmtree(destination)

    _ = shutil.copytree(source, destination)
    print(f"✅ 已安装到: {destination}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Install a generated OpenCode skill from a staging directory.")
    _ = parser.add_argument("source_dir", help="生成物 skill 目录")
    _ = parser.add_argument("--scope", choices=["global", "project"], default="global")
    _ = parser.add_argument("--project-root", help="项目根目录，仅 project scope 需要")
    _ = parser.add_argument("--destination", help="显式指定目标目录；提供后优先级最高")
    _ = parser.add_argument("--force", action="store_true", help="目标目录已存在时覆盖")
    _ = parser.add_argument("--dry-run", action="store_true", help="只打印将要执行的安装动作")
    args = parser.parse_args()

    source = Path(cast(str, args.source_dir)).expanduser().resolve()
    if not source.exists() or not source.is_dir():
        print(f"❌ 生成物目录不存在: {source}")
        return 1

    skill_md = source / "SKILL.md"
    if not skill_md.exists():
        print(f"❌ 未找到 SKILL.md: {skill_md}")
        return 1

    try:
        skill_name = read_skill_name(skill_md)
        destination = build_destination(args, skill_name)
        install(
            source,
            destination,
            force=cast(bool, args.force),
            dry_run=cast(bool, args.dry_run),
        )
    except Exception as exc:  # noqa: BLE001
        print(f"❌ 安装失败: {exc}")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
