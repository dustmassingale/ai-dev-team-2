// Kanban board behavior and state management

let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];
let draggedTaskId = null;

const columns = {
    backlog: "backlog",
    todo: "todo",
    doing: "doing",
    review: "review",
    done: "done",
};

document.addEventListener("DOMContentLoaded", () => {
    bindForm();
    bindColumnDropZones();
    renderBoard();
    populateParentSelect();
});

function bindForm() {
    const form = document.getElementById("taskForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = document.getElementById("title")?.value?.trim() || "";
        if (!title) return;

        const newTask = {
            id: generateId(),
            title,
            description: document.getElementById("description")?.value?.trim() || "",
            assignee: document.getElementById("assignee")?.value?.trim() || "",
            taskNumber: parseTaskNumber(document.getElementById("id")?.value),
            dueDate: document.getElementById("dueDate")?.value || "",
            parentTask: document.getElementById("parentTask")?.value || "",
            linkedTasks: parseLinkedTasks(document.getElementById("linkedTasks")?.value),
            status: columns.backlog,
        };

        tasks.push(newTask);
        saveAndRender();
        form.reset();
    });
}

function parseTaskNumber(value) {
    if (!value) return null;
    const parsed = Number.parseInt(String(value).trim(), 10);
    return Number.isNaN(parsed) ? null : parsed;
}

function parseLinkedTasks(value) {
    if (!value) return [];
    return String(value)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

function generateId() {
    return (
        "TASK-" +
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 7).toUpperCase()
    );
}

function populateParentSelect() {
    const select = document.getElementById("parentTask");
    if (!select) return;

    select.innerHTML = '<option value="">No Parent</option>';

    tasks.forEach((task) => {
        const option = document.createElement("option");
        option.value = task.id;
        option.textContent = `${task.taskNumber ?? "N/A"} - ${task.title}`;
        select.appendChild(option);
    });
}

function getColumnContainer(columnId) {
    return document.getElementById(columnId);
}

function clearColumns() {
    Object.values(columns).forEach((columnId) => {
        const container = getColumnContainer(columnId);
        if (container) container.innerHTML = "";
    });
}

function renderBoard() {
    clearColumns();

    tasks.forEach((task) => {
        const card = createTaskCard(task);
        const container = getColumnContainer(task.status);
        if (container) container.appendChild(card);
    });

    updateCounts();
}

function createTaskCard(task) {
    const card = document.createElement("div");
    card.className = "w3-card-4 w3-padding w3-margin-bottom w3-white";
    card.dataset.id = task.id;
    card.draggable = true;

    const number = task.taskNumber ?? "#";
    const assignee = task.assignee || "Unassigned";

    card.innerHTML = `
        <div class="w3-text-dark-grey"><strong>${escapeHtml(String(number))} - ${escapeHtml(task.title)}</strong></div>
        <div class="w3-small w3-text-grey">Assignee: ${escapeHtml(assignee)}</div>
    `;

    card.addEventListener("click", () => {
        // click-to-open minimal move prompt
        moveTaskPrompt(task.id);
    });

    card.addEventListener("dragstart", () => {
        draggedTaskId = task.id;
        card.classList.add("w3-border-blue");
    });

    card.addEventListener("dragend", () => {
        draggedTaskId = null;
        card.classList.remove("w3-border-blue");
    });

    return card;
}

function moveTaskPrompt(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const target = window.prompt(
        'Move to: backlog, todo, doing, review, done',
        task.status
    );

    if (!target) return;
    const normalized = target.trim().toLowerCase();

    if (!Object.prototype.hasOwnProperty.call(columns, normalized)) {
        return;
    }

    task.status = normalized;
    saveAndRender();
}

function bindColumnDropZones() {
    Object.values(columns).forEach((columnId) => {
        const column = document.getElementById(columnId);
        if (!column) return;

        column.addEventListener("dragover", (e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        });

        column.addEventListener("drop", (e) => {
            e.preventDefault();
            if (!draggedTaskId) return;

            const task = tasks.find((t) => t.id === draggedTaskId);
            if (!task) return;

            task.status = columnId;
            saveAndRender();
        });
    });
}

function updateCounts() {
    Object.values(columns).forEach((columnId) => {
        const countEl = document.getElementById(`${columnId}Count`);
        if (!countEl) return;
        const count = tasks.filter((t) => t.status === columnId).length;
        countEl.textContent = String(count);
    });
}

function saveAndRender() {
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
    populateParentSelect();
    renderBoard();
}

function escapeHtml(str) {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
