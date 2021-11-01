const fb = require('./core/commonDBFunction_Firebird.js');
const pg = require('./core/commonDBFunction_Postgress.js');
const ss = require('./core/commonDBFunction_SqlServer.js');

FIREBIRD_DB = 1
POSTGRESS_DB = 2
SQLSERVER_DB = 3

class ConFirebird {
  constructor(database, user, password, host = '127.0.0.1', port = 3050 ) {
    this.jenis = FIREBIRD_DB;
    this.host = host;
    this.port = port;
    this.database = database;
    this.user = user;
    this.password = password;
  }
}

class ConPostgress {
  constructor(database, user, password, host = '127.0.0.1', port = 5432, max = 100, idleTimeoutMillis = 30000, connectionTimeoutMillis = 2000) {
    this.jenis = POSTGRESS_DB;
    this.host = host;
    this.port = port;
    this.database = database;
    this.user = user;
    this.password = password;
    this.max = max
    this.idleTimeoutMillis = idleTimeoutMillis,
    this.connectionTimeoutMillis =  connectionTimeoutMillis
  }
}

function Connection() {
  let devDB = [
    {
      connectionString: process.env.DATABASE_URL || 'postgres://zslgunmfltknfd:8a90709e414cf82a0f4b8acc75cb216624b335a14194c512a2bd3d3e731f5fdc@ec2-52-207-47-210.compute-1.amazonaws.com:5432/davputfrk845mo',
      ssl: {
        rejectUnauthorized : false,
        // ca   : fs.readFileSync("server-ca.pem").toString(),
        // key  : fs.readFileSync("client-key.pem").toString(),
        // cert : fs.readFileSync("client-cert.pem").toString(),
      },
      jenis: POSTGRESS_DB,
    },
  ];

  let listDB = [
    {
      connectionString: process.env.DATABASE_URL || 'postgres://zslgunmfltknfd:8a90709e414cf82a0f4b8acc75cb216624b335a14194c512a2bd3d3e731f5fdc@ec2-52-207-47-210.compute-1.amazonaws.com:5432/davputfrk845mo',
      // connectionString: process.env.DATABASE_URL || 'postgres://bitssu:8175Pass@localhost:5432/shbjaya',
      max       : 20,
      ssl: {
        rejectUnauthorized : false,
        // ca   : fs.readFileSync("server-ca.pem").toString(),
        // key  : fs.readFileSync("client-key.pem").toString(),
        // cert : fs.readFileSync("client-cert.pem").toString(),
      },
      jenis: POSTGRESS_DB,
    },
  ];

  this.getListDB = () => (process.env.PORT == null) ? devDB: listDB;
 
  this.init = function () {
    let curDB = (process.env.PORT == null) ? devDB: listDB;
    console.log('Inisialisasi DB: ', curDB.length)
    curDB.forEach((db) => {
      switch (db.jenis) {
        case POSTGRESS_DB : db.pool = pg.init(db); break;
        case FIREBIRD_DB  : db.pool = fb.init(db); break;
        case SQLSERVER_DB : db.pool = ss.init(db); break;
      }
    });
  }
}


module.exports = new Connection();