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
  LCekDelete: {Key1: String, Key2: ....},
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
    tipeData: int,
    isAuto: boolean
  }, Key2: {...}, ...
}
/* */
const Postgress_CDBF = require('./commonDBFunction_Postgress.js')
const Firebird_CDBF = require('./commonDBFunction_Firebird.js')
const SqlServer_CDBF = require('./commonDBFunction_SqlServer.js')
const db = require('../db.js')
const Constanta = require('./constanta.js');
const CommonFunc = require('./commonFunc.js');

function commonDBFunction() {
  this.PrintJson = function (code, status, message, jumlahData, isiData) {
    return PrintJson(code, status, message, jumlahData, isiData)
  }

  this.PrintJsonShow = function (data) {
    let hasil
    // hasil = data
    if (data.length > 0) {
      hasil = PrintJson(Constanta.CCODE_BERHASIL, Constanta.CSTATUS_BERHASIL, 'Berhasil Mendapatkan Data', data.length, data)
    } else {
      hasil = PrintJson(Constanta.CODE_GAGAL, Constanta.CSTATUS_GAGAL, 'Tidak Ada Data', 0, [])
    }

    return hasil
  }

  this.PrintJsonDelete = function (data) {
    return PrintJson(Constanta.CCODE_BERHASIL, Constanta.CSTATUS_BERHASIL, 'Data Berhasil di Hapus', 1, data)
  }

  this.PrintJsonUpdate = function (data) {
    let hasil
    if (data.length > 0) {
      hasil = PrintJson(Constanta.CCODE_BERHASIL, Constanta.CSTATUS_BERHASIL, 'Data yang di udpate berhasil', data.length, data)
    } else {
      hasil = PrintJson(Constanta.CODE_GAGAL, Constanta.CSTATUS_GAGAL, 'Data yang di udpate gagal', 0, [])
    }
    return hasil
  }

  this.PrintJsonInsert = function (data) {
    let hasil
    if (data.length > 0) {
      hasil = PrintJson(Constanta.CCODE_BERHASIL, Constanta.CSTATUS_BERHASIL, 'Data yang di input berhasil masuk', data.length, data)
    } else {
      hasil = PrintJson(Constanta.CODE_GAGAL, Constanta.CSTATUS_GAGAL, 'Data yang di input gagal masuk', 0, [])
    }

    return hasil
  }

  this.PrintJsonError = function (data) {
    return PrintJson(Constanta.CODE_GAGAL, Constanta.CSTATUS_GAGAL, data, 0, [])
  }

  this.PrintJsonNotExist = function (data) {
    return PrintJson(Constanta.CODE_GAGAL, Constanta.CSTATUS_TIDAK_ADA_DATA, data, 0, [])
  }

  // this.isExist = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
  //   getCommonDB(ConnectionDB.jenis).isExist(QueryJson, ConnectionDB, NamaTabel)
  //     .then(data => resolve(data))
  //     .catch(err => reject(err))
  // })

  this.isExist = isExist

  this.ShowTabel = (QueryJson, conectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    getCommonDB(conectionDB.jenis).ShowTabel(QueryJson, conectionDB, NamaTabel)
      .then(data => resolve(data))
      .catch(err => {
        console.log(err);
        reject('Query Tidak Berhasil')
      })
  })

  this.InsertTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).InsertTabel(QueryJson, ConnectionDB, NamaTabel)
      .then(data => resolve(data))
      .catch(err => {
        console.log(err);
        return reject('Insert Tidak Berhasil')
      })
  })

  this.UpdateTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).UpdateTabel(QueryJson, ConnectionDB, NamaTabel)
      .then(data => resolve(data))
      .catch(err => {
        reject('Insert Tidak Berhasil')
      })
  })

  this.DeleteTabel = (QueryJson, ConnectionDB, NamaTabel = '') => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).DeleteTabel(QueryJson, ConnectionDB, NamaTabel)
      .then(data => resolve(data))
      .catch(err => {
        reject('Delete Tidak Berhasil')
      })
  })

  this.RawQuery = (SqlText, ConnectionDB) => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).RawQuery(SqlText, ConnectionDB)
      .then(data => resolve(data))
      .catch(err => {
        console.log(err);
        reject('Ada Kesalan Raw')
        // reject(err)
      })
  })

  this.closeConnection = (ConnectionDB, statusCommit = true) => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).closeConnection(ConnectionDB, statusCommit)
      .then(done => resolve(done))
      .catch(err => reject(err))
  })

  this.rollBackConnection = (ConnectionDB) => new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).rollbackTransaction(ConnectionDB)
      .then(done => resolve(done))
      .catch(err => reject(err))
  })

  this.cekDelete = (QueryJson, connectionDB) => new Promise(async function (resolve, reject) {
    // let canDel = true;
    let res = {
      hasil: true,
      message: 'OK'
    }
    if (QueryJson.hasOwnProperty('LCekDelete')) {
      let tmpQuery = {};
      let tmpLKey = {};
      for (tabel in QueryJson.LCekDelete) {
        tmpQuery['LNamaTabel'] = tabel;
        tmpQuery['LNamaField'] = '*';

        for (key in QueryJson.LCekDelete[tabel].LFieldPair) {
          // let val = QueryJson.LCekDelete[key]
          console.log('di dalam cek delete ');
          console.log('key  >>>', key);
          console.log('QueryJson.LCekDelete  >>>', QueryJson.LCekDelete);
          console.log('QueryJson.LCekDelete[tabel][key]  >>>', QueryJson.LCekDelete[tabel].LFieldPair[key]);

          if (QueryJson.LKey.hasOwnProperty(QueryJson.LCekDelete[tabel].LFieldPair[key])) {
            tmpLKey[key] = QueryJson.LKey[QueryJson.LCekDelete[tabel].LFieldPair[key]];
          } else {
            res.hasil = false;
            res.message = 'Pair Field Tidak Sesuai';
            reject(res);
          }
        }
        // let firstKey = Object.keys(QueryJson.LKey)[0];

        // tmpLKey[QueryJson.LCekDelete[tabel]] = QueryJson.LKey[firstKey];
        tmpQuery['LKey'] = tmpLKey;

        // console.log('tmpQuery >>>>> ', tmpQuery);

        // let tmpExist = await fnIsExist(tmpQuery, connectionDB);
        let tmpExist = await isExist(tmpQuery, connectionDB);
        if (tmpExist) {
          res.hasil = false;
          res.message = 'Data masih terpakai di table lain';
          // canDel = false;
        }
      }
    } else {
      res.hasil = true;
      res.message = 'Tidak ada pengecekan Tabel';
    }
    resolve(res);
  })

  this.checkDBExist = (dbPos = -1) => new Promise(async function (resolve, reject) {
    if (dbPos == -1) {
      let i = 0
      let hasilCheckDB
      do {
        hasilCheckDB = await getCommonDB(db.getListDB()[i].jenis).checkDBExist(db.getListDB()[i].pool)
        .then(hasilDB => {
          return hasilDB
        })
        .catch(err => {
          return err
        })
        i = i + 1
      } while ((hasilCheckDB == false) && (i < db.getListDB().length))

      if (hasilCheckDB == false) {
        reject(false)
      } else {
        // JenisDB = hasilCheckDB.jenis
        resolve(hasilCheckDB)
      }
    } else {
      // JenisDB = db.getListDB()[i].jenis
      getCommonDB(db.getListDB()[dbPos].jenis).checkDBExist(db.getListDB()[dbPos].pool)
      .then(hasilDB => {
        // JenisDB = hasilCheckDB.jenis
        resolve(hasilDB)
      })
      .catch(err => {
        reject(err)
      })
    }
  })

  this.generateAutoNumber = (QueryJson, connectionDB) => new Promise(async function (resolve, reject) {
    let tmpID = '';
    if (QueryJson.hasOwnProperty('LHeaderAutoNumber')) {
      // for (field in QueryJson.LHeaderAutoNumber) {
      let field = Object.keys(QueryJson.LHeaderAutoNumber)[0];
      console.log('CUR FIELD:', field);
      {
        let tmpHeaderJSON = QueryJson.LHeaderAutoNumber[field];

        let header = tmpHeaderJSON.header;
        let tanggal = new Date();
        let format = tmpHeaderJSON.format;
        let jenis = tmpHeaderJSON.jenis;

        header = CommonFunc.getHeaderAutoNumber(header, format, tanggal, jenis);
        console.log('CURRENT HEADER', header);
        if (jenis != Constanta.CJENIS_AN_TGL_JAM) {
          let localQueryJson;
          let isLocalExist = false;
          getNumber(header, connectionDB)
          .then(curNumber => {
            console.log('Number dari GETNUMBER: ', curNumber);
            tmpID = CommonFunc.lengthIntToStr(header, curNumber, 17);
            
            // localQueryJson.LNamaTabel = QueryJson.LNamaTabel;
            localQueryJson = createQueryJSON(QueryJson.LNamaTabel);
            setFieldMap(localQueryJson.LKey, field, tmpID);
            // isLocalExist = await isExist(localQueryJson, connectionDB);

            // if (isLocalExist) {
            resolve(tmpID);
            if (curNumber > 1)
            {  
              localQueryJson = createQueryJSON('ms_autonumber');
              setFieldMap(localQueryJson.LKey, 'id', header);
              addFieldMap(localQueryJson.LData, 'nilai', curNumber + 1)
              return getCommonDB(connectionDB.jenis).UpdateTabel(localQueryJson, connectionDB)              
            }
          })          
        }
        else resolve(header);
      }
    }
  })

  this.createQueryJSON = createQueryJSON;

  this.addFieldMap = addFieldMap;
  this.setFieldMap = setFieldMap;
  this.clearMap = clearMap;
  this.setDataMap = setDataMap;
  this.addDataMap = addDataMap;
  this.setHeaderAutoNumber = setHeaderAutoNumber;
  this.addHeaderAutoNumber = addHeaderAutoNumber;
}

function getNumber(header, ConnectionDB) {
  console.log('MEMANGGIL GETNUMBER')
  return new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).getNumber(header, ConnectionDB)
    .then(number => resolve(number))
    .catch(e => reject(e))  
  });
}  

function isExist(QueryJson, ConnectionDB, NamaTabel = '') {
  console.log('COMMON DB IS EXIST')
  return new Promise(function (resolve, reject) {
    getCommonDB(ConnectionDB.jenis).isExist(QueryJson, ConnectionDB, NamaTabel)
      .then(data => resolve(data))
      .catch(err => reject(err))
  })
}

function PrintJson(code, status, message, jumlahData, isiData) {
  let hasil = {
    Code: code,
    status: status,
    message: message,
    jumlahData: jumlahData,
    isidata: isiData
  }
  return hasil
}

function getCommonDB(jenis) {
  if (jenis == POSTGRESS_DB) {
    return Postgress_CDBF
  } else if (jenis == FIREBIRD_DB) {
    return Firebird_CDBF
  } else if (jenis == SQLSERVER_DB) {
    return SqlServer_CDBF
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

function setHeaderAutoNumber(source, lfield, lheader, ljenis = 3, lformat = '-yymmdd-HHMMssl', ltipeData = 2, lisAuto = true) {
  clearMap(source);
  addHeaderAutoNumber(source, lfield, lheader, ljenis, lformat, ltipeData, lisAuto);
}

function addHeaderAutoNumber(source, lfield, lheader, ljenis = 3, lformat = '-yymmdd-HHMMssl', ltipeData = 2, lisAuto = true) {
  source[lfield] = {
    header: lheader,
    jenis: ljenis,
    format: lformat,
    tipeData: ltipeData,
    isAuto: lisAuto
  }
}

function setFieldMap(source, lfield, ldata, lopr = '=', ljenis = Constanta.CJENIS_FILTER_STRING, lisSensitive = false, loperand = 'AND') {
  clearMap(source);
  addFieldMap(source, lfield, ldata, lopr, ljenis, lisSensitive, loperand);
}

function addFieldMap(source, lfield, ldata, lopr = '=', ljenis = Constanta.CJENIS_FILTER_STRING, lisSensitive = false, loperand = 'AND') {
  source[lfield] = {
    isSensitive: lisSensitive,
    jenis: ljenis,
    data: []
    // data: [{
    //   data: ldata,
    //   opr: lopr,
    //   operand: loperand
    // }]
  }
}

function clearMap(source) {
  source = {};
}

function setDataMap(source, ldata, lopr = '=', loperand = 'AND') {
  if (Array.isArray(source))  source = [] 
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