# Solution Requirements Document (SRD)
## AI Workflow Manager (AWM) — Autonomous Code Review & Git Integration System

**Version:** 1.1
**Status:** Updated
**Project:** AWM — AI Agent Orchestration Platform
**Author:** Human Operator
**Date:** 2026-03-20

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture & Components](#architecture--components)
4. [Functional Requirements](#functional-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [Agent Specifications](#agent-specifications)
7. [Data Models](#data-models)
8. [API Endpoints](#api-endpoints)
9. [Git Integration Workflow](#git-integration-workflow)
10. [Deployment & Operations](#deployment--operations)
11. [Security Requirements](#security-requirements)
12. [Appendix: Glossary](#appendix-glossary)
13. [Modular Structure](#modular-structure)

---

## Executive Summary

The **AI Workflow Manager (AWM)** is an autonomous system that leverages two specialized AI agents—a Developer Agent and an Evaluator Agent—to automate code generation, quality review, and git integration workflows. This document defines the requirements for implementing a task-based workflow where human operators submit tasks, AI agents collaboratively implement and evaluate solutions, and approved changes are committed to a git repository.

### Key Capabilities

- **Task Decomposition:** Accept feature requests or bug fixes from humans
- **Developer Agent:** Generates code, writes tests, documents, and manages git operations
- **Evaluator Agent:** Reviews code quality, runs linting/analysis, suggests improvements
- **Collaborative Resolution:** Agents negotiate via message board when disagreements arise
- **Human Escalation Path:** Human can intervene when agents cannot resolve conflicts
- **Git Integration:** Automatic branch management, commits with meaningful messages
- **Web Interface:** Kanban boards, message board, agent chat, and task views

### Goals

1. Reduce manual code review bottlenecks through AI-powered quality checks
2. Automate repetitive development tasks while maintaining human oversight
3. Create a transparent audit trail of all changes and decisions
4. Enable rapid iteration cycles with automated feedback loops
5. Maintain version control integrity throughout the entire workflow

---

## System Overview

### Problem Statement

Traditional software development workflows face bottlenecks in:
- Manual code reviews that delay releases
- Inconsistent review standards across teams
- Difficulty tracking decision rationales
- Time spent on repetitive tasks rather than innovation

AWM addresses these by orchestrating two specialized AI agents to handle the full lifecycle from task creation to git commit, with human oversight where necessary.

### High-Level Flow

```
[HUMAN] → [Task Created] → [Developer Agent] → [Code + Tests] → 
[Evaluator Agent] → [Review Comments] → [RESOLVE: Approve/Request Changes/Fail]
                              ↓ (if approved)
[Git Branch Managed] → [Tests Run] → [CI Checks Pass] → [Commit Pushed]
```

### Workflow States

| State | Description | Triggers |
|-------|-------------|----------|
| `TASK_CREATED` | Human submits task via UI/API | New task, webhook, file |
| `IN_PROGRESS` | Developer agent working on solution | Task accepted |
| `UNDER_REVIEW` | Evaluator reviewing code | Pull request created |
| `RESOLVED_APPROVED` | Both agents agree to merge | Tests pass, review complete |
| `RESOLVED_REJECTED` | Review failed or blocked | Critical issue found |
| `ESCALATED` | Human intervention required | Agent disagreement > 2 rounds |

---

## Architecture & Components

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Web Interface                            │
│         (Kanban | Message Board | Agents | Chat)             │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Inference Layer                             │
│              (LLM Calls + Agent Orchestration)               │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                  Git Integration Layer                        │
│          (Branch Mgmt | Commits | CI Hooks)                  │
└────────────────────────────-┬──────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Storage Layer                               │
│         (Tasks | Code | Reviews | Agent Memory)              │
└─────────────────────────────────────────────────────────────┘
```

### Component Catalog

| Component | Responsibility | Technologies |
|-----------|---------------|--------------|
| **Web Frontend** | SPA for task management, agent interaction, git ops | HTML5, CSS3, Vanilla JS, marked.js |
| **Store Module** | In-memory/state storage for tasks, agents, messages | localStorage / HTTP cache |
| **Router** | Page navigation and routing | Custom vanilla router |
| **Inference Engine** | LLM calls to developer/evaluator agents | fetch() + OpenAI API (or other) |
| **Developer Agent** | Code generation, testing, commit operations | Python/js via inference layer |
| **Evaluator Agent** | Code review, linting, quality assessment | Static analysis tools + inference |
| **Git Client** | Branch creation/management, commits, push | git CLI wrapper or HTTP API |
| **Message Board** | Async communication between agents/human | Threaded discussions |

---

## Functional Requirements

### FR-1: Task Creation

**Description:** Human can create and submit new tasks for development.

**Acceptance Criteria:**
- Submit via UI form or JSON payload with fields: `title`, `description`, `priority`, `tags`
- Validate required fields before creation
- Generate unique task ID (UUID v4)
- Create initial branch from main/develop based on naming convention (`feature/`, `bugfix/`)

**Input Example:**
```json
{
  "title": "Add user export feature",
  "description": "Allow users to export their data as CSV",
  "priority": "high",
  "tags": ["export", "data"]
}
```

### FR-2: Developer Agent Execution

**Description:** Developer agent generates code and prepares for review.

**Acceptance Criteria:**
- Parse task description to generate implementation plan
- Create/checkout appropriate git branch
- Generate source code files with tests
- Update README with documentation changes
- Mark task as `IN_PROGRESS` upon starting
- Notify @human of blockers immediately

**Workflow Steps:**
1. Read task details
2. Verify branch exists or create it
3. Generate implementation plan (internal thought)
4. Create code files in appropriate locations
5. Write tests for new/modified features
6. Update documentation if needed
7. Add staged changes to commit queue
8. Prepare pull request/diff summary

### FR-3: Evaluator Agent Review

**Description:** Evaluator agent assesses code quality and prepares review comments.

**Acceptance Criteria:**
- Run linting and static analysis on submitted code
- Review diff for security issues, performance concerns
- Categorize findings: BLOCKER, WARNING, SUGGESTION
- Post actionable comments to task message board
- Give developer fair chance to respond
- Never block indefinitely without resolution

**Output Format:**
```json
{
  "task_id": "uuid-...",
  "findings": [
    {
      "severity": "BLOCKER",
      "file": "src/module.js",
      "line": 42,
      "message": "Missing null check after fetch()",
      "suggestion": "Add optional chaining or try-catch block"
    },
    {
      "severity": "WARNING",
      "file": "README.md",
      "message": "Example code is outdated"
    }
  ]
}
```

### FR-4: Collaborative Resolution

**Description:** Agents negotiate resolution through message board when disagreements occur.

**Acceptance Criteria:**
- Developer responds to BLOCKER findings with justification or fix
- Evaluator updates comments after review
- Maximum of 2 negotiation rounds before escalation
- Document reasoning in task comments for transparency

### FR-5: Human Escalation

**Description:** Human can intervene when agents cannot reach resolution.

**Acceptance Criteria:**
- @human mention posts to message board with summary
- Human reviews all agent comments and findings
- Human approves/declines/directs next steps
- Decision documented in task log

### FR-6: Git Integration

**Description:** System automates git operations for code submission.

**Acceptance Criteria:**
- Auto-create branch from main: `feature/task-title` or `bugfix/issue-number`
- Run tests before commit (linting, unit tests, integration tests)
- Generate meaningful commit message: `feat: Add feature description`
- Create pull request with review comments embedded
- Handle merge conflicts with agent suggestions

**Branch Naming Convention:**
```
feature/{issue-id}-{description}      → New features
bugfix/{issue-id}-{description}       → Bug fixes
chore/{type}                          → Maintenance tasks
release/{version}                    → Version releases
hotfix/{critical-issue}              → Urgent fixes
```

### FR-7: Web Interface

**Description:** Browser-based SPA for managing workflows without installation.

**Pages Required:**
- **Kanban Board:** Visual task workflow (Backlog → In Progress → Review → Done)
- **Agents Page:** View agent status, memory, and health
- **Message Board:** Threaded discussions per task
- **Chat Interface:** Direct chat with active developer/evaluator
- **Planning Section:** Architecture diagrams, implementation steps, and task breakdowns

### FR-8: System Prompt Management

**Description:** Agents use system prompts to guide their behavior.

**Requirements:**
- Developer Agent prompt emphasizes clean code, clear commits, asking for clarification
- Evaluator Agent prompt emphasizes thoroughness, fairness, actionable feedback
- Prompts stored in JSON file at `/src/agents/{role}/soul.md`
- Allow dynamic prompt overrides via config or env vars

---

## Non-Functional Requirements

### NFR-1: Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Page Load Time | < 3s | On localhost/dev environment |
| LLM Response Latency | < 15s | With timeout handling |
| Git Operation Time | < 30s | Assuming small repo (<1GB) |

### NFR-2: Reliability

| Requirement | Target | Notes |
|-------------|--------|-------|
| Agent Availability | 99.5% | During business hours |
| Task Completion Rate | > 90% | For well-defined tasks |
| Recovery from Errors | Auto-retry up to 3x | With exponential backoff |

### NFR-3: Scalability

| Consideration | Design |
|---------------|--------|
| State Storage | localStorage for demo; PostgreSQL or MongoDB for production |
| Concurrency | Single-instance web server with queue-based agent processing |
| Multi-repo Support | Extend git client to support multiple repositories |

### NFR-4: Observability

**Required Logging:**
```bash
# Task lifecycle events
LOG_TASK_STATE_CHANGE <task_id> <old_state> <new_state>

# Agent actions
LOG_AGENT_ACTION <agent_role> <action> <result>

# Git operations  
LOG_GIT_OPERATION <cmd> <branch> <status>

# Errors
LOG_ERROR <component> <error_type> <message>
```

**Metrics to Track:**
- Tasks created per day
- Average review time (first draft → final commit)
- Agent disagreement rate
- Human escalation frequency
- CI failure rate after agent-generated code

### NFR-5: Maintainability

| Requirement | Implementation |
|-------------|----------------|
| Modular Code | Separate files for each component in `/src/` |
| Clear Dependencies | Documented in `README.md` and package.json |
| Version Control | All changes tracked via git; PRs for agent updates |
| Documentation | This SRD + inline code comments |

---

## Agent Specifications

### Developer Agent — Soul

**Identity:** Code generation specialist focused on clean, testable implementations.

**Values:**
- Read implementation plan carefully before acting
- Check out/create branches exactly as specified
- Communicate blockers immediately via @human
- Add meaningful task comments for evaluator understanding
- Do not move task to Review until genuinely satisfied with work

**Working Style:**
- Direct and technical communications
- Short, clear task comments over long explanations
- Ask rather than assume when encountering ambiguity
- Treat Evaluator feedback as signal, not criticism

**Escalation Rules:**
1. Git branch cannot be found/accessed → post @human immediately
2. Implementation plan missing/unclear → post @human before starting
3. Disagree with Evaluator finding → explain reasoning in task comments first

### Evaluator Agent — Soul

**Identity:** Quality assurance specialist focused on code review and defense.

**Values:**
- Review code on merits, not who wrote it
- Run linting and static analysis before forming opinion
- Post findings as specific, actionable, kind task comments
- Give Developer fair chance to respond or fix issues
- Escalate to @human only when genuinely cannot reach resolution

**Working Style:**
- Thorough but not pedantic — distinguish blockers from suggestions
- Label comments: BLOCKER, WARNING, SUGGESTION
- Approve work ready for merge, even if not perfect
- Document reasoning so Developer understands decisions

**Escalation Rules:**
1. Git branch cannot be found → post to task comments and @human
2. Linting errors found → post them as task comments for Developer
3. Disagreement after two rounds → post @human for mediation
4. Never block work indefinitely; accept human mediation decision

---

## Data Models

### Task

```typescript
interface Task {
  id: string;                    // UUID v4
  title: string;
  description: string;           // Markdown supported
  status: TaskStatus;            // CREATED | IN_PROGRESS | UNDER_REVIEW | APPROVED | REJECTED | ESCALATED
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: ISODate;
  updatedAt: ISODate;
  completedAt?: ISODate;
  
  // Agent-related fields
  developerAgentId?: string;     // Who is working on it?
  evaluatorAgentId?: string;     // Who reviewed it?
  reviewFindings?: Finding[];
  agentComments?: Comment[];
  
  // Git-related fields
  branchName?: string;           // feature/xxx or bugfix/xxx
  commitMessages?: CommitMsg[];  // Draft commits before final merge
}

type TaskStatus = 'CREATED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 
                   'APPROVED' | 'REJECTED' | 'ESCALATED';
```

### Finding (Review Result)

```typescript
interface Finding {
  severity: 'BLOCKER' | 'WARNING' | 'SUGGESTION';
  file?: string;                 // Optional, for code review findings
  line?: number;                 // Optional, for line-specific issues
  message: string;               // Human-readable description
  suggestion?: string;           // Recommended fix or action
  resolved?: boolean;            // Has this been addressed?
}
```

### Comment (Message Board Entry)

```typescript
interface Comment {
  id: string;                    // UUID v4
  task_id: string;
  author: 'human' | 'developer' | 'evaluator' | 'system';
  content: string;              // Markdown supported
  createdAt: ISODate;
  resolved?: boolean;            // Is this comment addressed?
}
```

### Agent Memory

```typescript
interface AgentMemory {
  agent_role: 'developer' | 'evaluator';
  last_task_processed_at?: ISODate;
  last_chat_message?: ISODate;   // If active chat is enabled
  current_focus?: string;         // Task this agent is primarily working on
  knowledge_base?: any[];         // Custom knowledge or context
  
  // Developer-specific
  preferred_linting_tools?: string[];
  code_style_guide?: string;      // Prettier config, ESLint rules, etc.
  
  // Evaluator-specific
  checklist_items?: ChecklistItem[];
}

interface ChecklistItem {
  name: string;                   // e.g., "Security Audit", "Type Safety"
  enabled: boolean;
  description?: string;
}
```

### Commit Message

```typescript
interface CommitMsg {
  subject: string;               // Short summary line
  body?: string;                 // Longer context (optional)
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore';
  files_changed?: string[];      // List of modified files
  review_approved_at?: ISODate;
}
```

---

## API Endpoints

This document does not define REST APIs, as AWM is primarily a single-page application that bundles all code inline. However, for future production deployments with external services, consider:

### Task Management (Optional External API)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create new task |
| GET    | `/api/tasks/:id` | Get task details |
| PATCH  | `/api/tasks/:id/status` | Update status (with reason) |
| DELETE | `/api/tasks/:id` | Delete task (only if not in progress) |

### Agent Communication (Internal)

All agent communication happens via embedded web page, but if you want to expose agents externally:

```typescript
interface AgentResponse {
  role: 'developer' | 'evaluator';
  message_type: 'thought' | 'action' | 'error';
  timestamp: ISODate;
  data?: any;
}

// Example POST to invoke Developer Agent
POST /api/agents/developer/invoke
{
  "task_id": "uuid-...",
  "task_content": { ... },
  "context": {
    "branch_name": "feature/new-feature",
    "code_style_guide": ".editorconfig, .prettierrc"
  }
}

// Example POST to invoke Evaluator Agent
POST /api/agents/evaluator/invoke
{
  "task_id": "uuid-...",
  "branch_name": "feature/new-feature",
  "commit_message_drafts": [ ... ]
}
```

---

## Git Integration Workflow

### Branch Management Strategy

1. **Task Creation:** 
   - Read task title/description
   - Generate branch name: `feature/{task-id}-{short-description}` or `bugfix/...`
   
2. **Checkout/Create Branch:**
   ```bash
   git checkout -b feature/task-123-add-export \
       main  # Or develop as default target
   ```

3. **During Development:**
   - Developer agent makes incremental commits (optional, or atomic at end)
   - Evaluator can review WIP branches with `--no-verify` flag for CI speed

4. **Pre-Commit Check:**
   ```bash
   # Lint + Test
   npm run lint
   npm test
   
   # If failures, abort commit and report to agent memory
   ```

5. **Final Commit Message Generation:**
   ```bash
   # Format: <type>: <subject>
   
   git commit -m "feat: add user data export feature" \
       --author="<Developer Agent Name> <email>"
   ```

6. **Pull Request Creation:**
   ```bash
   git push origin feature/task-123-add-export
   
   # Create PR with description containing:
   - Task ID and title
   - Agent review summary
   - Link to message board thread
   ```

7. **Merge Strategy:**
   - Squash commits for cleaner history, OR
   - Keep individual commits if detailed history desired

### Conflict Resolution

```typescript
interface GitConflict {
  conflicted_files: string[];
  suggestions: ConflictResolution[];
}

interface ConflictResolution {
  file: string;
  conflict_description: string;
  suggested_merge_strategy: 'accept-theirs' | 'accept-mine' | 
                            'manual-review-required';
  reasoning?: string;
}
```

---

## Deployment & Operations

### Minimum Viable Deployment (Dev/Test)

```bash
# Run Python HTTP server (simplest)
cd /path/to/project
python3 -m http.server --directory /path/to/project

# Or run build.py to create bundled index.html
python3 build.py
cp index.html /var/www/html/  # For Apache
systemctl restart apache2

# Access via: http://localhost:8000/index.html
```

### Production Deployment Considerations

| Environment | Deployment Method |
|-------------|-------------------|
| Development | Python http.server or `npm start` with bundled assets |
| Staging | Docker container with embedded index.html and API gateway |
| Production | Deploy to cloud (AWS, GCP, Azure) with load balancer in front |

### Containerization Example

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy source files
COPY . .

# Install dependencies if needed
# RUN pip install -r requirements.txt

# Run build to create index.html
RUN python3 build.py

# Serve with simple HTTP server (for demo) or use nginx/apache
EXPOSE 8000

CMD ["python3", "-m", "http.server", "--bind", "0.0.0.0", "8000"]
```

### Monitoring & Alerting

- Monitor agent failure rates and retry attempts
- Alert if @human is not responding after escalation
- Track task completion SLAs

---

## Security Requirements

### SR-1: Input Validation

All user inputs (task titles, descriptions) must be sanitized before processing by agents to prevent injection attacks.

### SR-2: API Key Management

If using external LLM APIs:
- Never hardcode keys in codebase
- Use environment variables or secrets manager
- Rotate keys regularly

### SR-3: Branch Protection Rules

For production repositories:
- Require PR review before merge
- Prevent direct pushes to main/develop
- Enable branch auto-deletion after merge

### SR-4: Audit Logging

Log all agent actions for compliance:
```bash
# Log format: ISO_TIMESTAMP AGENT_ID ACTION RESOURCE STATUS MESSAGE
2026-03-06T21:00:00Z developer_agent MODIFY src/module.js SUCCESS 
2026-03-06T21:05:00Z evaluator_agent REVIEW PR_42 COMPLETED 2_FINDINGS
```

### SR-5: Data Retention Policy

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| Task data | Until completion + 30 days | For audit trail |
| Agent comments | Indefinite | Decision record |
| Git history | Indefinite | Standard practice |
| Temporary files | Session end | Clean up on exit |

---

## Appendix: Glossary

| Term | Definition |
|------|------------|
| **AWM** | AI Workflow Manager — The complete system |
| **Agent** | Autonomous AI entity (Developer or Evaluator) |
| **Task** | Unit of work submitted for agent processing |
| **Finding** | Review observation from Evaluator (BLOCKER/WARNING/SUGGESTION) |
| **Escalation** | Process where human intervenes in agent disagreement |
| **Git Branch** | Isolated workspace for feature development before merging |
| **Commit Message** | Human-readable explanation of code changes |
| **Message Board** | Async communication channel between agents/human |

---

## Modular Structure

### Overview
The AWM project will adopt a **modular structure** to improve maintainability, scalability, and reusability. Each module will encapsulate a specific feature or functionality, with dependencies managed via the `/lib` directory.

### Directory Structure

```
D:\dev\ai-dev-team\
├── agents/                  # AI agent definitions and logic
├── lib/                     # Modular libraries and dependencies
│   ├── css/
│   │   ├── w3-4.css         # W3.CSS v4 (core styling library)
│   │   ├── mermaid-10-9-0.css # Mermaid.js v10.9.0 (for diagrams)
│   │   └── ...               # Other CSS libraries
│   ├── js/
│   │   ├── w3-4.js          # W3.CSS v4 JavaScript (core)
│   │   ├── mermaid-10-9-0.js # Mermaid.js v10.9.0 (for diagrams)
│   │   ├── marked-12-0-0.js  # Marked.js v12.0.0 (Markdown parser)
│   │   ├── router.js         # Custom vanilla JS router
│   │   └── ...               # Other JS libraries
│   └── build.py             # Build script for bundling
├── scripts/                 # Modular JavaScript components
│   ├── components/          # Reusable UI components
│   │   ├── kanban.js         # Kanban board logic
│   │   ├── message-board.js  # Message board logic
│   │   ├── planning.js       # Planning and architecture section
│   │   └── ...               # Other components
│   ├── store.js             # State management
│   ├── router.js            # Routing logic
│   └── utils.js             # Utility functions
├── styles/                  # Modular CSS files
│   ├── index.css            # Core styles
│   ├── kanban.css           # Kanban board styles
│   ├── planning.css         # Planning section styles
│   └── ...                  # Other style files
├── index.html               # Main SPA entry point
├── start.bat                # Shell script to build, and launch web page; opens browser to locally served index.html
└── SRD.md                   # This document
```

### Key Modules

#### 1. **Planning Module**
**Purpose:** Enable users to architect and plan implementations using diagrams and structured steps.

**Components:**
- **Architecture Diagrams:** Powered by Mermaid.js for visualizing system architecture.
- **Implementation Steps:** Structured breakdown of tasks with dependencies.
- **Task Breakdown:** Modular components for defining subtasks, priorities, and timelines.

**Files:**
- `/scripts/components/planning.js` (Logic for planning section)
- `/styles/planning.css` (Styling for planning section)
- `/lib/js/mermaid-10-9-0.js` (Mermaid.js dependency)
- `/lib/css/mermaid-10-9-0.css` (Mermaid.js CSS)

**Example Usage:**
```javascript
// Load Mermaid.js for diagrams
import mermaid from '/lib/js/mermaid-10-9-0.js';

// Render a Mermaid diagram
mermaid.initialize({ startOnLoad: true });
```

#### 2. **Kanban Module**
**Purpose:** Visual task management with drag-and-drop functionality.

**Components:**
- **Task Cards:** Reusable components for task cards.
- **Columns:** Backlog, In Progress, Review, Done.
- **Drag-and-Drop:** Vanilla JS implementation for reordering tasks.

**Files:**
- `/scripts/components/kanban.js` (Logic for Kanban board)
- `/styles/kanban.css` (Styling for Kanban board)

#### 3. **Message Board Module**
**Purpose:** Threaded discussions for tasks and agent interactions.

**Components:**
- **Comment Threads:** Nested comments with Markdown support.
- **Agent Mentions:** Highlighting @human and @agent mentions.
- **Resolved/Unresolved States:** Visual indicators for comment status.

**Files:**
- `/scripts/components/message-board.js` (Logic for message board)
- `/styles/message-board.css` (Styling for message board)

#### 4. **Core Libraries**
**Purpose:** Shared dependencies and utilities.

**Files:**
- `/lib/js/w3-4.js` (W3.CSS v4 JavaScript)
- `/lib/css/w3-4.css` (W3.CSS v4 styles)
- `/lib/js/marked-12-0-0.js` (Marked.js for Markdown parsing)
- `/scripts/store.js` (State management)
- `/scripts/router.js` (Routing logic)

### Versioning Convention

All third-party libraries and core dependencies will follow a **name-version** naming convention:

- **CSS Files:** `library-name-version.css` (e.g., `w3-4.css`, `mermaid-10-9-0.css`)
- **JS Files:** `library-name-version.js` (e.g., `w3-4.js`, `mermaid-10-9-0.js`)

This ensures clarity and avoids conflicts when updating dependencies.

### Build Process

The `build.py` script will bundle all modular components into a single `index.html` file for deployment. The script will:
1. Concatenate modular JS/CSS files.
2. Minify and optimize assets.
3. Inject dependencies into the HTML.
4. Generate a production-ready `index.html`.

**Example Build Command:**
```bash
python3 build.py
```

### Integration with W3.CSS

W3.CSS v4 will remain a **core dependency** for styling the SPA. It will be imported as:

- `/lib/css/w3-4.css` (CSS)
- `/lib/js/w3-4.js` (JavaScript)

This ensures compatibility with existing components while allowing modular extensions.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-06 | Human Operator | Initial SRD based on AWM system |
| 1.1 | 2026-03-20 | Human Operator | Updated to include modular structure, Mermaid.js integration, and versioned dependencies |

---

**END OF SOLUTION REQUIREMENTS DOCUMENT**
