require("dotenv").config();
const mongoose = require("mongoose");

const env = process.env.NODE_ENV || "development";

// let url = process.env.LOCAL_MONGODB;

// if (env !== "development") {
url = process.env.MONGODB_CONNECT_LINK;
// }

module.exports = mongoose.connect(url);
