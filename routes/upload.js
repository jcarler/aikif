var express = require('express');
var multer = require('multer');
var http = require('http');
var router = express.Router();
var cloudinary = require('cloudinary');

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

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});


router.post('/', function (req, res) {
  upload(req, res, function (err) {

    console.log(req.files);

    cloudinary.uploader.upload(req.files[0].path,
      function (result) {
        console.log(result);
        return res.send(result);
      });

    if (err) {
      return res.end("Error with file", req.files[0]);
    }


  })
});

module.exports = router;
