const express = require("express");
const Reservation = require("../models/reservation");

const router = express.Router();

router.post("/scenario1", async (req, res) => {
  const { name, email, time, duration, number_of_guests } = req.body;
  try {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let date = new Date().getDate();
    if (date < 10) date = `0${date}`;
    let d = `${year}-${month}-${date}T${time}:00`;
    const timezone =
      new Date()
        .toLocaleDateString(undefined, { day: "2-digit", timeZoneName: "long" })
        .substring(4) +
      " " +
      new Date().toString().split(" ")[5];
    let duratn = duration.split(":");
    const dura = parseInt(duratn[0]) * 60 * 60 + parseInt(duratn[1]) * 60;
    let hours = parseInt(time.split(":")[0]) + parseInt(duratn[0]);
    let minutes = parseInt(time.split(":")[1]) + parseInt(duratn[1]);
    if (minutes > 59) {
      hours++;
      minutes -= 60;
    }
    if (minutes < 10) minutes = `0${minutes}`;
    const end_time_time = `${hours}:${minutes}`;

    const reservation_confirm = await Reservation.findOne({
      "reserve_time.date": new Date(d),
    });
    let no_guests_reserved = await Reservation.aggregate([
      { $group: { _id: null, total_guest: { $sum: "$number_of_guests" } } },
    ]);
    const available_guests = 100 - no_guests_reserved[0].total_guest;
    if (parseInt(number_of_guests) > available_guests)
      return res.status(400).json({
        success: 0,
        message: "Sorry, the number of guests limit exceeded",
      });
    if (reservation_confirm)
      return res
        .status(400)
        .json({ success: 0, message: "Sorry, the table is already reserved" });

    const newReservation = new Reservation({
      reserve_time: [
        { timestamp: new Date(d).getTime(), date: new Date(d), time, timezone },
      ],
      end_time: [
        {
          timestamp: new Date(d).getTime() + dura * 1000,
          date: new Date(new Date(d).getTime() + dura * 1000),
          time: end_time_time,
          timezone,
        },
      ],
      duration,
      number_of_guests,
      customer: [{ name, email }],
    });
    await newReservation.save();

    res.status(200).json({
      success: 1,
      message: "Your reservation has been made",
      data: newReservation,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/scenario2", async (req, res) => {
  const { name, email, time, number_of_guests, duration } = req.body;
  try {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let date = new Date().getDate();
    if (date < 10) date = `0${date}`;
    let d = `${year}-${month}-${date}T${time}:00`;
    const reservation_confirm = await Reservation.findOne({
      "reserve_time.date": new Date(d),
    });
    console.log(reservation_confirm);
    let times = time.replace(
      time.split(":")[0],
      parseInt(time.split(":")[0]) - 2
    );
    if (reservation_confirm) {
      res.status(200).json({
        success: 0,
        message: `Sorry, the time is already reserved. Your possible reservation times are ${times}pm or ${reservation_confirm.end_time[0].time}pm. You can choose between them`,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/scenario3", async (req, res) => {
  const { name, email, time, number_of_guests, duration } = req.body;
  try {
    const reserved_guest = 97;
    const seat_capacity = 100;

    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let date = new Date().getDate();
    if (date < 10) date = `0${date}`;
    let d = `${year}-${month}-${date}T${time}:00`;
    const check_reservation = await Reservation.find({
      "end_time.date": { $lte: new Date(d) },
    });
    const available_reserve_time = [];
    const time_set = new Set();
    if (check_reservation.length > 0)
      check_reservation.map((obj) => time_set.add(obj.end_time[0].time));
    time_set.forEach((item) => available_reserve_time.push(item));
    if (check_reservation.length < 1)
      return res.status(400).json({
        success: 0,
        message:
          "Sorry, no available reservation found today so, The reservation can not be taken",
      });
    if (seat_capacity - reserved_guest < number_of_guests)
      return res.status(400).json({
        success: 0,
        message: `Sorry, available seat limit exceeded, You can take reservation at ${available_reserve_time.join(
          " or "
        )}`,
      });
    return res.status(200).json({
      success: 1,
      message: "Your reservation confirmed!",
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/scenario4", (req, res) => {
  const { name, email, time, number_of_guests, duration } = req.body;
  const reserve_parameter_cutoff = 20;
  if (reserve_parameter_cutoff < number_of_guests)
    return res.status(200).json({
      success: 0,
      message:
        "number of guest limit exceeded, call the restaurent to reserve table because it's a large group",
    });
  return res.status(200).json({
    success: 1,
    message: "Your reservation confirmed!",
  });
});

router.post("/activeReservation", async (req, res) => {
  const { name, email, time, number_of_guests, duration } = req.body;
  try {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let date = new Date().getDate();
    if (date < 10) date = `0${date}`;
    let d = `${year}-${month}-${date}T${time}:00`;
    let duratn = duration.split(":");
    const dura = parseInt(duratn[0]) * 60 * 60 + parseInt(duratn[1]) * 60;
    const all_active_reservation_by_reserve_time = await Reservation.find({
      "reserve_time.date": { $gte: new Date(d) },
    });
    const all_active_reservation_by_end_time = await Reservation.find({
      "end_time.date": {
        $lte: new Date(new Date(d).getTime() + (dura * 1000 - 1 * 1000)),
      },
    });
    const all_active_reservation = [];
    all_active_reservation_by_reserve_time.map((obj) =>
      all_active_reservation.push(obj)
    );
    all_active_reservation_by_end_time.map((obj) =>
      all_active_reservation.push(obj)
    );
    res.status(200).json({
      success: 1,
      message: "Active reservations as provided reserve time has been fetched",
      data: all_active_reservation,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/activeReserveDuringY", async (req, res) => {
  const { name, email, time, number_of_guests, duration } = req.body;
  try {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let date = new Date().getDate();
    if (date < 10) date = `0${date}`;
    let d = `${year}-${month}-${date}T${time}:00`;
    const active_reservation = await Reservation.find({
      "end_time.date": { $gt: new Date(d) },
    });
    res.status(200).json({
      success: 1,
      message: "active reservations fetched",
      data: active_reservation,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/sumof", async (req, res) => {
  const { name, email, time, number_of_guests, duration } = req.body;
  try {
    const no_guests_reserved = await Reservation.aggregate([
      { $group: { _id: null, total_guest: { $sum: "$number_of_guests" } } },
    ]);
    if (no_guests_reserved[0].total_guest >= parseInt(number_of_guests))
      return res.status(200).json({
        success: 1,
        message: "Your reservation accepted!",
      });
    if (parseInt(number_of_guests) > no_guests_reserved[0].total_guest)
      return res.status(200).json({
        success: 0,
        message: "Your reservation rejected!",
      });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
