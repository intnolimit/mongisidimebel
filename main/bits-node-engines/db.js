const fb = require('./commonDBFunction_Firebird');
const pg = require('./commonDBFunction_Postgress');
const ss = require('./commonDBFunction_SqlServer');
const constanta = require('./constanta');
// const fb = require('./core/commonDBFunction_Firebird.js');
// const pg = require('./core/commonDBFunction_Postgress.js');
// const ss = require('./core/commonDBFunction_SqlServer.js');

const MODE_TEST = 'mode_test';
const MODE_PROD = 'mode_production';

// var JenisDB 
// JenisDB = FIREBIRD_DB
// JenisDB = POSTGRESS_DB


// tabel_user{
//   'tabel': namaTabel,
//   'keyfield' : keyField,
//   'passfield' : passField,     
// };

// tabel_autonumber {
//   'tabel': namaTabel,
//   'keyfield' : keyField,
//   'valfield' : valField,     
// };

class ConFirebird {
  constructor(database, user, password, tabel_autonumber, tabel_user, jwtsecretkey, host = '127.0.0.1', port = 3050, lowercase_keys = true, max = 100) {
    this.dbSetting = {
      host : host,
      port : port,
      database : database,
      user : user,
      password : password,
      lowercase_keys : lowercase_keys,
      max : max,
    }

    this.bitsSetting = {
      jenis : constanta.CFIREBIRD_DB,
      tabel_autonumber : tabel_autonumber,
      tabel_user : tabel_user,
      jwtsecretkey : jwtsecretkey, 
    }

    // this.jenis = constanta.CFIREBIRD_DB;
    // this.host = host;
    // this.port = port;
    // this.database = database;
    // this.user = user;
    // this.password = password;
    // this.lowercase_keys = lowercase_keys;
    // this.max = max;
    // this.tabel_autonumber = tabel_autonumber;
    // this.tabel_user = tabel_user;
  }
}

class ConPostgress {
  constructor(database, user, password, tabel_autonumber, tabel_user, jwtsecretkey, host = '127.0.0.1', port = 5432, max = 100, idleTimeoutMillis = 30000, connectionTimeoutMillis = 2000) {
    this.dbSetting = {
      host : host,
      port : port,
      database : database,
      user : user,
      password : password,
      max : max,
      idleTimeoutMillis : idleTimeoutMillis,
      connectionTimeoutMillis : connectionTimeoutMillis,
      ssl: {
        rejectUnauthorized : false,
        // ca   : fs.readFileSync("server-ca.pem").toString(),
        // key  : fs.readFileSync("client-key.pem").toString(),
        // cert : fs.readFileSync("client-cert.pem").toString(),
      },
    }

    this.bitsSetting = {
      jenis : constanta.CPOSTGRESS_DB,
      tabel_autonumber : tabel_autonumber,
      tabel_user : tabel_user,
      jwtsecretkey: jwtsecretkey,
    }

    // this.jenis = constanta.CPOSTGRESS_DB;
    // this.host = host;
    // this.port = port;
    // this.database = database;
    // this.user = user;
    // this.password = password;
    // this.max = max;
    // this.idleTimeoutMillis = idleTimeoutMillis;
    // this.connectionTimeoutMillis = connectionTimeoutMillis;
    // this.tabel_autonumber = tabel_autonumber;
    // this.tabel_user = tabel_user;
  }
}

function Connection() {
  let listDB = [];

  this.createFirebird = (database, user, password, tabel_autonumber, tabel_user, jwtsecretkey, host = '127.0.0.1', port = 3050, lowercase_keys = true, max = 100) => {
    return new ConFirebird(database, user, password, tabel_autonumber, tabel_user, jwtsecretkey, host, port, lowercase_keys, max);
  }

  this.createPostGress = (database, user, password, tabel_autonumber, tabel_user, jwtsecretkey, host = '127.0.0.1', port = 5432, max = 100, idleTimeoutMillis = 30000, connectionTimeoutMillis = 2000) => {
    return new ConPostgress(database, user, password, tabel_autonumber, tabel_user, jwtsecretkey, host, port, max, idleTimeoutMillis, connectionTimeoutMillis);
  }

  this.setTabelAutonumber = (namaTabel, keyField, valField, panjangnumber = 17) => {
    return {
      'tabel': namaTabel,
      'keyfield': keyField,
      'valfield': valField,
      'panjangnumber': panjangnumber,
    };
  }

  this.setTabelUser = (namaTabel, keyField, passField) => {
    return {
      'tabel': namaTabel,
      'keyfield': keyField,
      'passfield': passField,
    };
  }

  this.getListDB = () => {
    return listDB
  }

  this.init = function (list) {
    listDB = list;
    // let curDB = (process.env.PORT == null) ? devDB: listDB;
    let curDB = listDB;
    console.log('Inisialisasi DB: ', curDB.length)
    curDB.forEach((db) => {
      switch (db.bitsSetting.jenis) {
        case constanta.CPOSTGRESS_DB:
          db.pool = pg.init(db);
          break;
        case constanta.CFIREBIRD_DB:
          // console.log('inisial fb init')
          db.pool = fb.init(db);
          break;
        case constanta.CSQLSERVER_DB:
          db.pool = ss.init(db);
          break;
      }
    });
    console.log('isi curDB >>>>>>>', curDB);
  }
}

module.exports = new Connection();