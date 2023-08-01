const AppError = require("../utils/appError");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error("Error:", err);
    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(.*?[^\\])\1/)[0];
  const message = `Duplicate field value : ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.error).map((el) => el.message);
  const message = `Invalid Input : ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () => {
  return new AppError("Invalid jwt token, Please login again", 401);
};

const handleTokenExpiredError = () => {
  return new AppError("Your token has expired, Please login again", 401);
};

module.exports = (err, req, res, next) => {
  // Set default error properties if not already present
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.isOperational = err.isOperational || true;

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    // Create a new object to avoid modifying the original error object
    const error = { ...err, name: err.name, message: err.message };

    // Handle specific types of errors for production environment
    if (error.name === "CastError") {
      const castError = handleCastErrorDB(error);
      sendErrorProd(castError, res);
    } else if (error.code === 11000) {
      const duplicateFieldsError = handleDuplicateFieldsDB(error);
      sendErrorProd(duplicateFieldsError, res);
    } else if (error.name === "ValidatorError") {
      const validationError = handleValidationErrorDB(error);
      sendErrorProd(validationError, res);
    } else if (error.name === "JsonWebTokenError") {
      const jsonWebTokenError = handleJsonWebTokenError();
      sendErrorProd(jsonWebTokenError, res);
    } else if (error.name === "TokenExpiredError") {
      const tokenExpiredError = handleTokenExpiredError();
      sendErrorProd(tokenExpiredError, res);
    } else {
      // For other types of errors, send the original error object
      sendErrorProd(error, res);
    }
  }
};
