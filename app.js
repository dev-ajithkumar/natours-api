const express = require("express");
const app = express();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
app.use(express.json());

const tourRoute = require("./routes/tourRoute");
const userRoute = require("./routes/userRoute");
const reviewRoute = require("./routes/reviewRoute");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");

// 🛡️ Adds security headers to protect against common web vulnerabilities.
app.use(helmet());

// 🧹 Sanitizes incoming data to prevent NoSQL injection attacks.
app.use(mongoSanitize());

// 🗡️ Sanitizes incoming data to prevent cross-site scripting (XSS) attacks.
app.use(xss());

// ✅ Protects against HTTP Parameter Pollution, whitelisting essential parameters.
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// Mounting the tour route handler at '/api/v1/tours'
app.use("/api/v1/tours", tourRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/reviews", reviewRoute);

// Creates a rate limiter that allows each IP to make 100 requests per 60 minutes
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

// 🔐 Limits the number of requests a client can make to the server.
app.use("/api", limiter);

// Handling undefined routes and generating a 404 error ❌🚨
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Using the global error handler middleware to handle errors throughout the app.
app.use(globalErrorHandler);

module.exports = app;
