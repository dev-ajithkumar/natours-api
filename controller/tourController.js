// Import required modules and utilities
const Tours = require("../model/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

exports.cheapTours = (req, res, next) => {
  // Middleware function to set default query parameters for cheapTours route
  req.query.sort = "price";
  req.query.limit = "5";
  req.query.fields = "name,duration,averageRating,price,summary,difficulty";
  next();
};

exports.getAllTours = factory.getAll(Tours);

exports.createNewtour = catchAsync(async (req, res, next) => {
  const newTour = await Tours.create(req.body);
  res.status(200).json({
    status: "success",
    data: {
      newTour,
    },
  });
});

exports.getTour = factory.getOne(Tours, { path: "reviews" }); // Route handler to get a single tour by its ID

exports.updateTour = factory.updateOne(Tours); // Route handler to update a tour by its ID

exports.deleteTour = factory.deleteOne(Tours); // Route handler to delete a tour by its ID

// Route handler to get statistics for tours with an average rating greater than or equal to 4.5
exports.getTourStats = catchAsync(async (req, res) => {
  // Aggregate tours based on average rating, difficulty, and price
  const stats = await Tours.aggregate([
    {
      $match: {
        averageRating: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: {
          $toUpper: "$difficulty",
        },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        countOfTours: { $sum: 1 },
        avgRating: { $avg: "$averageRating" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  // Send Response with the tour statistics
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

// Route handler to get the monthly plan for tours
exports.getMonthlyPlan = catchAsync(async (req, res) => {
  // Extract the year from the request parameters
  const year = req.params.year * 1;

  // Aggregate tours based on their start dates
  const monthly = await Tours.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numOfTours: {
          $sum: 1,
        },
        tours: {
          $push: "$name",
        },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numOfTours: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  // Send Response with the monthly plan
  res.status(200).json({
    status: "success",
    result: monthly.length,
    data: {
      monthly,
    },
  });
});

exports.getWeekPlan = catchAsync(async (req, res) => {
  const year = req.params.year;
  const weekPlan = await Tours.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $week: "$startDates",
        },
        numTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { weekOfTheYear: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTours: -1,
        weekOfTheYear: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    result: weekPlan.length,
    data: {
      weekPlan,
    },
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/244/center/40,-20/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  const tours = await Tours.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  const distance = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      distance,
    },
  });
});
