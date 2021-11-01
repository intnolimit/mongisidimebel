// var connection = require('../../config/db.js');
const ci = require('case-insensitive');
var db = require('../../config/db.js');
var commonDbFunction = require('../../config/core/commonDBFunction.js');
var commonFunction = require('../../config/core/commonFunc.js');
var jwt = require('jsonwebtoken');

const errorUser = 0;
const nonUser = 1;
const newUser = 2;
const isUser = 3;

// ====isi TmpFilter==== 
// {
//   "LOffset":"1",
//   "LLimit":"1",
//   "LNamaTabel":"M_GUDANG",
//   "LNamaField":["*"],
//   "LKeyField":["id"],
//   "LKeyData":["G%", "sdasd", "dasdsa"],
//   "LOperator":["like"], 
//   "LOrderBy": "nama"
//   }
var fnCheckUser = new mainControl().checkUser;

function mainControl() {
  this.showData = async function(req, res, next) {
    console.log('getuser')
    let QueryJson = req.body;

    // QueryJson.LNamaTabel = 'sec_user'
    commonDbFunction.checkDBExist(0)
    .then(connectionDB => { 
      commonDbFunction.ShowTabel(QueryJson, connectionDB, 'm_customer')
      .then(show => {
        console.log(show)
        res.json(show)
      })
      .catch(err => {
        console.log(err)
        res.json(commonFunction.PrintJsonError('Gagal Mendapatkan Data'))
        return false          
      })      
      .then (isDone => {
        commonDbFunction.closeConnection(connectionDB, isDone)
        .then(() => {})
        .catch(() => {})
        
      })
    })
    .catch(err => { throw err })
  };  

  this.createUser = async function(req, res, next) {
    let QueryJson = req.body;
    console.log('Creating User');
    
    commonDbFunction.checkDBExist(0)
    .then(connectionDB => {
      commonDbFunction.isExist(QueryJson, connectionDB, 'm_customer')
      .then(retValue => {
        if (retValue) {
          console.log('User sudah ada');
          res.json(commonFunction.PrintJsonError('User sudah ada'))
          // return false;
        } else {
          let idx = ci(QueryJson.LNField).indexOf('passwd');
          QueryJson.LNData[idx] = commonFunction.encrypt(QueryJson.LNData[idx]);
          return commonDbFunction.InsertTabel(QueryJson, connectionDB, 'm_customer')
          .then (insertData => {
            console.log('closing connection');
            return commonDbFunction.closeConnection(connectionDB)
            .then(() => {
              res.json(commonFunction.PrintJsonInsert('data berhasil ditambahkan'));
              console.log('User berhasil ditambahkan');
            })
          })
        }
      })
      .catch (data => {
        commonDbFunction.rollBackConnection(connectionDB)
          .then(() => {
            res.json(commonFunction.PrintJsonError(data));
          })
      })
    })
    .catch(err => {res.json(commonFunction.PrintJsonError(err))});
  };
  
  this.updateData = async function(req, res, next) {
  };

  this.deleteData = async function(req, res, next) {
    let QueryJson = req.body;
  };

  this.loginData = async function(req, res, next) {
    console.log('ini adalah  login')
    let QueryJson = req.body;
    let jsonCheck = {
      LKey: { uname: {data: [{data: QueryJson.uname, opr: "="}]} }
    };
    
    fnCheckUser(jsonCheck)
    .then(checkRes => {
      let inputPass = commonFunction.encrypt(QueryJson.pass);
      if (checkRes.status == nonUser) {
        res.json(commonFunction.PrintJsonError('User Tidak Ada')); 
      }
      else if (inputPass == ((checkRes.data[0].passwd == null) ? commonFunction.encrypt(checkRes.data[0].uname) : checkRes.data[0].passwd)) {
        console.log(inputPass + ' -- ' + checkRes.data[0].passwd)
          let jwtToken = jwt.sign(checkRes.data[0].uname, KeyJWT);
        // let jwtToken = jwt.sign('STEVEN', KeyJWT, {expiresIn: '1h'});
        console.log('TABLE ID: ', checkRes.data[0].tableid);
        res.json(commonFunction.PrintJson(CCodeBerhasil, CStatusBerhasil, 'Sudah Berhasil Login', 1, 
          [{custid: checkRes.data[0].tableid, token:jwtToken}]));  
      } else {
        res.json(commonFunction.PrintJsonError('Password Tidak Sesuai'));  
      }
    })
    .catch(err => { 
      res.json(commonFunction.PrintJsonError(err));
     })
  };  

  this.checkUser = (QueryJson) => new Promise(function (resolve, reject) {
    console.log('Check User')
    commonDbFunction.checkDBExist(0)
    .then(connectionDB => { 
      commonDbFunction.ShowTabel(QueryJson, connectionDB, 'm_customer')
      .then(show => {
        // console.log('Data User: '+ show.isidata[0].passwd);
        resolve({
          result: (show.length > 0) ? true : false, 
          status: (show.length > 0) ? ((show[0].passwd == '') ? newUser : isUser): nonUser, 
          data: show
        });
      })
      .catch(err => {
        console.log('error' + err)
        commonDbFunction.rollBackConnection(connectionDB)
        .then(() => {
          reject( {result: false, status: errorUser, data: []});
        })        
      })
    })
    .catch(err => { 
      console.log('error' + err)
      reject( {result: false, status: errorUser, data: []} );
    }) 
  })
}

module.exports = new mainControl();

