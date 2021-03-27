// COMPANY ROUTES

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("SELECT * FROM companies");
    return res.json({ companies: results.rows });
  } catch (error) {
    return next(error);
  }
});
// -----------------------------------------------
router.get("/:code", async (req, res, next) => {
  try {
    code = req.params.code;
    const results = await db.query(
      "select * from companies full outer join invoices on companies.code = invoices.comp_code where companies.code=$1;",
      [code]
    );

    if (results.rowCount === 0) {
      throw new ExpressError("Invalid company code", 404);
    }
    const { code: cCode, name, description } = results.rows[0];
    const invoiceArray = results.rows.map((row) => {
      const { id, amt, paid, add_date, paid_date } = row;
      return { id, amt, paid, add_date, paid_date };
    });
    return res.json({
      company: { code: cCode, name, description, invoices: invoiceArray },
    });
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(
      "INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING code,name,description",
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.put("/:code", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(
      "UPDATE companies SET code=$1, name=$2, description=$3 WHERE code=$4",
      [code, name, description, req.params.code]
    );

    if (results.rowCount === 0) {
      throw new ExpressError("PUT: Invalid company code", 404);
    }
    return res.status(200).json({ company: { code, name, description } });
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.delete("/:code", async (req, res, next) => {
  try {
    code = req.params.code;
    const results = await db.query("DELETE FROM companies WHERE code = $1", [
      code,
    ]);
    if (results.rowCount === 0) {
      throw new ExpressError("DELETE: Invalid company code", 404);
    }
    return res.send({ status: "deleted" });
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
// ------------------------------------------------
module.exports = router;
