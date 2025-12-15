const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

// Cargar tareas al inicio
document.addEventListener('DOMContentLoaded', loadTasks);

function loadTasks() {
  fetch('/api/todos')
    .then(res => res.json())
    .then(tasks => {
      taskList.innerHTML = '';
      tasks.forEach(task => renderTask(task));
    });
}

function renderTask(task) {
  const li = document.createElement('li');
  if (task.completed) li.classList.add('completed');
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleComplete(task.id, checkbox.checked));
  
  const span = document.createElement('span');
  span.textContent = task.title;
  
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Eliminar';
  deleteBtn.addEventListener('click', () => deleteTask(task.id, li));
  
  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}

function toggleComplete(id, completed) {
  fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  }).then(() => loadTasks());  // Recargar lista después de actualizar
}

function deleteTask(id, liElement) {
  fetch(`/api/todos/${id}`, {
    method: 'DELETE'
  }).then(() => {
    liElement.remove();  // Eliminar elemento de la UI inmediatamente
  });
}

addTaskBtn.addEventListener('click', () => {
  const title = taskInput.value.trim();
  if (title) {
    fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    }).then(() => {
      taskInput.value = '';
      loadTasks();
    });
  }
});