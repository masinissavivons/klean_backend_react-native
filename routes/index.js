const { closeDelimiter } = require("ejs");
var express = require("express");
var router = express.Router();
var request = require("sync-request");
const cityModel = require("../models/cities");

let cleanwalkModel = require("../models/cleanwalks");
let userModel = require("../models/users");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/*Autocomplete-search*/
router.post("/autocomplete-search", function (req, res, next) {
  let requete = request(
    "GET",
    `https://api-adresse.data.gouv.fr/search/?q=${req.body.adress}`
  );
  let response = JSON.parse(requete.body);

  res.json({ result: true, response: response.features });
});

/*Autocomplete-search-city-only*/
router.post("/autocomplete-search-city-only", function (req, res, next) {
  let cityRegex = /arrondissement/i;

  let requete = request(
    "GET",
    `https://api-adresse.data.gouv.fr/search/?q=${req.body.city}&type=municipality`
  );
  let response = JSON.parse(requete.body);
  let newResponse = response.features.filter(
    (obj) => !cityRegex.test(obj.properties.label)
  );
  // console.log("newResponse", newResponse);
  newResponse = newResponse.map((obj) => {
    let copy = { ...obj };
    copy.properties.label = copy.properties.city;
    return copy;
  });

  res.json({ result: true, newResponse });
});

// load-cleanwalk
router.get("/load-cleanwalk/:idCW", async function (req, res, next) {
  var cleanwalk = await cleanwalkModel
    .findById(req.params.idCW)
    .populate("cleanwalkCity")
    .populate("participantsList")
    .populate("admin")
    .exec();

  res.json({ result: true, cleanwalk });
});

/*load-pin-on-change-region*/
router.post("/load-pin-on-change-region", async function (req, res, next) {
  const coordinateJsonParse = JSON.parse(req.body.coordinate);
  const dateSearch = req.body.date;

  //on définit la fonction pour calculer les intervals nécessaires à la requête
  const definePerimeter = (regionLat, regionLong, latD, longD) => {
    let interval = {
      lat: { min: regionLat - 0.5 * latD, max: regionLat + 0.5 * latD },
      long: { min: regionLong - 0.5 * longD, max: regionLong + 0.5 * longD },
    };
    return interval;
  };

  //on reçoit via le body les éléments de la région qu'on place en arguments de la fonction
  let customInterval = definePerimeter(
    coordinateJsonParse.latitude,
    coordinateJsonParse.longitude,
    coordinateJsonParse.latitudeDelta,
    coordinateJsonParse.longitudeDelta
  );

  //on fait la requete dans MongoDB
  let cleanWalkRequest = await cleanwalkModel
    .find()
    .where("cleanwalkCoordinates.latitude")
    .gte(customInterval.lat.min)
    .lte(customInterval.lat.max)
    .where("cleanwalkCoordinates.longitude")
    .gte(customInterval.long.min)
    .lte(customInterval.long.max)
    .where("startingDate")
    .gte(dateSearch)
    .populate("admin")
    .exec();

  res.json({ result: true, cleanWalkArray: cleanWalkRequest });
});

/*load-cities-ranking*/
router.get("/load-cities-ranking", async function (req, res, next) {
  let pointsPerCw = 5;

  let cwpercity = await cleanwalkModel.aggregate([
    { $group: { _id: "$cleanwalkCity", count: { $sum: pointsPerCw } } },
    { $sort: { count: -1 } },
    {
      $lookup: {
        from: "cities",
        localField: "_id",
        foreignField: "_id",
        as: "city_info",
      },
    },
  ]);
  console.log(cwpercity);

  let token = req.query.token;
  let user = await userModel.find({ token: token });

  if (user.length > 0) {
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
      copy.ranking = i + 1;
      return copy;
    });

    res.json({ result: true, ranking: cwpercity });
  } else {
    res.json({ result: false, error: "user not found" });
  }
});

// load-profil
router.get("/load-profil/:token", async function (req, res, next) {
  const token = req.params.token;
  const user = await userModel
    .findOne({ token: token })
    .populate("city")
    .exec();

  if (user) {
    const userId = user._id;

    // unwind éclate le tableau 'participantsList' dans l'objet cleanwalk, il fait autant d'objet qu'il y a d'élément dans le tableau
    // cela devient une clé 'participantsList' de l'objet cleanwalk
    // on fait ensuite un match pour ne garder que ceux qui ont comme valeur l'id de l'user
    const cleanwalksParticipate = await cleanwalkModel.aggregate([
      { $unwind: "$participantsList" },
      { $match: { participantsList: userId } },
    ]);

    // Création du tableau d'objets des CW auquelles ils participent avec uniquement les infos qu'on a besoin
    const infosCWparticipate = cleanwalksParticipate.map((cleanwalk) => {
      return {
        id: cleanwalk._id,
        title: cleanwalk.cleanwalkTitle,
        date: cleanwalk.startingDate,
      };
    });

    // récup des cleanwalks qu'organise le user
    const cleanwalksOrganize = await cleanwalkModel.find({ admin: userId });

    // Création du tableau d'objets des CW qu'ils organisent avec uniquement les infos qu'on a besoin
    const infosCWorganize = cleanwalksOrganize.map((cleanwalk) => {
      return {
        id: cleanwalk._id,
        title: cleanwalk.cleanwalkTitle,
        date: cleanwalk.startingDate,
      };
    });

    // création d'un objet avec uniquement les infos du user qu'on veut afficher ds le screen profil
    const infosUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      city: user.city.cityName,
    };

    //console.log('infosUser', infosUser);

    res.json({ result: true, infosCWparticipate, infosCWorganize, infosUser });
  } else {
    res.json({ result: false, error: "user not found" });
  }
});

// subscribe to cleanwalk
// router.post("/subscribe-cw", async function (req, res, next) {
//   let cleanwalk = await cleanwalkModel.findOne({ _id: idCleanwalk });

//   let idCleanwalk = req.body.cleanwalkIdFromFront;

//   newParticipant = await cleanwalkModel.updateOne(
//     { _id: idCleanwalk },
//     { $push: { participantsList: saveUser._id } }
//   );

//   res.json({ result: true, cleanwalk });
// });

/*load message*/
router.get("/load-messages/:token/:cwid", async function (req, res, next) {
  let cleanwalk = await cleanwalkModel.find({ _id: req.params.cwid });
  let messages = cleanwalk[0].messages;

  res.json({ result: true, messages });
});

/*save message*/
router.post("/save-message", async function (req, res, next) {
  let token = req.body.token;
  let cwid = req.body.cwid;
  let message = JSON.parse(req.body.message);
  let date = JSON.parse(req.body.date);

  let cleanwalk = await cleanwalkModel.find({ _id: cwid });
  let user = await userModel.find({ token: token });
  let sender = user[0].firstName;

  cleanwalk[0].messages.push({
    user: sender,
    message: message,
    date: date,
  });

  let cleanwalkSaved = await cleanwalk[0].save();

  if (cleanwalkSaved) {
    res.json({ result: true, messages: cleanwalkSaved.messages });
  } else {
    res.json({ result: true, error: "Couldn't save the message" });
  }
});

// create-cw
router.post("/create-cw", async function (req, res, next) {
  let cityInfo = JSON.parse(req.body.city);
  let code = cityInfo.cityCode;
  let userToken = req.body.token;
  let user = await userModel.findOne({token: userToken})

  let found = await cityModel.findOne({ cityCode: code });
  var result = false;

  if (found) {
    console.log("blabla: ", found._id);
    var addCW = new cleanwalkModel({
      cleanwalkTitle: req.body.title,
      cleanwalkDescription: req.body.description,
      cleanwalkCity: found._id,
      cleanwalkCoordinates: {
        longitude: cityInfo.cityCoordinates[0],
        latitude: cityInfo.cityCoordinates[1],
      },
      startingDate: req.body.startingDate,
      endingDate: req.body.endingDate,
      toolBadge: req.body.tool,
      admin: user._id,
    });

    var cleanwalkSave = await addCW.save();
  }
  // if (found == null) {
  //   let newCity = cityModel({
  //     cityName: req.body.city,
  //     cityCoordinbates: req.body.,
  //     population:,
  //     cityCode
  //   });
  // }

  res.json({ result });
});

// /get-city-from-coordinates   --> proposer une cleanwalk
router.post("/get-city-from-coordinates", function (req, res, next) {
  let requete = request(
    "GET",
    `https://api-adresse.data.gouv.fr/reverse/?lon=${req.body.lonFromFront}&lat=${req.body.latFromFront}`
  );
  let response = JSON.parse(requete.body);
  // console.log("réponse API: ", response);

  res.json({ result: true, response: response });
});

/*search-city-only*/
router.post("/search-city-only", function (req, res, next) {
  let cityRegex = /arrondissement/i;

  let requete = request(
    "GET",
    `https://api-adresse.data.gouv.fr/search/?q=${req.body.city}&type=municipality`
  );
  let response = JSON.parse(requete.body);
  let newResponse = response.features.filter(
    (obj) => !cityRegex.test(obj.properties.label)
  );
  // console.log("newResponse", newResponse);
  newResponse = newResponse.map((obj) => {
    let copy = { ...obj };
    copy.properties.label = copy.properties.city;
    return copy;
  });

  res.json({ result: true, newResponse });
});

module.exports = router;
