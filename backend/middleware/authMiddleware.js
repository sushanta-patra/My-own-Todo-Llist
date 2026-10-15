
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  // 1. Check if token exists
  if (!token) {
    return res.status(401).json({
      message: "Please log in first",
    });
  }

  let decoded;

  // 2. Verify JWT
  try {
    decoded = jwt.verify(
      token,
      process.env.SECRETE_KEY
    );
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  // 3. Fetch the latest user details from MongoDB
  try {
    const user = await User.findById(decoded.userId)
      .select("name email role");

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    // 4. Store authenticated user details
    req.user = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // 5. Allow the request to continue
    return next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "Unable to verify user",
    });
  }
};

export default protect;
