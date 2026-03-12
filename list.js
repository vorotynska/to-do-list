// list.js
const input = document.getElementById("taskInput");
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById("taskList");
//localStorage.removeItem('tasks');
// Loading tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
console.log(tasks)
renderTasks();

addBtn.addEventListener('click', addTask);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});

// Save function
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Task display function
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task.text;

        if (task.completed) {
            li.classList.add('completed');
        }

        li.addEventListener('click', () => {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            renderTasks();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';

        deleteBtn.addEventListener('click', () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}


// Add task
function addTask() {
    const text = input.value.trim();
    if (text === '') return alert('Ensure you input a value in field');

    tasks.push({
        text: text,
        completed: false
    });

    saveTasks();
    renderTasks();
    input.value = '';
}


/*
function addTask1() {
    if (input.value.trim() === '') {
        alert('Ensure you input a value in field')
    } else {
        const li = document.createElement('li');
        taskList.appendChild(li);
        li.textContent = input.value.trim();
        li.addEventListener('click', () => {
            li.classList.toggle('completed');
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.setAttribute('class', 'deleteBtn');
        li.appendChild(deleteBtn);
        deleteBtn.addEventListener('click', () => {
            li.remove();
        })
    }

    input.value = '';
}
*/