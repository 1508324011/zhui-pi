#!/usr/bin/env python3
"""
以 OpenCode 友好的方式调用 skill-creator 的打包器。

用法:
    python3 package_generated_skill.py <skill-dir> [output-dir]
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def locate_skill_creator_root() -> Path:
    candidates = [
        Path(__file__).resolve().parents[2] / "skill-creator",
        Path.home() / ".config" / "opencode" / "skills" / "skill-creator",
    ]

    for candidate in candidates:
        package_script = candidate / "scripts" / "package_skill.py"
        if package_script.exists():
            return candidate

    raise FileNotFoundError("未找到 skill-creator；无法调用打包器")


def main() -> int:
    if len(sys.argv) < 2:
        print("用法: python3 package_generated_skill.py <skill-dir> [output-dir]")
        return 1

    skill_creator_root = locate_skill_creator_root()

    skill_path = Path(sys.argv[1]).expanduser().resolve()
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    print(f"📦 使用 skill-creator 打包: {skill_path}")
    print(f"   skill-creator root: {skill_creator_root}")
    if output_dir:
        print(f"   output dir: {Path(output_dir).expanduser().resolve()}")
    print()

    command = [sys.executable, "-m", "scripts.package_skill", str(skill_path)]
    if output_dir:
        command.append(output_dir)

    completed = subprocess.run(command, cwd=skill_creator_root, check=False)
    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())
