var express = require('express');
var Category = require('../models/category');
var router = express.Router();

router.get('/', function (req, res) {
  Category
    .find()
    .exec()
    .then(function (categories) {
      res.json(categories);
    }, function (err) {
      res.send(err);
    });
});

router.post('/', function (req, res) {
  var category = new Category();
  category.displayName = req.body.displayName;
  category.code = req.body.code;
  category.color = req.body.color;

  category
    .save()
    .then(function () {
      res.json({message: 'Category created'});
    }, function (err) {
      res.send(err);
    });
});

router.put('/:id', function (req, res) {
  Category
    .findById(req.params.id)
    .exec()
    .then(function (category) {
      if (category) {
        category.displayName = req.body.displayName || category.displayName;
        category.code = req.body.code || category.code;
        category.color = req.body.color || category.color;

        category
          .save()
          .then(function () {
            res.json({message: 'Category updated'});
          }, function (err) {
            res.send(err);
          });
      }
      else {
        res.json({message: 'Category not found...'});
      }
    }, function (err) {
      res.send(err);
    });
});

router.delete('/:id', function (req, res) {
  Category
    .findByIdAndRemove(req.params.id)
    .then(function () {
      res.json({message: 'Category deleted'});
    }, function (err) {
      res.send(err);
    });
});

module.exports = router;
