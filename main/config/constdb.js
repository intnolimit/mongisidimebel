
const db = require('../bits-node-engines/db');

const tabelAutonumber = db.setTabelAutonumber('ms_autonumber', 'id', 'nilai'); 
const tabelUser = db.setTabelUser('sec_user', 'nama', 'pass_mobile'); 

module.exports = {
  tabelUser : db.setTabelUser('sec_user', 'nama', 'pass_mobile'), 

  CLISTDB : [
    db.createPostGress('davputfrk845mo',
      'zslgunmfltknfd', 
      '8a90709e414cf82a0f4b8acc75cb216624b335a14194c512a2bd3d3e731f5fdc', 
      tabelAutonumber, 
      tabelUser, 
      'Secret-Key-is=8175Pass',
      'ec2-52-207-47-210.compute-1.amazonaws.com', 
      '5432',
    ),
    // db.createPostGress('Developer', 'bitssu', '8175Pass', tabelAutonumber, tabelUser, 'Secret-Key-is=8175Pass'),
    // db.createFirebird('E:/Kerja/BITS/Programing/DesktopBase/Suhandry (keramik Veteran)/Database/thedb.gdb', 'SYSDBA', 'masterkey'),
  ],
}

