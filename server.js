const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

//init middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: false }));
app.use(morgan('dev'));

// app.use(cors());
app.use(cors({ origin: process.env.CLIENT_URL }));

// Add routes, both API and view
app.use(routes);

// db
connectDB();

app.listen(port, () => console.log(`API is running on port ${port}`));
