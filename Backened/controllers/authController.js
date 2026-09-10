const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      universityName,
      department,
      phone,
    } = req.body;

    // Required fields check
    if (!name || !email || !password || !universityName) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and university name are required",
      });
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),

    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Password ko secure hash mein convert karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // New user create karo
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "university",
      universityName,
      department: department || "",
      phone: phone || "",
    });

    // Password response mein kabhi mat bhejo
    return res.status(201).json({
      success: true,
      message: "University user registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        universityName: user.universityName,
        department: user.department,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);

    // Mongoose unique email error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering the user",
    });
  }
};






const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    // Same message for user-not-found or incorrect password
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password in MongoDB
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check whether JWT secret is available in .env
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
        success: false,
        message: "JWT secret is not configured",
      });
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        universityName: user.universityName,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        universityName: user.universityName,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
};


module.exports = { registerUser, loginUser };
