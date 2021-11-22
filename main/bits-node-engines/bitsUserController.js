const CI = require('case-insensitive');
var COMMONDBFUNCTION = require('./commonDBFunction.js');
var COMMONFN = require('./commonFunc.js');
// var JWT = require('jsonwebtoken');
var CONSTANTA = require('./constanta.js');
const BITSTOKEN = require('./bitsToken');

function mainControl() {
  //INPUT: req.body = {uname, pass, fielddesktop}
  //RESULT: req.body = {uname, token}
  this.loginData = async function (req, res, next) {
    let QueryJson = req.body;
    COMMONDBFUNCTION.checkDBExist(0)
      .then(connectionDB => {
        return getCurrentUser(connectionDB, QueryJson.uname, QueryJson.pass, QueryJson.fielddesktop)
          .then(async data => {
            await COMMONDBFUNCTION.closeConnection(connectionDB);
            // let jwtToken = JWT.sign(data[0][connectionDB.tabel_user.keyfield], connectionDB.jwtsecretkey);
            let jwtToken = await BITSTOKEN.signIn({
              user: data[0][connectionDB.tabel_user.keyfield],
              // pass: data[0][connectionDB.tabel_user.passfield],
            });
            res.json(COMMONFN.printJsonShow([{
              uname: data[0][connectionDB.tabel_user.keyfield],
              token: jwtToken
            }]));
          })
      })
      .catch((err) => {
        res.json(COMMONFN.printJsonError(err));
      });
  };

  //req.body = {uname, pass, newpass}
  //RESULT: req.body = {uname, token}
  this.updatePass = async function (req, res, next) {
    let QueryJson = req.body;
    COMMONDBFUNCTION.checkDBExist(0)
      .then(connectionDB => {
        return getCurrentUser(connectionDB, QueryJson.uname, QueryJson.pass)
          .then(data => {
            let cryptedPass = COMMONFN.encrypt(QueryJson.newpass);
            let QueryLcl = COMMONDBFUNCTION.createQueryJSON('sec_user');
            COMMONDBFUNCTION.addMap(QueryLcl.LKey, connectionDB.tabel_user.keyfield, QueryJson.uname, '=', CONSTANTA.CJENIS_FILTER_STRING)
            COMMONDBFUNCTION.addMap(QueryLcl.LData, connectionDB.tabel_user.passfield, cryptedPass, '=', CONSTANTA.CJENIS_FILTER_STRING)
            return COMMONDBFUNCTION.updateTabel(QueryLcl, connectionDB)
              .then(updatedData => {
                return COMMONDBFUNCTION.closeConnection(connectionDB)
                  .then(hasil => {
                    return BITSTOKEN.signIn({
                      user: data[0][connectionDB.tabel_user.keyfield],
                      // pass: data[0][connectionDB.tabel_user.passfield]
                    }).then(jwtToken => {
                        res.json(COMMONFN.printJsonShow([{
                          uname: data[0][connectionDB.tabel_user.keyfield],
                          token: jwtToken
                        }]));
                      })
                  })
              })
          })
      })
      .catch((err) => {
        res.json(COMMONFN.printJsonError(err));
      });
  }

  // this.showData = async function (req, res, next) {
  //   let QueryJson = req.body;

  //   // COMMONDBFUNCTION.checkDBExist(db, 0)
  //   COMMONDBFUNCTION.checkDBExist(0)
  //     .then(async connectionDB => {
  //       try {
  //         const show = await COMMONDBFUNCTION.showTabel(QueryJson, connectionDB);
  //         await COMMONDBFUNCTION.closeConnection(connectionDB);
  //         console.log('dalam ShowTabel');
  //         res.json(COMMONFN.printJsonShow(show));
  //       } catch (err) {
  //         await COMMONDBFUNCTION.rollBackConnection(connectionDB);
  //         throw err;
  //       }
  //     })
  //     .catch((err) => {
  //       console.log('dalam caths paling luar');
  //       res.json(COMMONFN.printJsonError(err));
  //     })
  // };

  // this.createUser = async function (req, res, next) {
  //   let QueryJson = req.body;
  //   console.log('Creating User');

  //   // COMMONDBFUNCTION.checkDBExist(db, 0)
  //   COMMONDBFUNCTION.checkDBExist(0)
  //     .then(async connectionDB => {
  //       try {
  //         if (COMMONDBFUNCTION.isExist(QueryJson, connectionDB)) {
  //           console.log('User sudah ada');
  //           throw {
  //             errorUser: 'User sudah ada',
  //             errorProgramer: 'User sudah ada'
  //           };
  //         } else {
  //           let idx = CI(QueryJson.LNField).indexOf('passwd');
  //           QueryJson.LNData[idx] = COMMONFN.encrypt(QueryJson.LNData[idx]);
  //           await COMMONDBFUNCTION.insertTabel(QueryJson, connectionDB);
  //           await COMMONDBFUNCTION.closeConnection(connectionDB);
  //           res.json(COMMONFN.printJsonInsert([{
  //             data: 'user berhasil ditambahkan'
  //           }]));
  //         }
  //       } catch (err) {
  //         await COMMONDBFUNCTION.rollBackConnection(connectionDB);
  //         throw err;
  //       }
  //     })
  //     .catch((err) => {
  //       console.log('dalam caths paling luar');
  //       res.json(COMMONFN.printJsonError(err));
  //     });
  // };

  // this.updateData = async function (req, res, next) {};

  // this.deleteData = async function (req, res, next) {
  //   let QueryJson = req.body;
  // };
}

function getCurrentUser(connectionDB, userID, pass, fielddesktop) {
  let QueryLcl = COMMONDBFUNCTION.createQueryJSON('sec_user');
  if (userID != null) {
    COMMONDBFUNCTION.addMap(QueryLcl.LKey, connectionDB.tabel_user.keyfield, userID, '=', CONSTANTA.CJENIS_FILTER_STRING)
  } else {
    throw COMMONFN.generateError('salah key json uname', 'salah field uname');
  }
  let inputPass = '';
  if (pass != null) {
    inputPass = COMMONFN.encrypt(pass);
  } else {
    throw {
      errorUser: 'salah key json pass',
      errorProgramer: 'salah field pass'
    };
  }
  if (fielddesktop != null) 
    COMMONDBFUNCTION.addMap(QueryLcl.LKey, fielddesktop, pass, '=', CONSTANTA.CJENIS_FILTER_STRING)


  return COMMONDBFUNCTION.showTabel(QueryLcl, connectionDB)
    .then(async show => {
      let data = COMMONFN.lowerCaseListJson(show);
      if (data.length > 0) {
        if (fielddesktop == null)
        {
          if (data[0].ismobile == 1) {
            let passMobile = (data[0][connectionDB.tabel_user.passfield] == '') ?
              COMMONFN.encrypt(data[0][connectionDB.tabel_user.keyfield]) :
              data[0][connectionDB.tabel_user.passfield];
            if (inputPass == passMobile) {
              data[0][connectionDB.tabel_user.passfield] = passMobile;
              if (data[0][connectionDB.tabel_user.passfield] == '') {
                COMMONDBFUNCTION.addMap(QueryLcl.LData, connectionDB.tabel_user.passfield, passMobile, '=', CONSTANTA.CJENIS_FILTER_STRING)
                await COMMONDBFUNCTION.updateTabel(QueryLcl, connectionDB);
              }            
              return data;
            } else {
              throw COMMONFN.generateError('Password tidak sesuai', 'Password tidak sesuai');
            }
          } else {
            // throw 'User belum terdaftar sebagai user mobile';
            throw COMMONFN.generateError('User belum terdaftar sebagai user mobile', 'User belum terdaftar sebagai user mobile');
          }
        } else return data;
      } else {
        throw COMMONFN.generateError('User name salah', 'User name salah');
      }
    })
}


module.exports = new mainControl();