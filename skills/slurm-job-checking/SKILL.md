---
name: slurm-job-checking
description: Use after submitting any SLURM/sbatch job - requires immediate log checking protocol with error-first verification; never check output files before verifying job health
---

# SLURM 作业检查协议

## Overview

**核心原则：错误优先，日志第一。**

提交作业后不检查错误日志就直接检查输出文件 = 盲目乐观，不是高效工作。

**违反规则的字面意思就是违反规则的精神。**

---

## 铁律

```
提交作业后 30 秒内必须开始检查日志，永远不要先检查业务输出文件
```

如果你没有在检查 `.err` 和 `.out` 文件，你就不能声称作业在正常运行。

---

## 强制检查流程

### 阶段 1：提交时（立即）

```bash
# 1. 记录 JOB_ID（从 sbatch --parsable 输出）
JOB_ID=$(sbatch --parsable ...)

# 2. 保存作业信息到日志文件
echo "$(date): Submitted job ${JOB_ID}" >> .slurm_job_history.log
echo "JOB_ID=${JOB_ID}" >> .slurm_job_history.log
echo "ERR_FILE=slurm-${JOB_ID}.err" >> .slurm_job_history.log
echo "OUT_FILE=slurm-${JOB_ID}.out" >> .slurm_job_history.log
```

### 阶段 2：提交后 30 秒内（必须完成）

```bash
# 第一步：检查作业状态
squeue -j ${JOB_ID} --format="%.10i %.8T %.10M %R"

# 第二步：定位日志文件
ERR_FILE="slurm-${JOB_ID}.err"  # 或 sbatch -e 指定的路径
OUT_FILE="slurm-${JOB_ID}.out"  # 或 sbatch -o 指定的路径

# 第三步：第一优先级 - 检查错误日志
if [ -f "${ERR_FILE}" ]; then
    # 检查致命错误
    if grep -qiE "ERROR|Fatal|Exception|Traceback|Killed|OOM" "${ERR_FILE}"; then
        echo "=== 作业失败 - 立即停止 ==="
        grep -iE "ERROR|Fatal|Exception|Traceback|Killed|OOM" "${ERR_FILE}"
        # 不要继续检查输出文件！
        exit 1
    fi
fi

# 第四步：检查输出日志进度
if [ -f "${OUT_FILE}" ]; then
    echo "=== 作业进度 ==="
    tail -50 "${OUT_FILE}"
fi
```

### 阶段 3：等待作业时

```bash
# 轮询检查（每 60 秒）
while squeue -j ${JOB_ID} -h 2>/dev/null | grep -q .; do
    sleep 60
    
    # 每次轮询都检查错误日志
    if [ -f "${ERR_FILE}" ]; then
        if grep -qiE "ERROR|Fatal|Exception|Traceback|Killed|OOM" "${ERR_FILE}"; then
            echo "作业失败，查看错误日志"
            cat "${ERR_FILE}"
            exit 1
        fi
    fi
    
    echo "作业仍在运行..."
done
```

### 阶段 4：作业完成后

```bash
# 1. 检查最终状态
echo "=== 作业完成状态 ==="
sacct -j ${JOB_ID} --format="JobID,State,ExitCode,Elapsed"

# 2. 检查错误日志（最终）
echo "=== 错误日志检查 ==="
if [ -f "${ERR_FILE}" ]; then
    if [ -s "${ERR_FILE}" ]; then
        echo "错误日志非空:"
        cat "${ERR_FILE}"
    else
        echo "✓ 错误日志为空"
    fi
fi

# 3. 检查输出日志（最终）
echo "=== 输出日志检查 ==="
if [ -f "${OUT_FILE}" ]; then
    echo "输出日志最后 100 行:"
    tail -100 "${OUT_FILE}"
fi

# 4. 最后：检查业务输出文件
echo "=== 业务输出检查 ==="
if [ -f "expected_output_file" ]; then
    ls -lh expected_output_file
    # 验证文件内容（如果有验证脚本）
else
    echo "⚠ 预期输出文件不存在"
fi
```

---

## 检查顺序铁律

**必须严格遵守以下顺序**：

```
1. squeue 检查作业状态
   ↓
2. 检查.err 文件（致命错误检测）
   ↓
3. 检查.out 文件（进度检查）
   ↓
4. 检查业务输出文件（最终验证）
```

**跳过任何步骤 = 盲目检查，不是验证。**

---

## 常见错误

| 错误行为 | 正确做法 |
|---------|---------|
| 直接检查输出文件 | 先检查.err 和.out 日志 |
| 作业失败后继续检查输出 | 立即停止，报告错误 |
| 只看输出文件大小 | 检查日志中的进度标志 |
| 相信"应该没问题" | 用日志证据说话 |
| 等待数小时后才看日志 | 提交后 30 秒内开始检查 |

---

## 危险信号 - 立即停止

出现以下任何情况，**立即停止并报告错误**：

- `.err` 文件包含 `ERROR`、`Fatal`、`Exception`、`Traceback`
- `squeue` 显示作业状态为 `FAILED`、`CANCELLED`、`OUT_OF_MEMORY`
- `sacct` 显示 `ExitCode` 非 0
- 输出日志包含 `Killed`（SLURM 杀死作业）
- 业务输出文件在作业完成后仍然不存在

**不要**：
- 继续检查其他输出文件
- 尝试"再等等看"
- 重新提交作业（先分析失败原因）

---

## 合理化预防

| 借口 | 现实 |
|------|------|
| "输出文件没有，我去看看日志" | 一开始就应该看日志 |
| "应该是小问题，重试一下" | 先分析错误原因 |
| "之前都是这样运行的" | 每次作业都是独立的 |
| "可能是延迟，再等等" | 检查日志，不要猜测 |
| "我想先看看输出目录" | 输出目录不会告诉你为什么失败 |

---

## 关键模式

### 快速状态检查

```bash
# 一句话检查作业状态
squeue -j ${JOB_ID} -h | awk '{print $4}'  # 输出状态列
```

### 错误提取

```bash
# 提取所有错误行
grep -iE "ERROR|Fatal|Exception|Traceback" slurm-*.err

# 提取最后错误（如果有）
tail -50 slurm-${JOB_ID}.err | grep -iE "ERROR|Fatal"
```

### 进度标志检查

```bash
# 检查特定进度标志（根据作业类型调整）
grep -E "Stage.*started|completed|Finished" slurm-${JOB_ID}.out

# 检查是否开始处理
grep -q "BEGIN\|Starting\|Loading" slurm-${JOB_ID}.out && echo "作业已启动"
```

### 完成验证

```bash
# 检查作业正常结束
grep -q "END\|completed\|FINISHED" slurm-${JOB_ID}.out && echo "作业正常结束"

# 检查 SLURM 完成标记
tail -5 slurm-${JOB_ID}.out | grep -q "Exit Code: 0" && echo "成功退出"
```

---

## 何时应用

**每次提交 SLURM 作业后必须使用**：
- `sbatch` 提交任何作业
- 作业数组（`--array`）
- 依赖作业链（`--dependency`）
- 交互式作业（`srun --pty`）

**规则适用于**：
- 确切短语
- 任何变体（"检查作业"、"看看运行得怎么样"）
- 任何暗示检查作业状态的行为

---

## 验证清单

在声称作业正常之前：

- [ ] 记录了 JOB_ID
- [ ] 运行 `squeue -j ${JOB_ID}` 检查状态
- [ ] 检查了 `.err` 文件（无致命错误）
- [ ] 检查了 `.out` 文件（有进度输出）
- [ ] 作业状态为 `COMPLETED` 或 `RUNNING`
- [ ] 退出码为 0（`sacct` 验证）
- [ ] 业务输出文件存在且非空
- [ ] 日志中包含预期的完成标志

**不能勾选所有框？作业可能有问题。重新检查。**

---

## 为什么这很重要

从无数失败案例中学到的教训：

- **浪费数小时等待** → 其实作业一开始就失败了
- **反复检查输出文件** → 从不检查错误日志
- **"应该在工作"** → 实际上 SLURM 根本没调度
- **重试同样的错误** → 从不分析失败原因

**这个协议防止无意义的死循环。**

---

## 底线

```
提交 → 30 秒内查日志 → 有错立即报 → 完成再验证
```

**没有捷径。每次都遵循协议。**

这是不可协商的。
