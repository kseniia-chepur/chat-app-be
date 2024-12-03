const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const router = require('./routes/user.router');

const app = express();

let { PORT, MONGODB_URL } = process.env;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/', router);

PORT = PORT ?? 8080;

mongoose
  .connect(MONGODB_URL)
  .then(() => app.listen(PORT))
  .catch((err) => {
    console.error('Failed to connect to MongoDB Atlas:', err);
    process.exit(1);
  });
