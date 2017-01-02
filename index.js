var fileS3 = require('./lib/fileS3');
var imageS3 = require('./lib/imageS3');
var imageCropS3 = require('./lib/imageCropS3');

module.exports={
	file: fileS3,
	image: imageS3,
	imageCrop: imageCropS3,
	imageResize: imageResizeS3,
}