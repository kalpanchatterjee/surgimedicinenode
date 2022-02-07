const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Ka@721211",
  database: "medico_db",
});

connection.connect(function (err) {
  if (err) throw err;
});

module.exports = connection;
