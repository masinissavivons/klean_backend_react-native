var express = require('express');
var router = express.Router();
var request = require('sync-request');

let cleanwalkModel = require('../models/cleanwalks');
let userModel = require("../models/users");

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

/*Autocomplete-search-city-only*/
router.post('/autocomplete-search-city-only', function(req, res, next) {
  
  let cityRegex = /arrondissement/i

  let requete = request("GET", `https://api-adresse.data.gouv.fr/search/?q=${req.body.city}&type=municipality`);
  let response = JSON.parse(requete.body);
  let newResponse = response.features.filter(obj => !cityRegex.test(obj.properties.label) )
console.log("newResponse", newResponse);
  newResponse = newResponse.map(obj => {
    let copy = {...obj}
    copy.properties.label = copy.properties.city
    return copy});

  res.json({result: true, newResponse});
});

// load-cleanwalk
router.get('/load-cleanwalk/:idCW', async function(req, res, next) {

  var cleanwalk = await cleanwalkModel.findById(req.params.idCW).populate('cleanwalkCity').populate('participantsList').populate('admin').exec();

  res.json({result: true, cleanwalk});
}); 

/*load-pin-on-change-region*/
router.post('/load-pin-on-change-region', async function(req, res, next) {

  const coordinateJsonParse = JSON.parse(req.body.coordinate);
  const dateSearch = req.body.date;

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
  .where('cleanwalkCoordinates.longitude').gte(customInterval.long.min).lte(customInterval.long.max)
  .where('startingDate').gte(dateSearch)
  .populate('admin').exec();

  res.json({result: true, cleanWalkArray: cleanWalkRequest});
});

/*load-cities-ranking*/
router.get('/load-cities-ranking', async function(req, res, next) {

  let pointsPerCw = 5;

  let cwpercity = await cleanwalkModel.aggregate([{ $group: { _id: "$cleanwalkCity", count: { $sum: pointsPerCw } } },{$sort: {count: -1}}, {$lookup:{from: "cities",localField: "_id",foreignField: "_id",as: "city_info"}}])
  console.log(cwpercity);

  let token = req.query.token
  let user = await userModel.find({token: token});

  if(user.length > 0) {
    /*let userCity = await cleanwalkModel.aggregate([{ $group: { _id: "$cleanwalkCity", count: { $sum: pointsPerCw } } },{$sort: {count: -1}}, {$lookup:{from: "cities",localField: "_id",foreignField: "_id",as: "city_info"}},{$match: {"_id": user[0].city}}])
    console.log(userCity);*/

    cwpercity = cwpercity.map((obj, i) => {
      let copy = {};
      if (obj["_id"].toString() === user[0].city.toString()) {
        copy.isMyCity = true;
      } else {
        copy.isMyCity = false;
      }
      copy.city = obj["city_info"][0].cityName;
      copy.points = obj.count;
      copy.ranking = i+1;
      return (copy)
    })

    res.json({result: true, ranking: cwpercity});
  } else {
  res.json({result: false, error: "user not found"});
}
}); 

module.exports = router;
