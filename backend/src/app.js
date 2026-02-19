require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/assignments', require('./routes/assignments'));

// Hata middleware'i
app.use(require('./middleware/errorHandler'));

module.exports = app;