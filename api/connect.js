let mysql = require("mysql");

let tables = [
  `create table if not exists parents(
    id int primary key auto_increment,
    fathersFirstName varchar(45),
    mothersFirstName varchar(45),
    lastName varchar(45),
    addres int,
    phone varchar(45),
    email varchar(45));`,
  `create table if not exists student(
    id int primary key auto_increment,
    parentsId int,
    firstName varchar(45),
    lastName varchar(45),
    grade int,
    phone varchar(45),
    email varchar(45));`,
  `create table if not exists weeklyDismissal(
    studentId int primary key,
    monday varchar(45),
    tuesday varchar(45),
    wednesday varchar(45),
    thursday varchar(45),
    friday varchar(45),
    saturday varchar(45));`,
  `create table if not exists exceptionalDismissal(
      id int primary key auto_increment,
      studentId int,
      date date,
      dismissalMethod varchar(100));`,
  `create table if not exists daysOff(
      id int primary key auto_increment,
      date date);`,
];

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "zxcvb",
  database: "schooldb",
});

connection.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }

  for (const table of tables) {
    connection.query(table, function (err, results, fields) {
      if (err) {
        console.log('err',err.message);
      }
    });
  }

  // connection.end(function (err) {
  //   if (err) {
  //     return console.log('err', err.message);
  //   }
  // });

  console.log("Connected to the MySQL server.");
});

module.exports = connection;
