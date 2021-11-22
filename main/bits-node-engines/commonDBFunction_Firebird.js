const FIREBIRD = require('node-firebird');
const CONSTANTA = require('./constanta');

function commonDBFunction() {
  this.init = function (conDB, done) {
    // conDB.lowercase_keys = true;
    let thepool = new FIREBIRD.pool(conDB.dbSetting.max, conDB.dbSetting);
    thepool.bitsSetting = conDB.bitsSetting;
    return thepool;
  }

  this.checkDBExist = (db) => new Promise((resolve, reject) => {
    db.get(function (err, con) {
      if (err) {
        reject(err)
      } else {
        con.transaction(FIREBIRD.ISOLATION_READ_COMMITED, (err, transaction) => {
          if (err) reject(err)
          else {
            transaction.jenis = db.bitsSetting.jenis;
            transaction.tabel_autonumber = db.bitsSetting.tabel_autonumber;
            transaction.tabel_user = db.bitsSetting.tabel_user;
            transaction.jwtsecretkey = db.bitsSetting.jwtsecretkey;
            transaction.con = con;
            resolve(transaction)
          }
        })
      }
    })
  })

  this.closeConnection = (transaction) => new Promise(function (resolve, reject) {
    transaction.commit(err => {
      if (err) {
        transaction.rollback();
        transaction.con.detach();
        reject(err)
      } else {
        transaction.con.detach(err => {
          if (err) reject(err)
          else resolve(true)
        });
      }
    })
  })

  this.rollbackTransaction = (transaction) => new Promise(function (resolve, reject) {
    transaction.rollback(errRoll => {
      if (errRoll) {
        reject(errRoll)
        transaction.con.detach();
      } else {
        transaction.con.detach(err => {
          if (err) reject(err)
          else resolve(true)
        });
      }
    })
  })

  this.isExist = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    let SqlText = SQLShowTabel(QueryJson);

    SqlText.text = SqlText.text + GetOrderBy(QueryJson);

    let limitOffer = GetLimitOffer(QueryJson);
    SqlText.text = SqlText.text.replace('Select', limitOffer)
    console.log('dalam isexist sql text >>>>', SqlText)
    ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
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

  this.showTabel = showTabel;

  this.insertTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    let SqlText = SQLInsertTabel(QueryJson);
    
    ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

  this.updateTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    let SqlText = SQLUpdateTabel(QueryJson)
    console.log('SQL TEXT DI update TABLE FB >>>', SqlText);
    ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    });
  })

  this.deleteTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    let SqlText = SQLDeleteTabel(QueryJson)

    ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    });
  })

  this.rawQuery = (SqlText, ConnectionDB) => new Promise(function (resolve, reject) {
    if (!SqlText.hasOwnProperty('values')) SqlText['values'] = [];
    if (SqlText.hasOwnProperty('keyValues')) SqlText.values.push(SqlText['keyValue']);
    if (SqlText.hasOwnProperty('fieldValues')) SqlText.values.push(SqlText['fieldValues']);
    console.log(SqlText);
    ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function showTabel(QueryJson, ConnectionDB, NamaTabel = '') {
  return new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    let SqlText = SQLShowTabel(QueryJson);
    SqlText.text = SqlText.text + GetGroupBy(QueryJson);
    SqlText.text = SqlText.text + GetOrderBy(QueryJson);

    let limitOffer = GetLimitOffer(QueryJson);
    SqlText.text = SqlText.text.replace('Select', limitOffer)
    
    return ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
      if (err) {
        reject(err)
      } else {
        // console.log('hasil data di query fb >>>> ', data);
        resolve(data)
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
  let SqlText = GetInsertTable(QueryJson);
  SqlText.text = query + SqlText.text;
  return SqlText;
}

function SQLUpdateTabel(QueryJson) {
  let query = 'Update ' + GetNamaTable(QueryJson);
  // console.log('di SQLUpdateTabel FB');

  let whereText = GetWhereTable(QueryJson);
  let indexWhere = (whereText.hasOwnProperty('values')) ? whereText.values.length : 0;
  let updateText = GetUpdateTable(QueryJson, indexWhere);
  // console.log('di  GetUpdateTable FB');

  let SqlText = {
    text: '',
  }

  SqlText.text = query + updateText.text + whereText.text;
  SqlText.values = updateText.values;
  whereText.values.forEach(function (item, index, array) {
    SqlText.values.push(item);
  })
  // console.log('SQL TEXT di SQLUpdateTabel FB >>> ', SqlText);

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
  return (QueryJson.hasOwnProperty('LLimit')) ? (QueryJson.LLimit != '') ? ' first ' + QueryJson.LLimit : '' : '';
}

function GetOffset(QueryJson) {
  return (QueryJson.hasOwnProperty('LOffset')) ? (QueryJson.LOffset != '') ? ' skip ' + QueryJson.LOffset : '' : '';
}

function GetFieldQuery(QueryJson) {
  let NamaField = '';
  if (QueryJson.hasOwnProperty('LNamaField')) {
    if (Array.isArray(QueryJson.LNamaField)) {
      QueryJson.LNamaField.forEach(function (item, index, array) {
        (NamaField == '') ? NamaField = item: NamaField = NamaField + ', ' + item;
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
  }

  if (QueryJson.hasOwnProperty('LKey')) {
    for (let field in QueryJson.LKey) {
      let val = QueryJson.LKey[field].data
      let tmpField = field

      if (val.length > 0) {
        if (Json.text == '') {
          Json.text = ' where ('
          Json.values = []
        } else {
          Json.text = Json.text + ' AND ('
        }

        if (QueryJson.LKey[field].isSensitive == false) {
          if (QueryJson.LKey[field].jenis == CONSTANTA.CJENIS_FILTER_STRING) {
            tmpField = ' Upper (' + tmpField + ')'
          }
        }

        val.forEach((Data, index) => {
          if (index != 0) {
            Json.text = Json.text + ' ' + Data.operand + ' '
          }

          let tmpData = Data.data
          if (QueryJson.LKey[field].isSensitive == false) {
            if (QueryJson.LKey[field].jenis == CONSTANTA.CJENIS_FILTER_STRING) {
              tmpData = tmpData.toUpperCase()
            }
          }

          Json.text = Json.text + tmpField + ' ' + Data.opr + ' ' + '?'
          // Json.text = Json.text + field + ' ' + Data.opr + ' ' + '?'
          Json.values.push(tmpData)
          // Json.values.push(Data.data)
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
  }

  let tmpField = '';
  let tmpValue = '';

  if (QueryJson.hasOwnProperty('LData')) {
    for (let field in QueryJson.LData) {
      let val = QueryJson.LData[field].data

      if (val.length > 0) {
        val.forEach((Data, index) => {
          if (tmpField == '') {
            tmpField = field
            tmpValue = '?'

            Json.values = [Data.data];
          } else {
            tmpField = tmpField + ' , ' + field;
            tmpValue = tmpValue + ' , ' + '?'

            Json.values.push(Data.data);
          }
        })
      }
    }
    Json.text = '(' + tmpField + ') ' + ' Values (' + tmpValue + ')';
  }

  return Json;
}

function GetUpdateTable(QueryJson, indexWhere) {
  let Json = {
    text: '',
  }

  let tmpField = '';
  if (QueryJson.hasOwnProperty('LData')) {
    for (let field in QueryJson.LData) {
      let val = QueryJson.LData[field].data

      if (val.length > 0) {
        val.forEach((Data, index) => {
          if (tmpField == '') {
            tmpField = field + ' = ?'
            Json.values = [Data.data];
          } else {
            tmpField = tmpField + ' , ' + field + ' = ?'
            Json.values.push(Data.data);
          }
        })
      }
    }
    Json.text = ' set ' + tmpField;
  }
  return Json;
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