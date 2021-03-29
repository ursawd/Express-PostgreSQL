//INVOICE ROUTES

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("SELECT * FROM invoices");
    return res.json({ invoices: results.rows });
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.get("/:id", async (req, res, next) => {
  try {
    id = req.params.id;
    const results = await db.query(
      "select * from invoices as i inner join companies on i.comp_code = companies.code where i.id = $1",
      [id]
    );
    if (results.rowCount === 0) {
      throw new ExpressError("Invalid invoice id", 404);
    }
    const {
      id: invoiceid,
      amt,
      paid,
      add_date,
      paid_date,
      code,
      name,
      description,
    } = results.rows[0];

    return res.json({
      invoice: {
        id: invoiceid,
        amt,
        paid,
        add_date,
        paid_date,
        company: { code, name, description },
      },
    });
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      "INSERT INTO invoices (comp_code,amt) VALUES ($1,$2) RETURNING id,comp_code,amt,paid,add_date,paid_date",
      [comp_code, amt]
    );
    const {
      id,
      comp_code: code,
      amt: invoiceAmt,
      paid,
      add_date,
      paid_date,
    } = results.rows[0];
    return res.status(201).json({
      invoice: {
        id,
        comp_code: code,
        amt: invoiceAmt,
        paid,
        add_date,
        paid_date,
      },
    });
  } catch (error) {
    const detail = error.detail;
    res.json({ error: { detail } });
    return next(error);
  }
});
// ------------------------------------------------
router.put("/:id", async (req, res, next) => {
  try {
    const { amt, paid } = req.body;

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    id = req.params.id;
    const curResults = await db.query(
      "select paid,paid_date from invoices where id = $1",
      [id]
    );
    if (curResults.rowCount === 0) {
      throw new ExpressError("Invalid invoice id", 404);
    }
    const isPaid = curResults.rows[0].paid;
    const paidDate = curResults.rows[0].paid_date;

    if (!isPaid && paid) {
      paid_date = new Date();
    } else if (!paid) {
      paid_date = null;
    } else {
      paid_date = paidDate;
    }

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    const results = await db.query(
      "UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING *",
      [amt, paid, paid_date, req.params.id]
    );
    if (results.rowCount === 0) {
      throw new ExpressError("PUT: Invalid invoice id", 404);
    }
    return res.status(200).json({ invoice: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
router.delete("/:id", async (req, res, next) => {
  try {
    id = req.params.id;
    const results = await db.query("DELETE FROM invoices WHERE id = $1", [id]);

    if (results.rowCount === 0) {
      throw new ExpressError("DELETE: Invalid invoice id", 404);
    }

    return res.send({ status: "deleted" });
  } catch (error) {
    return next(error);
  }
});
// ------------------------------------------------
// ------------------------------------------------
module.exports = router;
