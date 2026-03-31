# TODO — AWM Project
# Last updated: 2026-03-30
# Key: [x] done, [ ] open, [~] partially done, [-] removed from scope

---

## Priority 1: Core Functionality

- [x] Task creation UI (title, description, priority, tags)
- [x] Unique task ID generation
- [x] Task state machine (CREATED → IN_PROGRESS → UNDER_REVIEW → RESOLVED / ESCALATED)
- [x] Kanban board with drag-and-drop (Backlog → In Progress → Review → Done)
- [x] Message board with threaded posts and @mention support
- [x] Agent panel (status, memory, current focus)
- [x] Chat interface (private human ↔ agent)
- [x] In-memory state management (store.js)
- [x] Vanilla JS SPA router
- [x] Inference layer — Anthropic API calls from browser (inference.js)
- [x] Developer soul file (Draco)
- [x] Evaluator soul file (Eulalia)
- [x] Developer memory seed (memory.json)

- [ ] **Evaluator memory seed** — `src/agents/evaluator/memory.json` does not exist yet
      build.py will fail at json.load() without it. Model on developer/memory.json.
      Include: checklist_items (Security Audit, Type Safety, etc.), evaluator defaults.

- [ ] **Task card git fields** — `branchName` and `commitMessage` fields on the task data model
      Set by Draco when he posts his plan. Displayed on the task card.
      Eulalia can comment on them as part of plan review.
      No git CLI — text output only, in the format defined in AGENTS.md.

- [ ] **Autonomous agent loop** — inference.js must trigger Draco automatically on task creation,
      then trigger Eulalia after Draco posts his plan, then loop on findings until escalation or approval.
      Human sign-off is the only close signal. Agents cannot self-close tasks.

- [ ] **All-agents-see-all message board** — all agents receive full board context on every inference call,
      not just their own thread. Any agent can respond to any post.

---

## Priority 2: Third-Party Libraries (src/lib/)

`src/lib/` does not exist yet. build.py does not read from it. Both must be created together.

- [ ] **Download and place libraries** in `src/lib/css/` and `src/lib/js/`:
  - `w3-4.css` and `w3-4.js` — W3.CSS v4
  - `mermaid-10-9-0.js` and `mermaid-10-9-0.css` — Mermaid.js v10.9.0
  - `marked-12-0-0.js` — Marked.js v12.0.0

- [ ] **Update build.py** to read lib files and inject them:
  - CSS libs → style injection block (before app.css)
  - JS libs → script block (before store.js)

- [ ] **Wire Marked.js** into messageboard.js and task comment rendering
      All board posts and task descriptions should render Markdown.

---

## Priority 3: Planning Page

- [ ] **Create `src/pages/planning.html`** and wire into build.py's pages list
- [ ] **Create planning JS module** (`src/js/planning.js`) and add to build.py's JS list
- [ ] Planning page should include:
  - Architecture diagrams via Mermaid.js
  - Structured implementation step breakdowns
  - Task breakdown with subtasks, priorities, dependencies

---

## Priority 4: Documentation

- [x] AGENTS.md (agent-facing context file)
- [x] README.md (human-facing intro)
- [x] SRD.md (system requirements)
- [ ] Inline code comments in inference.js — the orchestration logic is the least obvious part
- [ ] Document the memory.json schema for both agents

---

## Removed from Scope

- [-] Docker / containerization — not needed for a static SPA
- [-] npm / package.json — no build toolchain; build.py is sufficient
- [-] Backend server or REST API — browser-only, Anthropic API called directly
- [-] Git CLI integration — agents output branch/commit text; no actual git calls
- [-] Multi-repository support — out of scope
- [-] External project management integrations (Jira, Trello) — out of scope
- [-] CI/CD hooks — out of scope
- [-] Linting tools run by agents — agents reason about code quality via LLM, not static analysis tools
