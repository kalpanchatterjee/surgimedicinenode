const express = require("express");

const app = express();

var loginroute = require("./routes/loginReg");
const productroute = require("./routes/product");
const categoryroute = require("./routes/categoryRoute");
const dotenv = require("dotenv");
//db credentials
//const db = require("./config");

dotenv.config();
const port = process.env.PORT;

//middleware
var bodyparser = require("body-parser");
app.use(bodyparser.json());
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);

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

//cors origin check
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

//redirecting to route module
app.use("/", loginroute);
app.use("/product", productroute);
app.use("/category", categoryroute);

app.listen(process.env.PORT || 1400, () => {
  console.log("server started at port no " + port);
});
