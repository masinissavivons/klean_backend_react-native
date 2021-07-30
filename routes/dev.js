var express = require('express');
var router = express.Router();
var newsModel = require('../models/news')
var userModel = require('../models/users')
var cleanwalkModel = require('../models/cleanwalks')
var cityModel = require('../models/cities')
const uid2 = require("uid2");
var bcrypt = require("bcrypt");

/* 
  /dev/gen-fake-data
  /dev/del-fake-data
*/


function rand(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
};

let lastnameArray = ["Doe", "Dupont", "Leblanc", "Germain", "Martin", "Marchand", "Saint-Hilaire", "Herreman", "Diot"];
let firstnameArray = ["Mika", "Malo", "John", "Remy", "Sebastien", "Thomas", "Gregoire", "Julien", "Mireille", "Elizabeth", "Anne", "Sam"];
let message = ["Salut", "Bonjour tout le monde, comment allez-vous ?", "Hello Hello !", "CleanWalk forever <3"];
let date = [];
let cities = [
  {
    cityName: "Paris",
    cityCoordinates: { longitude: 2.347, latitude: 48.859 },
    population: 2190327,
    cityCode: "75056"
  },
  {
    cityName: "Marseille",
    cityCoordinates: { longitude: 5.405, latitude: 43.282 },
    population: 862211,
    cityCode: "13055"
  },
]

let cleanwalks = [
  {
    cleanwalkTitle: "Nettoyage du Boulevard Pereire devant la Capsule",
    cleanwalkDescription: "Bonjour, je vous propose de nous retrouver devant le 55 boulevard Pereire pour nettoyer la rue qui est très sale. Merci à tous !",
    cleanwalkCity: "Paris",
    cleanwalkCoordinates: { longitude: 2.307331, latitude: 48.887416 },
    startingDate: new Date(2021, 8, 22),
    endingDate: new Date(2021, 8, 23),
    toolBadge: ["Gants", "Sacs poubelle", "Bonne humeur", "Lampe torche", "Apéro"],
    admin: "",
    participantsList: [],
    messages: [
      {
        user: firstnameArray[rand(0, firstnameArray.length - 1)],
        message: message[rand(0, message.length - 1)],
        date: new Date(2021, 8, 22),
      },
      {
        user: firstnameArray[rand(0, firstnameArray.length - 1)],
        message: message[rand(0, message.length - 1)],
        date: new Date(2021, 8, 22),
      },
      {
        user: firstnameArray[rand(0, firstnameArray.length - 1)],
        message: message[rand(0, message.length - 1)],
        date: new Date(2021, 8, 22),
      },
    ],
  },
  {
    cleanwalkTitle: "Cleanons les Tuileries !",
    cleanwalkDescription: "Amis CleanWalker, à vos gants et sac poubelle ! l'heure est venue de dire adieu aux déchets",
    cleanwalkCity: "Paris",
    cleanwalkCoordinates: { longitude: 2.329997, latitude: 48.862729 },
    startingDate: new Date(2021, 9, 12),
    endingDate: new Date(2021, 9, 13),
    toolBadge: ["Gants", "Sacs poubelle", "Bonne humeur", "Lampe torche", "Apéro", "ticket de métro"],
    admin: "",
    participantsList: [],
    messages: [
      {
        user: firstnameArray[rand(0, firstnameArray.length - 1)],
        message: message[rand(0, message.length - 1)],
        date: new Date(2021, 9, 10),
      },
      {
        user: firstnameArray[rand(0, firstnameArray.length - 1)],
        message: message[rand(0, message.length - 1)],
        date: new Date(2021, 9, 10),
      },
      {
        user: firstnameArray[rand(0, firstnameArray.length - 1)],
        message: message[rand(0, message.length - 1)],
        date: new Date(2021, 9, 10),
      },
    ],
  },
  {
    cleanwalkTitle: "Nettoyage des calanques de Marseille",
    cleanwalkDescription: "Sauvons nos calanques !!",
    cleanwalkCity: "Marseille",
    cleanwalkCoordinates: { longitude: 5.422175, latitude: 43.210817 },
    startingDate: new Date(2021, 10, 6),
    endingDate: new Date(2021, 10, 8),
    toolBadge: ["Gants", "Sacs poubelle", "Bonne humeur", "Lampe torche", "Apéro", "ticket de métro"],
    admin: "",
    participantsList: [],
    messages: [
      {
        user: firstnameArray[rand(0, firstnameArray.length - 1)],
        message: message[rand(0, message.length - 1)],
        date: new Date(2021, 10, 2),
      },
      {
        user: firstnameArray[rand(0, firstnameArray.length - 1)],
        message: message[rand(0, message.length - 1)],
        date: new Date(2021, 10, 2),
      },
      {
        user: firstnameArray[rand(0, firstnameArray.length - 1)],
        message: message[rand(0, message.length - 1)],
        date: new Date(2021, 10, 2),
      },
    ],
  },
]



/*GENERATE FAKE DATA*/
router.get('/gen-fake-data', async function (req, res, next) {

  //cities
  for (let i = 0; i < cities.length; i++) {

    var newCity = new cityModel({
      cityName: cities[i].cityName,
      cityCoordinates: { longitude: cities[i].cityCoordinates.longitude, latitude: cities[i].cityCoordinates.latitude },
      population: cities[i].population,
      cityCode: cities[i].cityCode,
    });

    var citySaved = await newCity.save();
  };

  //users

  let requeteCity = await cityModel.find();
  let randfn;
  let randln;

  for (let i = 0; i < 10; i++) {

    randfn = firstnameArray[rand(0, firstnameArray.length - 1)];
    randln = lastnameArray[rand(0, lastnameArray.length - 1)];

    var newUser = new userModel({
      firstName: randfn,
      lastName: randln,
      email: (randfn + randln + rand(0, 2000) + "@gmail.com").toLowerCase(),
      password: bcrypt.hashSync("cleanwalk", 10),
      city: requeteCity[rand(0, requeteCity.length - 1)]["_id"],
      avatarUrl: "",
      token: uid2(32),
    });

    var userSaved = await newUser.save();
  }


  //CleanWalk
  let randAdmin;
  let AdminOut;
  let randParArr;
  let randPar;
  let requeteUser;
  let cityId;
  
  for (let i = 0; i < cleanwalks.length; i++) {
    
    requeteUser = await userModel.find();
    randAdmin = requeteUser[rand(0, requeteUser.length - 1)]["_id"]
    AdminOut = requeteUser.splice(requeteUser.findIndex(e => e["_id"] === randAdmin), 1)
    console.log (AdminOut)

    randPar = () => {
      let arr = [];
      let p;

      for (let i = 0; i < 6; i++) {
        p = requeteUser[rand(0, requeteUser.length - 1)]["_id"]
        if(arr.indexOf(p) === -1){
        arr.push(p)
      } else {

      }
      }
      console.log({ARRrandPar: arr})
      return arr
    },

    randParArr = randPar()
    cityId = await cityModel.findOne({ cityName: cleanwalks[i].cleanwalkCity });
    console.log({cityId});

    var newCleanwalk = new cleanwalkModel({
      cleanwalkTitle: cleanwalks[i].cleanwalkTitle,
      cleanwalkDescription: cleanwalks[i].cleanwalkDescription,
      cleanwalkCity: cityId["_id"],
      cleanwalkCoordinates: cleanwalks[i].cleanwalkCoordinates,
      startingDate: cleanwalks[i].startingDate,
      endingDate: cleanwalks[i].endingDate,
      toolBadge: cleanwalks[i].toolBadge,
      admin: randAdmin,
      participantsList: randParArr,
      messages: cleanwalks[i].messages,
    });

    var cleanwalkSaved = await newCleanwalk.save();
  }



  res.json({ result: true });
});



/*DELETE FAKE DATA*/

router.get('/del-fake-data', async function (req, res, next) {

  await userModel.deleteMany();
  await cityModel.deleteMany();
  await cleanwalkModel.deleteMany();

  res.json({ result: true });
});


module.exports = router;
