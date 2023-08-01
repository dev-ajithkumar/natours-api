const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please provide your name"],
  },
  email: {
    type: String,
    trim: true,
    unique: [true, "User Email id should be unique"],
    required: [true, "Please provide your email id"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a vaild email id"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "admin", "guide", "lead-guide"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please provide a password"],
    select: false,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: String,
  passwordResetExpires: String,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//Hashing the password before save into DB.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only run this function if password was actually modified
  this.password = await bcrypt.hash(this.password, 12); // Hash the password with cost of 12
  this.confirmPassword = undefined; // Delete confirmPassword field
  return next();
});

// Sets `passwordChangedAt` to current time - 1000ms if `password` is modified or document is new.
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Pre-find middleware that only returns active users.
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Compare the candidate password with the user's hashed password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Returns True if the password was changed after the given JWTTimestamp, False otherwise.
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChanged = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < passwordChanged;
  }

  return false;
};

// Generates a password reset token and sets the password reset expiration date.
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
