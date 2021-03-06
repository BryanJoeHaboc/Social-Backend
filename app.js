const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { graphqlHTTP } = require("express-graphql");
const fs = require("fs");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const db = require("./database/db");
const auth = require("./middlewares/authentication/is-auth");

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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated");
    error.code = 401;
    throw error;
  }

  if (!req.file) {
    return res.status(200).json({ message: "No file provided" });
  }

  req.file.path = req.file.path.replace("\\", "/");

  if (req.body.oldPath) {
    req.body.oldPath = req.body.oldPath.replace("\\", "/");
    clearImage(req.body.oldPath);
  }

  return res
    .status(201)
    .json({ message: "file stored", filePath: req.file.path });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }

      const data = err.originalError.data;
      const message = err.message || "An error occured";
      const code = err.originalError.code || 500;
      return { message, status: code, data };
    },
  })
);

app.use((error, req, res, next) => {
  const { data, message, statusCode } = error;
  console.log("data", data, "message", message, "statusCode", statusCode);
  res.status(statusCode).json({ message, data });
});

db.then(() => {
  app.listen(port, () => {
    console.log("Listening to port:", port);
  });
}).catch((err) => console.log(err));

const clearImage = (filePath) => {
  filePath = path.join(__dirname, filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
