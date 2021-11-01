const APIBasic = require('../controllers/APIBasicQuery/APIBasicontroller.js');
const express = require('express');
var router = express.Router();

router.post('/show', APIBasic.showData);
router.post('/insert', APIBasic.insertData);
router.post('/update', APIBasic.updateData);
router.post('/delete', APIBasic.deleteData);
router.post('/raw', APIBasic.rawQuery);

module.exports = router;
