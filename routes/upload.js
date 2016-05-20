var express = require('express');
var multer = require('multer');
var aws = require('aws-sdk');
var router = express.Router();

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

// CF Multer doc : https://github.com/expressjs/multer
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname.substr(file.originalname.length - 15));
  }
});

// limit file size to 5Mo
var limits = {fileSize: 500000};

// Accept any files
var upload = multer({storage: storage, limits: limits}).any();

router.post('/', function (req, res) {
  upload(req, res, function (err) {

    // if unable to upload in local, then we'll upload it on aws s3 ...
    if (err) {

      var file = req.files[0];

      // first get the signed URL

      aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});

      var s3 = new aws.S3();
      var s3_params = {
        Bucket: S3_BUCKET,
        Key: file.filename,
        Expires: 60,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };
      s3.getSignedUrl('putObject', s3_params, function (err, data) {
        if (err) {
          console.log(err);
          return res.end("Error uploading file.");
        }
        else {

          var xhr = new XMLHttpRequest();
          xhr.open("PUT", data);
          xhr.setRequestHeader('x-amz-acl', 'public-read');
          xhr.onload = function () {
            if (xhr.status === 200) {
              console.log('UPLOAD OK');
              console.log('https://' + S3_BUCKET + '.s3.amazonaws.com/' + file.filename);
              var response = {
                filename: req.files[0].filename,
                href: 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + file.filename
              };

              res.send(response);
            }
          };
          xhr.onerror = function () {
            return res.end("Error uploading file.");
          };
          xhr.send(file);
        }
      });

    }

    var response = {
      filename: req.files[0].filename,
      href: req.protocol + '://' + req.get('host') + '/images/' + req.files[0].filename
    };

    res.send(response);
  })
});

module.exports = router;
