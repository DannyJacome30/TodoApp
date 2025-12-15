const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./todos.db');

// Crear tabla con campo completed
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0
    )
  `);
});

module.exports = db;