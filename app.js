const express = require("express");
const path = require("path");
const apiRoutes = require("./routes/index.js");

const app = express();

// middlewear usage
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// api routes
app.use("/api", apiRoutes);

module.exports = app;
