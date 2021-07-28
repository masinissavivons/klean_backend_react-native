var express = require("express");
var router = express.Router();

let userModel = require("../models/users");
var bcrypt = require("bcrypt");
const uid2 = require("uid2");

/* GET users listing. */
router.post("/sign-up", async function (req, res, next) {
  let error = [];
  let result = false;
  let saveUser = null;
  let token = null;

  let data = await userModel.findOne({
    email: req.body.emailFromFront,
  });

  if (
    req.body.usernameFromFront == "" ||
    req.body.emailFromFront == "" ||
    req.body.passwordFromFront == ""
  ) {
    error.push("Veuillez remplir tous les champs.");
  }

  if (data != null) {
    error.push("Vous vous êtes déjà enregistré. Vous pouvez vous connecter.");
  }



  if (error.length == 0) {
    let hash = bcrypt.hashSync(req.body.passwordFromFront, 10);
    let newUser = new userModel({
      firstName: req.body.firstNameFromFront,
      lastName: req.body.lastNameFromFront,
      email: req.body.emailFromFront,
      city: req.body.cityFromFront,
      password: hash,
      token: uid2(32),
    });

    saveUser = await newUser.save();

    if (saveUser) {
      result = true;
      token = saveUser.token;
    }
  }

  res.json({ error, result, saveUser, token });
});

router.post("/sign-in", async function (req, res, next) {
  let error = [];
  let result = false;
  let user = null;
  let token = null;

  if (req.boody.emailFromFront == "" || req.body.passwordFromFront == "") {
    error.push("Veuillez remplir les deux champs");
  }

  if (error.length) {
    let user = await userModel.findOne({
      email: req.body.emailFromFront,
    });
  }

  let password = req.body.passwordFromFront;

  if (user) {
    if (bcrypt.compareSync(password, user.password)){ 
      result = true
        token = user.token
      } else {
      error.push("Mot de passe incorrect")
    }
  }

  res.json({result});
});

module.exports = router;
