const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect("mongodb://localhost:27017/excellenceReservation")
  .then(() => console.log("Connected to mongodb"))
  .catch((err) => console.log(err));

const server = http.createServer(app);
const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Server up and running on port ${port}`));
