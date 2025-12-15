const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const app = require('../app.js'); // Adjust path if app.js is not in backend/

let db;

beforeAll(() => {
  db = new sqlite3.Database('./todos.db');
});

afterAll(() => {
  db.close();
});

beforeEach((done) => {
  // Clear todos table before each test
  db.run('DELETE FROM todos', done);
});

describe('Todo API', () => {
  it('should create a new todo', async () => {
    const newTodo = { title: 'Test Todo', completed: false };
    const response = await request(app)
      .post('/todos')
      .send(newTodo);
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Test Todo');
    expect(response.body.completed).toBe(false);
  });

  it('should get all todos', async () => {
    // Create a todo for this test
    await request(app).post('/todos').send({ title: 'Test Todo', completed: false });
    const response = await request(app).get('/todos');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should update the status of a todo', async () => {
    // Create a todo for this test
    const createResponse = await request(app).post('/todos').send({ title: 'Test Todo', completed: false });
    const todoId = createResponse.body.id;
    const updateData = { completed: true };
    const response = await request(app)
      .put(`/todos/${todoId}`)
      .send(updateData);
    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(true);
  });

  it('should delete a todo', async () => {
    // Create a todo for this test
    const createResponse = await request(app).post('/todos').send({ title: 'Test Todo', completed: false });
    const todoId = createResponse.body.id;
    const response = await request(app).delete(`/todos/${todoId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for updating a non-existent todo', async () => {
    const response = await request(app)
      .put('/todos/999')
      .send({ completed: true });
    expect(response.status).toBe(404);
  });

  it('should return 404 for deleting a non-existent todo', async () => {
    const response = await request(app).delete('/todos/999');
    expect(response.status).toBe(404);
  });

  describe('Integration Tests - Data Persistence', () => {
    it('should save a todo to database and retrieve it after simulated restart', async () => {
      // Add todo via API
      const newTodo = { title: 'Persistent Todo', completed: false };
      const response = await request(app)
        .post('/todos')
        .send(newTodo);
      expect(response.status).toBe(201);
      const todoId = response.body.id;

      // Verify in DB
      const row = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM todos WHERE id = ?', [todoId], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
      expect(row.title).toBe('Persistent Todo');
      expect(row.completed).toBe(0);

      // Simulate restart by closing and reopening DB (data persists in file)
      db.close();
      db = new sqlite3.Database('./todos.db');

      // Retrieve via API after "restart"
      const getResponse = await request(app).get('/todos');
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.length).toBe(1);
      expect(getResponse.body[0].title).toBe('Persistent Todo');
    });
  });
});
