// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var Deal     = require('./models/deal');
mongoose.connect('mongodb://mooj:mooj@ds025792.mlab.com:25792/mooj');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// on routes that end in /bears
// ----------------------------------------------------
router.route('/deals')

  // create a bear (accessed at POST http://localhost:8080/api/bears)
  .post(function(req, res) {

    var deal = new Deal();      // create a new instance of the Bear model
    deal.name = req.body.name;  // set the bears name (comes from the request)
    deal.description = req.body.description;  // set the bears name (comes from the request)

    // save the bear and check for errors
    deal.save(function(err) {
      if (err)
        res.send(err);

      res.json({ message: 'coucou ça marche!' });
    });

  })

  // get all the bears (accessed at GET http://localhost:8080/api/bears)
  .get(function(req, res) {
    Deal.find(function(err, deals) {
      if (err)
        res.send(err);

      res.json(deals);
    });
  });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);