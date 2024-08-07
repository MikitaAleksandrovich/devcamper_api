// app.js
const express = require('express');
const app = express();
const port = 3000; // Choose an appropriate port number

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Placeholder route for testing the server
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

