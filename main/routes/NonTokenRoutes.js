const APIUser = require('bits-node-engines/bitsUserController');

const express = require('express');
var router = express.Router();

router.post('/bits/user/login', APIUser.loginData);

module.exports = router;