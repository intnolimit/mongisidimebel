const APIMain = require('../controllers/APIAdmin/APIMainController.js');
const express = require('express');
var router = express.Router();

router.get('/updatebarang', APIMain.updateBarang);
router.get('/cleardata', APIMain.clearData);
router.get('/setupdatetime', APIMain.setUpdateTime);
router.post('/uploaditem', APIMain.uploadItem);

module.exports = router;