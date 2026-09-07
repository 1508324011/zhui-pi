---
name: bidirectional-align
description: Enforce a pre-work alignment protocol before ambiguous, high-impact, or easily misunderstood tasks. Use when the user mentions bidirectional alignment, asks to align first, requests planning before execution, or when Codex is about to install services, change configuration, expose ports, handle secrets, delete files, update code, create skills, draft important plans, or perform work where misunderstanding the intent or final deliverable would create wasted effort.
---

# Bidirectional Align

## Overview

Use this skill to align with the user before doing substantive work. Confirm both the original intent and the expected final result, then proceed only when the next action is proportional to the alignment confidence.

Bidirectional alignment means:
- Align the **goal intent**: why this is being done, what problem should actually be solved, and what should not be optimized by accident.
- Align the **result shape**: what should exist when finished, what form it should take, what boundaries apply, and what counts as done.

## Core Rule

Before acting, state the alignment in the user's language:

```text
I understand the goal intent as: ...
I understand the expected result as: ...
I will do: ...
I will not do yet: ...
The main uncertainty is: ...
```

If the goal intent or result shape is unclear, ask only the smallest number of questions needed to remove the ambiguity. Do not turn alignment into a questionnaire when a reasonable assumption is safe; state the assumption and its consequence.

## Workflow

1. Restate the user's request in terms of intent, not just literal wording.
2. Identify the expected deliverable and completion standard.
3. Name any likely mismatch risks: terminology, hidden constraints, technical preference, method preference, missing context, or scope ambiguity.
4. Choose an action mode:
   - **Proceed** when both intent and result are clear.
   - **Proceed with stated assumptions** when uncertainty is low and reversible.
   - **Pause and ask** when uncertainty could change the work, create risk, or waste significant effort.
5. After alignment, execute the work and keep future decisions tied to the confirmed intent/result.

## Strictness

Pause and ask before:
- destructive actions
- credential or secret handling
- network exposure or service installation
- large refactors or persistent configuration changes
- creating reusable assets such as skills, templates, or policies
- choosing between multiple methods with different tradeoffs

Proceed with assumptions for:
- small text edits
- low-risk exploration
- reversible local checks
- drafting options explicitly labeled as draft or exploration

## Output Patterns

For quick alignment:

```text
Before I do that, I want to align on two things:
Goal intent: ...
Expected result: ...
If that is right, I will ...
```

For work already in progress:

```text
Alignment check:
The goal remains ...
The result we are aiming for is ...
This decision affects ...
I recommend ...
```

For a user using AI to think through work:

```text
Let's align before generating content:
Why are you doing this?
What should the final output help you decide or accomplish?
What should the AI avoid doing for you?
```

## Reference

For reusable prompts and examples, read [references/templates.md](references/templates.md).
