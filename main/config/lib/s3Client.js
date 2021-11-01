// const { S3Client, ListBucketsCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
// const REGION = "ap-northeast-2"; //e.g. "us-east-1"
// const s3Client = new S3Client({ region: REGION });

function mainControl() {
	this.getListBucket = function (req, res) {
// 		console.log('Get List Bucket');
// 		s3Client.send(new ListBucketsCommand({}))
// 			.then(data => {
// 				console.log("Success", data.Buckets);
// 				return res.json({ status: 200, message: 'Success', result: [data.Buckets] }); // For unit tests.
// 			})
// 			.catch((err) => {
// 				console.log("Error", err);
// 				return res.json(err);
// 			})
	}

	this.uploadFile = function (req, res) {
	}

}

module.exports = new mainControl();