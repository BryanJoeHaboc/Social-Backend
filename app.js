const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const db = require("./database/db");
const feedRoutes = require("./routes/feed.route");
const authRoutes = require("./routes/auth.route");

const app = express();

// for reference in storing different files
// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (req.body.event == 'test') {
//       cb(null, "images/test"); // it will upload inside test under images
//     } else {
//       cb(null, "images/try"); // it will upload inside try under images
//     }
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString() + "-" + file.originalname);
//   }
// });

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  file.mimetype === "image/png" ||
  file.mimetype === "image/jpg" ||
  file.mimetype === "image/jpeg"
    ? cb(null, true)
    : cb(null, false);
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

app.use("/images", express.static(path.join(__dirname, "images")));

const port = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization,Accept"
  );
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const { data, message, statusCode } = error;

  res.status(statusCode).json({ message, data });
});

db.then(() => {
  app.listen(port, () => {
    console.log("Listening to port:", port);
  });
}).catch((err) => console.log(err));
