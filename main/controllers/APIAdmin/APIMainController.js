var commonDbFunction = require('../../bits-node-engines/commonDBFunction');
var commonFn = require('../../bits-node-engines/commonFunc');
var fbStorage = require('../../config/lib/firebase/firebaseAdmin')

function mainControl() {
  //MULTIPART request FIELDNAME = picture
  this.uploadFile = async function (req, res, next) {
    fbStorage.uploadFile(req, res)
      .then(files => {
        // files[0].
      })
      .catch(res.json(commonFn.PrintJsonError(err)))
  }

  this.clearData = async function (req, res, next) {
    commonDbFunction.checkDBExist()
    .then(connectionDB => {
      commonDbFunction.rawQuery('Delete from m_item', connectionDB)
      .then(done => commonDbFunction.closeConnection(connectionDB))
      .then(data => res.json(commonFn.printJsonInsert('Berhasil Hapus Data')))
      .catch(err => {
        console.log(err)
        res.json(commonFn.printJsonError(err))
        return commonDbFunction.rollBackConnection(connectionDB)
      })
    });
  }

  this.setUpdateTime = async function (req, res, next) {
    commonDbFunction.checkDBExist()
    .then(connectionDB => {
      sqlText = {
        text: 'Update ms_config set nilai = current_timestamp where kode = $1',
        values: ['01-UPDATETIME'],
      }
      commonDbFunction.rawQuery(sqlText, connectionDB)
      .then(done => commonDbFunction.closeConnection(connectionDB))
      .then(data => res.json(commonFn.printJsonInsert('Berhasil Update Data')))
      .catch(err => {
        console.log(err)
        res.json(commonFn.printJsonError(err))
        return commonDbFunction.rollBackConnection(connectionDB)
      })
    });
  }

  this.uploadItem = async function (req, res, next) {
    let QueryJson = req.body
    commonDbFunction.checkDBExist()
    .then(connectionDB => {
      // commonDbFunction.RawQuery('Delete from m_item', connectionDB)
      // .then(() => {
        insertPromise = [];
        tmpFilter = QueryJson;
        // tmpFilter = commonDbFunction.createQueryJSON('m_item');
        // commonDbFunction.addFieldMap(tmpFilter.LData, 'kode', '');
        // commonDbFunction.addFieldMap(tmpFilter.LData, 'gudang', '');
        // commonDbFunction.addFieldMap(tmpFilter.LData, 'tipe', '');
        // commonDbFunction.addFieldMap(tmpFilter.LData, 'nama', '');
        // commonDbFunction.addFieldMap(tmpFilter.LData, 'jumlah', 0, '=', constanta.CJENIS_FILTER_DOUBLE);
        // commonDbFunction.addFieldMap(tmpFilter.LData, 'harga', 0, '=', constanta.CJENIS_FILTER_DOUBLE);
        // commonDbFunction.addFieldMap(tmpFilter.LData, 'modal', 0, '=', constanta.CJENIS_FILTER_DOUBLE);
        // commonDbFunction.addFieldMap(tmpFilter.LData, 'edittime', 0, '=', constanta.CJENIS_FILTER_TANGGAL);
        // QueryJson.forEach(insertData => {
        //   commonDbFunction.addDataMap(tmpFilter.LData.kode, insertData.kode);
        //   commonDbFunction.addDataMap(tmpFilter.LData.gudang, insertData.gudang);
        //   commonDbFunction.addDataMap(tmpFilter.LData.tipe, insertData.tipe);
        //   commonDbFunction.addDataMap(tmpFilter.LData.nama, insertData.nama);
        //   commonDbFunction.addDataMap(tmpFilter.LData.jumlah, insertData.jumlah);
        //   commonDbFunction.addDataMap(tmpFilter.LData.harga, insertData.harga);
        //   commonDbFunction.addDataMap(tmpFilter.LData.modal, insertData.modal);
        //   commonDbFunction.addDataMap(tmpFilter.LData.edittime, new Date());
        // });
        console.log('Calling Insert', tmpFilter);
        insertPromise.push(commonDbFunction.insertTabel(tmpFilter, connectionDB))
        console.log('After Calling Insert', insertPromise);
        Promise.all(insertPromise)
        .then(insert => commonDbFunction.closeConnection(connectionDB))
        .then(data => res.json(commonFn.printJsonInsert(QueryJson)))
        .catch(err => {
          console.log(err)
          res.json(commonFn.printJsonError(err))
          return commonDbFunction.rollBackConnection(connectionDB)
        // })
      })      
    })
    .catch(err => commonFn.printJsonError(err))
  }
  
  this.updateBarang = async function (req, res, next) {
    getMaxID(0, 'm_item', 'sjid')
      .then((maxID) => {
        commonDbFunction.checkDBExist(1)
          .then(connectionDB => {
            let sqlText = {
              text: 'Select Top 20 BarangID, Tipe, Ukuran, Kode, Harga from tbStok where BarangID < @k0 and Jumlah >= 6'
                + ' group by BarangID, Tipe, Ukuran, Kode, Harga order by BarangID desc',
              keyValues: [maxID],
              keyJenis: [2],
              fieldValues: [],
              fieldJenis: [],
            }
            commonDbFunction.rawQuery(sqlText, connectionDB)
              .then(data => {
                insertFromData(0, data, 'm_item',
                  ['sjid', 'tipe', 'ukuran', 'kode', 'harga', 'seri'],
                  ['BarangID', 'Tipe', 'Ukuran', 'Kode', 'Harga', 'Seri'])
                  .then((listInsert) => {
                    console.log(listInsert);
                    res.json(commonFn.printJsonInsert(listInsert));
                  })
              })
              .catch(err => res.json(commonFn.printJsonError(err)))
              .then(() => {
                commonDbFunction.closeConnection(connectionDB, true)
                  .catch((err) => console.log('ERROR DISINI', err));
              })
          })
          .catch((err) => { res.json(commonFn.printJsonError(err)) })
      })
      .catch(() => res.json(commonFn.printJsonError('Error Getting ID')));
  }
}

getMaxID = (posDB, nTabel, nField) => new Promise(function (resolve, reject) {
  commonDbFunction.checkDBExist(posDB)
    .then(connectionDB => {
      let sqlText = { text: "Select Coalesce(Min(" + nField + "), '') as max from " + nTabel + '' };
      commonDbFunction.rawQuery(sqlText, connectionDB)
        .then(data => {
          commonDbFunction.closeConnection(connectionDB)
          resolve((data[0].max == null) ? "" : data[0].max);
        })
    })
    .catch((err) => { reject(err) })
})

insertFromData = (posDB, data, nTabel, fieldList, dataFieldList) => new Promise(function (resolve, reject) {
  let res = [];
  commonDbFunction.checkDBExist(posDB)
    .then(dbMain => {
      for (let i = 0; i < data.length; i++) {
        let QueryJson = commonFn.convertDataToJson(data, i, nTabel, fieldList, dataFieldList);
        QueryJson.LHeaderAutoNumber = { tableid: { header: 'ITM', jenis: 4, tipedata: 2, format: '-yymmdd-HHMMssl' } }
        commonDbFunction.generateAutoNumber(QueryJson, dbMain)
          .then(id => QueryJson.LData.tableid = { data: [{ data: id }] })
          .then(() => commonDbFunction.insertTabel(QueryJson, dbMain))
          .then(data => res.push(QueryJson.LData[fieldList[0]].data[0].data))
          .catch((err) => console.log('Insert Error', err))
      }
      commonDbFunction.closeConnection(dbMain)
        .then(() => { console.log(res); resolve(res) })
        .catch(err => {
          console.log(err);
          reject('Error Committing Insert');
        });
    })
    .catch((err) => {
      console.log(err);
      reject('Error Connecting Database');
    });
})

module.exports = new mainControl();
