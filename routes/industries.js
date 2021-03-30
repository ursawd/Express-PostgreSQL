// INDUSTRIES ROUTES

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
// -----------------------------------------------
//
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`
    select i.code,i.industry,c.name
    from industries as i
    left join company_industry as ci 
      on i.code = ci.ind_code
    left join companies as c 
      on ci.comp_code = c.code`);

    return res.json({ industries: results.rows });
  } catch (error) {
    return next(error);
  }
});

// -----------------------------------------------
//
router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;

    const results = await db.query(
      "INSERT INTO industries (code,industry) VALUES ($1,$2) RETURNING code,industry",
      [code, industry]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});

// -----------------------------------------------
//
router.post("/:comp/:indus", async (req, res, next) => {
  try {
    const { comp, indus } = req.params;
    const results = await db.query(
      "INSERT INTO company_industry (comp_code,ind_code) VALUES ($1,$2) RETURNING comp_code,ind_code",
      [comp, indus]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});

// -----------------------------------------------

module.exports = router;
