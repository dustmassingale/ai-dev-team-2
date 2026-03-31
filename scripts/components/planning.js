// Planning Module - Mermaid.js Diagram Rendering and Task Breakdown Logic
// Provides architecture visualization and implementation planning capabilities

class PlanningModule {
  constructor(options = {}) {
    this.mermaidLib = options.mermaidLib || null;
    this.taskBreakdowns = [];
    this.diagrams = {};

    // Bind methods for consistent `this` reference
    this.renderDiagram = this.renderDiagram.bind(this);
    this.createTaskBreakdown = this.createTaskBreakdown.bind(this);
  }

  /**
   * Initialize Mermaid.js library if not provided
   */
  initializeMermaid() {
    if (!this.mermaidLib) {
      try {
        // Try to load from browser globals first
        if (typeof mermaid !== "undefined") {
          this.mermaidLib = mermaid;
        } else {
          throw new Error("Mermaid.js not found in global scope");
        }
      } catch (error) {
        console.error("Failed to initialize Mermaid.js:", error);
        return false;
      }
    }
    return true;
  }

  /**
   * Render a Mermaid diagram
   * @param {string} type - Diagram type (flowchart, sequenceDiagram, classDiagram)
   * @param {string} content - Diagram definition
   * @returns {Promise<string>} HTML representation of the rendered diagram
   */
  async renderDiagram(type, content) {
    // Ensure mermaid is available in the browser environment
    if (!this.initializeMermaid()) {
      return `<div class="empty-state">Mermaid.js not loaded. Please ensure lib/js/mermaid-10-9-0.js is included.</div>`;
    }

    try {
      // Initialize mermaid for browser API usage (if available)
      try {
        if (
          this.mermaidLib &&
          this.mermaidLib.mermaidAPI &&
          typeof this.mermaidLib.mermaidAPI.initialize === "function"
        ) {
          this.mermaidLib.mermaidAPI.initialize({ startOnLoad: false });
        } else if (
          this.mermaidLib &&
          typeof this.mermaidLib.initialize === "function"
        ) {
          this.mermaidLib.initialize({ startOnLoad: false });
        }
      } catch (initErr) {
        // Non-fatal, continue and try render methods
        console.warn(
          "Mermaid initialize warning:",
          initErr && initErr.message ? initErr.message : initErr,
        );
      }

      const diagramId = `diagram-${Date.now()}`;

      // content is expected to be a full mermaid definition (e.g. "graph TD ...")
      let svg = "";

      // Preferred: mermaid.mermaidAPI.render (returns svg or an object with svg)
      if (
        this.mermaidLib &&
        this.mermaidLib.mermaidAPI &&
        typeof this.mermaidLib.mermaidAPI.render === "function"
      ) {
        // Some mermaid versions return { svg, bindFunctions } and some return svg string.
        const res = await this.mermaidLib.mermaidAPI.render(diagramId, content);
        svg = res && res.svg ? res.svg : res;
      } else if (
        this.mermaidLib &&
        typeof this.mermaidLib.render === "function"
      ) {
        // Newer browser-friendly API also exposes render
        const res = await this.mermaidLib.render(diagramId, content);
        svg = res && res.svg ? res.svg : res;
      } else {
        // Fallback: return the mermaid source wrapped for client-side initialization
        return `<pre class="mermaid">${content}</pre>`;
      }

      // Wrap and return SVG so callers can inject it into the DOM
      return `<div class="mermaid-container">${svg}</div>`;
    } catch (error) {
      console.error("Error rendering Mermaid diagram:", error);
      return `<div class="empty-state">Failed to render diagram: ${error && error.message ? error.message : error}</div>`;
    }
  }

  /**
   * Create a structured task breakdown with subtasks, priorities, and timelines
   * @param {Object} task - Main task object
   * @returns {Promise<Object>} Structured breakdown including diagrams and steps
   */
  async createTaskBreakdown(task) {
    const breakdown = {
      taskId: task.id,
      title: task.title,
      description: task.description,
      createdAt: new Date().toISOString(),
      architectureDiagram: null,
      implementationSteps: [],
      subtasks: [],
    };

    try {
      // Generate architecture diagram based on task type
      if (task.type === "feature") {
        breakdown.architectureDiagram = await this.generateFeatureDiagram(task);
      } else if (task.type === "bugfix") {
        breakdown.architectureDiagram = await this.generateBugFixDiagram(task);
      }

      // Create implementation steps
      breakdown.implementationSteps = this.createImplementationSteps(task);

      // Generate subtasks from description
      breakdown.subtasks = this.extractSubtasks(task.description);
    } catch (error) {
      console.error("Error creating task breakdown:", error);
      return null;
    }

    return breakdown;
  }

  /**
   * Generate architecture diagram for feature tasks
   */
  async generateFeatureDiagram(task) {
    const flow = `
      graph TD
        A[User] --> B[AWM Interface]
        B --> C{Task Type}
        C -->|Feature| D[Developer Agent]
        C -->|Bugfix| E[Evaluator Agent]
        D --> F[Code Generation]
        E --> G[Code Review]
        F --> H[Git Integration]
        G --> I[Message Board]
        H --> J[Pull Request]
    `;

    return await this.renderDiagram("flowchart", flow);
  }

  /**
   * Generate architecture diagram for bugfix tasks
   */
  async generateBugFixDiagram(task) {
    const sequence = `
      sequenceDiagram
        participant User
        participant AWM
        participant Developer
        participant Evaluator

        User->>AWM: Report Bug
        AWM->>Developer: Assign Task
        Developer->>Developer: Analyze Code
        Developer->>AWM: Submit Fix
        AWM->>Evaluator: Request Review
        Evaluator->>AWM: Provide Feedback
        AWM->>Developer: Apply Changes
        Developer->>User: Deploy Fix
    `;

    return await this.renderDiagram("sequenceDiagram", sequence);
  }

  /**
   * Create implementation steps from task description
   */
  createImplementationSteps(task) {
    const steps = [
      {
        step: 1,
        title: "Code Analysis",
        description: "Review existing codebase and understand context",
      },
      {
        step: 2,
        title: "Plan Implementation",
        description: "Create detailed implementation plan with subtasks",
      },
      {
        step: 3,
        title: "Write Code",
        description: "Implement the feature or bugfix according to plan",
      },
      {
        step: 4,
        title: "Add Tests",
        description: "Write unit tests for new functionality",
      },
      {
        step: 5,
        title: "Code Review",
        description: "Submit code for evaluation and feedback",
      },
    ];

    return steps;
  }

  /**
   * Extract subtasks from task description using simple keyword matching
   */
  extractSubtasks(description) {
    const keywords = ["add", "implement", "create", "fix", "update", "modify"];
    const subtasks = [];

    // Simple heuristic: split by common delimiters and filter
    const parts = description
      .split(/[.,;]/)
      .filter((p) => p.trim().length > 20);

    for (const part of parts) {
      if (keywords.some((kw) => part.toLowerCase().includes(kw))) {
        subtasks.push({
          title: part.trim(),
          priority: "medium",
          description: `Extracted from main task description`,
        });
      }
    }

    return subtasks;
  }

  /**
   * Render the planning section in HTML
   */
  async renderPlanningSection(task) {
    // createTaskBreakdown is async so await it to ensure diagrams are rendered
    const breakdown = await this.createTaskBreakdown(task);

    if (!breakdown) {
      return `<div class="empty-state">Failed to generate task breakdown</div>`;
    }

    // breakdown.architectureDiagram is expected to already contain rendered SVG (or safe HTML)
    const diagramHtml = breakdown.architectureDiagram || "";

    let html = `
      <div class="page planning-section">
        <h1>${breakdown.title}</h1>
        <p class="subtitle">${breakdown.description}</p>

        ${diagramHtml ? `<div class="planning-diagram">${diagramHtml}</div>` : ""}
    `;

    html += `
      <div class="section-header">Implementation Steps</div>
      <ul>
        ${breakdown.implementationSteps
          .map(
            (step) => `
          <li>
            <strong>${step.step}. ${step.title}</strong><br>
            ${step.description}
          </li>
        `,
          )
          .join("")}
      </ul>

      ${breakdown.subtasks.length > 0 ? `<div class="section-header">Subtasks</div><ul>` : ""}
      ${breakdown.subtasks
        .map(
          (sub) => `
        <li>${sub.title}</li>
      `,
        )
        .join("")}
      ${breakdown.subtasks.length > 0 ? "</ul>" : ""}
    </div>
    `;

    return html;
  }
}

// Export for use in other modules
if (typeof module !== "undefined") {
  module.exports = PlanningModule;
}
