// State Management Utilities for Tasks and Agents
// Provides in-memory state handling for tasks, agents, and messages

class Store {
  constructor() {
    this.tasks = [];
    this.agents = [];
    this.messages = [];
    this.settings = {};

    // Initialize with default settings if empty
    if (Object.keys(this.settings).length === 0) {
      this.seedSettings();
    }
  }

  seedSettings() {
    this.settings = {
      pollInterval: 3000,
      lastUpdated: new Date().toISOString(),
      version: "1.0.0",
    };
  }

  // Task Management
  getTasks() {
    return [...this.tasks];
  }

  saveTasks(tasks) {
    this.tasks = tasks;
    return true;
  }

  createTask(task) {
    const newTask = {
      ...task,
      id: this.generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(updatedTask) {
    const index = this.tasks.findIndex((t) => t.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...updatedTask,
        updatedAt: new Date().toISOString(),
      };
      return true;
    }
    return false;
  }

  deleteTask(taskId) {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }

  // Agent Management
  getAgents() {
    return [...this.agents];
  }

  saveAgents(agents) {
    this.agents = agents;
    return true;
  }

  createAgent(agent) {
    const newAgent = {
      ...agent,
      id: this.generateUUID(),
      createdAt: new Date().toISOString(),
    };
    this.agents.push(newAgent);
    return newAgent;
  }

  updateAgent(updatedAgent) {
    const index = this.agents.findIndex((a) => a.id === updatedAgent.id);
    if (index !== -1) {
      this.agents[index] = {
        ...this.agents[index],
        ...updatedAgent,
        updatedAt: new Date().toISOString(),
      };
      return true;
    }
    return false;
  }

  deleteAgent(agentId) {
    const index = this.agents.findIndex((a) => a.id === agentId);
    if (index !== -1) {
      this.agents.splice(index, 1);
      return true;
    }
    return false;
  }

  // Message Management
  getMessages() {
    return [...this.messages];
  }

  saveMessages(messages) {
    this.messages = messages;
    return true;
  }

  createMessage(message) {
    const newMessage = {
      ...message,
      id: this.generateUUID(),
      createdAt: new Date().toISOString(),
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  updateMessage(updatedMessage) {
    const index = this.messages.findIndex((m) => m.id === updatedMessage.id);
    if (index !== -1) {
      this.messages[index] = {
        ...this.messages[index],
        ...updatedMessage,
        updatedAt: new Date().toISOString(),
      };
      return true;
    }
    return false;
  }

  deleteMessage(messageId) {
    const index = this.messages.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      this.messages.splice(index, 1);
      return true;
    }
    return false;
  }

  // Settings Management
  getSettings() {
    return { ...this.settings };
  }

  saveSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    this.settings.lastUpdated = new Date().toISOString();
    return true;
  }

  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  // Utility Methods
  clearAll() {
    this.tasks = [];
    this.agents = [];
    this.messages = [];
    this.settings = {};
  }

  resetStore() {
    this.clearAll();
    this.seedSettings();
  }
}

// Export for use in other modules
if (typeof module !== "undefined") {
  module.exports = Store;
}
