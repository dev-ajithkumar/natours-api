const express = require("express");
const userRoute = express.Router();

const authController = require("../controller/authController");
const userController = require("../controller/userController");
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  checkPassword,
} = userController;

const { protect, updatePassword, resetPassword, forgotPassword } =
  authController;

userRoute.post("/signup", authController.signup);
userRoute.post("/login", authController.login);
userRoute.post("/forgotPassword", forgotPassword);
userRoute.patch("/resetPassword/:token", resetPassword);

userRoute.use(authController.protect);
userRoute.patch("/updatePassword", updatePassword);
userRoute.patch("/updateMe", updateMe);
userRoute.delete("/deleteMe", deleteMe);
userRoute.get("/me", userController.getMe, userController.getUser);

userRoute.use(authController.restrictTo("admin"));
userRoute.route("/").get(getAllUsers).post(createUser);
userRoute
  .route("/:id")
  .get(getUser)
  .patch(checkPassword, updateUser)
  .delete(deleteUser);

module.exports = userRoute;
