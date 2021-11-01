var admin = require("firebase-admin");
var path = require("path");

var serviceAccount = require("./firebaseAccountKey.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://shbjaya-5ae1b.firebaseio.com",
	storageBucket: "gs://shbjaya-5ae1b.appspot.com",
});
var fbBucket = admin.storage().bucket();

function mainControl() {
	this.getList = (pathFolder) => new Promise(async function (resolve, reject) {
		console.log('Firebase Get List: ', fbBucket.name);
		fbBucket.getFiles({ prefix: convertToPosix(pathFolder) })
			.then((hasil) => {
				let filelist = [];
				hasil[0].forEach((file) => filelist.push(file.name))
				resolve(filelist);
			})
			.catch(err => reject(err));
	})

	this.uploadFile = (pathFolder, filename, sourcePath) => new Promise(function (resolve, reject) {
		filepath = convertToPosix(path.join(pathFolder, filename));
		fbBucket.upload(sourcePath, { destination: filepath })
			.then(hasil =>{
				console.log(hasil);
				resolve(hasil[0].name);
			})
			.catch(err => reject(err));
	});
}

function convertToPosix(data) {
	return data.split(path.sep).join(path.posix.sep);
}

module.exports = new mainControl();