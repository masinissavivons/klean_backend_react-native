var express = require('express');
var router = express.Router();

var cleanwalkModel = require('../models/cleanwalks');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/load-cleanwalk', async function(req, res, next) {

  var cleanwalk = await cleanwalkModel.findById("61017ac720f07d486871be0b").populate('cleanwalkCity').exec();

  console.log(cleanwalk);
  console.log("city", cleanwalk.cleanwalkCity.cityName);

  res.json({cleanwalk});
});

module.exports = router;
