var gm = require('gm').subClass({imageMagick: true});
var filename = require('./filename');
var mime= require("mime-types");
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

module.exports= function (filesObj) {
	
	var PromiseArr= filesObj.map(function (fileObj) {
		return new Promise(function (resolve,reject) {

			if(!process.env.hasOwnProperty('AWS_ACCESS_KEY_ID') || !process.env.hasOwnProperty('AWS_SECRET_ACCESS_KEY') || !process.env.hasOwnProperty('AWS_REGION'))
			{
				reject({err:'AWS Credentials not supplied'});
			}

			if(!fileObj.hasOwnProperty('file') || !fileObj.hasOwnProperty('resize') )
			{
				reject({err:'Required parameters resize not supplied'});
			}


			var bucket=fileObj.bucket;
			var acl=fileObj.acl || "public-read";
			var resize= fileObj.resize || 60;
			var newFileName;

			if(fileObj.hasOwnProperty('name'))
				newFileName=fileObj.name+'.'+mime.extension(fileObj.file.mimetype);
			else
				newFileName=filename()+'.'+mime.extension(fileObj.file.mimetype);

			gm(fileObj.file.buffer)
			.size(function (err,size) {
				if(err)
					return reject(err);
				if(fileObj.hasOwnProperty('minWidth') && fileObj.hasOwnProperty('minHeight'))
				{
					// console.log(size);
					if(size.width< fileObj.minWidth || size.height <fileObj.minHeight)
						return reject({msg:'Image file should be '+fileObj.minWidth+'x'+fileObj.minHeight+' minimum.'});

					else
					{
						gm(fileObj.file.buffer)
						.resize(null,resize)
						.stream(function(err, stdout, stderr) {
							if(err)	reject(err);

							var data = {
								ACL:acl,
								Bucket: bucket,
								Key: newFileName,
								Body: stdout,
								ContentType: fileObj.file.mimetype
							};

							s3.upload(data, function(err, res) {
								if(err) reject(err);
								resolve(res);
							});
						});
					}
				}

				else
				{
					gm(fileObj.file.buffer)
					.resize(null,resize)
					.stream(function(err, stdout, stderr) {
						if(err)	reject(err);

						var data = {
							ACL:acl,
							Bucket: bucket,
							Key: newFileName,
							Body: stdout,
							ContentType: fileObj.file.mimetype
						};

						s3.upload(data, function(err, res) {
							if(err) reject(err);
							resolve(res);
						});
					});
				}
			})
			
			

		});
	});

	return Promise.all(PromiseArr);
}