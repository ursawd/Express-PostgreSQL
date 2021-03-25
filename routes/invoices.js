//INVOICE ROUTES

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.get("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.post("/", async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.put("/:id", async (req, res, next) => {
  try {
    const results = await db.query("SELECT * FROM invoices");
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.delete("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
// ------------------------------------------------
module.exports = router;
