var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/sms', function(req, res, next) {
  res.send('sms sent');
  console.log(req.body);

  var date = new Date();

  Merchant
    .find({moojPhone: '0366970527'})
    .exec(function (err, merchant) {
      if (err) {
        console.log(err);
        res.json(
          {
            message: 'Merchant not found'
          }
        );
        res.status(404).end();
      }

      var deal = new Deal();      // create a new instance of the Deal model
      deal.name = 'Test deal by sms';
      deal.description = 'Sms sent from:' + req.body.From + ', body: ' + req.body.Body ;
      deal.timestamp = date.getTime();
      deal.merchant = merchant[0]._id;

      // save the bear and check for errors
      deal.save(function (err) {
        if (err)
          res.send(err);

        res.json({message: 'Deal created'});
      });
    });

});

module.exports = router;
