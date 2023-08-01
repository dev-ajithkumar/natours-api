const catchAsync = (fn) => {
  // Wraps an asynchronous function to catch errors globally
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Export the catchAsync function for reuse in other parts of the application
module.exports = catchAsync;
