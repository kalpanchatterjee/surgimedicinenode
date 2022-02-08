const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const sql = require("mysql2");
const db = require("../config");

router.post("/register", (req, res) => {
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;
  let password = req.body.password;

  let searchsql =
    "select count(*) as count from co_users where email='" + email + "'";
  db.query(searchsql, function (err, countres) {
    if (countres[0].count == 0) {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        var query =
          "INSERT INTO co_users (first_name, last_name,email,phone,password) VALUES (?,?,?,?,?)";
        db.query(
          query,
          [first_name, last_name, email, phone, hash],
          function (err, result) {
            if (err) throw err;
            else res.send("user registered succesfully");
          }
        );
      });
    } else {
      res.send("user is already registerd");
    }
  });
});

router.post("/login", (req, res) => {
  let username = req.body.email;
  let password = req.body.password;

  let loginquery = "select * from co_users where email='" + username + "'";
  db.query(loginquery, function (err, user) {
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, function (err, passmatch) {
        if (passmatch == true) {
          res.json(user);
        } else {
          res.send("invalid credentials");
        }
      });
    } else {
      res.send("user is not registerd");
    }
  });
});
module.exports = router;
