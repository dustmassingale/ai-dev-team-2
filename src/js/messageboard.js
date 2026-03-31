// Message Board Module - Threaded Comments with Markdown Support and @Mention Detection
// Provides discussion capabilities for agent negotiations and human escalations

class MessageBoardModule {
  constructor(options = {}) {
    this.tasks = options.tasks || [];
    this.messages = options.messages || [];
    this.mentionRegex = /@([a-zA-Z0-9_]+)/g;

    // Bind methods for consistent `this` reference
    this.initMessageBoard = this.initMessageBoard.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
    this.handleMentionClick = this.handleMentionClick.bind(this);
    this.addComment = this.addComment.bind(this);
  }

  /**
   * Initialize the message board with tasks and messages data
   */
  initMessageBoard() {
    // Render all task messages
    const container = document.querySelector(".message-board");
    if (container) {
      this.renderAllMessages();
    }

    // Setup mention click handlers
    this.setupMentionHandlers();
  }

  /**
   * Render all messages across all tasks
   */
  renderAllMessages() {
    const container = document.querySelector(".message-board");
    if (!container) return;

    let html = "";

    // Group messages by task
    this.messages.forEach((msg) => {
      const taskRef = msg.taskRef || "general";

      // Find the task title for display
      const taskTitle = this.getTaskTitle(taskRef);

      if (taskRef !== "general") {
        html += `
          <div class="message-section">
            <h2>${taskTitle}</h2>
        `;
      }

      // Render each message in the thread
      const taskMessages = this.messages.filter((m) => m.taskRef === taskRef);

      for (const msg of taskMessages) {
        html += this.renderMessage(msg, false);
      }

      if (taskRef !== "general") {
        html += "</div>";
      }
    });

    container.innerHTML = html;
  }

  /**
   * Render a single message with proper formatting
   */
  renderMessage(msg, isReply) {
    const hasMentions = this.hasMentions(msg.text);
    const mentionHuman = msg.mentions && msg.mentions.includes("human");

    // Format text as HTML (Markdown support would go here in production)
    let textHtml = this.formatText(msg.text);

    // Add mentions highlighting if present
    if (hasMentions) {
      textHtml = this.highlightMentions(textHtml, msg.mentions || []);
    }

    const timeStr = new Date(msg.createdAt).toLocaleString();

    let senderClass = "";
    if (msg.sender === "human") {
      senderClass = "human";
    } else if (msg.sender === "developer") {
      senderClass = "developer";
    } else if (msg.sender === "evaluator") {
      senderClass = "evaluator";
    }

    let repliesHtml = "";
    if (msg.replies && msg.replies.length > 0) {
      repliesHtml = this.renderReplies(msg.replies);
    }

    return `
      <div class="task-comment">
        ${isReply ? '<div class="reply-header">Reply to: ' + this.getTaskTitle(msg.taskRef) + "</div>" : ""}

        <div class="comment-author ${senderClass}">
          <span class="author-name">${this.getAgentName(msg.sender)}</span>
          <span class="timestamp">${timeStr}</span>
        </div>

        <div class="comment-text prose-content">
          ${textHtml}
        </div>

        ${repliesHtml ? `<div class="msg-replies">${repliesHtml}</div>` : ""}
      </div>
    `;
  }

  /**
   * Render replies to a message
   */
  renderReplies(replies) {
    let html = "";

    for (const reply of replies) {
      const timeStr = new Date(reply.createdAt).toLocaleString();

      html += `
        <div class="msg-reply">
          <div class="comment-author developer">
            <span class="author-name">Developer</span>
            <span class="timestamp">${timeStr}</span>
          </div>

          <div class="comment-text prose-content">
            ${this.formatText(reply.text)}
          </div>
        </div>
      `;
    }

    return html;
  }

  /**
   * Format text content using Markdown (Marked.js) when available.
   * Falls back to minimal formatting when Marked is not present.
   *
   * Note: Marked is expected to be included in the page (e.g. via index.html).
   * This function returns an HTML string. Mentions are handled after markdown rendering.
   */
  formatText(text) {
    const src = text == null ? "" : String(text);

    // Prefer Marked.js if available in the environment
    try {
      // `marked` can expose either `marked.parse` or be callable directly depending on version.
      if (typeof marked !== "undefined") {
        // Use safe defaults for marked if available (user can customize globally)
        // If marked provides an async renderer or options, we keep it simple here.
        const parser =
          typeof marked.parse === "function" ? marked.parse : marked;
        const html = parser(src);
        return html;
      }
    } catch (err) {
      // If marked exists but parsing fails for any reason, fall through to the fallback renderer.
      console.warn(
        "[warn] Marked.js parsing failed, using fallback formatting:",
        err && err.message,
      );
    }

    // Fallback: escape HTML then do a couple of inline markup substitutions
    const escaped = src
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return escaped
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br/>");
  }

  /**
   * Highlight mentions in formatted text
   */
  highlightMentions(textHtml, mentions) {
    if (!mentions || mentions.length === 0) return textHtml;

    let html = textHtml;

    for (const mention of mentions) {
      const className = mention === "human" ? "mention-human-card" : "mention";

      // Replace @mention with clickable span
      const regex = new RegExp(
        `@${mention.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "g",
      );
      html = html.replace(
        regex,
        `<span class="${className}" onclick="handleMentionClick('${mention}')">@${mention}</span>`,
      );
    }

    return html;
  }

  /**
   * Handle mention click events
   */
  handleMentionClick(mention) {
    if (mention === "human") {
      // Trigger human escalation
      this.triggerHumanEscalation();
    } else {
      // Open agent configuration or memory modal
      this.openAgentModal(mention);
    }
  }

  /**
   * Setup mention click handlers globally
   */
  setupMentionHandlers() {
    document.addEventListener("click", (e) => {
      const target = e.target;

      if (
        target.classList.contains("mention") ||
        target.classList.contains("mention-human-card")
      ) {
        const mentionText = target.textContent.replace("@", "");
        this.handleMentionClick(mentionText);
      }
    });
  }

  /**
   * Trigger human escalation when @human is mentioned
   */
  triggerHumanEscalation() {
    // Log escalation event
    console.log("ESCALATION: Human notified of issue");

    // Add system comment to message board
    const taskRef = this.getActiveTaskRef();
    if (taskRef) {
      this.addSystemComment(taskRef, "HUMAN ESCALATED", true);
    }
  }

  /**
   * Get active task reference from current view
   */
  getActiveTaskRef() {
    const taskId = document.querySelector(".kanban-card.active")?.dataset
      .taskId;
    if (taskId) {
      return this.getTaskFromId(taskId)?.taskRef || "general";
    }
    return "general";
  }

  /**
   * Get task title from reference
   */
  getTaskTitle(ref) {
    const task = this.getTaskFromId(ref);
    return task ? task.title : ref;
  }

  /**
   * Get agent name from sender type
   */
  getAgentName(sender) {
    const names = {
      human: "Human",
      developer: "Developer Agent",
      evaluator: "Evaluator Agent",
    };
    return names[sender] || sender;
  }

  /**
   * Get task object from ID or reference
   */
  getTaskFromId(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) return task;

    // Try to find by taskRef
    return this.tasks.find((t) => t.taskRef === id);
  }

  /**
   * Add a comment to a task
   */
  addComment(taskId, author, text) {
    const newMessage = {
      id: Date.now().toString(),
      sender: author,
      text: text,
      mentions: this.extractMentions(text),
      replies: [],
      status: "open",
      createdAt: new Date().toISOString(),
      taskRef: taskId || "general",
    };

    // Find existing messages for this task and append
    const taskMessages = this.messages.filter((m) => m.taskRef === taskId);
    taskMessages.push(newMessage);

    // Update stored messages
    this.messages = [...this.messages, ...taskMessages];

    // Re-render to show new comment
    if (document.querySelector(".message-board")) {
      this.renderAllMessages();
    }

    return newMessage;
  }

  /**
   * Add a system comment (e.g., escalation)
   */
  addSystemComment(taskId, text, isEscalation = false) {
    const newMessage = {
      id: Date.now().toString(),
      sender: "system",
      text: text,
      mentions: [],
      replies: [],
      status: isEscalation ? "escalated" : "open",
      createdAt: new Date().toISOString(),
      taskRef: taskId || "general",
    };

    const taskMessages = this.messages.filter((m) => m.taskRef === taskId);
    taskMessages.push(newMessage);

    this.messages = [...this.messages, ...taskMessages];

    if (document.querySelector(".message-board")) {
      this.renderAllMessages();
    }

    return newMessage;
  }

  /**
   * Post a general message to the message board (not tied to a specific task)
   * @param {string} sender - The sender of the message ("human", "developer", "evaluator", etc.)
   * @param {string} text - The message content
   */
  postMessage(sender, text) {
    const newMessage = {
      id: Date.now().toString(),
      sender: sender || "human",
      text: text || "",
      mentions: this.extractMentions(text),
      replies: [],
      status: "active",
      createdAt: new Date().toISOString(),
      taskRef: null, // General message board post, not tied to a task
    };

    this.messages.push(newMessage);

    if (document.querySelector(".message-board")) {
      this.renderAllMessages();
    }

    return newMessage;
  }

  /**
   * Extract @mentions from text using regex
   */
  extractMentions(text) {
    const matches = [...text.matchAll(this.mentionRegex)];
    const mentions = Array.from(new Set(matches.map((m) => m[1])));
    return mentions;
  }

  /**
   * Check if text contains any mentions
   */
  hasMentions(text) {
    return this.extractMentions(text).length > 0;
  }

  /**
   * Open agent configuration modal for mentioned agent
   */
  openAgentModal(agentName) {
    const container = document.querySelector(".agents-page");
    if (container) {
      // In production, render the appropriate modal based on agent name
      console.log("Opening agent modal:", agentName);
    }
  }

  /**
   * Get all messages for a specific task
   */
  getMessagesByTask(taskId) {
    return this.messages.filter(
      (m) => m.taskRef === taskId || m.taskRef === "general",
    );
  }

  /**
   * Update message status (e.g., close thread after resolution)
   */
  updateMessageStatus(messageId, newStatus) {
    const msgIndex = this.messages.findIndex((m) => m.id === messageId);
    if (msgIndex !== -1) {
      this.messages[msgIndex].status = newStatus;

      // Re-render to show updated status
      if (document.querySelector(".message-board")) {
        this.renderAllMessages();
      }

      return true;
    }
    return false;
  }

  /**
   * Initialize the module with provided data or defaults
   */
  initialize(data) {
    if (data) {
      this.tasks = data.tasks || [];
      this.messages = data.messages || [];
    }

    this.initMessageBoard();
  }
}

// Export for use in other modules
if (typeof module !== "undefined") {
  module.exports = MessageBoardModule;
}
