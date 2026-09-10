const express = require("express");
const router = express.Router();

const {
  submitProposal,
  getMyProposals,
} = require("../controllers/proposalController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, submitProposal);
router.get("/my", protect, getMyProposals);

module.exports = router;
