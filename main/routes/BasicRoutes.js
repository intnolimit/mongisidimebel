const APIBITSFILTER = require('../bits-node-engines/bitsFilterController') 
const express = require('express');
var router = express.Router();

router.post('/show', APIBITSFILTER.showData);
router.post('/insert', APIBITSFILTER.insertData);
router.post('/update', APIBITSFILTER.updateData);
router.post('/delete', APIBITSFILTER.deleteData);
router.post('/raw', APIBITSFILTER.rawQuery);

module.exports = router;
