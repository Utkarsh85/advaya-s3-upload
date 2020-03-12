var filename = require('./filename');
var mime= require("mime-types");
const { GcsFileUpload } = require('gcs-file-upload');


module.exports= function (filesObj) {
	
	var PromiseArr= filesObj.map(function (fileObj) {
		return new Promise(function (resolve,reject) {

			if(!process.env.hasOwnProperty('AWS_ACCESS_KEY_ID') || !process.env.hasOwnProperty('AWS_SECRET_ACCESS_KEY') || !process.env.hasOwnProperty('AWS_REGION'))
			{
				reject({err:'AWS Credentials not supplied'});
			}

			if(!fileObj.hasOwnProperty('file') && !fileObj.hasOwnProperty('bucket'))
			{
				reject({err:'Bucket not supplied'});
			}

			var bucket=fileObj.bucket;
			var newFileName;


			const myBucket = new GcsFileUpload({
			  keyFilename: fileObj.servicekey,
			  projectId: fileObj.project,
			}, fileObj.bucket);

			if(fileObj.hasOwnProperty('name'))
				newFileName=fileObj.name+'.'+mime.extension(fileObj.file.mimetype);
			else
				newFileName=filename()+'.'+mime.extension(fileObj.file.mimetype);

			var fileMetaData = {
				originalname: newFileName,
				buffer: fileObj.file.buffer
			};

			myBucket.uploadFile(fileMetaData)
			.then((data) => {
				console.log(data)
			})
			.catch((err) => {
				console.log(err)
			})

		});
	});

	return Promise.all(PromiseArr);
}