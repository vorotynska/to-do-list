// list.js
const input = document.getElementById("taskInput");
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById("taskList");


addBtn.addEventListener('click', addTask);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});

function addTask() {
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