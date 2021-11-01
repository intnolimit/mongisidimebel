const APIUser = require('../controllers/APIAdmin/APIUserController.js');
const APIBasic = require('../controllers/APIBasicQuery/APIBasicontroller.js');

const express = require('express');
var router = express.Router();

router.post('/bits/user/login', APIUser.loginData);
router.post('/bits/user/register', APIUser.createUser);
router.get('/bits/tesQuery', APIBasic.tesQuery);

module.exports = router;