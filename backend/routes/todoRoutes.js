const express = require('express');
const db = require('../database');
const router = express.Router();

// Obtener todas las tareas
router.get('/', (req, res) => {
  db.all('SELECT * FROM todos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear nueva tarea
router.post('/', (req, res) => {
  const { title } = req.body;
  db.run('INSERT INTO todos (title, completed) VALUES (?, 0)', [title], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, completed: false });
  });
});

// Actualizar estado de completado
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  db.run('UPDATE todos SET completed = ? WHERE id = ?', [completed ? 1 : 0, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task updated' });
  });
});

// Eliminar tarea
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task deleted' });
  });
});

module.exports = router;