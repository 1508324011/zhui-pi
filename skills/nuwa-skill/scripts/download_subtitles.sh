#!/bin/bash
# 从 YouTube 视频下载字幕。
# 用法: ./download_subtitles.sh <YouTube_URL> [输出目录]

set -euo pipefail

URL="${1:-}"
OUTPUT_DIR="${2:-.}"

if [ -z "$URL" ]; then
    echo "用法: ./download_subtitles.sh <YouTube_URL> [输出目录]"
    exit 1
fi

if ! command -v yt-dlp >/dev/null 2>&1; then
    echo "❌ 未找到 yt-dlp。请先安装 yt-dlp 后再运行。"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"
MARKER="$(mktemp)"
trap 'rm -f "$MARKER"' EXIT

find_recent_subtitle() {
    find "$OUTPUT_DIR" -type f \( -name "*.srt" -o -name "*.vtt" \) -newer "$MARKER" -print | sort | head -n 1
}

echo ">>> 检查可用字幕..."
yt-dlp --list-subs --no-download "$URL" 2>/dev/null | tail -20 || true

echo ""
echo ">>> 尝试下载人工字幕（中文优先）..."
if yt-dlp --write-subs --sub-langs "zh-Hans,zh-Hant,zh,zh-CN,zh-TW" --sub-format srt --skip-download -o "$OUTPUT_DIR/%(title)s" "$URL" 2>/dev/null; then
    FOUND="$(find_recent_subtitle || true)"
    if [ -n "$FOUND" ]; then
        echo "✅ 下载成功: $FOUND"
        exit 0
    fi
fi

echo ">>> 无中文人工字幕，尝试英文..."
if yt-dlp --write-subs --sub-langs "en,en-US,en-GB" --sub-format srt --skip-download -o "$OUTPUT_DIR/%(title)s" "$URL" 2>/dev/null; then
    FOUND="$(find_recent_subtitle || true)"
    if [ -n "$FOUND" ]; then
        echo "✅ 下载成功: $FOUND"
        exit 0
    fi
fi

echo ">>> 无人工字幕，尝试自动生成字幕..."
if yt-dlp --write-auto-subs --sub-langs "zh-Hans,zh,en" --sub-format srt --skip-download -o "$OUTPUT_DIR/%(title)s" "$URL" 2>/dev/null; then
    FOUND="$(find_recent_subtitle || true)"
    if [ -n "$FOUND" ]; then
        echo "✅ 自动字幕下载成功: $FOUND"
        exit 0
    fi
fi

echo "❌ 未找到任何可用字幕"
exit 1
