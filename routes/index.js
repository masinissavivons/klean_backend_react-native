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

/*load-pin-on-change-region*/
router.post('/load-pin-on-change-region', async function(req, res, next) {

  const coordinateJsonParse = JSON.parse(req.body.coordinate);

  //on définit la fonction pour calculer les intervals nécessaires à la requête
  const definePerimeter = (regionLat, regionLong, latD, longD) => {
    let interval = {
      lat: {min: regionLat - (0.5*latD), max: regionLat + (0.5*latD)},
      long: {min: regionLong - (0.5*longD), max: regionLong + (0.5*longD)}
    };
    return interval;
  };

  //on reçoit via le body les éléments de la région qu'on place en arguments de la fonction
  let customInterval = definePerimeter(coordinateJsonParse.latitude, coordinateJsonParse.longitude, coordinateJsonParse.latitudeDelta, coordinateJsonParse.longitudeDelta);

  //on fait la requete dans MongoDB
  let cleanWalkRequest = await cleanwalkModel.find()
  .where('cleanwalkCoordinates.latitude').gte(customInterval.lat.min).lte(customInterval.lat.max)
  .where('cleanwalkCoordinates.longitude').gte(customInterval.long.min).lte(customInterval.long.max);

  res.json({result: true, cleanWalkArray: cleanWalkRequest});
});

module.exports = router;
