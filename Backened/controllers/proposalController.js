const Proposal = require("../models/Proposal");
const Team = require("../models/Team");
const Challenge = require("../models/Challenge");

// ----------------------------------------------------
// Submit a proposal for an accepted challenge
// POST /api/proposals
// ----------------------------------------------------
const submitProposal = async (req, res) => {
  try {
    const {
      title,
      solutionSummary,
      detailedPlan,
      estimatedBudget,
      estimatedTimelineMonths,
      teamId,
      documentLink,
    } = req.body;

    const universityName = req.user.universityName;

    if (
      !title ||
      !solutionSummary ||
      !detailedPlan ||
      estimatedBudget === undefined ||
      estimatedTimelineMonths === undefined ||
      !teamId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, solution summary, detailed plan, budget, timeline and team ID are required",
      });
    }

    // Team must belong to the logged-in university
    const team = await Team.findOne({
      _id: teamId,
      universityName,
      status: "active",
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Active team not found or it does not belong to your university",
      });
    }

    // Team's linked challenge must still be accepted
    const challenge = await Challenge.findOne({
      _id: team.challenge,
      assignedUniversity: universityName,
      status: "accepted",
    });

    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: "The linked challenge is not accepted or is unavailable",
      });
    }

    // First version rule: one team can submit one proposal
    const existingProposal = await Proposal.findOne({ team: teamId });

    if (existingProposal) {
      return res.status(409).json({
        success: false,
        message: "This team has already submitted a proposal",
      });
    }

    const proposal = await Proposal.create({
      title,
      solutionSummary,
      detailedPlan,
      estimatedBudget,
      estimatedTimelineMonths,
      team: team._id,
      challenge: challenge._id,
      universityName,
      documentLink: documentLink || "",
    });

    res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      proposal,
    });
  } catch (error) {
    console.error("Submit proposal error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to submit proposal",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// Get proposals submitted by logged-in university
// GET /api/proposals/my
// ----------------------------------------------------
const getMyProposals = async (req, res) => {
  try {
    const universityName = req.user.universityName;

    const proposals = await Proposal.find({ universityName })
      .populate("team", "teamName members")
      .populate("challenge", "title district category priority status deadline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      message: "Proposals fetched successfully",
      proposals,
    });
  } catch (error) {
    console.error("Get proposals error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch proposals",
      error: error.message,
    });
  }
};

module.exports = {
  submitProposal,
  getMyProposals,
};
