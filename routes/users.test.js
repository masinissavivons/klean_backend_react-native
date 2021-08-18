var app = require("../app");
var request = require("supertest");
const cityModel = require("../models/cities");

describe("sign-up", () => {
  //    only one field input
  test("only one field input", async () => {
    const { body } = await request(app).post("/users/sign-up").send({
      firstNameFromFront: "name",
    });
    expect(body).toStrictEqual({
      error: ["Veuillez remplir tous les champs.", "Format d'email incorrect"],
      result: false,
    });
  });

  // //    all inputs empty
  test("all inputs empty", async () => {
    const { body } = await request(app).post("/users/sign-up").send({
      firstNameFromFront: "",
      lastNameFromFront: "",
      emailFromFront: "",
      cityFromFront: "",
      passwordFromFront: "",
    });
    expect(body).toStrictEqual({
      error: ["Veuillez remplir tous les champs.", "Format d'email incorrect"],
      result: false,
    });
  });


  //    find user in DB
    test("find user in DB", async () => {
      const { body } = await request(app).post("/users/sign-up").send({
        email: "test@gmail.com",
      });
      if (found) {
        expect(body).toEqual({
          city: found._id,
        });
      }
      if (!found) {
          expect(body).toEqual({
          result: false,
      });
      }
    });


  //  find city in DB
  test("find city in DB", async () => {
    const found = await cityModel.findOne({ cityCode: 75056 });
    const { body } = await request(app).post("/users/sign-up").send({

      firstNameFromFront: "john",
      lastNameFromFront: "doe",
      emailFromFront: "blabla@gmail.com",
      cityFromFront: "Paris",
      passwordFromFront: "hello",
      confirmPasswordFromFront: "hello",
      cleanwalkIdFromFront: undefined,
      found,
    });
    if (found) {
      expect(body).toEqual({
          result: false,
        });
        expect(body.result).toBeTruthy();
    }
    if (!found) {
        expect(body.result).toBeFalsy();
    }
  });
});

describe("sign-in", () => {

  // only one field input
  test("only one field input", async () => {
    const { body } = await request(app).post("/users/sign-up").send({
      emailFromFront: "test@test.com",
    });
    expect.objectContaining({
      error: ["Vous ne vous êtes pas encore enregistré."],
      result: false,
      user: null,
      token: null,
    });
  });
});