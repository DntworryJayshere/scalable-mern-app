const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();

// db
mongoose
	.connect(process.env.MONGO_URI, {
		useCreateIndex: true,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => console.log('DB connected'))
	.catch((err) => console.log(err));

// import routes
const authRoutes = require('./routes/auth');

// app middlewares
app.use(morgan('dev'));
app.use(express.json({ extended: false }));
// app.use(cors());
app.use(cors({ origin: process.env.CLIENT_URL }));

// middlewares
app.use('/api', authRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`API is running on port ${port}`));
