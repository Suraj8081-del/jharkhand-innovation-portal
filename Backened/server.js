const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middleware/authMiddleware");
const challengeRoutes = require("./routes/challengeRoutes");
const teamRoutes = require("./routes/teamRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const governmentRoutes = require("./routes/governmentRoutes");






dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/government", governmentRoutes);





app.get("/api/auth/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected route accessed successfully",
    user: req.user,
  });
});



app.get("/", (req, res) => {
  res.json({ message: "University Dashboard API is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
