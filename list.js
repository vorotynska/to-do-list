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

const filterBtns = document.querySelectorAll('.filter');
const template = document.getElementById('taskTemplate');
let currentFilter = 'all';
let dragIndex = null;
let searchText = '';

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
        filtered = tasks.filter(task => task.text.toLowerCase().includes(searchText));
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach((task) => {
        const index = tasks.indexOf(task);
        const clone = template.content.cloneNode(true);
        const li = clone.querySelector('li');
        li.dataset.index = index;
        li.tabIndex = 0;
        li.draggable = true;

        const span = clone.querySelector('.taskText');
        span.textContent = task.text;

        const deleteBtn = clone.querySelector('.deleteBtn');
        deleteBtn.setAttribute('aria-label', `Delete task ${task.text}`);

        const checkbox = clone.querySelector('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;

        span.addEventListener('dblclick', () => editTask(span, index));

        if (task.completed) {
            li.classList.add('completed');
        }

        if (index === tasks.length - 1) highLightingNewTask(li)

        fragment.appendChild(li);
    });
    taskList.appendChild(fragment);
    updateInfo();
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
        //tasks[index].completed = !tasks[index].completed
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

// Deleting a list of completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
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
    setTimeout(() => {
        el.textContent = text;
        el.classList.remove('fade-out')
        el.classList.add('visible');
    }, 150);

    setTimeout(() => {
        el.classList.add('fade-out');
    }, 3000);

    warning.addEventListener('transitioned', () => {
        if (el.classList.contains('fade-out')) {
            el.remove();
        }
    });
};

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
        btn.setAttribute('aria-pressed', 'true');
        currentFilter = btn.dataset.filter;
        filterBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');

        renderTasks();
    });
});

// Drag & Drop
taskList.addEventListener('dragstart', e => {
    dragIndex = e.target.dataset.index;
})
taskList.addEventListener('dragover', e => {
    e.preventDefault();
});
taskList.addEventListener('drop', draggedLi)

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