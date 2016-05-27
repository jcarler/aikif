var express = require('express');
var multer = require('multer');
var http = require('http');
var router = express.Router();
var cloudinary = require('cloudinary');

// CF Multer doc : https://github.com/expressjs/multer
var storage = multer.memoryStorage();

// limit file size to 5Mo
var limits = {fileSize: 500000};

// Accept any files
var upload = multer({storage: storage, limits: limits}).any();

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});


router.post('/', function (req, res) {
  upload(req, res, function (err) {

    if (err) {
      return res.end("Error with file", req.files[0]);
    }

    cloudinary.v2.uploader.upload_large(req.files[0],
      function (error, result) {
        if (err) {
          return res.end("Error while uploading file", req.files[0]);
        }

        return res.send(result);
      });


  })
});

module.exports = router;
