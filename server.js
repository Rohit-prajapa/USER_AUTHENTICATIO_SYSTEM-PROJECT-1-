const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Import Routes
const authRoutes = require("./routes/auth");

// Use Routes
app.use("/", authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🔥 MY NEW SERVER IS RUNNING");
});