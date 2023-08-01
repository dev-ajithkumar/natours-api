const mongoose = require("mongoose");
const Tour = require("../model/tourModel");
const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tours",
      required: [true, "Review must belong to be a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to be a user"],
    },
  },
  {
    toJSON: { virtuals: true }, // used for virtual to use on this particular schema
    toObject: { virtuals: true },
  }
);

// Add the unique compound index to enforce one-user-one-review-per-tour
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  });
  next();
});

reviewSchema.post("save", function () {
  this.constructor.updateTourAvgRatings(this.tour);
});

// FindByIdAndUpdate
// FindByIdAndDelete
// Middleware function to update average ratings in the associated tour document
reviewSchema.statics.updateTourAvgRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Middleware for updating average ratings on review update
reviewSchema.post("findOneAndUpdate", async function (doc) {
  await doc.constructor.updateTourAvgRatings(doc.tour);
});

// Middleware for updating average ratings on review delete
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc.tour) {
    await doc.constructor.updateTourAvgRatings(doc.tour);
  }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
