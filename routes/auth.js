const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ================================
// LOGIN PAGE
// ================================

router.get("/", (req, res) => {
  res.render("login", {
    error: null
  });
});


// ================================
// REGISTER PAGE
// ================================

router.get("/register", (req, res) => {
  res.render("register", {
    error: null
  });
});


// ================================
// REGISTER USER
// ================================

router.post("/register", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    // Check empty fields
    if (!name || !email || !password) {
      return res.render("register", {
        error: "All fields are required"
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.render("register", {
        error: "Password must be at least 6 characters"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.render("register", {
        error: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    // Save in MongoDB
    await newUser.save();

    console.log("User Registered Successfully");

    // Go to login
    res.redirect("/");

  } catch (error) {

    console.log("Registration Error:", error);

    res.render("register", {
      error: "Something went wrong"
    });
  }
});


// ================================
// LOGIN USER
// ================================

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("login", {
        error: "Email and password are required"
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.render("login", {
        error: "Invalid email or password"
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.render("login", {
        error: "Invalid email or password"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    // Store JWT in cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000
    });

    // Go to dashboard
    res.redirect("/dashboard");

  } catch (error) {

    console.log("Login Error:", error);

    res.render("login", {
      error: "Something went wrong"
    });
  }
});


// ================================
// PROTECTED DASHBOARD
// ================================

router.get(
  "/dashboard",
  authMiddleware,
  (req, res) => {

    res.render("dashboard", {
      user: req.user
    });

  }
);


// ================================
// LOGOUT
// ================================

router.get("/logout", (req, res) => {

  res.clearCookie("token");

  res.redirect("/");

});


module.exports = router;