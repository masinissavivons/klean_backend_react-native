var app = require("../app");
var request = require("supertest");
const cityModel = require("../models/cities");
const userModel = require("../models/users");



//    testing sign-up route cases   //
describe("sign-up", () => {
  //    only one input filled
  test("only one input filled", async () => {
    const { body } = await request(app).post("/users/sign-up").send({
      firstNameFromFront: "name",
    });
    expect(body).toStrictEqual({
      error: ["Veuillez remplir tous les champs.", "Format d'email incorrect."],
      result: false,
    });
  }); // ---- > success : le test fail, montre que la gestion erreur sur la route n'est pas bonne



  //    all inputs empty    //
  test("all inputs empty", async () => {
    const { body } = await request(app).post("/users/sign-up").send({
      firstNameFromFront: "",
      lastNameFromFront: "",
      emailFromFront: "",
      cityFromFront: "",
      passwordFromFront: "",
    });
    expect(body).toStrictEqual({
      error: ["Veuillez remplir tous les champs.", "Format d'email incorrect."],
      result: false,
    });
  }); // ---- > SUCCESS : ressort la bonne erreur


  //    find user in DB   //
    test("find user that exists in DB", async () => {
      const user = await userModel.findOne({email: "jadelambert2567@gmail.com"})
      const { body } = await request(app).post("/users/sign-up").send({
        user,
      });
      expect(body).toBeTruthy();
    }); // ---- > SUCCESS : utilisateur trouvé


      //    find user in DB   //
      test("find user that doesn't exist in DB", async () => {
        const user = await userModel.findOne({email: "bloublou@gmail.com"})
        const { body } = await request(app).post("/users/sign-up").send({
          user,
        });
        expect(body).toBeFalsy();
      }); // ---- > success: le test fail en retournant une error supplémentaire, cela montre que la gestion d'erreurs n'est pas bonne


      //    find city in DB   //
      test("find city that exists in DB", async () => {
        const city = await cityModel.findOne({cityCode: 75056})
        const { body } = await request(app).post("/users/sign-up").send({
          city,
        });
        expect(body).toBeTruthy();
      });// ---- > SUCCESS : city trouvée


      //    find city in DB   //
      test("find city that doesn't exist in DB", async () => {
        const city = await cityModel.findOne({cityCode: 71042})
        const { body } = await request(app).post("/users/sign-up").send({
          city,
        });
        expect(body).toBeFalsy();
      });// ---- > success: le test fail en retournant une error supplémentaire, cela montre que la gestion d'erreurs n'est pas bonne


// note: les .toBeTruthy() fonctionnent, alors que les .toBeFalsy() non, à creuser pourquoi.


});



//    testing sign-in route cases   //
describe("sign-in", () => {
  //    only one input filled
  test("only one finput filled", async () => {
    const { body } = await request(app).post("/users/sign-in").send({
      emailFromFront: "bloublou@gmail.com",
    });
    expect(body).toStrictEqual({
    error: ["Vous ne vous êtes pas encore enregistré."],
    result: false,
    user: null,
    token: null
    });
  });// ---- > SUCCESS : bonnes erreurs retournées si l'utilisateur n'existe pas
  
});