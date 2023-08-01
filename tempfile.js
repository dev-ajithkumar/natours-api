const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const Tour = require("./model/tourModel");
const User = require("./model/userModel");
const Review = require("./model/reviewModel");

// const databaseConnection = process.env.DATABASE.replace(
//   "<password>",
//   process.env.PASSWORD
// );
const fs = require("fs");
const { json } = require("body-parser");

dotenv.config({ path: "./config.env" });

const databaseConnection = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

// Connecting to MongoDB
mongoose
  .connect(databaseConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"));

const reviewsData = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);
// const userData = JSON.parse(
//   fs.readFileSync(`${__dirname}/users.json`, "utf-8")
// );
// const reviewData = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tour.json`, "utf-8")
// );
const importDataToDB = async () => {
  try {
    await Review.create(reviewsData);
    // // await User.create(userData, { validateBeforeSave: false });
    // await Review.create(reviewData);
    console.log("Data has been loaded");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deletDbData = async () => {
  try {
    await Review.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();
    console.log("Data has been deleted....!!");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

importDataToDB();
