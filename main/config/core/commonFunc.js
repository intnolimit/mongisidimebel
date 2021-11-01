const crypto = require('crypto');
const algorithm = 'aes-192-cbc';
const password = '12345678901234567890';
const key = crypto.scryptSync(password, 'salt', 24);
const iv = Buffer.alloc(16, 0); // Initialization vector.
const Constanta = require('./constanta');
const dateFormat = require("dateformat");

CCodeBerhasil = 1;
CCodeGagal = 0;
CStatusBerhasil = 1;
CStatusGagal = 0;
CStatusTidakAdaData = 2;

CStatusReprint = 6;


// const fnPrintJson = new commonFunc().PrintJson;
// const fnGenerateAutoNumberFormatDate = new commonFunc().generateAutoNumberFormatDate;

function commonFunc() {
  this.encrypt = function (text) {
    console.log(text);
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    cipher.end;
    return encrypted;
  }

  this.decrypt = function (text) {
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }

  this.lengthIntToStr = function (head, data, jml) {
    var tmpJum = jml - head.length - data.toString().length;
    var tmpStr = '0';
    return head + tmpStr.repeat(tmpJum) + data;
  }

  this.test = function () {
    console.log(en);
  }

  this.PrintJson = printJson;
  // this.PrintJson = function (code, status, message, jumlahData, isiData) {
  //   // let x = 'Messsage Print JSON' + message;
  //   // console.log
  //   return {
  //     Code: code,
  //     status: status,
  //     message: message.toString(),
  //     jumlahData: jumlahData,
  //     isidata: isiData
  //   }
  // }

  this.getHeaderAutoNumber = function(header, format, tanggal, jenis) {
    // let isGetNumber = true;
    switch (jenis) {
      case Constanta.CJENIS_AN_HARIAN: {
        format = '-yymmdd-';
        break;
      }
      case Constanta.CJENIS_AN_BULANAN: {
        format = '-yymm-';
        break;
      }
      case Constanta.CJENIS_AN_TAHUNAN: {
        format = '-yyyy-';
        break;
      }
      case Constanta.CJENIS_AN_TGL_JAM: {
        format = '-yymmdd-HHMMssl';
        break;
      }
    }
    return header + dateFormat(tanggal, format);
  }

  // this.PrintJsonShow = function (data) {
  //   return (data.length > 0) ?
  //     printJson(Constanta.CCODE_BERHASIL, Constanta.CSTATUS_BERHASIL, 'Berhasil Mendapatkan Data', data.length, data) :
  //     printJson(Constanta.CCODE_BERHASIL, Constanta.CSTATUS_GAGAL, 'Tidak Ada Data', 0, []);
  // }

  // this.PrintJsonDelete = function (data) {
  //   return printJson(Constanta.CCODE_BERHASIL, Constanta.CSTATUS_BERHASIL, 'Data Berhasil di Hapus', 1, data)
  // }

  // this.PrintJsonUpdate = function (data) {
  //   return (data.length > 0) ?
  //     printJson(Constanta.CCODE_BERHASIL, Constanta.CSTATUS_BERHASIL, 'Data yang di udpate berhasil', data.length, data) :
  //     printJson(Constanta.CCODE_BERHASIL, Constanta.CSTATUS_GAGAL, 'Data yang di update gagal', 0, [])
  // }

  // this.PrintJsonInsert = function (data) {
  //   return (data.length > 0) ?
  //     printJson(Constanta.CCODE_BERHASIL, Constanta.CSTATUS_BERHASIL, 'Data yang di input berhasil masuk', data.length, data) :
  //     printJson(Constanta.CCODE_BERHASIL, Constanta.CSTATUS_GAGAL, 'Data yang di input gagal masuk', 0, [])
  // }

  // this.PrintJsonError = function (data) {
  //   return printJson(Constanta.CCODE_GAGAL, Constanta.CSTATUS_GAGAL, data, 0, [])
  // }

  // this.PrintJsonNotExist = function (data) {
  //   return printJson(Constanta.CCODE_GAGAL, Constanta.CSTATUS_TIDAK_ADA_DATA, data, 0, [])
  // }

  this.PrintJsonShow = function(data) {
    return (data.length > 0) 
      ? printJson(CCodeBerhasil, CStatusBerhasil, 'Berhasil Mendapatkan Data', data.length, data)
      : printJson(CCodeBerhasil, CStatusGagal, 'Tidak Ada Data', 0, []);
  }

  this.PrintJsonDelete = function(data) {
    return printJson(CCodeBerhasil, CStatusBerhasil, 'Data Berhasil di Hapus', 1, data)
  }

  this.PrintJsonUpdate = function(data) {
    return (data.length > 0) 
      ? printJson(CCodeBerhasil, CStatusBerhasil, 'Data yang di udpate berhasil', data.length, data)
      : printJson(CCodeBerhasil, CStatusGagal, 'Data yang di update gagal', 0, [])
  }

  this.PrintJsonInsert = function(data) {
    return (data.length > 0) 
      ? printJson(CCodeBerhasil, CStatusBerhasil, 'Data yang di input berhasil masuk', data.length, data)
      : printJson(CCodeBerhasil, CStatusGagal, 'Data yang di input gagal masuk', 0, [])
  }

  this.PrintJsonError = function(data) {
    return printJson(CCodeGagal, CStatusGagal, data, 0, [])
  }

  this.PrintJsonNotExist = function(data) {    
    return printJson(CCodeGagal, CStatusTidakAdaData, data, 0, [])
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
      // [data][0][data] = ];  
    }
    return QueryJson;
  }

  // this.generateAutoNumberFormatDate = function (head, formnat = 'yymmdd-HHMMssl') {
  //   console.log('ini masuk di set generateAutoNumberFormatDate !!!!!!!!');
  //   return head + '-' + dateFormat(new Date(), formnat);
  // }

  // this.setAutoNumber = (QueryJson) => {
  //   console.log('dalam set auto number !!!!!!!!!');
  //   if (QueryJson.hasOwnProperty('LHeaderAutoNumber')) {
  //     for (field in QueryJson.LHeaderAutoNumber) {
  //       let tmpID = '';
  //       let tmpHeader = QueryJson.LHeaderAutoNumber[field];
  //       if (tmpHeader.isAuto) {
  //         switch (tmpHeader.format) {
  //           // case 0:
  //           case Constanta.CFORMAT_AN_DATE_MS:
  //             tmpID = fnGenerateAutoNumberFormatDate(tmpHeader.header);
  //             break;
  //         }
  //       }

  //       // console.log('constanta.appName >>> ',constanta.appName);

  //       if (tmpID != '') {
  //         QueryJson.LData[field].data[0].data = tmpID;
  //       }
  //     }
  //   }
  // }
}

function printJson (code, status, message, jumlahData, isiData) {
  // let x = 'Messsage Print JSON' + message;
  // console.log
  return {
    Code: code,
    status: status,
    message: message.toString(),
    jumlahData: jumlahData,
    isidata: isiData
  }
}


module.exports = new commonFunc();