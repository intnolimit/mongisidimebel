const Firebird = require('node-firebird');

function commonDBFunction() {
  this.init = function(conDB, done) {    
    return Firebird.pool(3, conDB);
  }

  this.checkDBExist = (db) => new Promise((resolve, reject) => {
    db.get(function(err, con) {
      if (err) { console.log(err); reject(err)}
      else { 
        con.transaction(Firebird.ISOLATION_READ_COMMITED, (err, transaction) => {
          if (err) reject(err);
          transaction.jenis = FIREBIRD_DB;
          transaction.con = con;
          resolve(transaction)
        }) 
      }
    })
  })

  this.closeConnection = (transaction, statusCommit = true) => new Promise(function (resolve, reject) {
    if (statusCommit == true) {
      transaction.commit(err => {
        if (err) { 
          console.log(err)
          transaction.rollback() 
          transaction.con.detach();
          reject(false)
        } else {
          transaction.con.detach();
          resolve(true)
        }
      })
    } else {
      transaction.rollback()
      let berhasil = true
      transaction.con.detach();
      resolve(true)
              
      if (berhasil == false) { reject(false)  }
    }
  })

  this.rollbackTransaction = (transaction) => new Promise(function (resolve, reject) {
    transaction.rollback()
    let berhasil = true
    transaction.con.detach();
    resolve(true)
              
    if (berhasil == false) { 
      reject(false);
    }
  })

  this.isExist = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;
      
    let SqlText = SQLShowTabel(QueryJson);

    SqlText.text = SqlText.text + GetOrderBy(QueryJson);

    let limitOffer = GetLimitOffer(QueryJson);
    SqlText.text = SqlText.text.replace('Select', limitOffer)

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

  this.ShowTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    try {
      QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;
      
      let SqlText = SQLShowTabel(QueryJson);
      SqlText.text = SqlText.text + GetGroupBy(QueryJson);
      SqlText.text = SqlText.text + GetOrderBy(QueryJson);
      
      let limitOffer = GetLimitOffer(QueryJson);
      SqlText.text = SqlText.text.replace('Select', limitOffer)
  
      ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
        (err) ? reject(err) : resolve(data)
      });
    }
    catch (err) {
      console.log(err);
    }
  })

  this.InsertTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;
      
    let SqlText = SQLInsertTabel(QueryJson);
    
    ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
      (err) ? reject(err) : resolve(data)
    });
  })

  this.UpdateTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;
      
    let SqlText = SQLUpdateTabel(QueryJson)
    
    ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
      (err) ? reject(err) : resolve(data)
    });
  })

  this.DeleteTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    QueryJson.LNamaTabel = (NamaTabel != '') ? NamaTabel : QueryJson.LNamaTabel;
      
    let SqlText = SQLDeleteTabel(QueryJson)
    
    ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
      (err) ? reject(err) : resolve(data)
    });
  })

  this.RawQuery = (SqlText, ConnectionDB) => new Promise(function (resolve, reject) {
    if (!SqlText.hasOwnProperty('values')) SqlText['values'] = [];
    if (SqlText.hasOwnProperty('keyValues'))SqlText.values.push(SqlText['keyValue']);
    if (SqlText.hasOwnProperty('fieldValues'))SqlText.values.push(SqlText['fieldValues']);
    console.log(SqlText);
    ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
  
  this.getNumber = (header, ConnectionDB) => new Promise(function (resolve, reject) {    
    let sqlText = {
      text: 'Select * from ms_autonumber where id = $1',
      values: [header],
    }
    
    ConnectionDB.query(SqlText.text, SqlText.values, function (err, data) {
      if (!err) {
        if (data.length == 0) 
        {
          sqlText.text = 'insert into ms_autonumber(id, nilai, edittime) values ($1, $2, $3)';
          sqlText.values = [header, 2, new Date()];    
          ConnectionDB.query(sqlText, SqlText.values, function (err, data) {
            return (err) ? reject(err) : resolve(1)
          // .then(hasil => resolve(1))
          // .catch(e => reject(e)
          })
        }
        else return resolve(data[0].nilai)        
      }
      else reject(err)
    });
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
  let whereText = GetWhereTable(QueryJson);
  let indexWhere = (whereText.hasOwnProperty('values')) ? whereText.values.length : 0;
  let updateText = GetUpdateTable(QueryJson, indexWhere);

  let SqlText = {
    text: '',
  }

  SqlText.text = query + updateText.text + whereText.text;
  SqlText.values = updateText.values;
  whereText.values.forEach(function (item, index, array) {
    SqlText.values.push(item);
  })

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
  return (QueryJson.hasOwnProperty('LGroup')) ? (QueryJson.LGroup != '') ? ' Group By ' + QueryJson.LGroup : '': '';
}

function GetOrderBy(QueryJson) {
  return (QueryJson.hasOwnProperty('LOrder')) ? (QueryJson.LOrder != '') ? ' Order By ' + QueryJson.LOrder : '': '';
}

function GetLimitOffer(QueryJson) {
  let first = GetLimit(QueryJson);
  first += GetOffset(QueryJson);
  return 'Select ' + first + ' ';
}

function GetLimit(QueryJson) {
  return (QueryJson.hasOwnProperty('LLimit')) ? (QueryJson.LLimit != '') ? ' first ' + QueryJson.LLimit : '': '';
}

function GetOffset(QueryJson) {
  return (QueryJson.hasOwnProperty('LOffset')) ? (QueryJson.LOffset != '') ? ' skip ' + QueryJson.LOffset : '': '';
}

function GetFieldQuery(QueryJson) {
  let NamaField = '';
  if (QueryJson.hasOwnProperty('LNamaField')) {
    if (Array.isArray(QueryJson.LNamaField)) {
      QueryJson.LNamaField.forEach(function (item, index, array) {
        (NamaField == '') ? NamaField = item : NamaField = NamaField + ', ' + item;
      });
    } else {
      (QueryJson.LNamaField == '' || QueryJson.LNamaField == ' ') ? NamaField = '*'
        : NamaField = QueryJson.LNamaField;
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
            if (QueryJson.LKey[field].jenis == 2) {
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

module.exports = new commonDBFunction();