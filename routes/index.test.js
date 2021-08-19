var app = require("../app");
var request = require("supertest");


describe("get a city from coordinates", () => {
  //    sending (true) Paris coordinates
  test("send true coordinates", async () => {
    const { body } = await request(app).post("/get-city-from-coordinates").send({
        lon: 2.333333,
        lat: 48.866667,
    });
    expect(body).toBeTruthy();
  });// ---- > SUCCESS : le test affiche PASS

// note: même si le test passe, ajouter un nouveau fichier de test semble causer un problème

});