const express = require("express");
const router = express.Router();
const db = require("../config");

//get the categories
router.get("/getCategory", (req, res) => {
  let query = "select * from co_categories";
  db.query(query, (err, result) => {
    if (err) throw err;
    else res.json(result);
  });
});

//add the categories

router.post("/addCategory", (req, res) => {
  let category_name = req.body.category_name;
  let category_desc = req.body.category_desc;
  // let

  let insertquery =
    "INSERT INTO co_categories (category_name, category_desc,trending,status) VALUES (?,?,?,?)";

  db.query(
    insertquery,
    [category_name, category_desc, "N", "Y"],
    (err, result) => {
      if (err) throw err;
      else res.send("category inserted successfully");
    }
  );
});
module.exports = router;
