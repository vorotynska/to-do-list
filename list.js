// list.js
const SELECTORS = {
    input: '#taskInput',
    addBtn: '#addBtn',
    taskList: '#taskList',
    all: '#all',
    active: '#active',
    completed: '#completed',
    clearBtn: '#clearBtn',
    themeToggle: '#themeToggle',
    clearInput: '#clearInput',
    emptyState: '#emptyState',
    errorMsg: '#errorMsg',
    searchInput: '#searchInput',
    progressBar: '#progressBar',
    warning: '#warning',
    clearSearch: '#clearSearch',
}

const input = document.querySelector(SELECTORS.input);
const addBtn = document.querySelector(SELECTORS.addBtn);
const taskList = document.querySelector(SELECTORS.taskList);
const all = document.querySelector(SELECTORS.all);
const active = document.querySelector(SELECTORS.active);
const completed = document.querySelector(SELECTORS.completed);
const clearBtn = document.querySelector(SELECTORS.clearBtn);
const themeBtn = document.querySelector(SELECTORS.themeToggle);
const clearInputBtn = document.querySelector(SELECTORS.clearInput);
const emptyState = document.querySelector(SELECTORS.emptyState);
const errorMsg = document.querySelector(SELECTORS.errorMsg);
const searchInput = document.querySelector(SELECTORS.searchInput);
const progressBar = document.querySelector(SELECTORS.progressBar);
const warning = document.querySelector(SELECTORS.warning);
const clearSearchBtn = document.querySelector(SELECTORS.clearSearch);

const filterBtns = document.querySelectorAll('.filter');
const template = document.getElementById('taskTemplate');
let currentFilter = 'all';
let dragIndex = null;
let searchText = '';
let lastMessage = '';
let keyboardDragIndex = null;
let isDragginWithKeyboard = false;

//localStorage.removeItem('tasks');
// Loading tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

init();

function init() {
    if (localStorage.getItem('theme') === 'true') {
        document.body.classList.add('dark');
    }
    renderTasks();
    updateInfo();
}

// Save function
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Task display function
function renderTasks() {
    taskList.replaceChildren();

    let filtered = getFilteredTasks();

    const fragment = document.createDocumentFragment();

    filtered.forEach(task => {
        const index = tasks.indexOf(task);
        const li = createTaskElement(task, index);
        fragment.appendChild(li);
    });

    taskList.appendChild(fragment);
    announceSearchResults(filtered);
    updateInfo();
}

// Flters ansd Search
function getFilteredTasks() {
    let filtered = tasks;

    // Filters
    if (currentFilter === 'active') {
        filtered = tasks.filter(t => !t.completed);
    }

    if (currentFilter === 'completed') {
        filtered = tasks.filter(t => t.completed);
    }

    // Search
    if (searchText) {
        filtered = filtered.filter(task => task.text.toLowerCase().includes(searchText));
    }
    return filtered;
}

// Creating one element (the most important)
function createTaskElement(task, index) {
    const clone = template.content.cloneNode(true);
    const li = clone.querySelector('li');
    li.dataset.index = index;
    li.tabIndex = 0;
    li.draggable = true;

    const span = clone.querySelector('.taskText');
    span.textContent = task.text;

    const deleteBtn = clone.querySelector('.deleteBtn');
    deleteBtn.setAttribute('aria-label', `Delete task ${task.text}`);

    const checkbox = clone.querySelector('.checkbox');
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark task ${task.text} as completed`);

    if (task.completed) {
        li.classList.add('completed');
    }

    if (isDragginWithKeyboard && index === keyboardDragIndex) {
        li.classList.add('dragging')
    }
    li.setAttribute('aria-grabbed', isDragginWithKeyboard && index === keyboardDragIndex);

    if (index === tasks.length - 1) highLightingNewTask(li);

    return li;
}

// Add task
function addTask() {
    const text = input.value.trim();
    if (text === '') {
        errorMsg.textContent = 'Please enter a task';
        return;
    }
    errorMsg.textContent = '';

    tasks.push({
        text,
        completed: false
    });

    input.value = '';
    input.focus();
    // Announcement: task added
    sessionWarning(warning, 'Task added');

    saveTasks();
    renderTasks();
}

// Clear input
function clearInput() {
    input.value = '';
    input.focus();
    sessionWarning(warning, 'Input cleared');
}

// Clear search input
function clearSearchInput() {
    searchInput.value = '';
    searchText = '';
    renderTasks();

    sessionWarning(warning, 'Search cleared');
}

// One handler insted of many
function handleListClick(e) {
    const li = e.target.closest('li');
    if (!li) return;
    const index = Number(li.dataset.index);
    const checkbox = e.target.closest('input');

    if (e.target.classList.contains('deleteBtn')) {
        e.stopPropagation();
        tasks.splice(index, 1);
        // Announcement: task delete
        sessionWarning(warning, 'Task deleted');
    } else {
        tasks[index].completed = checkbox.checked;
    }

    saveTasks();
    renderTasks();
}

// Drop & Drag
function draggedLi(e) {
    const li = e.target.closest('li');
    if (!li) return;
    const dropIndex = Number(li.dataset.index);
    if (dragIndex === dropIndex) return
    const draggedTask = tasks.splice(dragIndex, 1)[0];
    tasks.splice(dropIndex, 0, draggedTask);

    saveTasks();
    renderTasks();
}

// Dragging with keyboard
function draggingWithKeyboard(e) {
    const li = e.target.closest('li');
    if (!li) return;

    const index = Number(li.dataset.index);

    // Space take / release
    if (e.key === ' ') {
        e.preventDefault();
        if (!isDragginWithKeyboard) {
            // take
            keyboardDragIndex = index;
            isDragginWithKeyboard = true;
            sessionWarning(warning, `Item picked up`);
        } else {
            // release
            isDragginWithKeyboard = false;
            keyboardDragIndex = null;
            sessionWarning(warning, `Item dropped`);
        }
    }
    // ESC cancellaton
    if (e.key === 'Escape' && isDragginWithKeyboard) {
        isDragginWithKeyboard = false;
        keyboardDragIndex = null;
        sessionWarning(warning, 'Drag canceled');
    }
    // Arrows
    if (isDragginWithKeyboard) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            moveTask(index, index + 1);
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            moveTask(index.index - 1);
        }
    }
}

// Move function with keyboard
function moveTask(from, to) {
    if (to < 0 || to >= tasks.length) return;

    const item = tasks.splice(from, 1)[0];
    tasks.splice(to, 0, item);

    keyboardDragIndex = to;

    saveTasks();
    renderTasks();

    // return focus
    const newItem = taskList.querySelector(`[data-index="${to}"]`);
    if (newItem) newItem.focus();
}

// Deleting a list of completed tasks
function clearCompleted() {
    const count = tasks.filter(task => task.completed).length;
    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();

    sessionWarning(warning, `${count} completed task cleared`);
}

// Function: double click you can change the task text
function editTask(span, index) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = tasks[index].text;

    span.replaceWith(input);
    input.focus();

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') saveEdit();
    });

    function saveEdit() {
        const newText = input.value.trim();
        if (newText) {
            tasks[index].text = newText;
        }
        sessionWarning(warning, `Task change to ${newText}`);
        saveTasks();
        renderTasks();
    }
}

// Highlighting a new task
function highLightingNewTask(li) {
    li.classList.add('new-task');
    setTimeout(() => {
        li.classList.remove('new-task');
    }, 800);
}

// General information about tasks
function updateInfo() {
    let completedTasks = tasks.filter((task) => task.completed).length;
    let activeTasks = tasks.length - completedTasks;

    all.textContent = `All: ${tasks.length}`;
    completed.textContent = `Completed: ${completedTasks}`;
    active.textContent = `Active: ${activeTasks}`;

    // progressBar
    const percent = tasks.length === 0 ? 0 : (completedTasks / tasks.length) * 100;
    progressBar.setAttribute('aria-valuenow', percent);
    progressBar.style.width = percent + '%';
    noTasks();
}

// message 'No tasks yet'
function noTasks() {
    if (tasks.length === 0) {
        emptyState.style.display = 'block'
    } else {
        emptyState.style.display = 'none'
    }
}

// Announcement task status
function sessionWarning(el, text) {
    if (text === lastMessage) return;
    lastMessage = text;

    setTimeout(() => {
        el.textContent = text;
        el.classList.remove('fade-out')
        el.classList.add('visible');
    }, 100);

    setTimeout(() => {
        el.classList.add('fade-out');
    }, 2000);
};

// Announcement search result
function announceSearchResults(filtered) {
    if (!searchText) return;
    if (filtered.length === 0) {
        sessionWarning(warning, 'No tasks found');
    } else {
        sessionWarning(warning, `${filtered.length} task found`);
    }
}

// Filter status task: all, active, completed
function filterStatusTask(btn) {
    currentFilter = btn.dataset.filter;

    filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    sessionWarning(warning, `Showing ${currentFilter} task`);
    renderTasks();
}

// add task
addBtn.addEventListener('click', addTask);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') addTask();
});

taskList.addEventListener('click', handleListClick);
clearBtn.addEventListener('click', clearCompleted);
clearInputBtn.addEventListener('click', clearInput);

// UI filters
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterStatusTask(btn)
    });
});

// Drag & Drop
taskList.addEventListener('dragstart', e => {
    dragIndex = e.target.dataset.index;
});

taskList.addEventListener('dragover', e => {
    e.preventDefault();
});
taskList.addEventListener('drop', draggedLi)

// Dragging with keybord
taskList.addEventListener('keydown', draggingWithKeyboard);


// Dark Mode
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark'));
});

// Search task
searchInput.addEventListener('input', (e) => {
    searchText = e.target.value.toLowerCase();
    renderTasks();
});

// Clear search
clearSearchBtn.addEventListener('click', clearSearchInput);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        clearSearchInput();
    }
});

// Event delegation. Edit task
taskList.addEventListener('dblclick', (e) => {
    const span = e.target.closest('.taskText');
    if (!span) return;

    const li = span.closest('li');
    const index = Number(li.dataset.index);
    editTask(span, index);
});