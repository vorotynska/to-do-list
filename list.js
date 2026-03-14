// list.js
const input = document.getElementById("taskInput");
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById("taskList");
const all = document.getElementById('all');
const active = document.getElementById('active');
const completed = document.getElementById('completed');
const clearBtn = document.getElementById('clearBtn');

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
    taskList.innerHTML = '';

    const fragment = document.createDocumentFragment();
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.dataset.index = index;
        const span = document.createElement('span');
        span.textContent = task.text;

        if (task.completed) {
            li.classList.add('completed');
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'deleteBtn'

        li.appendChild(span);
        li.appendChild(deleteBtn);
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