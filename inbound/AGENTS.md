# AGENTS.md — AI Agent Context File
# Read this before touching any file in this repository.
# This file is the authoritative source of truth for structure, behavior, and open work.
# It supersedes SRD.md and TODO.md wherever they conflict.

---

## What This Project Is

AWM (AI Workflow Manager) — a single-file SPA that orchestrates a small AI development team.
The team consists of two agents: Draco (Developer) and Eulalia (Evaluator).
A human operator creates tasks and gives final sign-off. Everything in between runs autonomously.

The entire application is built by `build.py` and delivered as one file: `index.html`.

---

## The Team

### Draco — Developer
Builds implementations. Brooding, terse, dry gallows humor. Professionally unimpeachable.
Posts plans before building. Proposes branch names and commit messages as task card fields.
Refers to the human as `@human`. Signs posts `— Draco`.
Soul file: `src/agents/developer/soul.md`
Memory seed: `src/agents/developer/memory.json`

### Eulalia — Evaluator
Reviews plans and completed work. Warm, thorough, well-spoken. Formally encouraging.
Reviews Draco's plan *before* he builds — raises concerns early, not just at the end.
Asks the human's name on first contact and uses it from then on. Signs posts `— Eulalia`.
Soul file: `src/agents/evaluator/soul.md`
Memory seed: `src/agents/evaluator/memory.json`

### @human — Operator
Creates tasks. Gives final sign-off to close them. Can intervene at any point.
Agents escalate to @human after two unresolved rounds. Human sign-off is the only "done" signal.

---

## Communication Rules

### Message Board — shared team space
- All agents see all posts at all times
- Any agent may respond to any post if they have something useful to add
- Not restricted to @mentions — agents respond proactively when relevant
- Draco and Eulalia's personalities show here (see soul files)
- Eulalia asks for human name(s) on first contact; uses names in all subsequent @human posts

### Chat — private
- One human ↔ one agent only
- No crossover between agents
- Same personalities apply, but it's a direct conversation, not a team thread

---

## Autonomous Workflow

Task creation triggers the full loop automatically. No human hand-holding between steps.

```
[Human creates task]
       ↓
[Draco reads task → posts implementation plan to board]
[Sets branch name + commit message fields on task card]
       ↓
[Eulalia reviews plan → posts any plan-level concerns]
       ↓                    ↑ (if BLOCKER on plan, Draco addresses, loop)
[Draco builds]
       ↓
[Draco marks ready for review]
       ↓
[Eulalia reviews work → posts consolidated findings]
       ↓
[Draco addresses BLOCKERs]
       ↓
[Eulalia re-reviews → approves or escalates]
       ↓
[Eulalia posts: ready for sign-off]
       ↓
[Human reviews → closes task]
```

Maximum two rounds of Draco/Eulalia negotiation before escalating to @human.
Human sign-off is the only action that closes a task. Agents cannot self-close.

### Task States
`TASK_CREATED` → `IN_PROGRESS` → `UNDER_REVIEW` → `RESOLVED_APPROVED` | `RESOLVED_REJECTED` | `ESCALATED`

---

## Git Output (text only — no CLI calls)

Draco proposes branch name and commit message as **dedicated fields on the task card**.
No actual git commands are executed by the SPA. Output is text for a human or system to use.

Branch naming:
```
feature/{task-id}-{short-description}
bugfix/{task-id}-{short-description}
chore/{description}
```

Commit message format:
```
feat: description
fix: description
docs: description
chore: description
```

---

## Build System

**Run:** `python3 build.py`
**Output:** `index.html` (project root) — the complete deployable artifact

No npm. No bundler. No minification. Pure string concatenation and injection.

### Injection Points in `src/main.html`

| Placeholder | Replaced with |
|---|---|
| `/* INJECT_CSS */` | `app.css` + extra styles defined inline in `build.py` |
| `<!-- INJECT_PAGES -->` | All HTML page files concatenated |
| `<!-- INJECT_JS -->` | All JS + seed data in one `<script>` tag |

### JS Load Order (order matters — single global scope)
1. Seed data (`SOUL_DEVELOPER`, `SOUL_EVALUATOR`, `MEM_DEVELOPER`, `MEM_EVALUATOR`)
2. `store.js`
3. `router.js`
4. `inference.js`
5. `kanban.js`
6. `messageboard.js`
7. `agents.js`
8. `chat.js`

---

## Canonical Source Tree

```
src/
├── main.html                       # SPA shell with injection placeholders
├── styles/
│   └── app.css                     # Base styles; extra styles inlined by build.py
├── pages/
│   ├── kanban.html                 # Kanban board view
│   ├── agents.html                 # Agent status and memory view
│   ├── messageboard.html           # Threaded message board
│   └── chat.html                   # Private chat view
├── js/
│   ├── store.js                    # In-memory state: tasks, messages, agents
│   ├── router.js                   # Vanilla JS SPA router
│   ├── inference.js                # Anthropic API calls; agent orchestration
│   ├── kanban.js                   # Kanban board logic and drag-drop
│   ├── messageboard.js             # Message board logic
│   ├── agents.js                   # Agent panel rendering and status
│   └── chat.js                     # Chat UI logic
├── agents/
│   ├── developer/
│   │   ├── soul.md                 # Draco's system prompt
│   │   └── memory.json             # Draco's memory seed
│   └── evaluator/
│       ├── soul.md                 # Eulalia's system prompt
│       └── memory.json             # Eulalia's memory seed ⚠️ not yet created
└── lib/                            # ⚠️ PLANNED — does not exist yet (see Open Work)
    ├── css/
    │   ├── w3-4.css                # W3.CSS v4
    │   └── mermaid-10-9-0.css      # Mermaid.js CSS
    └── js/
        ├── w3-4.js                 # W3.CSS v4 JS
        ├── mermaid-10-9-0.js       # Mermaid.js v10.9.0
        └── marked-12-0-0.js        # Marked.js v12.0.0
```

---

## Open Work

These are genuine gaps — not abandoned features.

### 1. `src/lib/` — third-party dependencies not yet wired into build.py
`build.py` does not yet read from `src/lib/`. Three libraries are required:
- **W3.CSS v4** — core UI styling (`w3-4.css`, `w3-4.js`)
- **Mermaid.js v10.9.0** — architecture diagram rendering in the Planning page
- **Marked.js v12.0.0** — Markdown parsing for board posts and task comments

When implementing: add lib reads to `build.py`; inject CSS libs into the style block, JS libs
into the script block before app JS. Download libraries to `src/lib/` — do not use CDN links.

### 2. Planning page
`src/pages/planning.html` does not exist yet. Should include:
- Architecture diagrams (Mermaid.js)
- Structured implementation step breakdowns
- Task breakdown with subtasks, priorities, timelines
Add the file and wire it into `build.py`'s `pages` list.

### 3. `src/agents/evaluator/memory.json`
Does not exist yet. `build.py` will fail at `json.load()` without it.
Model it on `src/agents/developer/memory.json`.
Include Eulalia's checklist items and evaluator-specific defaults.

### 4. Task card fields for git output
The task data model needs dedicated `branchName` and `commitMessage` fields.
These are set by Draco when he posts his plan and displayed on the task card.
Eulalia may comment on them; they are part of the reviewable plan output.

### 5. Dynamic prompt overrides
Soul files are currently baked in at build time.
Future: allow runtime overrides via config without rebuilding.

---

## Rules for Agents Working in This Repo

- **Check `build.py` first** — it defines what files actually exist and are used
- **Do not edit `index.html` directly** — it is generated output; changes will be overwritten
- **Run `python3 build.py`** after any source file change to regenerate `index.html`
- **Do not create files outside `src/`** unless modifying `build.py` or root-level docs
- **JS globals are intentional** — no module system; all JS shares one browser scope
- **Soul files are Markdown** — write them as clear, imperative, first-person system prompts
- **`memory.json` must be valid JSON** — `build.py` will fail at `json.load()` if malformed
- **Do not add Docker, npm, or a backend** — this is intentionally a static single-file SPA
