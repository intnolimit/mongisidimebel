const JWT = require('jsonwebtoken')
const COMMONFN = require('./commonFunc.js');
const COMMONDBFUNCTION = require('./commonDBFunction');
// cons
// const KeyJWT = 'Secret-Key-is=8175Pass'

function mainControl() {
  this.authUser = (req, res, next) => {
    const token = req.header('Token');
  
    COMMONDBFUNCTION.checkDBExist(0)
      .then(async connectionDB => {
        if (token) {
          // cekToken(token, KeyJWT)
          return cekToken(token, connectionDB.jwtsecretkey)
            .then(result => {
              req.body['jwtdecode'] = result;
              return COMMONDBFUNCTION.closeConnection(connectionDB)
              .then(() => next())
            })
        } else {
          throw COMMONFN.generateError('Token Tidak Ada',  'Token Tidak Ada');
        }
      })
      .catch((err) => {
        res.json(COMMONFN.printJsonError(err));
      })  
  }

  this.signIn = (data) => new Promise(function (resolve, reject) {
    COMMONDBFUNCTION.checkDBExist(0)
      .then(async connectionDB => {
        await COMMONDBFUNCTION.closeConnection(connectionDB);
        resolve(JWT.sign(data, connectionDB.jwtsecretkey))
      })
      .catch((err) => {
        reject(err)
        // res.json(COMMONFN.printJsonError(err));
      })  
  })
}

module.exports = new mainControl();

function cekToken(token, key) {
  return new Promise(function (resolve, reject) {
    JWT.verify(token, key, (err, decoded) => {
      (err) ? reject(COMMONFN.generateError('Token tidak valid', err)) : resolve(decoded);
    })
  })
}