const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const routes = require('./routes');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

//init middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: false }));
app.use(morgan('dev'));
app.use(routes);

// app.use(cors());
app.use(cors({ origin: process.env.CLIENT_URL }));

// db
connectDB();

app.listen(PORT, () => console.log('Server started on port' + PORT));
