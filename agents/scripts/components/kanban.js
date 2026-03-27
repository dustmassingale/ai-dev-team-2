// Kanban Module - Drag and Drop Functionality for Task Columns
// Provides visual task management with column-based organization

class KanbanModule {
  constructor(options = {}) {
    this.columns = options.columns || [];
    this.tasks = options.tasks || [];
    this.draggedTaskId = null;
    this.targetColumnId = null;

    // Bind methods for consistent `this` reference
    this.initBoard = this.initBoard.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  /**
   * Initialize the Kanban board with columns and tasks
   */
  initBoard() {
    // Create column elements if not provided
    if (!this.columns) {
      this.columns = [
        { id: 'backlog', label: 'Backlog' },
        { id: 'inprogress', label: 'In Progress' },
        { id: 'review', label: 'Review' },
        { id: 'done', label: 'Done' }
      ];
    }

    // Render columns and attach event listeners
    this.renderColumns();

    // Initialize drag-and-drop handlers
    this.setupDragAndDrop();
  }

  /**
   * Render column elements in the DOM
   */
  renderColumns() {
    const container = document.querySelector('.kanban-board');
    if (!container) return;

    this.columns.forEach(column => {
      const colElement = document.createElement('div');
      colElement.className = 'kanban-column';
      colElement.dataset.columnId = column.id;

      // Column header
      const header = document.createElement('div');
      header.className = 'kanban-col-header';
      header.innerHTML = `
        <h2 class="kanban-col-title">${column.label}</h2>
        <span class="kanban-col-count">0 tasks</span>
      `;

      // Column body (task container)
      const body = document.createElement('div');
      body.className = 'kanban-col-body';
      body.dataset.columnId = column.id;

      colElement.appendChild(header);
      colElement.appendChild(body);
      container.appendChild(colElement);

      // Attach drag-over event to column body
      body.addEventListener('dragover', this.handleDragOver);
      body.addEventListener('drop', this.handleDrop);
    });
  }

  /**
   * Setup drag-and-drop event handlers for tasks
   */
  setupDragAndDrop() {
    const taskCards = document.querySelectorAll('.kanban-card');

    taskCards.forEach(card => {
      card.addEventListener('dragstart', this.handleDragStart);
      card.addEventListener('dragend', this.handleDragEnd);
    });
  }

  /**
   * Handle drag start event on a task card
   */
  handleDragStart(e) {
    const taskId = e.target.dataset.taskId;
    this.draggedTaskId = taskId;

    // Add visual feedback
    e.target.classList.add('dragging');
    setTimeout(() => e.target.classList.remove('dragging'), 300);

    // Prevent default to allow drag operation
    e.preventDefault();
  }

  /**
   * Handle drag over event on a column body
   */
  handleDragOver(e) {
    const targetColumnId = e.target.dataset.columnId;
    this.targetColumnId = targetColumnId;

    // Add visual feedback for drop zone
    if (e.target.classList.contains('kanban-col-body')) {
      e.target.classList.add('drag-over');
    }

    e.preventDefault(); // Necessary to allow dropping
  }

  /**
   * Handle drop event on a column body
   */
  handleDrop(e) {
    const targetColumnId = e.target.dataset.columnId;

    if (this.draggedTaskId && this.targetColumnId === targetColumnId) {
      // Update task status in data model
      const taskIndex = this.tasks.findIndex(t => t.id === this.draggedTaskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex].status = targetColumnId;

        // Re-render to show updated state
        this.renderTasks();
      }
    }

    // Remove visual feedback
    document.querySelectorAll('.kanban-col-body').forEach(body => {
      body.classList.remove('drag-over');
    });

    e.preventDefault();
  }

  /**
   * Handle drag end event on a task card
   */
  handleDragEnd(e) {
    // Clean up any remaining visual states
    document.querySelectorAll('.kanban-card').forEach(card => {
      card.classList.remove('dragging');
    });

    this.draggedTaskId = null;
    this.targetColumnId = null;
  }

  /**
   * Render tasks within columns based on their status
   */
  renderTasks() {
    const columnBodies = document.querySelectorAll('.kanban-col-body');

    columnBodies.forEach(body => {
      body.innerHTML = ''; // Clear existing tasks

      const columnId = body.dataset.columnId;
      const columnTasks = this.tasks.filter(t => t.status === columnId);

      if (columnTasks.length > 0) {
        columnTasks.forEach(task => {
          const cardElement = document.createElement('div');
          cardElement.className = 'kanban-card';
          cardElement.dataset.taskId = task.id;

          // Card content based on existing implementation
          let commentsHtml = '';
          if (task.comments && task.comments.length > 0) {
            const commentCount = task.comments.filter(c => c.sender !== 'system').length;
            commentsHtml = `<span class="kanban-col-count">${commentCount} comments</span>`;
          }

          cardElement.innerHTML = `
            <div class="task-title">${task.title}</div>
            ${commentsHtml}
          `;

          body.appendChild(cardElement);
        });
      } else {
        // Empty state for column
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `<p>No tasks</p>`;
        body.appendChild(emptyState);
      }
    });
  }

  /**
   * Move a task to a different status/column
   */
  moveTask(taskId, newStatus) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      this.tasks[taskIndex].status = newStatus;
      this.renderTasks();
      return true;
    }
    return false;
  }

  /**
   * Get tasks for a specific column/status
   */
  getTasksByStatus(status) {
    return this.tasks.filter(t => t.status === status);
  }

  /**
   * Update task count display in column headers
   */
  updateColumnCounts() {
    const columnHeaders = document.querySelectorAll('.kanban-col-count');

    this.columns.forEach((column, index) => {
      if (columnHeaders[index]) {
        const statusTasks = this.tasks.filter(t => t.status === column.id);
        columnHeaders[index].textContent = `${statusTasks.length} tasks`;
      }
    });
  }

  /**
   * Initialize the module with provided data or defaults
   */
  initialize(data) {
    if (data) {
      this.tasks = data.tasks || [];
      this.columns = data.columns || this.columns;
    }

    this.initBoard();
    this.updateColumnCounts();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined') {
  module.exports = KanbanModule;
}
