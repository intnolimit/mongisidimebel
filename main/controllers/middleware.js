// let APIBasic = require('../../controllers/APIBasicQuery/APIBasicontroller');
// const APIUser = require('./APIAdmin/APIUserController.js');
const jwt = require('jsonwebtoken')
const commonFunction = require('../config/core/commonFunc.js');

exports.cekTokenAdmin = (req, res, next) => {
  console.log('check token')
  let token = req.headers['token']
  if (token) {
    cekToken(token, KeyJWT)
    .then(result => {
      console.log(result)
      if (result.status == 3) {
        console.log('token admin')
        next()
      } else {
        return res.json(commonFunction.PrintJsonError('Error Autorization'))  
      }     
    })
    .catch(err => {
      return res.json(commonFunction.PrintJsonError(err))
    })
  } else {
    console.log('tidak ada token')  
    return res.json(commonFunction.PrintJsonError('Token Tidak Valid '))
  }
}

exports.authUser = (req, res, next) => {
  console.log('check token ' + req.header('Token'));
  const token =  req.header('Token');
  if (token) {
    cekToken(token, KeyJWT)
    .then(result => next())
    .catch(err => {
      console.log('DIMANA ERROR?', err);
      return res.status(401).json(commonFunction.PrintJsonError(err))
    })
  } else {
    console.log('Tidak Ada Token')  
    return res.status(401).json(commonFunction.PrintJsonError('Token Tidak Ada'))
  }
}

cekToken = (token, key) => new Promise(function(resolve, reject) {
  jwt.verify(token, key, (err, decoded) => {
    if (err) reject("Token Tidak Valid")  
    else {
      resolve(decoded);
      // let QueryJson = {
      //   LKey: { uname: {data: [{data: decoded, opr: "="}]} }
      // }
      // APICustomer.checkUser(QueryJson)
      // .then(result => {
      //   console.log(result);
      //   (result.result) ? resolve(result) : reject('User Tidak Valid')
      // })
      // .catch(err => reject(err))     
    }
  })
})
