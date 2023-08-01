const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      minlength: [10, "A tour name must have less or equal to 40 characters"],
      maxlength: [40, "A tour name must have less or equal to 40 characters"],
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either : easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be less then 5.0"],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        /// custom validator
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount Price should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a image cover"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    startDates: [Date],
    slug: {
      type: String,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // used for virtual to use on this particular schema
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

tourSchema.index({ price: 1, averageRating: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

// Document Middleware 2 types 📃 pre(), post()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// // 🔐 This code ensures that all guides are loaded before saving the tour.
// tourSchema.pre("save", async function (next) {
//   const guidePromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromise);
//   next();
// });

// Query middleware Filter secret tours on find 🔐
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// 🗃️ Query  middleware Populate guides on find, excluding __v 🗃️
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v ",
  });
  next();
});

// Aggregrate MiddleWare:
// tourSchema.pre("aggregate", function () {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
// });

const Tours = mongoose.model("Tours", tourSchema);

module.exports = Tours;
