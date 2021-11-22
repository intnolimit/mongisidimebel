// var connection = require('../../config/db.js');
var COMMONDBFUNCTION = require('./commonDBFunction');
const COMMONFN = require('./commonFunc.js');
// var db = require('../../config/db.js');

function mainControl() {
  this.showData = async function (req, res, next) {
    let QueryJson = req.body;
    let posDB = (req.body.hasOwnProperty('posDB')) ? req.body.posDB : -1;
    // COMMONDBFUNCTION.checkDBExist(db, posDB)
    COMMONDBFUNCTION.checkDBExist(posDB)
      .then(async connectionDB => {
        try {
          const data = await COMMONDBFUNCTION.showTabel(QueryJson, connectionDB);
          await COMMONDBFUNCTION.closeConnection(connectionDB);
          res.json(COMMONFN.printJsonShow(data));
        } catch (err) {
          await COMMONDBFUNCTION.rollBackConnection(connectionDB);
          throw err;
        }
      })
      .catch((err) => {
        res.json(COMMONFN.printJsonError(err));
      })
  }


  this.insertData = async function (req, res, next) {
    let QueryJson = req.body
    // COMMONDBFUNCTION.checkDBExist(db)
    COMMONDBFUNCTION.checkDBExist()
      .then(async connectionDB => {
        try {
          const listAutoNumber = await COMMONDBFUNCTION.generateAutoNumber(QueryJson, connectionDB);
          QueryJson = COMMONFN.injectLkeyLData(QueryJson, listAutoNumber, false);
          QueryJson = COMMONFN.injectListPrimaryKey(QueryJson);
          const isExist = await COMMONDBFUNCTION.isExist(QueryJson, connectionDB);
          if (!isExist) {
            await COMMONDBFUNCTION.insertTabel(QueryJson, connectionDB);
            await COMMONDBFUNCTION.closeConnection(connectionDB);
            res.json(COMMONFN.printJsonInsert([listAutoNumber]));
          } else {
            throw {
              errorUser: 'Kode sudah ada',
              errorProgramer: 'Kode sudah ada'
            };
          }
        } catch (err) {
          await COMMONDBFUNCTION.rollBackConnection(connectionDB);
          throw err;
        }
      })
      .catch(err => {
        res.json(COMMONFN.printJsonError(err));
      })
  }

  this.updateData = async function (req, res, next) {
    let QueryJson = req.body
    // COMMONDBFUNCTION.checkDBExist(db)
    COMMONDBFUNCTION.checkDBExist()
      .then(async connectionDB => {
        try {
          if (await COMMONDBFUNCTION.isExist(QueryJson, connectionDB)) {
            await COMMONDBFUNCTION.updateTabel(QueryJson, connectionDB);
            await COMMONDBFUNCTION.closeConnection(connectionDB);
            res.json(COMMONFN.printJsonUpdate([]));
          } else {
            throw {
              errorUser: 'Data yang mau diupdate tidak ada',
              errorProgramer: 'Data yang mau diupdate tidak ada'
            };
          }
        } catch (err) {
          await COMMONDBFUNCTION.rollBackConnection(connectionDB);
          throw err;
        }
      })
      .catch(err => {
        res.json(COMMONFN.printJsonError(err));
      })
  }

  this.deleteData = async function (req, res, next) {
    let QueryJson = req.body
    COMMONDBFUNCTION.checkDBExist()
      .then(async connectionDB => {
        try {
          if (COMMONDBFUNCTION.isExist(QueryJson, connectionDB)) {
            await COMMONDBFUNCTION.cekDelete(QueryJson, connectionDB);
            await COMMONDBFUNCTION.deleteTabel(QueryJson, connectionDB);
            await COMMONDBFUNCTION.closeConnection(connectionDB);
            res.json(COMMONFN.printJsonDelete([]));
            // return COMMONDBFUNCTION.cekDelete(QueryJson, connectionDB)
            //   .then(canDel => {
            //     return COMMONDBFUNCTION.deleteTabel(QueryJson, connectionDB)
            //       .then(() => {
            //         return COMMONDBFUNCTION.closeConnection(connectionDB)
            //           .then(() => {
            //             console.log('ini then di close con');
            //             res.json(COMMONFN.printJsonDelete([]));
            //           });
            //       });
            //   });
          } else {
            throw {
              errorUser: 'Kode tidak ada',
              errorProgramer: 'Kode tidak ada'
            };
          }
        } catch (err) {
          await COMMONDBFUNCTION.rollBackConnection(connectionDB);
          throw err;
        }
      })
      .catch(err => {
        res.json(COMMONFN.printJsonError(err));
      })
  }

  this.rawQuery = async function (req, res, next) {
    let QueryJson = req.body;
    let posDB = (req.body.hasOwnProperty('posDB')) ? req.body.posDB : -1;
    // QueryJson.LNamaTabel = 'm_item'
    // COMMONDBFUNCTION.checkDBExist(db, posDB)
    COMMONDBFUNCTION.checkDBExist(posDB)
      .then(async connectionDB => {
        try {
          const data = await COMMONDBFUNCTION.rawQuery(QueryJson, connectionDB);
          await COMMONDBFUNCTION.closeConnection(connectionDB);
          res.json(COMMONFN.printJsonShow(data));
        } catch (err) {
          await COMMONDBFUNCTION.rollBackConnection(connectionDB);
          throw err;
        }
      })
      .catch((err) => {
        res.json(COMMONFN.printJsonError(err))
      })
  }

  // this.tesQuery = async function (req, res, next) {
  //   let QueryJson = {
  //     LNamaTabel: 'sec_user',
  //     LLimit: 10,
  //     LOrder: ''
  //   }
  //   console.log('tes')

  //   // COMMONDBFUNCTION.checkDBExist(db)
  //   COMMONDBFUNCTION.checkDBExist()
  //     .then(connectionDB => {
  //       // connectionDB.release()
  //       console.log(connectionDB)
  //       COMMONDBFUNCTION.showTabel(QueryJson, connectionDB)
  //         .then(data => {
  //           res.json(data)
  //           return true
  //         })
  //         .catch(err => {
  //           console.log(err)
  //           res.json(err)
  //           return false
  //         })
  //         .then(isDone => {
  //           if (isDone) {
  //             COMMONDBFUNCTION.closeConnection(connectionDB)
  //               .then(() => {})
  //               .catch(() => {})
  //           } else {
  //             COMMONDBFUNCTION.rollBackConnection(connectionDB)
  //               .then(() => {})
  //               .catch(() => {})
  //           }
  //         })
  //     })
  //     .catch(err => {
  //       throw err
  //     })
  // }
}

module.exports = new mainControl();