const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED EXCEPTION 🔔");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const databaseConnection = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

// Connecting to MongoDB
mongoose
  .connect(databaseConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"));

const port = 3000;

// Logging the current environment mode.
console.log(process.env.NODE_ENV);

// Starting the server and logging a message on successful startup.
const server = app.listen(port, () => {
  console.log(`Server Started on : ${port}`);
});

// Handling unhandled promise rejections and gracefully closing the server on error.
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION 🔔");
  server.close(() => {
    process.exit(1);
  });
});
