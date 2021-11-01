const APIFile = require('../controllers/APIBasicQuery/APIFileController');

const express = require('express');
var router = express.Router();

router.post('/list', APIFile.getList);
router.post('/getpath', APIFile.getPath);
router.post('/rename', APIFile.renameFile);
router.post('/remove', APIFile.deleteFile);
router.post('/upload', APIFile.uploadFile);

module.exports = router;