# AI Development Team Repository

## Overview

This repository contains a collection of developer agents, evaluators, and supporting infrastructure for building intelligent systems. The project is organized under an `agents` folder to facilitate modular development and easy management of multiple agent projects.

## Project Structure

```
dev/
└── agents/
    ├── AGENTS.md              # This file - Project documentation (updated)
    ├── build.py               # Build automation script
    ├── devscriptsstore.js     # Development scripts state manager
    ├── index.html             # Main application entry point (generated output)
    ├── lib/                   # Library dependencies (w3.css, marked, mermaid)
    ├── scripts/               # Core JavaScript modules
    │   ├── components/        # Reusable UI components
    │   ├── git_integration.js # Git operations integration (Node.js CLI tool)
    │   ├── index.js           # Application initialization
    │   ├── router.js          # Vanilla JS SPA router
    │   ├── store.js           # State management utilities
    │   └── ...                # Additional modules
    ├── SRD.md                 # System Requirements Document
    ├── styles/                # CSS styling (index.css)
    ├── TODO.md                # Task tracking and development roadmap
    ├── developer/             # Developer-specific resources
    │   ├── memory.json        # Developer agent memory state
    │   └── soul.md            # Developer persona details
    └── evaluator/             # Evaluator-specific resources
        └── soul.md            # Evaluator persona details
```

## Purpose

This repository serves as the central hub for:

1. **Developer Agents**: AI agents designed to assist with development tasks, code generation, and technical support
2. **Evaluator Agents**: AI agents responsible for quality assurance, testing, and performance evaluation
3. **Infrastructure**: Supporting tools and utilities for building and managing intelligent systems

## Key Components

### JavaScript Architecture (src/js/)

The application uses a modular JavaScript architecture with the following core modules:

| File | Purpose |
|------|---------|
| `router.js` | Vanilla JS SPA router using hash-based navigation. Supports route registration, parameterized routes, and event callbacks. |
| `store.js` | In-memory state management for tasks, agents, messages, and settings. Provides CRUD operations and persistence via localStorage. |
| `inference.js` | LLM API integration supporting Ollama (local), OpenAI-compatible APIs, and Anthropic Claude. Handles authentication and error handling. |
| `kanban.js` | Kanban board logic including drag-and-drop functionality, task management, and column rendering. |
| `messageboard.js` | Message board implementation with filtering, mentions, replies, and real-time updates. |
| `agents.js` | Agent panel rendering, status monitoring, configuration management, and memory/soul modal views. |
| `chat.js` | Direct chat interface for private conversations between humans and agents. |

### Build System (build.py)

The build system assembles all source files into a single `index.html` SPA:

- Reads CSS from `src/styles/app.css`
- Injects 4 HTML pages from `src/pages/`
- Bundles 7 JavaScript modules from `src/js/`
- Embeds soul files and memory JSON for both agents
- Outputs a complete, deployable single-file application

### Agent Configuration

Agents are configured via:
- **Soul files** (`src/agents/{role}/soul.md`): System prompts defining personality and behavior
- **Memory files** (`src/agents/{role}/memory.json`): Runtime state including checklist items, focus areas, and preferences

## Communication Rules

### Message Board — shared team space
- All agents see all posts at all times
- Any agent may respond to any post if they have something useful to add
- Not restricted to @mentions — agents respond proactively when relevant
- Draco and Eulalia's personalities show here (see soul files)
- Eulalia asks for human name(s) on first contact; uses names in all subsequent posts

### Chat — private
- One human ↔ one agent only
- No crossover between agents
- Same personalities apply, but it's a direct conversation, not a team thread

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
[Eulalia re-reviews → approves or raises new issues if they surfaced]
       ↓
[Eulalia posts: ready for sign-off]
       ↓
[Human reviews → closes task]
```

Maximum two rounds of Draco/Eulalia negotiation before escalating to @human. Human sign-off is the only action that closes a task. Agents cannot self-close.

## Git Output (text only — no CLI calls)

Draco proposes branch name and commit message as **dedicated fields on the task card**. No actual git commands are executed by the SPA. Output is text for a human or system to use.

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

## Build System

**Run:** `python3 build.py`
**Output:** `index.html` (project root) — the complete deployable artifact

No npm. No bundler. No minification. Pure string concatenation and injection.

### Injection Points in `src/main.html`

| Placeholder | Replaced with |
|---|---|
| `/* INJECT_CSS */` | `app.css` + extra styles defined inline in `build.py` |
| `<!-- INJECT_PAGES -->` | All HTML page files concatenated from `src/pages/` |
| `<!-- INJECT_JS -->` | All JS + seed data in one `<script>` tag (includes router, store, inference, and agent modules) |

### JS Load Order (order matters — single global scope)
1. Seed data (`SOUL_DEVELOPER`, `SOUL_EVALUATOR`, `MEM_DEVELOPER`, `MEM_EVALUATOR`)
2. `router.js` - SPA routing initialization
3. `store.js` - State management setup
4. `inference.js` - LLM API integration
5. `kanban.js` - Kanban board logic
6. `messageboard.js` - Message board logic
7. `agents.js` - Agent panel rendering and status
8. `chat.js` - Chat UI logic

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
│   ├── inference.js                # LLM API calls; agent orchestration
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
│       └── memory.json             # Eulalia's memory seed
└── lib/                            # Third-party dependencies (planned)
    ├── css/
    │   ├── w3-4.css                # W3.CSS v4
    │   └── mermaid-10-9-0.css      # Mermaid.js CSS
    └── js/
        ├── w3-4.js                 # W3.CSS v4 JS
        ├── mermaid-10-9-0.js       # Mermaid.js v10.9.0
        └── marked-12-0-0.js        # Marked.js v12.0.0
```

## Rules for Agents Working in This Repo

- **Check `build.py` first** — it defines what files actually exist and are used
- **Do not edit `index.html` directly** — it is generated output; changes will be overwritten
- **Run `python3 build.py`** after any source file change to regenerate `index.html`
- **Do not create files outside `src/`** unless modifying `build.py` or root-level docs
- **JS globals are intentional** — no module system; all JS shares one browser scope
- **Soul files are Markdown** — write them as clear, imperative, first-person system prompts
- **`memory.json` must be valid JSON** — `build.py` will fail at `json.load()` if malformed
- **Do not add Docker, npm, or a backend** — this is intentionally a static single-file SPA

## Notes on Architecture

The application follows these architectural principles:

1. **Modular JavaScript**: Each feature (kanban, messageboard, agents, chat) has its own module file that can be maintained independently
2. **Router-first approach**: The `router.js` handles all navigation, keeping the UI logic organized and predictable
3. **State management via Store**: Centralized state handling ensures consistency across all modules
4. **Build-time injection**: All assets are bundled into a single HTML file for easy deployment
5. **Agent separation**: Developer and evaluator agents have distinct soul files and memory configurations

This architecture allows for:
- Easy addition of new pages (just add to `src/pages/` and update `build.py`)
- Independent module development and testing
- Clear separation between agent personas and their behaviors