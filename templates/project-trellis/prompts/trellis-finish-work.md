# Finish Work

Wrap up the current Trellis session only after implementation, verification, and the human-owned commit phase are complete.

## Step 1: Survey Current State

```bash
python3 ./.trellis/scripts/get_context.py --mode record
```

Use the record view to confirm task state, git status, and the commit that will be recorded.

## Step 2: Follow the Repository Workflow

```bash
cat .trellis/workflow.md
```

Use the repository-owned finish, archive, and session-recording commands. Do not stage or commit unrelated changes, and do not invent missing summaries or test results.
