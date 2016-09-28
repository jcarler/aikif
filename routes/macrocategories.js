var express = require('express');
var Category = require('../models/category');
var MacroCategory = require('../models/macroCategory');
var router = express.Router();

router.get('/', function (req, res) {
  MacroCategory
    .find()
    .populate('categories')
    .exec(function (err, macroCategories) {
      if (err)
        res.send(err);

      res.json(macroCategories);
    });
});

router.post('/', function (req, res) {
  var macroCategory = new MacroCategory();
  macroCategory.displayName = req.body.displayName;
  macroCategory.code = req.body.code;
  macroCategory.categories = req.body.categories;

  macroCategory.save(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'MacroCategory created'});
  });
});

router.put('/:id', function (req, res) {
  MacroCategory.findById(req.params.id, function (err, macroCategory) {
    if (err)
      res.send(err);

    if (macroCategory) {
      macroCategory.displayName = req.body.displayName || macroCategory.displayName;
      macroCategory.code = req.body.code || macroCategory.code;
      macroCategory.categories = req.body.categories || macroCategory.categories;

      macroCategory.save(function (err) {
        if (err)
          res.send(err);

        res.json({message: 'MacroCategory updated'});
      });
    }
    else {
      res.json({message: 'MacroCategory not found...'});
    }
  });
});

router.delete('/:id', function (req, res) {
  MacroCategory.findByIdAndRemove(req.params.id, function (err) {
    if (err)
      res.send(err);

    res.json({message: 'MacroCategory deleted'});
  });
});

module.exports = router;
