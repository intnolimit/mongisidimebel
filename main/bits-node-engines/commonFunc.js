const CRYPTO = require('crypto');
const ALGORITHM = 'aes-192-cbc';
const PASSWORD = '12345678901234567890';
const KEY = CRYPTO.scryptSync(PASSWORD, 'salt', 24);
const IV = Buffer.alloc(16, 0); // Initialization vector.
const CONSTANTA = require('./constanta');
const DATEFORMAT = require("dateformat");


function commonFunc() {
  this.encrypt = function (text) {
    console.log(text);
    let cipher = CRYPTO.createCipheriv(ALGORITHM, KEY, IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    cipher.end;
    return encrypted;
  }

  this.decrypt = function (text) {
    let decipher = CRYPTO.createDecipheriv(ALGORITHM, KEY, IV);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }

  this.lengthIntToStr = function (head, data, jml) {
    var tmpJum = jml - head.length - data.toString().length;
    var tmpStr = '0';
    return head + tmpStr.repeat(tmpJum) + data;
  }


  this.printJson = printJson;

  this.injectLkeyLData = function (QueryJson, data, isLKey = true) {
    for (field in data) {
      let tmpVal = {
        isSensitive: false,
        jenis: 2,
        data: [{
          data: data[field],
          opr: '=',
          operand: 'AND',
        }]
      }
      if (isLKey) {
        QueryJson.LKey[field] = tmpVal;
      } else {
        QueryJson.LData[field] = tmpVal;
      }
    }
    return QueryJson;
  }

  this.injectListPrimaryKey = function (QueryJson) {
    let tmpLData = {};
    for (item in QueryJson.LData) {
      tmpLData[item.toLowerCase()] = QueryJson.LData[item];
    }

    if (QueryJson.hasOwnProperty('LListPrimaryKey')) {
      QueryJson.LListPrimaryKey.forEach(function (item, index, array) {
        // console.log('isi tmpLData adalah >>>>>>>>>', tmpLData[item.toLowerCase()]);
        // QueryJson.LKey[item.toLowerCase()] = QueryJson.LData[item.toLowerCase()]
        QueryJson.LKey[item.toLowerCase()] = tmpLData[item.toLowerCase()]
      })
    }
    return QueryJson;
  }

  this.getHeaderAutoNumber = function (header, format, tanggal, jenis, isGetNumber) {
    // let isGetNumber = true;
    switch (jenis) {
      case CONSTANTA.CJENIS_AN_HARIAN: {
        format = '-yymmdd-';
        break;
      }
      case CONSTANTA.CJENIS_AN_BULANAN: {
        format = '-yymm-';
        break;
      }
      case CONSTANTA.CJENIS_AN_TAHUNAN: {
        format = '-yyyy-';
        break;
      }
      case CONSTANTA.CJENIS_AN_TGL_JAM: {
        format = '-yymmdd-HHMMssl';
        isGetNumber = false;
        break;
      }
    }
    
    if (jenis <= 5)
      header = header + DATEFORMAT(tanggal, format);
    return {
      header: header,
      isGetNumber: isGetNumber
    }
  }

  this.printJsonShow = function (data) {
    return printJson(CONSTANTA.CCODE_BERHASIL, CONSTANTA.CSTATUS_BERHASIL, 'Berhasil Mendapatkan Data', data.length, data);
  }

  this.printJsonDelete = function (data) {
    return printJson(CONSTANTA.CCODE_BERHASIL, CONSTANTA.CSTATUS_BERHASIL, 'Data Berhasil di Hapus', data.length, data)    
  }

  this.printJsonUpdate = function (data) {
    return printJson(CONSTANTA.CCODE_BERHASIL, CONSTANTA.CSTATUS_BERHASIL, 'Data yang di udpate berhasil', data.length, data);    
  }

  this.printJsonInsert = function (data) {
    return printJson(CONSTANTA.CCODE_BERHASIL, CONSTANTA.CSTATUS_BERHASIL, 'Data yang di input berhasil masuk', data.length, data);
    
  }

  this.printJsonError = function (data) {
    let message = data; 
    if (data.hasOwnProperty('errorUser')) {
      message = data.errorUser;
    }
    return printJson(CONSTANTA.CCODE_GAGAL, CONSTANTA.CSTATUS_GAGAL, message, 0, data)
  }

  this.printJsonNotExist = function (data) {
    return printJson(CONSTANTA.CCODE_GAGAL, CONSTANTA.CSTATUS_TIDAK_ADA_DATA, data, 0, [])
  }

  this.convertDataToJson = function (dataList, pos, nTabel, fieldList, dataFieldList) {
    let QueryJson = {
      LNamaTabel: nTabel,
      LData: {},
    }
    for (let i = 0; i < fieldList.length; i++) {
      QueryJson.LData[fieldList[i]] = {
        data: [{
          data: dataList[pos][dataFieldList[i]]
        }]
      };
    }
    return QueryJson;
  }

  this.lowerCaseListJson = function (source) {
    var lowerCased = source.map(function (item) {
      return lowerCaseJson(item);
      // return this.lowerCaseJson(item);
    });
    return lowerCased;
  }

  this.generateError = function(userMessage, programmerMessage) {
    let res = {
      errorUser: userMessage,
      errorProgramer: programmerMessage
    }
    return res;
  }

  this.lowerCaseJson = lowerCaseJson;
  this.constanta = CONSTANTA
}

function lowerCaseJson(source) {
  var mapped = {};
  for (var lclKey in source) {
    mapped[lclKey.toLowerCase()] = source[lclKey];
  }

  return mapped;
}

function printJson(code, status, message, jumlahData, isiData) {
  return {
    Code: code,
    status: status,
    message: message.toString(),
    jumlahData: jumlahData,
    isidata: isiData
  }
}

module.exports = new commonFunc();