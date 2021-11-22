/*
TMPFILTER / QueryJson = {
  title: String,
  LNamaTabel: String,
  LNamaField: [String] / '*',
  LLimit: int,
  LOffset: int,
  LOrder: String,
  LKey: KeyMap,
  LData: KeyMap,
  LCekDelete: {Key(NamaTabel) : {Key1: String, Key2: ....}, },
  LHeaderAutoNumber: HeaderAutoNumber
}
KeyMap = {
  Key1: {
    data: DataMap, 
    jenis: int (0: Tgl, 1: int, 2: String, 3: double, 4: int, 5: lookup),
    isSensitif: boolean
  }, Key2: {...}, ...
}
DataMap = [
  { data: dynamic, 
    opr: String, 
    operand: String
  }
]
HeaderAutoNumber = {
  Key1: {
    header: String,
    jenis: int (-1: Custom, 1: Yearly, 2: Monthly, 3: Daily, 4: DateTime),
    format: String,
    isAuto: boolean
  }, Key2: {...}, ...
}

================================
hasil result json
{
    Code: 0 ,
    status: 0,
    message: message.toString(), string
    jumlahData: jumlahData, integer
    isidata: array of json 
}


=======================================================
nilai json isidata saat error

{
  errorUser: 'ini pesan yang akan muncul di message',
  errorProgramer: 'ini pesan utk progamer'
};

==================================================
nilai json isidata saat  berhasil
    isi data = nama field dari tabel
}


/**/


const POSTGRESS_CDBF = require('./commonDBFunction_Postgress.js')
const FIREBIRD_CDBF = require('./commonDBFunction_Firebird.js')
const SQLSERVER_CDBF = require('./commonDBFunction_SqlServer.js')
const DB = require('./db.js')
const CONSTANTA = require('./constanta.js');
const COMMONFUNC = require('./commonFunc.js');

function commonDBFunction() {
  this.isExist = isExist

  this.showTabel = (QueryJson, conectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    getCommonDB(conectionDB.jenis).showTabel(QueryJson, conectionDB, NamaTabel)
      .then(data => resolve(data))
      .catch(err => {
        reject({
          errorUser: 'ada masalah saat pengambilan data',
          errorProgramer: err.toString()
        })
      })
  })

  this.insertTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).insertTabel(QueryJson, ConnectionDB, NamaTabel)
      .then(data => {   
        resolve(data)
      })
      .catch(err => {
        reject({
          errorUser: 'ada masalah saat pengisian data',
          errorProgramer: err.toString()
        })
      })
  })

  this.updateTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).updateTabel(QueryJson, ConnectionDB, NamaTabel)
      .then(data => resolve(data))
      .catch(err => {
        reject({
          errorUser: 'ada masalah saat perubahan data',
          errorProgramer: err.toString()
        })
      })
  })

  this.deleteTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).deleteTabel(QueryJson, ConnectionDB, NamaTabel)
      .then(data => resolve(data))
      .catch(err => {
        reject({
          errorUser: 'ada masalah saat penghapusan data',
          errorProgramer: err.toString()
        })
      })
  })

  this.rawQuery = (SqlText, ConnectionDB) => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).rawQuery(SqlText, ConnectionDB)
      .then(data => resolve(data))
      .catch(err => {
        reject({
          errorUser: 'ada masalah saat raw query',
          errorProgramer: err.toString()
        })
      })
  })

  this.closeConnection = (ConnectionDB) => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).closeConnection(ConnectionDB)
      .then(done => resolve(done))
      .catch(err => reject({
        errorUser: 'ada masalah saat tutup koneksi',
        errorProgramer: err.toString()
      }))
  })

  this.rollBackConnection = (ConnectionDB) => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).rollbackTransaction(ConnectionDB)
      .then(done => resolve(done))
      .catch(err => reject({
        errorUser: 'ada masalah saat rollback',
        errorProgramer: err.toString()
      }))
  })

  this.cekDelete = (QueryJson, connectionDB) => new Promise(async function (resolve, reject) {
    let isError = false;
    if (QueryJson.hasOwnProperty('LCekDelete')) {
      let tmpQuery = {};
      let tmpLKey = {};
      for (tabel in QueryJson.LCekDelete) {
        if (isError) break;

        tmpQuery['LNamaTabel'] = tabel;
        tmpQuery['LNamaField'] = '*';

        for (key in QueryJson.LCekDelete[tabel].LFieldPair) {
          if (QueryJson.LKey.hasOwnProperty(QueryJson.LCekDelete[tabel].LFieldPair[key])) {
            tmpLKey[key] = QueryJson.LKey[QueryJson.LCekDelete[tabel].LFieldPair[key]];
          } else {
            isError = true;
            reject({
              errorUser: 'Error Saat Cek Delete',
              errorProgramer: 'Pair Field Tidak Sesuai'
            })
            break;
          }
        }
        if (!isError) {
          tmpQuery['LKey'] = tmpLKey;
          return isExist(tmpQuery, connectionDB)
            .then(tmpExist => {
              if (tmpExist) {
                isError = true;
                reject({
                  errorUser: 'Data masih terpakai di table lain',
                  errorProgramer: 'Data masih terpakai di table lain'
                })
              }
            })
            .catch(err => {
              reject(err)
              isError = true;
            })
        }
      }
    }
    if (!isError) resolve(true);
  })

  this.checkDBExist = (dbPos = -1) => new Promise(async function (resolve, reject) {
    if (dbPos == -1) {
      let i = 0
      let hasilCheckDB
      do {
        hasilCheckDB = await getCommonDB(DB.getListDB()[i].bitsSetting.jenis).checkDBExist(DB.getListDB()[i].pool)
          .then(hasilDB => {
            return hasilDB
          })
          .catch(err => {
            return false
          })
        i = i + 1;
      } while ((hasilCheckDB == false) && (i < DB.getListDB().length))

      if (hasilCheckDB == false) {
        reject({
          errorUser: 'Database tidak di temukan',
          errorProgramer: ''
        })
      } else {
        // JenisDB = hasilCheckDB.jenis
        resolve(hasilCheckDB)
      }
    } else {
      getCommonDB(DB.getListDB()[dbPos].bitsSetting.jenis).checkDBExist(DB.getListDB()[dbPos].pool)
        .then(hasilDB => {
          resolve(hasilDB)
        })
        .catch(err => {
          reject({
            errorUSer: 'Database tidak ada',
            errorProgramer: err.toString()
          })
        })
    }
  })

  this.generateAutoNumber = (QueryJson, connectionDB) => new Promise(async function (resolve, reject) {
    let isGetNumber = true;
    let tmpID = '';
    let isError = false;
    let hasil = {};
    if (QueryJson.hasOwnProperty('LHeaderAutoNumber')) {
      //di sini di looping field apa saja yang ada auto number
      for (fieldAutoNumber in QueryJson.LHeaderAutoNumber) {
        let tmpHeaderJSON = QueryJson.LHeaderAutoNumber[fieldAutoNumber];
        if (tmpHeaderJSON.isAuto) {
          let header = tmpHeaderJSON.header;

          let resHeader = COMMONFUNC.getHeaderAutoNumber(header, tmpHeaderJSON.format, new Date(),
            tmpHeaderJSON.jenis, isGetNumber);
          header = resHeader.header;
          isGetNumber = resHeader.isGetNumber;

          tmpID = header;

          if (isGetNumber) {
            tmpID = await getNumber(header, connectionDB, QueryJson, fieldAutoNumber)
              .then(number => number)
              .catch(err => {
                reject(err);
                isError = true
              });
          }
          hasil[fieldAutoNumber] = tmpID;
        }
      }
    }
    if (!isError) {
      resolve(hasil);
    }
  })

  this.createQueryJSON = createQueryJSON;

  this.addMap = addMap;
  this.setMap = setMap;
  this.clearMap = clearMap;
  this.setDataMap = setDataMap;
  this.addDataMap = addDataMap;
  this.setHeaderAutoNumber = setHeaderAutoNumber;
  this.addHeaderAutoNumber = addHeaderAutoNumber;

  this.constanta = CONSTANTA;
  this.initDB = DB.init;
}

// HeaderAutoNumber = {
//   Key1: {
//     header: String,
//     jenis: int (-1: Custom, 1: Yearly, 2: Monthly, 3: Daily, 4: DateTime),
//     format: String,
//     isAuto: boolean
//   }, Key2: {...}, ...
// }

// function addHeaderAutoNumber(source, header, jenis = constanta.CJENIS_AN_TGL_JAM, format = '', isAuto = true) {
//   if (source.hasOwnProperty('LHeaderAutoNumber')) {

//   }
// }

function getNumber(header, ConnectionDB, QueryJson, fieldAutoNumber) {
  return new Promise(function (resolve, reject) {
    let localQueryJson = createQueryJSON(ConnectionDB.tabel_autonumber.tabel);
    setMap(localQueryJson.LKey, ConnectionDB.tabel_autonumber.keyfield, header);

    getCommonDB(ConnectionDB.jenis).showTabel(localQueryJson, ConnectionDB)
      .then(async hasil => {
        let tmpNumber = 1;
        let isKembar = true;
        let tmpID = '';
        if (hasil.length > 0) {
          tmpNumber = hasil[0][ConnectionDB.tabel_autonumber.valfield];
        } else {
          setMap(localQueryJson.LData, ConnectionDB.tabel_autonumber.keyfield, header);
          addMap(localQueryJson.LData, ConnectionDB.tabel_autonumber.valfield, 1);

          await getCommonDB(ConnectionDB.jenis).insertTabel(localQueryJson, ConnectionDB)
        }
        
        localQueryJson = createQueryJSON(QueryJson.LNamaTabel);
        while (isKembar) {
          tmpID = tmpNumber.toString();
          let sisa = ConnectionDB.tabel_autonumber.panjangnumber - tmpID.length - header.length;

          for (i = 0; i < sisa; i++) {
            tmpID = '0' + tmpID;
          }
          tmpID = header + tmpID;

          setMap(localQueryJson.LKey, fieldAutoNumber, tmpID);
          isKembar = await isExist(localQueryJson, ConnectionDB);
          tmpNumber++;
        }

        localQueryJson = createQueryJSON('ms_autonumber');
        setMap(localQueryJson.LKey, ConnectionDB.tabel_autonumber.keyfield, header);
        addMap(localQueryJson.LData, ConnectionDB.tabel_autonumber.valfield, tmpNumber)
        // console.log('sebelum update ms auto >>>>', localQueryJson)
        return getCommonDB(ConnectionDB.jenis).updateTabel(localQueryJson, ConnectionDB)
          .then(update => {
            resolve(tmpID);
          })
        // .catch(err => {
        //   console.log('err dalam update >>>', err);
        //   reject(err);
        // });
      })
      .catch(err => {
        reject(err)
      })
  })
}

function isExist(QueryJson, ConnectionDB, NamaTabel = '') {
  return new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).isExist(QueryJson, ConnectionDB, NamaTabel)
      .then(data => { 
        resolve(data) })
      .catch(err => {
        reject({
        errorUser: 'ada masalah pengecekan isexist',
        errorProgramer: err.toString()
      })})
  })
}

function getCommonDB(jenis) {
  if (jenis == CONSTANTA.CPOSTGRESS_DB) {
    return POSTGRESS_CDBF
  } else if (jenis == CONSTANTA.CFIREBIRD_DB) {
    return FIREBIRD_CDBF
  } else if (jenis == CONSTANTA.CSQLSERVER_DB) {
    return SQLSERVER_CDBF
  }
}

function createQueryJSON(namaTable, NamaField = '*', orderBy = '', limit = 100) {
  let QueryJson = {
    title: '',
    LNamaTabel: namaTable,
    LNamaField: NamaField,
    LLimit: limit,
    LOffset: 0,
    LOrder: orderBy,
    LKey: {},
    LData: {},
    LCekDelete: {},
    LHeaderAutoNumber: {}
  }
  return QueryJson;
}

function setHeaderAutoNumber(source, lfield, lheader, ljenis = CONSTANTA.CJENIS_AN_HARIAN, 
  lformat = '-yymmdd-HHMMssl', ltipeData = CONSTANTA.CJENIS_FILTER_STRING, lisAuto = true) {
  clearMap(source);
  addHeaderAutoNumber(source, lfield, lheader, ljenis, lformat, ltipeData, lisAuto);
}

function addHeaderAutoNumber(source, lfield, lheader, ljenis = CONSTANTA.CJENIS_AN_HARIAN, 
  lformat = '-yymmdd-HHMMssl', ltipeData = CONSTANTA.CJENIS_FILTER_STRING, lisAuto = true) {
  source[lfield] = {
    header: lheader,
    jenis: ljenis,
    format: lformat,
    tipeData: ltipeData,
    isAuto: lisAuto
  }
}

function setMap(source, lfield, ldata, lopr = '=', ljenis = CONSTANTA.CJENIS_FILTER_STRING, 
  lisSensitive = false, loperand = 'AND') {
  clearMap(source);
  addMap(source, lfield, ldata, lopr, ljenis, lisSensitive, loperand);
}

function addMap(source, lfield, ldata, lopr = '=', ljenis = CONSTANTA.CJENIS_FILTER_STRING, 
  lisSensitive = false, loperand = 'AND') {
  source[lfield] = {
    isSensitive: lisSensitive,
    jenis: ljenis,
    data: [{
      data: ldata,
      opr: lopr,
      operand: loperand
    }]
  }
}

function clearMap(source) {
  source = {};
}

function setDataMap(source, ldata, lopr = '=', loperand = 'AND') {
  if (Array.isArray(source)) source = []
  else source.data = [];

  addDataMap(source, ldata, lopr, loperand);
}

function addDataMap(source, ldata, lopr = '=', loperand = 'AND') {
  if (Array.isArray(source)) {
    source.push({
      data: ldata,
      opr: lopr,
      operand: loperand
    })
  } else {
    source.data.push({
      data: ldata,
      opr: lopr,
      operand: loperand
    })
  }

}

module.exports = new commonDBFunction();