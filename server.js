"use strict";
process.env.PWD = process.cwd();
const express = require('express');
const logger = require('morgan');
const listdatadb = require('./main/config/constdb');
const COMMONDBFUNCTION = require('./main/bits-node-engines/commonDBFunction');
const app = express();
const path = require('path'); 
const cors = require('cors');

const theroute = require('./main/routes/theroute');
const constanta = require('./main/config/constanta');

const port = process.env.PORT || '1000';

COMMONDBFUNCTION.initDB(listdatadb.CLISTDB);
app.use(logger('dev'));
app.use(express.static(path.join(process.env.PWD, constanta.CUPLOAD_PATH)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
theroute.configure(app);
// module.exports = app;

app.listen(port, () => console.log(`Listening on port ${port}...`));