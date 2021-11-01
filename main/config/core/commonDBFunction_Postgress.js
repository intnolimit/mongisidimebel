const { json } = require('body-parser');
const { DateTime } = require('mssql');
const pg = require('pg');
const commonFunc = require('./commonFunc');
const constanta = require('./constanta');


function commonDBFunction() {
  this.init = function (conDB, done) {
    pg.defaults.ssl = false;
    // conDB.ssl = {
    //   rejectUnauthorized: false
    // };
    return new pg.Pool(conDB)
  }

  this.checkDBExist = (db) => new Promise((resolve, reject) => {
    db.connect((err, con, done) => {
      if (err) {
        console.log(err);
        reject(err)
      } else {
        con.query('BEGIN', err => {
          if (err) {
            console.log('ERROR PG CHECK DB EXIST 2');
            reject(err)
          }
          con.jenis = POSTGRESS_DB;
          resolve(con)
        })
      }
    })
  })

  this.closeConnection = (transaction, statusCommit = true) => new Promise(function (resolve, reject) {
    if (statusCommit == true) {
      transaction.query('COMMIT', err => {
        if (err) {
          console.error('Error committing transaction', err.stack)
          transaction.query('ROLLBACK', err => {
            transaction.release();
            reject(false)
          })
        } else {
          transaction.release();
          resolve(true)
        }
      })
    } else {
      transaction.query('ROLLBACK', err => {
        if (err) {
          transaction.release();
          reject(false)
        }
        transaction.release();
        resolve(true)
      })
    }
  })

  this.rollbackTransaction = (transaction) => new Promise(function (resolve, reject) {
    transaction.query('ROLLBACK', err => {
      if (err) {
        transaction.release();
        reject(false)
      }
      transaction.release();
      resolve(true)
    })
  })

  this.isExist = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;
    // console.log('baru masuk is exist postgress');
    
    let SqlText = SQLShowTabel(QueryJson);
    SqlText.text = SqlText.text + GetOrderBy(QueryJson);
    SqlText.text = SqlText.text + GetLimit(QueryJson);
    SqlText.text = SqlText.text + GetOffset(QueryJson);

    console.log('isi sql text di isexist >>>>', SqlText);
    ConnectionDB.query(SqlText)
    .then(hasil => {
      // console.log('hasil dari isexit >>>', hasil);
      if (hasil.rowCount > 0) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
    .catch(e => { 
      console.log('hasil dari isexit error >>>', e);
        reject(e);
    })
  })

  this.ShowTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    let SqlText = SQLShowTabel(QueryJson);
    SqlText.text = SqlText.text + GetGroupBy(QueryJson);
    SqlText.text = SqlText.text + GetOrderBy(QueryJson);
    SqlText.text = SqlText.text + GetLimit(QueryJson);
    SqlText.text = SqlText.text + GetOffset(QueryJson);
    console.log(SqlText);

    ConnectionDB.query(SqlText)
      .then(hasil => resolve(hasil.rows))
      .catch(e => reject(e))
  })

  this.InsertTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    // if (!QueryJson.LData.hasOwnProperty('edittime')) {
    //   QueryJson.LData['edittime'] = {
    //     data: [{
    //       data: new Date()
    //     }]
    //   }
    // }
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;
    
    let SqlText = SQLInsertTabel(QueryJson);
    ConnectionDB.query(SqlText)
      .then(hasil => resolve(hasil.rows))
      .catch(e => {
        console.log(e);
        reject(e)
      })
  })

  this.UpdateTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    if (!QueryJson.LData.hasOwnProperty('edittime')) {
      QueryJson.LData['edittime'] = {
        data: [{
          data : new Date()
        }]
      }
    }
    
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;
    
    let SqlText = SQLUpdateTabel(QueryJson)
    console.log("isi sql Update Tabel >>>> ", SqlText)
    // console.log("TANGGAL SEKARANG !!!!!!!!!!!!  ", new Date.now().toISOString)
    ConnectionDB.query(SqlText)
      .then(hasil => resolve(hasil.rows))
      .catch(e => reject(e))    
  })

  this.DeleteTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    // if (!QueryJson.LData.hasOwnProperty('edittime')) {
    //   QueryJson.LKey['edittime'] = {data: [{data: new Date().toISOString()}]}
    // }
    console.log('ini dalam delete tabel isi query >>> ', QueryJson);
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;

    let SqlText = SQLDeleteTabel(QueryJson)
    console.log('delete tabel sql text >>> ', SqlText);
    
    ConnectionDB.query(SqlText)
      .then(hasil => resolve(hasil.rows))
      .catch(e => reject(e))
  })

  this.RawQuery = (SqlText, ConnectionDB) => new Promise(function (resolve, reject) {
    // if (!SqlText.hasOwnProperty('values')) SqlText['values'] = [];
    if (!SqlText.hasOwnProperty('values')) SqlText['values'] = [];
    if (SqlText.hasOwnProperty('keyValues')) SqlText.values.push(SqlText['keyValue']);
    if (SqlText.hasOwnProperty('fieldValues')) SqlText.values.push(SqlText['fieldValues']);
    console.log('SqlText - Raw Query - CommonDB Func', SqlText);
    
    ConnectionDB.query(SqlText)
      .then(hasil => resolve(hasil.rows))
      .catch(e => reject(e))
  })

  this.getNumber = (header, ConnectionDB) => new Promise(async function (resolve, reject) {    
    let sqlText = {
      text: 'Select * from ms_autonumber where id = $1',
      values: [header],
    }            
    ConnectionDB.query(sqlText)
    .then(hasil => {
      if (hasil.rows.length == 0) 
      {        
        sqlText.text = 'insert into ms_autonumber(id, nilai, edittime) values ($1, $2, $3)';
        sqlText.values = [header, 2, new Date()];    
        ConnectionDB.query(sqlText)
        .then(hasil => resolve(1))
        .catch(e => reject(e))
      }
      else return resolve(hasil.rows[0].nilai);
    })
    .catch(e => reject(e))
  })
}

function SQLShowTabel(QueryJson) {
  let query = 'Select ' + GetFieldQuery(QueryJson) + ' From ' + GetNamaTable(QueryJson);
  let SqlText = GetWhereTable(QueryJson);
  SqlText.text = query + SqlText.text;
  
  return SqlText;
}

function SQLInsertTabel(QueryJson) {
  console.log('SBLM GET NAMA TABLE', QueryJson);
  let query = 'Insert Into ' + GetNamaTable(QueryJson);
  console.log(query);
  let SqlText = GetInsertTable(QueryJson);
  SqlText.text = query + SqlText.text;

  return SqlText;
}

function SQLUpdateTabel(QueryJson) {
  let query = 'Update ' + GetNamaTable(QueryJson);
  console.log("query json di sqlupdate >>>>>", QueryJson);
  
  let whereText = GetWhereTable(QueryJson);
  console.log("sql text di sqlupdate >>>>>",)
  let indexWhere = 0;

  if (whereText.hasOwnProperty('values')) {
    indexWhere = whereText.values.length
  }

  let updateText = GetUpdateTable(QueryJson, indexWhere);

  let SqlText = {
    text: '',
  }

  SqlText.text = query + updateText.text + whereText.text;
  console.log("sql text di sqlupdate >>>>>", SqlText.text)
  
  SqlText.values = whereText.values;
  updateText.values.forEach(function (item, index, array) {
    SqlText.values.push(item);
  })
  // SqlText.values.push(updateText.values);

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

function GetLimit(QueryJson) {
  return (QueryJson.hasOwnProperty('LLimit')) ? (QueryJson.LLimit != '') ? ' Limit ' + QueryJson.LLimit : '' : '';
}

function GetOffset(QueryJson) {
  return (QueryJson.hasOwnProperty('LOffset')) ? (QueryJson.LOffset != '') ? ' Offset ' + QueryJson.LOffset : '' : '';
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
  let posIndex = 1

  if (QueryJson.hasOwnProperty('LKey')) {
    for (field in QueryJson.LKey) {
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
          if (QueryJson.LKey[field].jenis == 2) {
            tmpField = ' Upper (' + tmpField + ')'
          }
        }

        val.forEach((Data, index) => {
          if (index != 0) {
            Json.text = Json.text + ' ' + Data.operand + ' '
          }
          let tmpData = Data.data
        
          if (QueryJson.LKey[field].isSensitive == false) {
            if (QueryJson.LKey[field].jenis == constanta.CJENIS_FILTER_STRING) {
              // if (QueryJson.LKey[field].jenis == 2) {
                tmpData = tmpData.toUpperCase()
            }
          }
        
          if (tmpData == null) {
            Json.text = Json.text + tmpField + ' is null '
          } else {
            Json.text = Json.text + tmpField + ' ' + Data.opr + ' ' + '$' + (posIndex)
            Json.values.push(tmpData)
        
            posIndex += 1
          }
          // Json.text = Json.text + tmpField + ' ' + Data.opr + ' ' + '$' + (posIndex)
          
        })
        Json.text = Json.text + ')'
      }
    }
  }

  return Json;
}

function GetInsertTable(QueryJson) {
  let Json = {text: ''}
  let posIndex = 1
  let tmpField = '';
  if (QueryJson.hasOwnProperty('LData')) {
    Json.values = [];
    rowData = [];
    for (field in QueryJson.LData) {
      let val = QueryJson.LData[field].data;
      tmpField = ((tmpField == '') ? field : tmpField + ' , ' + field);
      
      if (val.length > 0) {
        val.forEach((Data, rowIdx) => {
          rowData[rowIdx] = (rowData[rowIdx] == null) ? '' :  rowData[rowIdx] + ', '; 
          rowData[rowIdx]+= '$' + posIndex;
          // Json.values.push(new Intl.NumberFormat('en-US', {style: 'decimal'}).format(Data.data));
          Json.values.push(Data.data);
          posIndex++; 
        })
      }
    }
  
    Json.text = '(' + tmpField + ') Values ';
    rowData.forEach((rowText, idx) => {
      Json.text += (idx == 0) ? '(' + rowText + ')' : ', (' + rowText + ')';
    });
  }
  return Json;
}

function GetUpdateTable(QueryJson, indexWhere) {
  let Json = {
    text: '',
  }

  let posIndex = 1 + indexWhere

  let tmpField = '';
  if (QueryJson.hasOwnProperty('LData')) {
    for (field in QueryJson.LData) {
      let val = QueryJson.LData[field].data

      if (val.length > 0) {
        val.forEach((Data, index) => {
          if (tmpField == '') {
            tmpField = field + ' = $' + posIndex
            Json.values = [Data.data];
          } else {
            tmpField = tmpField + ' , ' + field + ' = $' + posIndex
            Json.values.push(Data.data);
          }
          posIndex += 1
        })
      }
    }
    Json.text = ' set ' + tmpField;
  }

  return Json;
}

module.exports = new commonDBFunction();