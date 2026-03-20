# TODO List for AWM Project

## Overview
This document tracks tasks and milestones for the **AI Workflow Manager (AWM)** project. Tasks are organized by priority and status.

---

## Priority 1: Core Functionality

### Task Management
- [ ] **FR-1: Task Creation**
  - Implement UI form for task submission (title, description, priority, tags).
  - Validate required fields before creation.
  - Generate unique task ID (UUID v4).
  - Create initial branch from `main` or `develop` based on naming convention (`feature/`, `bugfix/`).
  - **Dependencies:** Git integration, state management.

- [ ] **FR-2: Developer Agent Execution**
  - Parse task description to generate implementation plan.
  - Create/checkout appropriate git branch.
  - Generate source code files with tests.
  - Update README with documentation changes.
  - Mark task as `IN_PROGRESS` upon starting.
  - Notify @human of blockers immediately.
  - **Dependencies:** Git integration, LLM inference.

- [ ] **FR-3: Evaluator Agent Review**
  - Run linting and static analysis on submitted code.
  - Review diff for security issues, performance concerns.
  - Categorize findings: BLOCKER, WARNING, SUGGESTION.
  - Post actionable comments to task message board.
  - Give developer fair chance to respond.
  - **Dependencies:** Linting tools, state management.

- [ ] **FR-4: Collaborative Resolution**
  - Implement message board for agent negotiations.
  - Allow developer to respond to BLOCKER findings.
  - Limit negotiation rounds to 2 before escalation.
  - **Dependencies:** Message board module.

- [ ] **FR-5: Human Escalation**
  - Implement @human mention detection in message board.
  - Log escalation events for tracking.
  - **Dependencies:** Message board, logging.

---

## Priority 2: Git Integration

- [ ] **FR-6: Git Integration**
  - Auto-create branch from `main`: `feature/task-title` or `bugfix/issue-number`.
  - Run tests before commit (linting, unit tests, integration tests).
  - Generate meaningful commit message: `feat: Add feature description`.
  - Create pull request with review comments embedded.
  - Handle merge conflicts with agent suggestions.
  - **Dependencies:** Git CLI, CI/CD hooks.

---

## Priority 3: Web Interface

- [ ] **FR-7: Web Interface**
  - **Kanban Board:**
    - Implement drag-and-drop for task columns (Backlog → In Progress → Review → Done).
    - **Dependencies:** Kanban module, state management.
  
  - **Agents Page:**
    - Display agent status, memory, and health.
    - **Dependencies:** Agent logic, state management.
  
  - **Message Board:**
    - Threaded discussions per task.
    - Support for Markdown and @mentions.
    - **Dependencies:** Message board module.
  
  - **Chat Interface:**
    - Direct chat with active developer/evaluator agents.
    - **Dependencies:** WebSocket or polling, state management.
  
  - **Planning Section:**
    - Architecture diagrams using Mermaid.js.
    - Structured breakdown of implementation steps.
    - Task breakdown with subtasks, priorities, and timelines.
    - **Dependencies:** Mermaid.js, planning module.

---

## Priority 4: Modular Structure

### Directory Setup
- [ ] Create `/lib/js` and `/lib/css` directories for dependencies.
- [ ] Add versioned dependencies:
  - `/lib/js/w3-4.js` (W3.CSS v4 JavaScript).
  - `/lib/css/w3-4.css` (W3.CSS v4 styles).
  - `/lib/js/mermaid-10-9-0.js` (Mermaid.js v10.9.0).
  - `/lib/css/mermaid-10-9-0.css` (Mermaid.js CSS).
  - `/lib/js/marked-12-0-0.js` (Marked.js v12.0.0).
  - `/lib/js/router.js` (Custom vanilla JS router).

### Modular Components
- [ ] **Planning Module:**
  - Create `/scripts/components/planning.js`.
  - Implement Mermaid.js diagram rendering.
  - Add structured task breakdown logic.
  - **Dependencies:** Mermaid.js, state management.

- [ ] **Kanban Module:**
  - Create `/scripts/components/kanban.js`.
  - Implement drag-and-drop for task columns.
  - **Dependencies:** State management, W3.CSS.

- [ ] **Message Board Module:**
  - Create `/scripts/components/message-board.js`.
  - Implement threaded comments with Markdown support.
  - Add @mention detection and highlighting.
  - **Dependencies:** State management, Marked.js.

- [ ] **Store Module:**
  - Create `/scripts/store.js`.
  - Implement in-memory state management for tasks, agents, and messages.
  - **Dependencies:** None.

- [ ] **Router Module:**
  - Create `/scripts/router.js`.
  - Implement vanilla JS routing for SPA navigation.
  - **Dependencies:** None.

### Styling
- [ ] **Core Styles:**
  - Update `/styles/index.css` to include core styles.
  - Ensure compatibility with W3.CSS v4.

- [ ] **Kanban Styles:**
  - Create `/styles/kanban.css`.
  - Style task cards and columns.

- [ ] **Planning Styles:**
  - Create `/styles/planning.css`.
  - Style architecture diagrams and task breakdowns.

- [ ] **Message Board Styles:**
  - Create `/styles/message-board.css`.
  - Style threaded comments and @mentions.

---

## Priority 5: Build and Deployment

- [ ] **Build Script (`build.py`):**
  - Update to bundle modular JS/CSS files into `index.html`.
  - Minify and optimize assets.
  - Inject dependencies into HTML.
  - **Dependencies:** Python, file system operations.

- [ ] **Deployment:**
  - Test deployment using Python HTTP server.
  - Containerize for production (Docker).
  - **Dependencies:** Docker, cloud provider (if applicable).

---

## Priority 6: Documentation and Testing

- [ ] **Documentation:**
  - Update `README.md` to reflect modular structure.
  - Add setup instructions for new developers.
  - Document API endpoints (if applicable).

- [ ] **Testing:**
  - Write unit tests for modular components.
  - Test Git integration workflow.
  - Test agent interactions (Developer and Evaluator).
  - **Dependencies:** Testing framework (e.g., Jest, Mocha).

---

## Priority 7: Future Enhancements

- [ ] **Multi-Repository Support:**
  - Extend Git client to support multiple repositories.
  - **Dependencies:** Git integration.

- [ ] **Advanced Planning Tools:**
  - Add Gantt charts for task timelines.
  - Integrate with external project management tools (e.g., Jira, Trello).
  - **Dependencies:** Mermaid.js, external APIs.

- [ ] **Agent Customization:**
  - Allow dynamic prompt overrides via config.
  - **Dependencies:** Agent logic, state management.

---

## Notes
- **Dependencies:** Tasks may depend on other tasks (e.g., Git integration requires state management).
- **Status Updates:** Mark tasks as complete when fully implemented and tested.
- **Blockers:** Use `@human` in task comments to escalate issues.

---

**Last Updated:** 2026-03-20