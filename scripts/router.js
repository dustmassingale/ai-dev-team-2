// Vanilla JavaScript Router for Single Page Application Navigation
// Provides client-side routing without server configuration

class Router {
  constructor(options = {}) {
    this.routes = options.routes || [];
    this.currentRoute = null;
    this.initialized = false;

    // Bind methods to ensure consistent `this` reference
    this.navigate = this.navigate.bind(this);
    this.onRouteChange = options.onRouteChange || (() => {});
  }

  /**
   * Register a new route
   * @param {string} path - Route path pattern (e.g., '/tasks', '/agents/:id')
   * @param {Function} handler - Function to execute when route matches
   * @returns {Router} This router for method chaining
   */
  register(path, handler) {
    this.routes.push({ path, handler });
    return this;
  }

  /**
   * Navigate to a specific route
   * @param {string} path - Target route path
   * @returns {Router} This router for method chaining
   */
  navigate(path) {
    if (!this.initialized) {
      this.initialize();
    }

    // Update URL hash
    window.location.hash = path;

    // Find matching route handler
    const matchedRoute = this.routes.find(route =>
      this.matchesPath(route.path, path)
    );

    if (matchedRoute && typeof matchedRoute.handler === 'function') {
      try {
        this.currentRoute = path;
        return matchedRoute.handler();
      } catch (error) {
        console.error(`Error in route handler for ${path}:`, error);
        throw error;
      }
    }

    // Default fallback handler if no match found
    this.onRouteChange(path);
  }

  /**
   * Check if a path matches a route pattern
   * @param {string} pattern - Route pattern to match against
   * @param {string} targetPath - Path to check
   * @returns {boolean} True if paths match
   */
  matchesPath(pattern, targetPath) {
    // Simple exact match first
    if (pattern === targetPath) return true;

    // Handle parameterized routes like /agents/:id
    const paramPattern = pattern.replace(/:([a-zA-Z0-9]+)/g, '([^/]+)');

    try {
      const regex = new RegExp(`^${paramPattern}$`);
      return regex.test(targetPath);
    } catch (error) {
      console.error('Invalid route pattern:', pattern);
      return false;
    }
  }

  /**
   * Initialize the router by setting up event listeners
   */
  initialize() {
    if (this.initialized) return;

    this.initialized = true;

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const path = window.location.hash.slice(1);
      this.navigate(path || '/');
    });

    // Handle initial load if no hash exists
    if (!window.location.hash) {
      this.navigate('/');
    }

    // Fallback for browsers that don't support hashchange
    setInterval(() => {
      if (!window.location.hash && !this.initialized) {
        window.addEventListener('hashchange', () => {
          const path = window.location.hash.slice(1);
          this.navigate(path || '/');
        });
        this.initialized = true;
      }
    }, 250);
  }

  /**
   * Get the current route path
   * @returns {string} Current route path
   */
  getCurrentRoute() {
    return window.location.hash.slice(1) || '/';
  }

  /**
   * Check if we're on a specific route
   * @param {string} path - Route to check against
   * @returns {boolean} True if current route matches
   */
  isRoute(path) {
    return this.getCurrentRoute() === path;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined') {
  module.exports = Router;
}
