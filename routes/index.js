var express = require('express');
var router = express.Router();
var request = require('sync-request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*Autocomplete-search*/
router.post('/autocomplete-search', function(req, res, next) {
  
  console.log(req.body.adress);

  let requete = request("GET", `https://api-adresse.data.gouv.fr/search/?q=${req.body.adress}`);
  let response = JSON.parse(requete.body);

  res.json({result: true, response: response.features});
});

module.exports = router;
