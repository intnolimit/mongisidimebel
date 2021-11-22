var commonFn = require('../../bits-node-engines/commonFunc');
var fs = require('fs-extra');
var multer = require('multer');
const path = require("path");
const constanta = require('../constanta');

function mainControl() {
	this.getList = (pathFolder) => new Promise(function (resolve, reject) {
		dirpath = path.join(constanta.CUPLOAD_PATH, pathFolder);
		fs.ensureDir(dirpath)
			.then(() => {
				fs.readdir(dirpath)
					.then((listFile) => {
						const promises = listFile.map((fname) => {
							return fs.stat(path.join(dirpath, fname))
								.then((statFile) => ({ name: fname, size: statFile.isDirectory() ? -1 : statFile.size }))
								.catch((err) => (err));
						});
						Promise.all(promises).then((data) => resolve(data))
					})
					.catch(err => reject(err))
			})
			.catch((err) => reject('Gagal Baca Folder'));
	})


	this.getPath = function (pathFolder, filename) {
		return path.join(constanta.CUPLOAD_PATH, pathFolder, filename);
	}

	//MULTIPART request FIELDNAME = filename
	this.uploadFile = (req, res) => new Promise(function (resolve, reject) {
		const myStorage = multer.diskStorage({
			destination: function (req, file, cb) {
				console.log('Storage Dest', req.body)
				dirpath = path.join(constanta.CUPLOAD_PATH, req.body.dirpath);
				fs.ensureDir(dirpath).then(() => {
					cb(null, dirpath)
				}).catch((err) => {
					console.log(err);
					res.json(commonFn.PrintJsonError('Gagal Buat Folder'));
				});
			},
			filename: function (req, file, cb) {
				console.log('Storage Filename', req.body.filename)
				cb(null, req.body.filename)
			}
		})
		upload = multer({ storage: myStorage })
		upload.any()(req, res, next => {
			console.log("Received file", req.files);
			resolve(req.files)
		})
	});

	this.renameFile = (pathFolder, filename, toFile) => new Promise(function (resolve, reject) {
		// console.log('Rename File', req.body)
		fs.rename(path.join(constanta.CUPLOAD_PATH, pathFolder, filename), path.join(constanta.CUPLOAD_PATH, pathFolder, toFile))
			.then(() => resolve(filename + ' Renamed'))
			.catch(err => reject(err));
	});

	this.deleteFile = (pathFolder, filename) => new Promise(function (resolve, reject) {
		fs.remove(path.join(constanta.CUPLOAD_PATH, pathFolder, filename))
			.then(() => resolve('Delete File', 1, filename + ' Deleted'))
			.catch(err => reject(err));
	});
}

module.exports = new mainControl();
