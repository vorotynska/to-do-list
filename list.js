// list.js
const SELECROTS = {
    input: '#taskInput',
    addBtn: '#addBtn',
    taskList: '#taskList',
    all: '#all',
    active: '#active',
    completed: '#completed',
    clearBtn: '#clearBtn',

}

const input = document.querySelector(SELECROTS.input);
const addBtn = document.querySelector(SELECROTS.addBtn);
const taskList = document.querySelector(SELECROTS.taskList);
const all = document.querySelector(SELECROTS.all);
const active = document.querySelector(SELECROTS.active);
const completed = document.querySelector(SELECROTS.completed);
const clearBtn = document.querySelector(SELECROTS.clearBtn);
const filterBtns = document.querySelectorAll('.filter');
const template = document.getElementById('taskTemplate');
let currentFilter = 'all';
let dragIndex = null;

//localStorage.removeItem('tasks');
// Loading tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

init();

function init() {
    renderTasks();
    updateInfo();
}

addBtn.addEventListener('click', addTask);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});
taskList.addEventListener('click', handleListClick);
clearBtn.addEventListener('click', clearCompleted);

// UI filters
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        filterBtns.forEach(b => b.classList.remove('active'));
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

// Save function
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add task
function addTask() {
    const text = input.value.trim();
    if (text === '') return alert('Ensure you input a value in field');

    tasks.push({
        text,
        completed: false
    });

    input.value = '';
    input.focus();

    saveTasks();
    renderTasks();
}

// Task display function
function renderTasks() {
    taskList.replaceChildren();
    let filtered = tasks;

    if (currentFilter === 'active') {
        filtered = tasks.filter(t => !t.completed);
    }

    if (currentFilter === 'completed') {
        filtered = tasks.filter(t => t.completed);
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach((task, index) => {
        const clone = template.content.cloneNode(true);
        const li = clone.querySelector('li');
        li.draggable = true;
        const span = clone.querySelector('.taskText');
        li.dataset.index = index;
        span.textContent = task.text;
        span.addEventListener('dbclick', () => editTask(span, index));

        if (task.completed) {
            li.classList.add('completed');
        }

        fragment.appendChild(li);
    });
    taskList.appendChild(fragment);
    updateInfo();
}

// One handler insted of many
function handleListClick(e) {
    const li = e.target.closest('li');
    if (!li) return;

    const index = Number(li.dataset.index);

    if (e.target.classList.contains('deleteBtn')) {
        e.stopPropagation();
        tasks.splice(index, 1);
    } else {
        tasks[index].completed = !tasks[index].completed
    }

    saveTasks();
    renderTasks();
}

// Drop & Drag
function draggedLi(e) {
    const li = e.target.closest('li');
    if (!li) return;
    const dropIndex = li.dataset.index;
    const draggedTask = tasks.splice(dragIndex, 1)[0];
    tasks.splace(dropIndex, 0, draggedTask);

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

// General information about tasks
function updateInfo() {
    let completedTasks = tasks.filter((task) => task.completed).length;
    let activeTasks = tasks.length - completedTasks;

    all.textContent = `All: ${tasks.length}`;
    completed.textContent = `Completed: ${completedTasks}`;
    active.textContent = `Active: ${activeTasks}`;
}