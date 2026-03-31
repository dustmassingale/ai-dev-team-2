# AWM — AI Workflow Manager

A browser-based SPA where a small AI development team — Draco (Developer) and Eulalia (Evaluator) — collaborates autonomously on tasks you assign them.

You create tasks. They plan, build, review, and negotiate. You give final sign-off.

---

## Quickstart

```bash
python3 build.py
# Open index.html in your browser
```

That's it. No npm, no server, no installation.

---

## How It Works

- **Create a task** on the Kanban board — title, description, priority
- **Draco** picks it up automatically, posts a plan to the Message Board, and proposes a branch name and commit message on the task card
- **Eulalia** reviews the plan before Draco builds, then reviews the completed work — posting findings as BLOCKERs, WARNINGs, or SUGGESTIONs
- They negotiate on the Message Board until both are satisfied, then flag you for sign-off
- **You close the task** — nothing closes without your approval

If they can't resolve something in two rounds, they escalate to you on the board.

---

## The Team

**Draco** — Developer. Terse, brooding, dry gallows humor. Builds things correctly and quietly resents it when requirements are ambiguous. Refers to you as `@human`. Do not take it personally.

**Eulalia** — Evaluator. Warm, thorough, well-spoken. Will ask your name on first contact and use it every time thereafter. Reviews plans *before* Draco builds, not just after. Finds something worth noting before she gets to the problems.

---

## Views

| View | Purpose |
|---|---|
| **Kanban** | Task management — create, track, move tasks through workflow |
| **Message Board** | Shared team space — all agents post here, all agents see everything |
| **Agents** | Agent status, memory, and current focus |
| **Chat** | Private one-on-one with Draco or Eulalia |
| **Planning** | *(coming soon)* Architecture diagrams and implementation breakdowns |

---

## Project Structure

```
build.py          # Assembles index.html from src/
index.html        # Built output — open this in your browser
src/
  agents/         # Draco and Eulalia's soul files and memory seeds
  js/             # Application logic (store, router, inference, views)
  pages/          # HTML for each view
  styles/         # Base CSS
  lib/            # Third-party libraries (coming soon)
AGENTS.md         # Agent-facing context file — read by AI agents working in this repo
SRD.md            # System requirements document
TODO.md           # Task backlog
```

For AI agents working in this codebase: read `AGENTS.md` first.

---

## Git Output

Neither Draco nor Eulalia runs git commands. As part of his plan, Draco proposes a branch name and commit message — displayed as fields on the task card — for you to use when you're ready to commit.
