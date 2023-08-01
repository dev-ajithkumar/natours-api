const User = require("../model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const response = (user, statusCode, res) => {
  res.status(statusCode).json({
    status: "success",
    user,
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.checkPassword = (req, res, next) => {
  if (req.body.password)
    next(
      new AppError(
        `Unauthorized action. To update your password, please use the designated route: ${
          req.protocol
        }://${req.get("host")}/api/v1/users/updatePassword`,
        401
      )
    );
  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
// The user can only edit their own details, and they must be logged in to do so.
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");

  // 3) Update user document
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  response(user, 200, res);
});

// The user can only delete their own details, and they must be logged in to do so.
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
