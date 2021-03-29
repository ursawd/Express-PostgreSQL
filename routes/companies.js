// COMPANY ROUTES

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

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

    const indResults = await db.query(
      `select i.industry 
      from companies as c
      left join company_industry as ci
      on c.code = ci.comp_code 
      left join industries as i 
      on ci.ind_code = i.code 
      where c.code = $1;`,
      [code]
    );

    if (indResults.rowCount === 0) {
      throw new ExpressError("Invalid company code", 404);
    }

    // const industries = indResults.rows;
    const industries = indResults.rows.map((row) => row.industry);

    const { code: cCode, name, description } = results.rows[0];

    const invoiceArray = results.rows.map((row) => {
      const { id, amt, paid, add_date, paid_date } = row;
      return { id, amt, paid, add_date, paid_date };
    });

    return res.json({
      company: {
        code: cCode,
        name,
        description,
        invoices: invoiceArray,
        industries,
      },
    });
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    slug_code = slugify(code, { lower: true });

    const results = await db.query(
      "INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING code,name,description",
      [slug_code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.put("/:code", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = req.params.code;
    const results = await db.query(
      "UPDATE companies SET  name=$1, description=$2 WHERE code=$3",
      [name, description, code]
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
