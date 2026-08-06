# 嵌入模型

离线使用的本地嵌入模型，供 Magic Context 插件调用。

## 模型

| 模型 | 维度 | 大小 | 用途 |
|------|------|------|------|
| `Xenova/bge-small-zh-v1.5` | 512 | ~91MB | 中英文记忆/文档向量化 |

## 安装

```bash
# 自动安装（推荐）
./install.sh

# 手动安装
MODEL_SRC="./models/embedding/Xenova/bge-small-zh-v1.5"
MODEL_DST="$HOME/.local/share/cortexkit/magic-context/models/Xenova/bge-small-zh-v1.5"
mkdir -p "$(dirname "$MODEL_DST")"
cp -r "$MODEL_SRC" "$MODEL_DST"

# 或创建符号链接（节省磁盘空间）
ln -s "$(pwd)/models/embedding/Xenova/bge-small-zh-v1.5" "$MODEL_DST"
```

## 使用

Magic Context 配置 (`~/.config/cortexkit/magic-context.jsonc`):

```jsonc
{
  "embedding": {
    "provider": "local",
    "model": "Xenova/bge-small-zh-v1.5"
  }
}
```

模型文件须放在 magic-context 的模型缓存目录下，默认路径：
`~/.local/share/cortexkit/magic-context/models/Xenova/bge-small-zh-v1.5/`

## 离线使用

将此仓库完整克隆到离线设备后运行 `install.sh`，模型文件已在仓库中，无需联网下载。

## 更新

上游模型更新于 HuggingFace: <https://huggingface.co/Xenova/bge-small-zh-v1.5>
