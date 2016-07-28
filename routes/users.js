var express = require('express');
var User = require('../models/user');
var mongoose = require('mongoose');
var cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});
var router = express.Router();

//mongoose.connect('mongodb://mooj:mooj@ds025792.mlab.com:25792/mooj');


router.get('/', function (req, res) {
  User.find(function (err, users) {
    if (err)
      res.send(err);

    res.json(users);
  });
});

router.post('/', function (req, res) {

  var user = new User();      // create a new instance of the User model
  user.name = req.body.name;
  user.imageLink = "";

  // save the bear and check for errors
  user.save(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'coucou ça marche!'});
  });
});

router.get('/:id', function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) {
      res.send(err);
    }

    res.json(user);
  });
});

router.post('/:id/upload', function (req, res) {
  var stream = cloudinary.uploader.upload_stream(function (result) {
    return res.send(result);
  });

  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

    file.on('error', function (err) {
      return res.send(err);
    });

    file.pipe(stream);

  });

  req.pipe(req.busboy);
});

router.delete('/', function(req, res) {
  User.remove(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'All deleted'});
  });
});

module.exports = router;
