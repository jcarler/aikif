var express = require('express');
var Category = require('../models/category');
var MacroCategory = require('../models/macroCategory');
var router = express.Router();

router.get('/', function (req, res) {
  MacroCategory
    .find()
    .populate('categories')
    .exec()
    .then(function (macroCategories) {
      res.json(macroCategories);
    }, function (err) {
      res.send(err);
    });
});

router.post('/', function (req, res) {
  var macroCategory = new MacroCategory();
  macroCategory.displayName = req.body.displayName;
  macroCategory.code = req.body.code;
  macroCategory.categories = req.body.categories;

  macroCategory
    .save()
    .then(function () {
      res.json({message: 'MacroCategory created'});
    }, function (err) {
      res.send(err);
    });
});

router.put('/:id', function (req, res) {
  MacroCategory
    .findById(req.params.id)
    .exec()
    .then(function (macroCategory) {

      if (macroCategory) {
        macroCategory.displayName = req.body.displayName || macroCategory.displayName;
        macroCategory.code = req.body.code || macroCategory.code;
        macroCategory.categories = req.body.categories || macroCategory.categories;

        macroCategory
          .save()
          .then(function () {
            res.json({message: 'MacroCategory updated'});
          }, function (err) {
            res.send(err);
          });
      }
      else {
        res.json({message: 'MacroCategory not found...'});
      }
    }, function (err) {
      res.send(err);
    });
});

router.delete('/:id', function (req, res) {
  MacroCategory
    .findByIdAndRemove(req.params.id)
    .then(function () {
      res.json({message: 'MacroCategory deleted'});
    }, function (err) {
      res.send(err);
    });
});

module.exports = router;
