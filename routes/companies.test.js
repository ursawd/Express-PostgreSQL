// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany;
let testInvoice;
//###################  BEFORE  ######################
beforeEach(async function () {
  let compResult = await db.query(`
  INSERT INTO companies (code,name,description)
  VALUES ('ibm', 'IBM', 'Big blue.')
  RETURNING code,name,description
  `);

  let invResult = await db.query(`
  INSERT INTO invoices (comp_code,amt,paid,paid_date)
  VALUES ('ibm', 400, false, null)
  RETURNING id, comp_code,amt,paid,add_date,paid_date
  `);

  testCompany = compResult.rows[0];
  testInvoice = invResult.rows[0];
});
//##################  TESTS  #########################
//
describe("Retrieve records from companies table", function () {
  test("GET a array of 1 company", async function () {
    const response = await request(app).get("/companies");
    expect(response.statusCode).toEqual(200);
    expect(response.body.companies[0]).toEqual(testCompany);
  });
});

// -----------------------------------------------
describe("Retrieve a single record from companies table", function () {
  test("GET an object of 1 company", async function () {
    const response = await request(app).get(`/companies/${testCompany.code}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body.company.invoices[0].amt).toEqual(testInvoice.amt);
  });
  test("Return 404 if company code not found", async function () {
    const response = await request(app).get(`/companies/@@@`);
    expect(response.statusCode).toEqual(404);
  });
});

// -----------------------------------------------
describe("Add a company to companies table", function () {
  test("Create a new company", async function () {
    const response = await request(app).post(`/companies`).send({
      code: "abc",
      name: "Google",
      description: "The alphabet company",
    });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      company: {
        code: "abc",
        name: "Google",
        description: "The alphabet company",
      },
    });
  });
});
// -----------------------------------------------
describe("Replace a company name or description with PUT", function () {
  test("Replaces company name or description", async function () {
    const response = await request(app)
      .put(`/companies/${testCompany.code}`)
      .send({
        name: "Google",
        description: "The alphabet company",
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      company: {
        code: "ibm",
        name: "Google",
        description: "The alphabet company",
      },
    });
  });
  test("Return 404 if company code not found", async function () {
    const response = await request(app).get(`/companies/@@@`);
    expect(response.statusCode).toEqual(404);
  });
});

// -----------------------------------------------
describe("Delete a company from companies table", function () {
  test("Delete a company", async function () {
    const response = await request(app).delete(
      `/companies/${testCompany.code}`
    );
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ status: "deleted" });
  });

  test("Return 404 if company code not found", async function () {
    const response = await request(app).delete(`/companies/@@@`);
    expect(response.statusCode).toEqual(404);
  });
});
// -----------------------------------------------
//
//##################  AFTER  #########################
afterEach(async function () {
  // delete any data created by test
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");
});

afterAll(async function () {
  // close db connection
  await db.end();
});
