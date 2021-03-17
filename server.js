const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const routes = require('./routes');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// db
connectDB();

//init middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '5mb', extended: false }));

//import & config cors
const corsOptions = {
	origin: process.env.CLIENT_URL,
	credentials: true, //access-control-allow-credentials:true
	optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

//import routes
app.use(routes);

app.listen(PORT, () => console.log('Server started on port' + PORT));
