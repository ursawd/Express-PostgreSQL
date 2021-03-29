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
describe("Retrieve records from invoices table", function () {
  test("GET a array of 1 invoice", async function () {
    const response = await request(app).get("/invoices");
    const { id, comp_code, amt, paid } = response.body.invoices[0];
    const { id: a, comp_code: b, amt: c, paid: d } = testInvoice;
    expect(response.statusCode).toEqual(200);
    expect([id, comp_code, amt, paid]).toEqual([a, b, c, d]);
  });
});

// -----------------------------------------------
describe("Retrieve a single invoice from invoices table", function () {
  test("GET an object of 1 invoice with joined company info", async function () {
    const response = await request(app).get(`/invoices/${testInvoice.id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body.invoice.amt).toEqual(testInvoice.amt);
  });
  test("Return 404 if invoice id not found", async function () {
    const response = await request(app).get(`/invoices/0`);
    expect(response.statusCode).toEqual(404);
  });
});

// -----------------------------------------------
describe("Add a invoice to invoices table", function () {
  test("Create a new invoice", async function () {
    const response = await request(app).post(`/invoices`).send({
      comp_code: "ibm",
      amt: 999.0,
      paid_date: null,
    });
    expect(response.statusCode).toEqual(201);
    expect(response.body.invoice.amt).toEqual(999.0);
  });
});
// -----------------------------------------------
describe("Replace an invoice amount with PUT", function () {
  test("Replaces specific invoice amt", async function () {
    const response = await request(app)
      .put(`/invoices/${testInvoice.id}`)
      .send({
        amt: "999999.00",
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body.invoice.amt).toEqual(999999.0);
  });
  test("Return 404 if invoice id not found", async function () {
    const response = await request(app).get(`/invoices/0`);
    expect(response.statusCode).toEqual(404);
  });
});

// -----------------------------------------------
describe("Delete an invoice from invoices table", function () {
  test("Delete an invoice", async function () {
    const response = await request(app).delete(`/invoices/${testInvoice.id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ status: "deleted" });
  });

  test("Return 404 if invoice id not found", async function () {
    const response = await request(app).delete(`/invoices/0`);
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
