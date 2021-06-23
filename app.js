const express = require("express");
const reservation = require("./routes/reservation");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/apis", reservation);

module.exports = app;
