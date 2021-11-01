// var connection = require('../../config/db.js');
const ci = require('case-insensitive');
var commonDbFunction = require('../../config/core/commonDBFunction.js');
var commonFunction = require('../../config/core/commonFunc.js');


function mainControl() {
  this.updateOrder = async function(req, res, next) {
    console.log('update Order')
    let tmpFilter = req.body;

    commonDbFunction.checkDBExist(0)
    .then(connectionDB => {
      // let tmpFilter = {
      //   LNamaTabel: 'm_customeritem',
      //   LKey = {
      //     custid: {data: [{data: req.body.custid}]},
      //     itemid: {data: [{data: req.body.itemid}]},
      //   },
      //   LData = {
      //     pesan: {data = [{data: req.body.pesan}]}
      //   }
      // }
      console.log(connectionDB)
      commonDbFunction.isExist(tmpFilter, connectionDB, 'm_customeritem')
      .then(itemExist => {
        if (itemExist) {
          commonDbFunction.UpdateTabel(tmpFilter, connectionDB, 'm_customeritem')
          .then (result => {
            console.log(result);
            res.json(commonFunction.PrintJsonInsert(result))
          })
          .catch (err => {
            console.log(err);
            res.json(commonFunction.PrintJsonError('Gagal Pesan Barang'))
          });
        } else {
          commonDbFunction.InsertTabel(tmpFilter, connectionDB, 'm_customeritem')
          .then (result => {
            console.log(result);
            res.json(commonFunction.PrintJsonInsert(result))
          })
          .catch (err => {
            console.log(err);
            res.json(commonFunction.PrintJsonError('Gagal Pesan Barang'))
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.json(commonFunction.PrintJsonError(err))
      })
      .then(() => {
        commonDbFunction.closeConnection(connectionDB, true)    
        .catch((err) =>  console.log('ERROR DISINI', err) );
      })
    })
    .catch((err) => { 
      console.log(err);
      res.json(commonFunction.PrintJsonError(err)); 
    })
  };  

  
}

module.exports = new mainControl();

