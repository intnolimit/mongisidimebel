// var connection = require('../../config/db.js');
var commonDbFunction = require('../../config/core/commonDBFunction.js');
const commonFunc = require('../../config/core/commonFunc.js');
const commonFn = require('../../config/core/commonFunc.js');
var db = require('../../config/db.js');

function mainControl() {
  this.showData = async function (req, res, next) {
    let QueryJson = req.body;
    console.log('show data', QueryJson);

    let posDB = (req.body.hasOwnProperty('posDB')) ? req.body.posDB : -1;
    commonDbFunction.checkDBExist(posDB)
    .then(connectionDB => {
      console.log('Showing Table');
      return commonDbFunction.ShowTabel(QueryJson, connectionDB)
      .then(data => res.json(commonFn.PrintJsonShow(data)))
      .then(data => commonDbFunction.closeConnection(connectionDB))
      .catch(err => {
        console.log(err)
        res.json(commonFn.PrintJsonError(err))
        return commonDbFunction.rollBackConnection(connectionDB)
      })
    })
    .catch((err) => {
      res.json(commonFn.PrintJsonError(err))
    })
  }

  this.insertData = async function (req, res, next) {
    let QueryJson = req.body
    let insertRes = {}
    console.log("insertData >>>  ", QueryJson);
    commonDbFunction.checkDBExist()
    .then(connectionDB => {
      console.log("mau insert tabel  !!!!!!!!!!!!");
      return commonDbFunction.generateAutoNumber(QueryJson, connectionDB)      
      .then(data => {
        console.log('Auto Number', QueryJson.LNamaTabel, Object.keys(QueryJson.LHeaderAutoNumber)[0], data);
        commonDbFunction.addMap(QueryJson.LData, Object.keys(QueryJson.LHeaderAutoNumber)[0], data);
        return commonDbFunction.InsertTabel(QueryJson, connectionDB)
      })
      .then(insert => commonDbFunction.ShowTabel(QueryJson, connectionDB))
      .then(insert => {
        insertRes = insert;
        console.log(insertRes);
        //return )
        return commonDbFunction.closeConnection(connectionDB)
      })
      .then(data => res.json(commonFn.PrintJsonInsert(insertRes)))
      .catch(err => {
        console.log(err)
        res.json(commonFn.PrintJsonError(err))
        return commonDbFunction.rollBackConnection(connectionDB)
      })
    })
    .catch(err => commonFn.PrintJsonError(err))
  }

  this.updateData = async function (req, res, next) {
    let QueryJson = req.body
    let updateRes = {}
    console.log('Update Tabel');
    commonDbFunction.checkDBExist()
    .then(connectionDB => {
      commonDbFunction.UpdateTabel(QueryJson, connectionDB)
      .then(update => commonDbFunction.ShowTabel(QueryJson, connectionDB))
      .then(update => {
        updateRes = update;
        return commonDbFunction.closeConnection(connectionDB)
      })
      .then(data => res.json(commonFn.PrintJsonUpdate(updateRes)))
      .catch(err => {
        console.log(err);
        res.json(commonFn.PrintJsonError(err))
        return commonDbFunction.rollBackConnection(connectionDB)
      })
    })
    .catch(err => console.log(commonFn.PrintJsonError(err)))
  }

  this.deleteData = async function (req, res, next) {
    let QueryJson = req.body
    // QueryJson.LNamaTabel = 'm_item'
    commonDbFunction.checkDBExist()
    .then(connectionDB => {
      commonDbFunction.isExist(QueryJson, connectionDB)
      .then(isExist => {
        if (isExist) {
          console.log('sebelum cekdelete !!!!!!!!');
          // if (Object.keys(QueryJson.LKey).length == 1) {
          return commonDbFunction.cekDelete(QueryJson, connectionDB)
          .then(canDel => {
            if (canDel.hasil) {
              console.log('ini di basic dan asil can del >>>> ', canDel);
              // di showtabel dolo supaya bisa dapat datanya utk di tampilakn setelah delete
              return commonDbFunction.ShowTabel(QueryJson, connectionDB)
              .then(show => {
                return commonDbFunction.DeleteTabel(QueryJson, connectionDB)
                .then(data => {
                  res.json(commonFn.PrintJsonDelete(show))
                  return true
                })
              })
            } else {
              res.json(commonFn.PrintJsonError(canDel.message));
              // res.json({hasil: "Ada Tabel yang masih berhubungan"})
              return true
            }
          })
        } else {
          // res.json({
          //   hasil: "ID barang Salah"
          // })
          commonFn.PrintJsonError('ID barang Salah');
          return false;
        }
      })
      .catch(err => {
        console.log(err)
        // res.json(err)
        commonFn.PrintJsonError(err);
        return false
      })
      .then(isDone => {
        if (isDone) {
          commonDbFunction.closeConnection(connectionDB)
            .then(() => {})
            .catch(() => {})
        } else {
          commonDbFunction.rollBackConnection(connectionDB)
            .then(() => {})
            .catch(() => {})
        }
        console.log('selesai delete dan roll')
      })
    })
    .catch(err => console.log(commonFn.PrintJsonError(err)))
  }

  this.rawQuery = async function (req, res, next) {
    console.log('RAW QUERY')
    let QueryJson = req.body;

    let posDB = (req.body.hasOwnProperty('posDB')) ? req.body.posDB : -1;
    // QueryJson.LNamaTabel = 'm_item'
    commonDbFunction.checkDBExist(posDB)
    .then(connectionDB => {
      console.log('Running Raw Query');
      commonDbFunction.RawQuery(QueryJson, connectionDB)
      .then(data => commonDbFunction.closeConnection(connectionDB))
      .then(data => res.json(commonFn.PrintJsonShow(data)))
      .catch(err => {
        console.log(err)
        res.json(commonFn.PrintJsonError(err))
        return commonDbFunction.rollBackConnection(connectionDB)
      })
    })
    .catch(err => console.log(commonFn.PrintJsonError(err)))
  }

  this.tesQuery = async function (req, res, next) {
    let QueryJson = {
      LNamaTabel: 'm_item',
      LLimit: 10,
    }
    console.log('tes')

    commonDbFunction.checkDBExist()
    .then(connectionDB => {
      console.log(connectionDB)
      commonDbFunction.ShowTabel(QueryJson, connectionDB)
      .then(data => {
        res.json(data)
        return commonDbFunction.closeConnection(connectionDB)
      })
      .catch(err => {
        console.log(err)
        res.json(commonFn.PrintJsonError(err))
        return commonDbFunction.rollBackConnection(connectionDB)
      })
    })
    .catch(err => console.log(commonFn.PrintJsonError(err)))
  }
}

module.exports = new mainControl();