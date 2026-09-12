const Proposal = require("../models/Proposal");
const Challenge = require("../models/Challenge");
const User = require("../models/User");

// ----------------------------------------------------
// Get all proposals for Government review
// GET /api/government/proposals
// ----------------------------------------------------
const getAllProposalsForReview = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    // Populates team and challenge info
    const proposals = await Proposal.find(query)
      .populate("team", "teamName members universityName")
      .populate("teamId", "teamName members universityName")
      .populate(
        "challenge",
        "title description district category priority status deadline"
      )
      .populate(
        "challengeId",
        "title description district category priority status deadline"
      )
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      message: "Proposals fetched successfully for government review",
      proposals,
    });
  } catch (error) {
    console.error("Get government proposals error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch proposals for review",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// Approve or reject one proposal
// PATCH /api/government/proposals/:id/review
//
// Supports both body styles:
// { "action": "approve", "reviewComment": "Good proposal" }
// OR
// { "status": "approved", "remarks": "Good proposal" }
// ----------------------------------------------------
const reviewProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, status, reviewComment, remarks } = req.body;

    // Normalizing action: 'approve'/'approved' -> 'approved', 'reject'/'rejected' -> 'rejected'
    let decision = (action || status || "").toLowerCase();
    if (decision === "approve") decision = "approved";
    if (decision === "reject") decision = "rejected";

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be 'approve' ('approved') or 'reject' ('rejected')",
      });
    }

    const finalComment = (reviewComment || remarks || "").trim();

    // Rejection case me comment / remarks mandatory hai
    if (decision === "rejected" && !finalComment) {
      return res.status(400).json({
        success: false,
        message: "A review comment or remark is required when rejecting a proposal",
      });
    }

    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    // Ek proposal par final decision sirf ek baar
    if (["approved", "rejected"].includes(proposal.status)) {
      return res.status(400).json({
        success: false,
        message: `This proposal has already been ${proposal.status}`,
      });
    }

    // Updating proposal fields
    proposal.status = decision;
    proposal.reviewComment = finalComment;
    proposal.governmentRemarks = finalComment;
    proposal.reviewedBy = req.user._id;
    proposal.reviewedAt = new Date();

    await proposal.save();

    res.status(200).json({
      success: true,
      message: `Proposal ${decision} successfully`,
      proposal,
    });
  } catch (error) {
    console.error("Review proposal error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid proposal ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to review proposal",
      error: error.message,
    });
  }
};




// ----------------------------------------------------
// NEW 1: Government KPI & Stats
// GET /api/government/stats
// ----------------------------------------------------
const getGovStats = async (req, res) => {
  try {
    const [totalChallenges, pendingReview, assignedChallenges, pendingProposals] = await Promise.all([
      Challenge.countDocuments(),
      Challenge.countDocuments({ status: { $in: ["pending", "submitted"] } }),
      Challenge.countDocuments({ status: "assigned" }),
      Proposal.countDocuments({ status: "submitted" })
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalChallenges,
        pendingReview,
        assignedChallenges,
        pendingProposals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Stats fetch failed", error: error.message });
  }
};

// ----------------------------------------------------
// NEW 2: All Challenges for Government Scrutiny
// GET /api/government/challenges
// ----------------------------------------------------
const getAllGovChallenges = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const challenges = await Challenge.find(query)
      .populate("submittedBy", "name email district phone")
      .populate("assignedUniversity", "name institutionName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      challenges,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Challenges fetch failed", error: error.message });
  }
};

// ----------------------------------------------------
// NEW 3: Assign Challenge to University
// PATCH /api/government/challenges/:id/assign
// ----------------------------------------------------
const assignChallengeToUniv = async (req, res) => {
  try {
    const { id } = req.params;
    const { universityId, priority } = req.body;

    if (!universityId) {
      return res.status(400).json({ success: false, message: "University ID is required" });
    }

    const challenge = await Challenge.findByIdAndUpdate(
      id,
      {
        assignedUniversity: universityId,
        priority: priority || "High",
        status: "assigned",
        assignedAt: new Date(),
      },
      { new: true }
    ).populate("assignedUniversity", "name institutionName");

    if (!challenge) {
      return res.status(404).json({ success: false, message: "Challenge not found" });
    }

    res.status(200).json({
      success: true,
      message: "Challenge allotted to university successfully",
      challenge,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Assignment failed", error: error.message });
  }
};

// ----------------------------------------------------
// NEW 4: Registered Universities list for allotment dropdown
// GET /api/government/universities
// ----------------------------------------------------
const getUniversitiesList = async (req, res) => {
  try {
    const list = await User.find({ role: "university" })
      .select("_id name institutionName email district");

    res.status(200).json({
      success: true,
      count: list.length,
      universities: list,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Universities list fetch failed", error: error.message });
  }
};

module.exports = {
  getAllProposalsForReview,
  reviewProposal,
  getGovStats,
  getAllGovChallenges,
  assignChallengeToUniv,
  getUniversitiesList,
};




module.exports = {
  getAllProposalsForReview,
  reviewProposal,
  getGovStats,
  getAllGovChallenges,
  assignChallengeToUniv,
  getUniversitiesList,
};
