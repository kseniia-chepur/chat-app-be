const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const router = require('./routes/user.router');
const { app, server } = require('./socket');

let { PORT, MONGODB_URL, FE_URL } = process.env;

app.use(cors({
  origin: FE_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/', router);

PORT = PORT ?? 8080;

mongoose
  .connect(MONGODB_URL)
  .then(() => server.listen(PORT))
  .catch((err) => {
    console.error('Failed to connect to MongoDB Atlas:', err);
    process.exit(1);
  });
