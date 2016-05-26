var express = require('express');
var multer = require('multer');
var aws = require('aws-sdk');
var http = require('http');
var busboy = require('connect-busboy');
var router = express.Router();

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || 'AKIAJXMYL5G5NZRA2NTQ';
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || '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';
var S3_BUCKET = process.env.S3_BUCKET || 'mooj';

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
  var fileBuffer = new Buffer('');

  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log('receving ' + filename + '...');

    file.on('data', function(data) {
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      fileBuffer = Buffer.concat([fileBuffer, data]);
    });

    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');

      aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
      var s3 = new aws.S3();
      var s3_params = {
        Bucket: S3_BUCKET,
        Key: filename,
        Expires: 60,
        ContentType: mimetype,
        ACL: 'public-read'
      };

      s3.getSignedUrl('putObject', s3_params, function(err, data){

        var protocol = data.split('/')[0];
        var hostname = data.split('/')[2];
        var path = data.split('/')[3];


        console.log('getting signed URL...');
        if(err){
          console.log('Error while getting signed URL ...', err);
          return res.end();
        }
        else{
          console.log('uploading image ...');
          console.log(file);
          var req = http.request({
//            protocol: protocol,
            hostname: hostname,
            path: '/' + path,
            method: 'PUT',
            headers: {
              'x-amz-acl':'public-read'
            }
          }, function(res) {

            console.log('sending ... ');
            console.log(res.headers);

            res.on('error', function(err) {
              console.log(err);
              return res.end();
            });

            res.on('end', function() {
              console.log('end !');
            });
          });

          req.on('error', function(err) {
            console.log('Error while sending image ...', err);
            return res.end();
          });

          req.write(fileBuffer);
          req.end();

        }
      });

    });



  });

  req.on('finish', function() {
    console.log('finich');
    return res.end();
  });

  req.pipe(req.busboy);



  /*upload(req, res, function (err) {

    if (err) {
      return res.end("Error uploading file.");
    }

    var response = {
      filename: req.files[0].filename,
      href: req.protocol + '://' + req.get('host') + '/images/' + req.files[0].filename
    };

    res.send(response);
  })*/
});

module.exports = router;
