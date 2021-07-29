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
router.get('/load-cleanwalk/:idCW', async function(req, res, next) {

  var cleanwalk = await cleanwalkModel.findById(req.params.idCW).populate('cleanwalkCity').populate('participantsList').populate('admin').exec();

  console.log(cleanwalk);

  res.json({result: true, cleanwalk});
}); 

module.exports = router;
