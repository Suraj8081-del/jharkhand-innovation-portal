const express = require("express");
const router = express.Router();

const {
  createTeam,
  getMyTeams,
  addTeamMember,
} = require("../controllers/teamController");

const { protect } = require("../middleware/authMiddleware");

// Create a team for one accepted challenge
router.post("/", protect, createTeam);

// Logged-in university ki saari teams
router.get("/", protect, getMyTeams);

// Existing team mein faculty/student add karna
router.post("/:id/members", protect, addTeamMember);

module.exports = router;
