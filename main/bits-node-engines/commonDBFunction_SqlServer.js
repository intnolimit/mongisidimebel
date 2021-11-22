const ss = require('mssql');

function commonDBFunction() {
  this.init = function (conDB) {
    let thepool = new ss.ConnectionPool(conDB.dbSetting);
    thepool.bitsSetting = conDB.bitsSetting;
    return thepool;
  }

  this.checkDBExist = (db) => new Promise((resolve, reject) => {
    db.connect((err, con, done) => {
      if (err) {
        reject(err)
      } else {
        trans = new ss.Transaction(con);
        trans.begin(err => {
          if (err) {
            reject(err)
          }
          trans.jenis = db.bitsSetting.jenis;
          trans.tabel_autonumber = db.bitsSetting.tabel_autonumber;
          trans.tabel_user = db.bitsSetting.tabel_user;
          trans.jwtsecretkey = db.bitsSetting.jwtsecretkey;
          // trans.jenis = SQLSERVER_DB;
          trans.con = con;
          resolve(trans);
        })
      }
    })
  })

  this.closeConnection = (transaction) => new Promise(function (resolve, reject) {
    transaction.commit(err => {
      if (err) {
        console.error('Error committing transaction', err.stack)
        transaction.rollback(err => {
          trans.con.close();
          reject(false)
        })
      } else resolve(true);
    })

  })

  this.rollbackTransaction = (transaction) => new Promise(function (resolve, reject) {
    transaction.rollback(err => {
      if (err) {
        trans.con.close();
        reject(false)
      }
      trans.con.close();
      resolve(true)
    })
  })

  this.isExist = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    const req = new ss.Request(ConnectionDB);

    let SqlText = SQLShowTabel(QueryJson, req);
    SqlText.text = SqlText.text + GetOrderBy(QueryJson);
    let limitOffer = GetLimitOffer(QueryJson);
    SqlText.text = SqlText.text.replace('Select', limitOffer)

    req.query(SqlText.text, function (err, data) {
      if (err) {
        reject(err)
      } else {
        if (data.length > 0) {
          resolve(true)
        } else {
          resolve(false)
        }
      }
    })
  })

  this.showTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    const req = new ss.Request(ConnectionDB);

    let SqlText = SQLShowTabel(QueryJson, req);

    SqlText.text = SqlText.text + GetGroupBy(QueryJson);
    SqlText.text = SqlText.text + GetOrderBy(QueryJson);
    let limitOffer = GetLimitOffer(QueryJson);
    SqlText.text = SqlText.text.replace('Select', limitOffer)

    setParam(SqlText, req);
    req.query(SqlText.text, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data.recordset)
      }
    })
  })

  this.insertTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    const req = new ss.Request(ConnectionDB);

    let SqlText = SQLInsertTabel(QueryJson, req);

    setParam(SqlText, req);
    req.query(SqlText.text, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data.recordset)
      }
    })
  })

  this.updateTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    const req = new ss.Request(ConnectionDB);

    let SqlText = SQLUpdateTabel(QueryJson, req)

    setParam(SqlText, req);
    req.query(SqlText.text, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data.recordset)
      }
    });
  })

  this.deleteTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    const req = new ss.Request(ConnectionDB);

    let SqlText = SQLDeleteTabel(QueryJson)

    setParam(SqlText, req);
    req.query(SqlText.text, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data.recordset)
      }
    });
  })

  this.rawQuery = (SqlText, ConnectionDB) => new Promise(function (resolve, reject) {
    const req = new ss.Request(ConnectionDB);
    setParam(SqlText, req);
    // console.log(req);

    // req.input('k1', ss.NVarChar, '%')
    req.query(SqlText.text, function (err, data) {
      if (err) {
        // console.log('Error QUERY', err);
        reject(err)
      } else {
        resolve(data.recordset)
      }
    })
  })
}

function SQLShowTabel(QueryJson) {
  let query = 'Select ' + GetFieldQuery(QueryJson) + ' From ' + GetNamaTable(QueryJson);
  let SqlText = GetWhereTable(QueryJson);
  SqlText.text = query + SqlText.text;
  return SqlText;
}

function SQLInsertTabel(QueryJson) {
  let query = 'Insert Into ' + GetNamaTable(QueryJson);
  let SqlText = GetInsertTable(QueryJson, req);
  SqlText.text = query + SqlText.text;
  return SqlText;
}

function SQLUpdateTabel(QueryJson) {
  let query = 'Update ' + GetNamaTable(QueryJson);
  let whereText = GetWhereTable(QueryJson);
  let updateText = GetUpdateTable(QueryJson);
  let SqlText = {
    text: query + updateText.text + whereText.text,
    keyParam: whereText.keyValues,
    keyJenis: whereText.keyJenis,
    fieldParam: updateText.fieldValues,
    fieldJenis: updateText.fieldJenis,
  }
  return SqlText;
}

function SQLDeleteTabel(QueryJson) {
  let query = 'Delete From ' + GetNamaTable(QueryJson);
  let SqlText = GetWhereTable(QueryJson);
  SqlText.text = query + SqlText.text;
  return SqlText;
}

function GetNamaTable(QueryJson) {
  return (QueryJson.hasOwnProperty('LNamaTabel')) ? QueryJson.LNamaTabel : '';
}

function GetGroupBy(QueryJson) {
  return (QueryJson.hasOwnProperty('LGroup')) ? (QueryJson.LGroup != '') ? ' Group By ' + QueryJson.LGroup : '' : '';
}

function GetOrderBy(QueryJson) {
  return (QueryJson.hasOwnProperty('LOrder')) ? (QueryJson.LOrder != '') ? ' Order By ' + QueryJson.LOrder : '' : '';
}

function GetLimitOffer(QueryJson) {
  let first = GetLimit(QueryJson);
  first += GetOffset(QueryJson);
  return 'Select ' + first + ' ';
}

function GetLimit(QueryJson) {
  return (QueryJson.hasOwnProperty('LLimit')) ? (QueryJson.LLimit != '') ? ' top ' + QueryJson.LLimit : '' : '';
}

function GetOffset(QueryJson) {
  let Offset = '';
  // if (QueryJson.hasOwnProperty('LOffset')) {
  //   Offset = ' skip ' + QueryJson.LOffset;
  // }

  return Offset;
}

function GetFieldQuery(QueryJson) {
  let NamaField = '';
  if (QueryJson.hasOwnProperty('LNamaField')) {
    if (Array.isArray(QueryJson.LNamaField)) {
      QueryJson.LNamaField.forEach(function (item, index, array) {
        (NamaField == '') ? NamaField = item: NamaField = NamaField + ', ' + item
      });
    } else {
      (QueryJson.LNamaField == '' || QueryJson.LNamaField == ' ') ? NamaField = '*': NamaField = QueryJson.LNamaField;
    }
  } else {
    NamaField = '*';
  }
  return NamaField;
}

function GetWhereTable(QueryJson) {
  let Json = {
    text: '',
    keyValues: [],
    keyJenis: [],
  }
  if (QueryJson.hasOwnProperty('LKey')) {
    for (field in QueryJson.LKey) {
      let val = QueryJson.LKey[field].data

      if (val.length > 0) {
        (Json.text == '') ? Json.text = ' where (': Json.text = Json.text + ' AND (';

        val.forEach((Data, index) => {
          (index != 0) ? Json.text = Json.text + ' ' + Data.operand + ' ': Json.text = Json.text;
          Json.text = Json.text + field + ' ' + Data.opr + ' ' + '@k' + index;
          Json.keyValues.push(Data.data);
          Json.keyJenis.push(QueryJson.LKey[field].jenisWidget)
          // req.input('k' + index, getTipeData( QueryJson.LKey[field].jenisWidget), Data.data)
        })
        Json.text = Json.text + ')'
      }
    }
  }
  return Json;
}

function GetInsertTable(QueryJson) {
  let Json = {
    text: '',
    fieldValues: [],
    fieldJenis: [],
  }

  let tmpField = '';
  let tmpValue = '';

  if (QueryJson.hasOwnProperty('LData')) {
    for (field in QueryJson.LData) {
      let val = QueryJson.LData[field].data

      if (val.length > 0) {
        val.forEach((Data, index) => {
          if (tmpField == '') {
            tmpField = field
            tmpValue = '@f' + index
          } else {
            tmpField = tmpField + ' , ' + field;
            tmpValue = tmpValue + ' , ' + '@f' + index
          }
          Json.fieldValues.push(Data.data);
          Json.fieldJenis.push(QueryJson.LData[field].jenisWidget)
          // req.input('f' + index, getTipeData(QueryJson.LKey[field].jenisWidget), Data.data)
        })
      }
    }
    Json.text = '(' + tmpField + ') ' + ' Values (' + tmpValue + ')';
  }
  return Json;
}

function GetUpdateTable(QueryJson) {
  let Json = {
    text: '',
    fieldValues: [],
    fieldJenis: [],
  }

  let tmpField = '';
  if (QueryJson.hasOwnProperty('LData')) {
    for (field in QueryJson.LData) {
      let val = QueryJson.LData[field].data

      if (val.length > 0) {
        val.forEach((Data, index) => {
          (tmpField == '') ? tmpField = field + ' = @f' + index: tmpField = tmpField + ' , ' + field + ' = @f' + index
          // req.input('f' + index, getTipeData(QueryJson.LKey[field].jenisWidget), Data.data)
          Json.fieldValues.push(Data.data);
          Json.fieldJenis.push(QueryJson.LData[field].jenisWidget)
        })
      }
    }
    Json.text = ' set ' + tmpField;
  }
  return Json;
}

function setParam(SqlText, req) {
  if (SqlText.hasOwnProperty('keyValues')) {
    for (let i = 0; i < SqlText.keyValues.length; i++) {
      req.input('k' + i, getTipeData(SqlText.keyJenis[i]), SqlText.keyValues[i])
    }
  }

  if (SqlText.hasOwnProperty('fieldValues')) {
    for (let i = 0; i < SqlText.fieldValues.length; i++) {
      req.input('f' + i, getTipeData(SqlText.fieldJenis[i]), SqlText.fieldValues[i])
    }
  }
}

function getTipeData(jenis) {
  let tipeData;
  (jenis == 2) ? tipeData = ss.NVarChar: (jenis == 1) ? tipeData = ss.Real :
    (jenis == 3) ? tipeData = ss.DateTime :
    tipeData = ss.NVarChar
  return tipeData;
}

// ====isi TmpFilter==== 
// {
//   "title":"Filter Barang",
//   "LNamaTabel":"m_item",
//   "LLimit":100,
//   "LOffset":0,
//   "LOrderBy":"",
//   "LKey":{
//      "KODE":{
//         "data":[
//            {
//               "data":"RUDY1",
//               "opr":"=",
//               "operand":"AND"
//            }
//         ],
//         "jenisWidget":2,
//         "titleWidget":"kode",
//         "hintWidget":"Masukan Nama Yang Di Cari"
//      },
//      "NAMA":{
//         "data":[
//            {
//               "data":"Nama BARU RUDY 1",
//               "opr":"=",
//               "operand":"AND"
//            }
//         ],
//         "jenisWidget":2,
//         "titleWidget":"kode",
//         "hintWidget":"Masukan Nama Yang Di Cari"
//      }
//   },
// "LData":{
//      "KODE":{
//         "data":[
//            {
//               "data":"RUDY1",
//               "opr":"=",
//               "operand":"AND"
//            }
//         ],
//         "jenisWidget":2,
//         "titleWidget":"kode",
//         "hintWidget":"Masukan Nama Yang Di Cari"
//      },
//      "NAMA":{
//         "data":[
//            {
//               "data":"Nama BARU RUDY 1",
//               "opr":"=",
//               "operand":"AND"
//            }
//         ],
//         "jenisWidget":2,
//         "titleWidget":"kode",
//         "hintWidget":"Masukan Nama Yang Di Cari"
//      },
//      "MERK":{
//         "data":[
//            {
//               "data":"MERK RUDY 1",
//               "opr":"=",
//               "operand":"AND"
//            }
//         ],
//         "jenisWidget":2,
//         "titleWidget":"kode",
//         "hintWidget":"Masukan Nama Yang Di Cari"
//      },
//      "GUDANG":{
//         "data":[
//            {
//               "data":"GUDANG BARU",
//               "opr":"=",
//               "operand":"AND"
//            }
//         ],
//         "jenisWidget":2,
//         "titleWidget":"kode",
//         "hintWidget":"Masukan Nama Yang Di Cari"
//      }
//   }
// }

module.exports = new commonDBFunction();