const express = require("express");
const router = express.Router();

const {
  getAllProposalsForReview,
  reviewProposal,
  getGovStats,           // Naya
  getAllGovChallenges,   // Naya
  assignChallengeToUniv, // Naya
  getUniversitiesList,   // Naya
} = require("../controllers/governmentController");

// Agar allowRoles roleMiddleware.js me hai toh ye rakho:
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
// (Note: Agar roleMiddleware alag file nahi hai, toh dono ko authMiddleware se import kar lena)

// Pehle token verify hoga, phir role 'government' check hoga
router.get("/proposals", protect, allowRoles("government"), getAllProposalsForReview);

router.patch(
  "/proposals/:id/review",
  protect,
  allowRoles("government"),
  reviewProposal
);

router.get("/stats", protect, allowRoles("government"), getGovStats);
router.get("/challenges", protect, allowRoles("government"), getAllGovChallenges);
router.patch("/challenges/:id/assign", protect, allowRoles("government"), assignChallengeToUniv);
router.get("/universities", protect, allowRoles("government"), getUniversitiesList);

module.exports = router;
