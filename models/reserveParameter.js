const mongoose = require("mongoose");

const reserverParameterSchema = new mongoose.Schema({
  duration_default: {
    type: Number,
    default: 2 * 60 * 60 * 1000,
  },
  seat_capacity: {
    type: Number,
    default: 100,
  },
});

const ReserveParameter = mongoose.model(
  "ReserveParameter",
  reserverParameterSchema
);
module.exports = ReserveParameter;
