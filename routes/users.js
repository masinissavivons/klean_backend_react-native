var express = require("express");
var router = express.Router();

let userModel = require("../models/users");
var bcrypt = require("bcrypt");
const uid2 = require("uid2");
const cleanwalkModel = require("../models/cleanwalks");

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

//    POST Sign-up    //
router.post("/sign-up", async function (req, res, next) {
  let error = [];
  let result = false;
  let saveUser = null;
  let token = null;
  let idCleanwalk = req.body.cleanwalkIdFromFront;
  let newParticipant = null;

  let data = await userModel.findOne({
    email: req.body.emailFromFront,
  });

  if (data != null) {
    error.push("Vous vous êtes déjà enregistré. Vous pouvez vous connecter.");
  }

  if (
    req.body.firsNameFromFront == "" ||
    req.body.lastNameFromFront == "" ||
    req.body.emailFromFront == "" ||
    req.body.cityFromFront == "" ||
    req.body.passwordFromFront == ""
  ) {
    error.push("Veuillez remplir tous les champs.");
  }

  if (!validateEmail(req.body.emailFromFront)) {
    error.push("Format d'email incorrect");
  }

  // register
  if (error.length == 0 && idCleanwalk === undefined) {
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

    res.json({
      error,
      result,
      saveUser,
      token,
    });
  }

  // register & participate
  if (error.length == 0 && idCleanwalk !== undefined) {
    let hash = bcrypt.hashSync(req.body.passwordFromFront, 10);
    let newUser = new userModel({
      firstName: req.body.firstNameFromFront,
      lastName: req.body.lastNameFromFront,
      email: req.body.emailFromFront,
      city: req.body.cityFromFront,
      password: hash,
      token: uid2(32),
    });

    let saveUser = await newUser.save();

    if (saveUser) {
      let cleanwalk = await cleanwalkModel.findOne({ _id: idCleanwalk });

      newParticipant = await cleanwalkModel.updateOne(
        { _id: idCleanwalk },
        { $push: { participantsList: saveUser._id } }
      );

      result = true;
      token = saveUser.token;

      res.json({
        error,
        result,
        saveUser,
        token,
        newParticipant,
      });
    }
  }

  res.json({
    error,
    result,
  });
});

//    POST Sign-in    //
router.post("/sign-in", async function (req, res, next) {
  let error = [];
  let result = false;
  let user = "";
  let token = null;

  let idCleanwalk = req.body.cleanwalkIdFromFront;
  let newParticipant = null;

  if (req.body.emailFromFront == "" || req.body.passwordFromFront == "") {
    error.push("Veuillez remplir les deux champs.");
  }

  // sign-in
  if (error.length == 0) {
    user = await userModel.findOne({
      email: req.body.emailFromFront,
    });

    if (user) {
      if (bcrypt.compareSync(req.body.passwordFromFront, user.password)) {
        result = true;
        token = user.token;
      } else {
        result = false;
        error.push("Mot de passe incorrect.");
      }
    } else {
      error.push("Email incorrect.");
    }

    res.json({ error, result, user, token });
  }

  // sign-in & participate
  if (error.length == 0 && idCleanwalk !== undefined) {
    user = await userModel.findOne({
      email: req.body.emailFromFront,
    });

    console.log("user: ", user)
    if (user) {
      if (bcrypt.compareSync(req.body.passwordFromFront, user.password)) {
        result = true;
        token = user.token;

        let cleanwalk = await cleanwalkModel.findOne({ _id: idCleanwalk });

        newParticipant = await cleanwalkModel.updateOne(
          { _id: idCleanwalk },
          { $push: { participantsList: user._id } }
        );
      } else {
        result = false;
        error.push("Mot de passe incorrect.");
      } 
    } else {
      error.push("Email incorrect.");
    }

    res.json({ error, result, user, token, newParticipant });
  }

  res.json({
    error,
    result,
  });
});

module.exports = router;
