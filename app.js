const express = require("express");
const path = require("path");
const routes = require("./routes/index.js");

const app = express();

// Middlewear usage
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/", routes);

module.exports = app;
