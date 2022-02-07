const express = require("express");
const router = express.Router();
const db = require("../config");

const app = express();
//cors origin
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

router.post("/addProduct", (req, res) => {
  let product_name = req.body.product_name;
  let product_desc = req.body.product_desc;
  let price = req.body.price;
  let category_id = req.body.category_id;

  let insertquery =
    "INSERT INTO co_products (product_name, product_desc,price,category_id) VALUES (?,?,?,?)";

  db.query(
    insertquery,
    [product_name, product_desc, price, category_id],
    (err, result) => {
      if (err) throw err;
      else res.send("product inserted successfully");
    }
  );
});

router.get("/getProducts", (req, res) => {
  //let query = "select * from co_products  order by category_id asc";

  let query =
    "select  cp.product_id,cp.product_name,cp.product_desc,cp.price,cp.category_id,cc.category_name  from co_products  cp left join co_categories cc on cp.category_id=cc.category_id order by category_id asc ";

  db.query(query, (err, result) => {
    if (err) throw err;
    else res.json(result);
  });
});

router.get("/getProducts/:id", (req, res) => {
  let query = "select * from co_products where product_id=" + req.params.id;
  db.query(query, (err, result) => {
    if (err) throw err;
    else res.json(result);
  });
});

router.put("/updateProduct", (req, res) => {
  let product_name = req.body.product_name;
  let product_desc = req.body.product_desc;
  let price = req.body.price;
  let category_id = req.body.category_id;
  let product_id = req.body.product_id;

  let updateQuery =
    "UPDATE co_products SET product_name=?,product_desc=?,price=?,category_id=? where product_id=?";
  db.query(
    updateQuery,
    [product_name, product_desc, price, category_id, product_id],
    (err, result) => {
      if (err) throw err;
      else res.redirect("/product/getProducts/" + product_id);
    }
  );
});

router.delete("/deleteProduct/:id", (req, res) => {
  let deleteQuery = "delete from co_products where product_id=" + req.params.id;
  console.log(deleteQuery);
  db.query(deleteQuery, (err, result) => {
    res.send("Product successfully deleted");
  });
});

module.exports = router;
