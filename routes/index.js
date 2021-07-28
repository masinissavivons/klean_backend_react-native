var express = require('express');
var router = express.Router();
var request = require('sync-request');

var cleanwalkModel = require('../models/cleanwalks');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*Autocomplete-search*/
router.post('/autocomplete-search', function(req, res, next) {
  
  let requete = request("GET", `https://api-adresse.data.gouv.fr/search/?q=${req.body.adress}`);
  let response = JSON.parse(requete.body);

  res.json({result: true, response: response.features});
});

// load-cleanwalk
router.get('/load-cleanwalk', async function(req, res, next) {

  var cleanwalk = await cleanwalkModel.findById("61017ac720f07d486871be0b").populate('cleanwalkCity').exec();

  console.log(cleanwalk);
  console.log("city", cleanwalk.cleanwalkCity.cityName);

  res.json({cleanwalk});
}); 

module.exports = router;
