const express = require('express');
const app=express();
app.get('/',(req,res)=>{
   res.status(200).json({messege:'hello my friendddddddd'}) 

});

app.get('/todo/health',(req,res)=>{
   res.status(200);
   res.send('OK');
});

// A list of existing TODO items
let todos = [];

// Middleware to parse the JSON body of the request
app.use(express.json());

// POST endpoint to create a new TODO item
app.post('/todo', (req, res) => {
  const { title, content, dueDate } = req.body;

  // Check if there is already a TODO with this title
  const todoWithTitle = todos.find(todo => todo.title === title);
  if (todoWithTitle) {
    return res.status(409).json({ errorMessage: 'Error: TODO with the title '+title+' already exists in the system' });
  }

  // Check if the due date is in the future
  if (dueDate < Date.now()) {
    return res.status(409).json({ errorMessage: 'Error: Can’t create new TODO that its due date is in the past.' });
  }

  // Create a new TODO item with the next available ID
  const newTodo = {
    id: todos.length + 1,
    title,
    content,
    dueDate,
    status: 'PENDING'
  };

  // Add the new TODO item to the list
  todos.push(newTodo);

  // Send the response with the new TODO item ID
   res.status(200).json({result: newTodo.id });
   });

app.use(express.urlencoded({ extended: true }));

// GET endpoint to return the total number of TODOs according to the filter
app.get('/todo/size', (req, res) => {
   const { status } = req.query;
 
   // Check if the status is valid
   if (!['ALL', 'PENDING', 'LATE', 'DONE'].includes(status)) {
     return res.status(400).json({ errorMessage: 'Invalid status filter.' });
   }
 
   // Filter the TODO items based on the status
   const filteredTodos = todos.filter(todo => {
     switch (status) {
       case 'PENDING':
         return todo.status === 'PENDING';
       case 'LATE':
         return todo.status === 'PENDING' && todo.dueDate < Date.now();
       case 'DONE':
         return todo.status === 'DONE';
       default:
         return true;
     }
     // Send the response with the total number of TODO items
 
});
res.status(200).json({result:{ count: filteredTodos.length }});
});

app.get('/todo/content', function(req, res) {
  // Get query parameters
  const status = req.query.status;
  const sortBy = req.query.sortBy || 'ID';

  // Validate query parameters
  const validStatuses = ['ALL', 'PENDING', 'LATE', 'DONE'];
  const validSortByValues = ['ID', 'DUE_DATE', 'TITLE'];
  if (!validStatuses.includes(status) || !validSortByValues.includes(sortBy)) {
    return res.status(400).json({ errorMessage: 'Bad request' });
  }

  // Filter todos based on status
  let filteredTodos = todos;
  if (status !== 'ALL') {
    filteredTodos = filteredTodos.filter(todo => todo.status === status);
  }

  // Sort todos based on sortBy
  filteredTodos.sort((a, b) => {
    if (sortBy === 'ID') {
      return a.id - b.id;
    } else if (sortBy === 'DUE_DATE') {
      return a.dueDate - b.dueDate;
    } else if (sortBy === 'TITLE') {
      return a.title.localeCompare(b.title);
    }
  });

  // Send response
  res.status(200).json({result:{filteredTodos}});
});

app.put('/todo', function(req, res) {
  // Get query parameters
  const id = Number(req.query.id);
  const status = req.query.status;

  // Validate query parameters
  const validStatuses = ['PENDING', 'LATE', 'DONE'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ errorMessage: 'Bad request' });
  }

  // Find todo with the given id
  const todo = todos.find(todo => todo.id === id);
  if (!todo) {
    return res.status(404).json({ errorMessage: `Error: no such TODO with id ${id}` });
  }

  // Get the old status of the todo
  const oldStatus = todo.status;

  // Update the status of the todo
  todo.status = status;

  // Send response with the old status
  res.status(200).json({result:{ oldStatus }});
});

app.delete('/todo', function(req, res) {
  // Get query parameter
  const id = Number(req.query.id);

  // Find index of todo with the given id
  const index = todos.findIndex(todo => todo.id === id);

  // If no such todo exists, return 404 error
  if (index === -1) {
    return res.status(404).json({ errorMessage: `Error: no such TODO with id ${id}` });
  }

  // Remove the todo from the array
  todos.splice(index, 1);

  // Send response with the number of todos left
  res.status(200).json({ result:{numTodos: todos.length} });
});


module.exports=app;

