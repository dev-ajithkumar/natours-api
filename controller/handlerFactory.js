const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id); // Find and delete the tour by its ID
    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404)); // Check if the tour exists, if not, return an error
    }
    res.status(204).json({ status: "success", data: "Resource deleted" }); // Send Response with success message
  });

//Do Not use this for passwords:
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404)); // Check if the tour exists, if not, return an error
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested  GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Create an APIFeatures instance to handle filtering, sorting, limiting, and pagination
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fieldLimits()
      .paginate();

    // Execute the query
    // const getAllDocs = await features.query.explain();
    const getAllDocs = await features.query;

    // Send Response with the list of tours
    res.status(200).json({
      status: "success",
      result: getAllDocs.length,
      data: {
        getAllDocs,
      },
    });
  });
