const express = require("express");
const router = express.Router();
const db = require("../config");
const app = express();
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

//muler config
const multer = require("multer");
// Create multer object
const imageUpload = multer({
  dest: "images",
});

//Aws related keys and imports
const AWS = require("aws-sdk");
const { reset } = require("nodemon");
const ID = process.env.s3accessid;
const SECRET = process.env.s3accesskey;
const BUCKET_NAME = process.env.s3bucketname;

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});
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
  let product_image_id = req.body.product_image_id;
  product_image_id = product_image_id.split(",");

  let newproduct_id = "";
  let insertquery =
    "INSERT INTO co_products (product_name, product_desc,price,category_id) VALUES (?,?,?,?)";

  db.query(
    insertquery,
    [product_name, product_desc, price, category_id],
    (err, result) => {
      newproduct_id = result.insertId;
      if (err) throw err;

      for (let i = 0; i < product_image_id.length - 1; i++) {
        let newQuery =
          "update co_product_images set product_id=" +
          newproduct_id +
          " where product_image_id=" +
          product_image_id[i];
        // console.log(newQuery);
        db.query(newQuery, (err, result) => {
          if (err) throw err;
        });
      }
      res.json("product inserted successfully");
    }
  );
});

router.get("/getProducts", (req, res) => {
  //let query = "select * from co_products  order by category_id asc";

  let query =
    "select  cp.product_id,cp.product_name,cp.product_desc,cp.price,cp.category_id,cc.category_name,(select product_image_name from co_product_images where product_id=cp.product_id limit 1)as image_name  from co_products  cp left join co_categories cc on cp.category_id=cc.category_id left join co_product_images cpi on cp.product_id=cpi.product_id order by category_id asc ";

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
  // console.log(deleteQuery);
  db.query(deleteQuery, (err, result) => {
    res.send("Product successfully deleted");
  });
});

router.post("/getProductsByCategory/:id", (req, res) => {
  let category_id = req.params.id;
  let limit = req.body.limit;
  let index = req.body.index;
  let query =
    "select (select count(*) from co_products where category_id=" +
    category_id +
    ")as total_product,cp.product_id,cp.product_name,cp.product_desc,cp.price,cp.category_id,cc.category_name,(select product_image_name from co_product_images where product_id=cp.product_id limit 1)as image_name  from co_products  cp left join co_categories cc on cp.category_id=cc.category_id  where cp.category_id=" +
    category_id;

  if (index != null && limit != "") {
    query += " LIMIT " + index + "," + limit;
  }

  db.query(query, (err, result) => {
    if (err) throw err;
    else res.json(result);
  });
});

router.post("/uploadImage", imageUpload.single("image"), (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);

  // Setting up S3 upload parameters
  const params = {
    Bucket: BUCKET_NAME,
    Key: req.file.filename, // File name you want to save as in S3
    Body: fileContent,
  };

  // Uploading files to the bucket imageUpload.single("image"),
  try {
    s3.upload(params, function (err, data) {
      if (err) {
        // throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
    });
  } catch (error) {
    // console.log(error);
  }

  fs.unlinkSync(req.file.path);

  let product_id = req.body.product_id;
  product_id = product_id == null ? 0 : product_id;

  // console.log("product-f", product_id, req.params.product_id);
  // console.log(product_id);
  let new_image_id = "";
  let insertQuery =
    "insert into co_product_images (product_id,product_image_name,status,created_date,created_timestamp)VALUES (" +
    product_id +
    ",'" +
    req.file.filename +
    "','Y',current_date,CURRENT_TIMESTAMP)";

  try {
    db.query(insertQuery, (err, data) => {
      // console.log(data.insertId);
      new_image_id = data.insertId;
      if (err) console.log(err);
      else res.send(new_image_id.toString());
    });
  } catch (error) {
    console.log(error);
  }

  //res.send("success");
});
router.get("/getProductImages/:key", (req, res) => {
  let key = req.params.key;
  let downloadParam = {
    Key: key,
    Bucket: BUCKET_NAME,
  };
  try {
    const readStream = s3.getObject(downloadParam).createReadStream();
    readStream.pipe(res);
  } catch (error) {
    console.log(error);
  }
});

router.get("/getImagesofProduct/:id", (req, res) => {
  let product_id = req.params.id;
  let query = "select * from co_product_images where product_id=" + product_id;
  db.query(query, (err, result) => {
    if (err) throw err;
    else res.json(result);
  });
});

module.exports = router;
