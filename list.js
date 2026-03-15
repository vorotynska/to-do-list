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
const template = document.getElementById('taskTemplate');

//localStorage.removeItem('tasks');
// Loading tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

renderTasks()

addBtn.addEventListener('click', addTask);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});
taskList.addEventListener('click', handleListClick);
clearBtn.addEventListener('click', clearCompleted);

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

    saveTasks();
    renderTasks();
    input.value = '';
    input.focus();
}

// Task display function
function renderTasks() {
    taskList.replaceChildren();

    const fragment = document.createDocumentFragment();
    tasks.forEach((task, index) => {
        const clone = template.content.cloneNode(true);
        //const li = document.createElement('li');
        //li.dataset.index = index;
        // const span = document.createElement('span');
        //span.textContent = task.text;
        const li = clone.querySelector('li');
        const span = clone.querySelector('.taskText');
        li.dataset.index = index;
        span.textContent = task.text;

        if (task.completed) {
            li.classList.add('completed');
        }

        // const deleteBtn = document.createElement('button');
        // deleteBtn.textContent = 'Delete';
        // deleteBtn.className = 'deleteBtn'

        // li.appendChild(span);
        // li.appendChild(deleteBtn);
        fragment.appendChild(li);
    });
    taskList.appendChild(fragment);
    infoTasks();
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

// Deleting a list of completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);

    clearBtn.style.display = 'none';
    saveTasks();
    renderTasks();
}

// General information about tasks
function infoTasks() {
    let completedTasks = tasks.filter((task) => task.completed);
    let activeTasks = tasks.length - completedTasks.length;

    all.textContent = `All: ${tasks.length}`;
    completed.textContent = `Completed: ${completedTasks.length}`;
    active.textContent = `Active: ${activeTasks}`;

    if (completedTasks.length > 0) clearBtn.style.display = 'block';
}