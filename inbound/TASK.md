# TASK.md — Migration Instructions for Haiku
# You are Claude Haiku 4.5 operating in Zed editor.
# Read this file completely before taking any action.
# Do not skip steps. Do not assume file contents — read them first.

---

## Your Mission

Migrate files from the `inbound/` folder into the correct locations in this project,
author one missing file, and confirm the build runs cleanly.

---

## Step 0 — Orient Yourself First

Before touching anything, read these files in this order:

1. `inbound/AGENTS.md` — this is your primary reference. It defines the project structure,
   what exists, what doesn't, and what the build system expects.
2. `build.py` — understand exactly which files it reads and in what order.
3. `inbound/developer-soul.md` and `inbound/evaluator-soul.md` — know their content
   before you place them.

Do not proceed to Step 1 until you have read all four.

---

## Step 1 — Place Root-Level Documents

Copy these files from `inbound/` to the **project root** (same level as `build.py`):

| From | To |
|---|---|
| `inbound/AGENTS.md` | `AGENTS.md` |
| `inbound/README.md` | `README.md` |
| `inbound/TODO.md` | `TODO.md` |

If `AGENTS.md`, `README.md`, or `TODO.md` already exist at the root, overwrite them.
Do not delete the originals from `inbound/` — leave `inbound/` intact.

**Do not place SRD.md yet** — it is not in the inbound folder and does not need to move.

---

## Step 2 — Place Soul Files

The soul files must be renamed on placement. Each agent has its own subfolder.

| From | To |
|---|---|
| `inbound/developer-soul.md` | `src/agents/developer/soul.md` |
| `inbound/evaluator-soul.md` | `src/agents/evaluator/soul.md` |

If `src/agents/developer/` or `src/agents/evaluator/` do not exist, create them.
If `soul.md` already exists in either location, overwrite it.

---

## Step 3 — Author `src/agents/evaluator/memory.json`

This file does not exist yet. You must create it.

First, read `src/agents/developer/memory.json` to understand the schema.
Then, read `inbound/evaluator-soul.md` to understand Eulalia's character and responsibilities.

Author `src/agents/evaluator/memory.json` using the same schema as the developer version,
adapted for Eulalia. Use these guidelines:

- `agent_role`: `"evaluator"`
- `current_focus`: `null` (no active task yet)
- `last_task_processed_at`: `null`
- `checklist_items`: create a reasonable default set reflecting Eulalia's review responsibilities.
  Suggested items (enabled by default): Security Audit, Type Safety, Code Clarity,
  Test Coverage, Documentation Completeness, API Contract Validity.
  Add others that make sense given her soul file.
- Any evaluator-specific fields from the schema: populate with sensible defaults.
- Any developer-specific fields (e.g. `preferred_linting_tools`, `code_style_guide`): omit entirely.

The file must be valid JSON. Validate it before saving — `build.py` will fail at `json.load()`
if it is malformed.

---

## Step 4 — Verify build.py References

Open `build.py` and confirm it reads the following files (these are the only ones it needs
from the agent folders at this stage):

- `src/agents/developer/soul.md`
- `src/agents/evaluator/soul.md`
- `src/agents/developer/memory.json`
- `src/agents/evaluator/memory.json`

If any of these paths differ in `build.py` (e.g. it uses a different filename or subfolder),
update `build.py` to match the paths above. Do not rename the files to match a broken path —
fix the path in `build.py`.

Make no other changes to `build.py`.

---

## Step 5 — Run the Build

Run:
```bash
python3 build.py
```

Expected output:
```
✅  Built index.html (... bytes)
    Pages:   4 injected
    JS files: 7 bundled
    Soul files: developer + evaluator embedded
```

---

## Step 6 — Report

After the build, post a brief summary covering:

1. **Files placed** — list each file and its destination
2. **Files authored** — confirm `evaluator/memory.json` was created; show its contents
3. **Build result** — paste the full terminal output from `python3 build.py`
4. **Anything uncertain or skipped** — flag it clearly so the human can review

If the build fails, do not attempt to fix `build.py` beyond what Step 4 describes.
Report the error output in full and stop. The human will decide what to do next.

---

## What You Must Not Do

- Do not edit `index.html` — it is generated output
- Do not modify any file in `src/js/`, `src/pages/`, or `src/styles/`
- Do not install packages, run npm, or add any toolchain
- Do not create any files not listed in this task
- Do not summarize or paraphrase file contents when placing them — copy exactly as-is
- Do not proceed past a failed step — report and stop
