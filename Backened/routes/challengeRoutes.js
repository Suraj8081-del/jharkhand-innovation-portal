const express = require("express");
const router = express.Router();

const {
  createChallenge,
  getAssignedChallenges,
  respondToChallenge,
} = require("../controllers/challengeController");

const { protect } = require("../middleware/authMiddleware");

// Temporary testing route:
// Login token required, but later Government/Admin role only karenge.
router.post("/", protect, createChallenge);

// Logged-in university ke assigned challenges
router.get("/assigned", protect, getAssignedChallenges);

// Accept / reject a challenge
router.patch("/:id/respond", protect, respondToChallenge);

module.exports = router;
