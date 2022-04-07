const express = require("express");
const bodyParser = require("body-parser");
const db = require("./database/db");
const feedRoutes = require("./routes/feed.route");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

const port = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

db.then(() => {
  app.listen(port, () => {
    console.log("Listening to port:", port);
  });
}).catch((err) => console.log(err));
