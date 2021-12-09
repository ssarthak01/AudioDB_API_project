// Imports the server.js file to be tested.
let server = require("../server");
//Assertion (Test Driven Development) and Should, Expect(Behaviour driven development) library
let chai = require("chai");
// Chai HTTP provides an interface for live integration testing of the API's.
let chaiHttp = require("chai-http");
const { response } = require("express");
chai.should();
chai.use(chaiHttp);
const { expect } = chai;
var assert = chai.assert;

describe("Server!", () => {

  //Home Page Test Case
  it("Home Page Loads Correctly", done => {
    chai
      .request(server)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  //Reviews Page Test Case
  it("Reviews Page Loads Properly With Table of Reviews", done => {

    chai
      .request(server)
      .get("/reviews")
      .end((err, response) => {
        expect(response).to.have.status(200);
        done();
      });
  });

  //Successful Search for Known Artist
  it("Search for Known Artist is Succesful", done => {
    let test = "Coldplay";
    chai
      .request(server)
      .post("/get_artist")
      .send(test)
      .end((err, response) => {
        expect(response).to.have.status(200);
        //expect(response).to.have.status(500);
        //expect(res).to.have.status(200);
        //response.body.should.have.should.have.property("message").eq("Fail to pull info because artist does not exist. Try with different artist name.");
        //assert.strictEqual(res.body.message, "Fail to pull info because artist does not exist. Try with different artist name.");
        done();
      });
  });
 });