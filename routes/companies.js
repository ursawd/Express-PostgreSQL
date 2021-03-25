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
    const results = await db.query("SELECT * FROM companies WHERE code = $1", [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError("Invalid company code", 404);
    }
    return res.json({ company: results.rows[0] });
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
    const results = await db.query("SELECT * FROM invoices");
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
    if (results.rows.length === 0) {
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
