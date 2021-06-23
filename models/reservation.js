const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
});

const reserve_time_schema = new mongoose.Schema({
  timestamp: {
    type: Number,
  },
  date: {
    type: Date,
  },
  time: {
    type: String,
  },
  timezone: {
    type: String,
  },
});

const end_time_schema = new mongoose.Schema({
  timestamp: {
    type: Number,
  },
  date: {
    type: Date,
  },
  time: {
    type: String,
  },
  timezone: {
    type: String,
  },
});

const reservationSchema = new mongoose.Schema(
  {
    reserve_time: [reserve_time_schema],
    end_time: [end_time_schema],
    duration: {
      type: String,
    },
    number_of_guests: {
      type: Number,
    },
    customer: [customerSchema],
  },
  { timestamps: true }
);

const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = Reservation;
