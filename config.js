const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const connection = mysql.createConnection({
  // host: process.env.RDS_HOSTNAME,
  // user: process.env.RDS_USERNAME,
  // password: process.env.RDS_PASSWORD,
  // port: process.env.RDS_PORT,
  // database: process.env.RDS_DB_NAME,

  host: "database-2.clhia2n7w6dv.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "Ka.721211",
  port: 3306,
  database: "medicodb",
});

connection.connect(function (err) {
  if (err) console.log(err);
  else console.log("db connected");
});

module.exports = connection;
