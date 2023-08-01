const express = require("express");
const tourController = require("../controller/tourController");
const authController = require("../controller/authController");
const reviewRoute = require("./reviewRoute");

const tourRoute = express.Router();

// Mount the reviewRoute
tourRoute.use("/:tourId/reviews", reviewRoute);

tourRoute.route("/").get(tourController.getAllTours);

// Protected routes
tourRoute.use(authController.protect);
tourRoute.use(authController.restrictTo("admin", "lead-guide"));

tourRoute.get(
  `/top-5-cheap-tours`,
  tourController.cheapTours,
  tourController.getAllTours
);

tourRoute.get(`/get-monthly-plan/:year`, tourController.getMonthlyPlan);

tourRoute.get(`/get-weekly-plan/:year`, tourController.getWeekPlan);

// Move the /tour-stats route above the generic parameterized route /:id
tourRoute.get(`/tour-stats`, tourController.getTourStats);
tourRoute
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);

tourRoute
  .route("/tours-within/center/:latlng/unit/:unit")
  .get(tourController.getDistance);

// Move the /:id route below the specific routes
tourRoute.route("/:id").get(tourController.getTour);

tourRoute.route("/").post(tourController.createNewtour);
// tourRoute.route("/:id").get(tourController.getTour);
tourRoute
  .route("/:id")
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRoute;
