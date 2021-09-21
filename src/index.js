const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).send({ error: 'User not found' })
  };

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.find((user) => user.username === username)

  if (user) {
    return response.status(400).send({ error: 'Username already exists' })
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).send(users[users.length - 1]);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(201).send(user.todos[user.todos.length - 1]);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoPositionArray = user.todos.findIndex((todo) => todo.id === id);

  if (todoPositionArray === -1) {
    return response.status(404).send({ error: 'Todo not found' });
  };

  const userPositionArray = users.findIndex((userPosition) => userPosition.id === user.id);

  users[userPositionArray].todos[todoPositionArray].title = title;
  users[userPositionArray].todos[todoPositionArray].deadline = deadline;

  return response.send(users[userPositionArray].todos[todoPositionArray]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoPositionArray = user.todos.findIndex((todo) => todo.id === id);

  if (todoPositionArray === -1) {
    return response.status(404).send({ error: 'Todo not found' });
  }

  const userPositionArray = users.findIndex((userPosition) => userPosition.id === user.id);
  
  users[userPositionArray].todos[todoPositionArray].done = true;

  return response.send(users[userPositionArray].todos[todoPositionArray])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoPositionArray = user.todos.findIndex((todo) => todo.id === id);

  if (todoPositionArray === -1) {
    return response.status(404).send({ error: 'Todo not found' });
  }

  const userPositionArray = users.findIndex((userPosition) => userPosition.id == user.id);

  users[userPositionArray].todos.splice(todoPositionArray, 1);

  return response.status(204).send()
});

module.exports = app;