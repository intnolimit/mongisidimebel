const staticLib = require('../../config/lib/staticFile');
const commonFn = require('../../bits-node-engines/commonFunc');
// const constanta = require('../../config/core/constanta');
const fbStorage = require('../../config/lib/firebase/firebaseAdmin')
var fs = require('fs-extra');
var multer = require('multer');
// var jimp = require('jimp');

// const myStorage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		dirpath = path.join(constanta.CUPLOAD_PATH, req.body.dirpath);
// 		fs.ensureDir(dirpath).then(() => {
// 			cb(null, dirpath)
// 		}).catch((err) => {
// 			console.log(err);
// 			reject('Gagal Buat Folder');
// 			// res.json(commonFn.PrintJsonError('Gagal Buat Folder'));
// 		});
// 	},
// 	filename: function (req, file, cb) {
// 		console.log('Storage Filename', req.body.filename)
// 		cb(null, req.body.filename)
// 	}
// })

function mainControl() {
	this.getList = function (req, res, next) {
		console.log('GetList FIle', req.body)
		// staticLib.getList(req.body.dirpath)
		fbStorage.getList(req.body.dirpath)
			.then((listfile) => res.json(commonFn.PrintJsonShow(listfile)))
			.catch(err => res.json(commonFn.PrintJsonError(err)));
	}

	this.getPath = function (req, res, next) {
		console.log('Get Path File', req.body)
		res.json(commonFn.PrintJson(commonFn.constata.CCODE_BERHASIL, commonFn.constata.CSTATUS_BERHASIL, 'File Path', staticLib.getPath(req.body.path, req.body.filename)));
	}

	//MULTIPART request FIELDNAME = filename
	this.uploadFile = function (req, res, next) {
		// upload = multer({ storage: myStorage })
		upload = multer({ dest: 'public' })
		upload.single('file')(req, res, next => {
			// req.file.destination = path.join(constanta.CUPLOAD_PATH, 'TEST');
			console.log("Received file", req.body);
			// staticLib.uploadFile(req.body.dirpath, req.body.filename, req.file.path)			
			fbStorage.uploadFile(req.body.dirpath, req.body.filename, req.file.path)
				.then((file) => {
					console.log('Done', file)
					res.json(commonFn.PrintJsonShow(file))
					fs.remove(req.file.path)
				})
				.catch(err => {
					console.log(err);
					res.json(commonFn.PrintJsonError(err))
				})
			// var destPath = req.file.path + '-resize'
			// var destThumb = req.file.path + '-thumb'
			// jimp.read(req.file.path)
			// 	.then(readImage => {
			// 		// readImage.exifRotate();
			// 		// fs.unlinkSync(req.file.path);
			// 		readImage.scaleToFit(1024, jimp.AUTO).write(destPath)
			// 		console.log('scale 1024');
			// 		readImage.scaleToFit(256, 256).write(destThumb)
			// 		console.log('scale 256');
			// 		return req.file;
			// 	})
			// 	.then((file) => {
			// 		console.log('ready to upload ', file)
			// 		return fbStorage.uploadFile(req.body.dirpath, req.body.filename, destPath)
			// 			.then(() => {
			// 				console.log('Upload 1024', req.file);
			// 				fbStorage.uploadFile(req.body.dirpath, 'thumb-' + req.body.filename, destThumb)
			// 				return req.file
			// 			})
			// 			.then(() => { 
			// 				console.log('Upload 256', req.file);
			// 				return req.file 
			// 			})
			// 	})
			// 	.then((file) => {
			// 		console.log('Done', file)
			// 		res.json(commonFn.PrintJsonShow(file))
			// 		fs.remove(req.file.path)
			// 		fs.remove(destPath)
			// 		fs.remove(destThumb)
			// 	})
			// 	.catch(err => res.json(commonFn.PrintJsonError(err)))

			// // staticLib.uploadFile(req.body.dirpath, req.body.filename, req.file)			
		})
	}

	this.renameFile = function (req, res, next) {
		console.log('Rename File', req.body)
		staticLib.renameFile(req.body.dirpath, req.body.filename, req.body.toname)
			.then((hasil) => res.json(commonFn.PrintJson(commonFn.constata.CCODE_BERHASIL, commonFn.constata.CSTATUS_BERHASIL, 'File Path', hasil)))
			.catch(err => res.json(commonFn.PrintJsonError(err)));
	}

	this.deleteFile = function (req, res, next) {
		console.log('Delete File', req.body)
		staticLib.deleteFile(req.body.dirpath, req.body.filename)
			.then((hasil) => res.json(commonFn.PrintJson(commonFn.constata.CCODE_BERHASIL, commonFn.constata.CSTATUS_BERHASIL, 'File Path', hasil)))
			.catch(err => res.json(commonFn.PrintJsonError(err)));
	}
}

module.exports = new mainControl();
