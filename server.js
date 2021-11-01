"use strict";
process.env.PWD = process.cwd();
const express = require('express');
const logger = require('morgan');
const app = express();
const path = require('path');
const cors = require('cors');

const db = require('./main/config/db');
const theroute = require('./main/routes/theroute');
const constanta = require('./main/config/core/constanta');

const port = process.env.PORT || '1000';

db.init();
app.use(logger('dev'));
app.use(express.static(path.join(process.env.PWD, constanta.CUPLOAD_PATH)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
theroute.configure(app);
// module.exports = app;

app.listen(port, () => console.log(`Listening on port ${port}...`));