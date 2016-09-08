var express = require('express');
var Category = require('../models/category');
var router = express.Router();

router.get('/', function (req, res) {
  Category
    .find()
    .exec(function (err, categories) {
      if (err)
        res.send(err);

      res.json(categories);
    });
});

router.post('/', function (req, res) {
  var category = new Category();
  category.displayName = req.body.displayName;
  category.code = req.body.code;
  category.color = req.body.color;

  category.save(function (err) {
    if (err)
      res.send(err);

    res.json({message: 'Category created'});
  });
});

router.put('/:id', function (req, res) {
  Category.findById(req.params.id, function (err, category) {
    if (err)
      res.send(err);

    category.displayName = req.body.displayName || category.displayName;
    category.code = req.body.code || category.code;
    category.color = req.body.color || category.color;

    category.save(function (err) {
      if (err)
        res.send(err);

      res.json({message: 'Category updated'});
    });
  });
});

router.delete('/:id', function (req, res) {
  Category.findByIdAndRemove(req.params.id, function (err) {
    if (err)
      res.send(err);

    res.json({message: 'Category deleted'});
  });
});

module.exports = router;
