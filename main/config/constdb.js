
const db = require('../bits-node-engines/db');

const tabelAutonumber = db.setTabelAutonumber('ms_autonumber', 'id', 'nilai'); 
const tabelUser = db.setTabelUser('sec_user', 'nama', 'pass_mobile'); 

module.exports = {
  tabelUser : db.setTabelUser('sec_user', 'nama', 'pass_mobile'), 

  CLISTDB : [
    db.createPostGress('mm',
      'bitssu', 
      '8175Pass', 
      tabelAutonumber, 
      tabelUser, 
      'Secret-Key-is=8175Pass',
      'localhost', 
      '5432',
    ),
    // db.createPostGress('Developer', 'bitssu', '8175Pass', tabelAutonumber, tabelUser, 'Secret-Key-is=8175Pass'),
    // db.createFirebird('E:/Kerja/BITS/Programing/DesktopBase/Suhandry (keramik Veteran)/Database/thedb.gdb', 'SYSDBA', 'masterkey'),
  ],
}

