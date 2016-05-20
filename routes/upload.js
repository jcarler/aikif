var express = require('express');
var multer = require('multer');
var router = express.Router();

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

    if (err) {
      return res.end(err);
    }

    var response = {
      filename: req.files[0].filename,
      href: req.protocol + '://' + req.get('host') + '/images/' + req.files[0].filename
    };

    res.send(response);
  })
});

module.exports = router;
