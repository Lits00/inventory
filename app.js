const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
require('dotenv').config();
const app = express();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const inventoryRouter = require("./routes/inventory");

mongoose.set("strictQuery", false);
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public/stylesheets'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use("/inventory", inventoryRouter);
// app.use('/users', usersRouter);

module.exports = app;
