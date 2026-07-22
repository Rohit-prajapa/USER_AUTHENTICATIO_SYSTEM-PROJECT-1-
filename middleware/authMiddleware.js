const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {

    // Get token from cookie
    const token = req.cookies.token;

    // If token doesn't exist
    if (!token) {
      return res.redirect("/");
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store user information
    req.user = decoded;

    next();

  } catch (error) {

    console.log("Authentication Error:", error.message);

    res.clearCookie("token");

    return res.redirect("/");
  }
};

module.exports = authMiddleware;