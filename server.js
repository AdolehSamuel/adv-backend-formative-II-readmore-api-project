require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const authorRoutes = require('./routes/authorRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'ReadMore API is running' });
});

app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }

  console.error(error);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const port = process.env.PORT || 3000;
const databaseUrl = process.env.MONGODB_URI;

async function startServer() {
  try {
    await mongoose.connect(databaseUrl);
    console.log('Connected to MongoDB');

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
