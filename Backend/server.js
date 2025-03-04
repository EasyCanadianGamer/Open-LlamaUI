const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

// Middleware for parsing JSON
app.use(express.json());
app.use(cors());

// Import and use the user router (example for future use)
// const userRouter = require('./routes/user');
// app.use('/api/users', userRouter); // All user-related routes will be prefixed with `/api/users`

const pg = require('./routes/playground');
app.use('/api/playground', pg);

const adventure = require('./routes/adventure');
app.use('/api/adventure', adventure);

const chat = require('./routes/chat');
app.use('/api/chat', chat);


// Root route
app.get('/', (req, res) => {
  res.send('Hello from the main server!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
