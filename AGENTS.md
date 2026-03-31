# AI Development Team Repository

## Overview

This repository contains a collection of developer agents, evaluators, and supporting infrastructure for building intelligent systems. The project is organized under an `agents` folder to facilitate modular development and easy management of multiple agent projects.

## Project Structure

```
dev/
└── agents/
    ├── AGENTS.md              # This file - Project documentation
    ├── build.py               # Build automation script
    ├── devscriptsstore.js     # Development scripts state manager
    ├── index.html             # Main application entry point
    ├── lib/                   # Library dependencies (w3.css)
    ├── scripts/               # Core JavaScript modules
    │   ├── components/        # Reusable UI components
    │   ├── git_integration.js # Git operations integration
    │   ├── index.js           # Application initialization
    │   ├── router.js          # Routing logic
    │   └── store.js           # State management utilities
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

- **State Management**: Centralized state handling for tasks, agents, and messages via `store.js`
- **Kanban Board**: Task management interface with drag-and-drop functionality
- **Git Integration**: Seamless integration with version control workflows
- **Agent Personas**: Detailed configurations for developer and evaluator agent behaviors

## Getting Started

1. Navigate to the `agents` folder
2. Review `SRD.md` for system requirements
3. Check `TODO.md` for current development tasks
4. Examine `developer/soul.md` and `evaluator/soul.md` for agent configurations

## License

[Add license information here]

---

*Last updated: 2026-03-19*