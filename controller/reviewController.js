const Review = require("../model/reviewModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.createNewReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;

  const review = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    tour: req.body.tour,
    user: req.body.user,
  });

  res.status(201).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
