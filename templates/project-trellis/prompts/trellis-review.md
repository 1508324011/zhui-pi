# Review Current Trellis Work

Perform the current task's independent read-only review.

1. Load the canonical task and workspace state:

```bash
python3 ./.trellis/scripts/get_context.py
```

2. Use the active task object from that output and the context injected by the Trellis integration. Do not invoke an unsupported task-resolution subcommand.
3. Dispatch `trellis-check` with a narrowly scoped read-only review request. The reviewer must not modify project files.
4. Require a fenced `acceptance-report` JSON block. Treat missing, invalid, or rejected acceptance as a failed review even when child execution exits successfully.
5. Read raw artifacts with `trellis_artifact` only when the structured handoff is insufficient.
