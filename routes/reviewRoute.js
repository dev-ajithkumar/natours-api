const express = require("express");
const reviewController = require("../controller/reviewController");
const authController = require("../controller/authController");

const reviewRoute = express.Router({ mergeParams: true }); //*IMP

reviewRoute.use(authController.protect);

reviewRoute
  .route("/")
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo("user"), reviewController.createNewReview);

reviewRoute
  .route("/:id")
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(authController.restrictTo("admin"), reviewController.deleteReview);

module.exports = reviewRoute;
