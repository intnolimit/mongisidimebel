var connection = require('../config/db.js');
var commonFn = require('../config/core/commonFunc.js');
var s3 = require('../config/lib/s3Client.js');
// var S3Client = require("@aws-sdk/client-s3");
// Set the AWS Region.
// Create an Amazon S3 service client object.
// var aws = require('aws-sdk');

KeyJWT = 'Secret-Key-is=8175Pass'

// ====isi TmpFilter====
// {
//   "LOffset":"1",
//   "LLimit":"1",
//   "LNamaTabel":"M_GUDANG",
//   "LNamaField":["*"],
//   "LKeyField":["id"],
//   "LKeyData":["G%", "sdasd", "dasdsa"],
//   "LOperator":["like"],
//   "LOrderBy": "nama"
//   }

function mainControl() {
  this.test = function(req, res) {
    console.log('test');
    return res.json({status:200, message:'success main', result:[]});
  }

  this.testenc = function(req, res) {
    console.log('testenc');
    x = commonFn.decrypt('f7fca11bc9810431ea0c1e53c5f63f3a');
    return res.json({status:200, message:x, result:[]});
  }

  this.testAWS = async function(req, res) {
    return s3.getListBucket(req, res);  
  //   s3 = new aws.S3({apiVersion: '2006-03-01',accessKeyId :'AKIA3CW45R7XE73QDRGY',secretAccessKey:'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',})
  //   console.log(s3.toString());
  //   var params = {};
  //   s3.listBuckets(params, function(err, data) {
  //    if (err) console.log(err, err.stack); // an error occurred
  //    console.log(data);           // successful response
  //    return res.json({status:200, message:'success main', result:[]});
  //  });
  }

  this.testdb = function(req, res, next) {
    // connection.db();
    console.log('test db')
    connection.db().get((err, db) => {
      if (err)
        throw err;
      // db = DATABASE
      db.query('SELECT * FROM m_company', function(err, result) {
          // IMPORTANT: release the pool connection
          res.json({total:result.length, isi: result})
      });
    })
  };
}

module.exports = new mainControl();
