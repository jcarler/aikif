var express = require('express');
var List = require('../models/list');

var router = express.Router();

router.get('/', function (req, res) {
  List
    .getAll()
    .exec()
    .then(function (lists) {
      res.json(lists);
    }, function (err) {
      res.send(err);
    });
});

router.post('/', function (req, res) {
  var list = new List();      // create a new instance of the List model
  list.name = req.body.name;
  list.description = req.body.description;
  list.city = req.body.city;
  list.merchants = req.body.merchants;
  list.imageLink = req.body.imageLink;

  // save the bear and check for errors
  list
    .save()
    .then(function () {
      res.json({message: 'List created'});
    }, function (err) {
      res.send(err);
    });
});

router.put('/:id', function (req, res) {
  List
    .findById(req.params.id)
    .exec()
    .then(function (list) {

      list.name = req.body.name || list.name;
      list.description = req.body.description || list.description;
      list.city = req.body.city || list.city;
      list.merchants = req.body.merchants || list.merchants;
      list.imageLink = req.body.imageLink || list.imageLink;

      list
        .save()
        .then(function () {
          res.json({message: 'List updated'});
        }, function (err) {
          res.send(err);
        });
    }, function (err) {
      res.send(err);
    });
});

router.get('/:id', function (req, res) {
  List
    .getById(req.params.id)
    .exec()
    .then(function (list) {
      res.json(list);
    }, function (err) {
      res.send(err);
    });
});

router.delete('/', function (req, res) {
  List
    .remove()
    .then(function () {
      res.json({message: 'All deleted'});
    }, function (err) {
      res.send(err);
    });
});

router.delete('/:id', function (req, res) {
  List
    .findByIdAndRemove(req.params.id)
    .then(function () {
      res.json({message: 'List deleted'});
    }, function (err) {
      res.send(err);
    });
});

module.exports = router;
