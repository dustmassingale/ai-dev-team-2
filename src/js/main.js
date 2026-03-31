// AWM Application Initialization - Main Entry Point
// This file is injected by build.py into index.html

// Settings Modal for Agent Configuration
const settingsModal = document.getElementById("settings-modal");

function openSettingsModal() {
  console.log("[AWM] Opening settings modal...");
  settingsModal.classList.add("open");
  document
    .getElementById("close-settings-modal")
    .addEventListener("click", () => {
      settingsModal.classList.remove("open");
    });
}

// Initialize AWM Application
function initAWM() {
  console.log("[AWM] Initializing AWM...");

  // Add settings trigger button to topbar if not already present
  const existingBtn = document.getElementById("settings-trigger-btn");
  if (!existingBtn) {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-sm";
    btn.textContent = "⚙️ Configure Agents";
    btn.id = "settings-trigger-btn";
    btn.style.cssText = "margin-left: 12px;";
    document.getElementById("topbar").appendChild(btn);

    btn.addEventListener("click", () => {
      openSettingsModal();
    });
  } else {
    // Ensure button is visible (not covered by modal)
    const existingBtn = document.getElementById("settings-trigger-btn");
    if (existingBtn && settingsModal.classList.contains("open")) {
      existingBtn.style.display = "none";
    }
  }

  // Initialize navigation using Router
  initNavigation();
}

function initNavigation() {
  console.log("[AWM] Initializing navigation...");

  const router = new Router({
    routes: [
      { path: "kanban", handler: () => showPage("kanban") },
      { path: "agents", handler: () => showPage("agents") },
      { path: "board", handler: () => showPage("board") },
      { path: "chat", handler: () => showPage("chat") },
    ],
  });

  router.onRouteChange = (path) => {
    console.log("[AWM] Route changed to:", path);

    // Update active nav link
    const navLinks = document.querySelectorAll("#topbar nav a");
    navLinks.forEach((link) => {
      if (link.getAttribute("data-nav") === path) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Hide all pages and show the requested one
    const pages = document.querySelectorAll(".page");
    console.log("[AWM] Found", pages.length, "pages to navigate");
    pages.forEach((page) => {
      if (page.getAttribute("data-page") === path) {
        console.log("[AWM] Showing page:", page.getAttribute("data-page"));
        page.style.display = "flex";
      } else {
        console.log("[AWM] Hiding page");
        page.style.display = "none";
      }
    });

    // Scroll to top
    window.scrollTo(0, 0);
  };

  router.initialize();
}

function showPage(pageName) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => {
    if (page.getAttribute("data-page") === pageName) {
      page.style.display = "flex";
    } else {
      page.style.display = "none";
    }
  });
}

// Initialize the application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAWM);
} else {
  console.log("[AWM] DOM already loaded, initializing...");
  initAWM();
}
