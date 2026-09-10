const Challenge = require("../models/Challenge");

// ----------------------------------------------------
// Create Challenge
// Temporary route for testing / adding challenges
// Later this will be used by Government/Admin dashboard
// ----------------------------------------------------
const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      district,
      priority,
      assignedUniversity,
      deadline,
    } = req.body;

    // Basic validation
    if (!title || !description || !district || !assignedUniversity) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, district and assignedUniversity are required",
      });
    }

    const challenge = await Challenge.create({
      title,
      description,
      category,
      district,
      priority,
      assignedUniversity,
      deadline,
    });

    res.status(201).json({
      success: true,
      message: "Challenge created and assigned successfully",
      challenge,
    });
  } catch (error) {
    console.error("Create challenge error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create challenge",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// Get challenges assigned to currently logged-in university
// GET /api/challenges/assigned
// ----------------------------------------------------
const getAssignedChallenges = async (req, res) => {
  try {
    // req.user authMiddleware se aa raha hai
    const universityName = req.user.universityName;

    if (!universityName) {
      return res.status(400).json({
        success: false,
        message: "University name is missing in your profile",
      });
    }

    const challenges = await Challenge.find({
      assignedUniversity: universityName,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      message: "Assigned challenges fetched successfully",
      challenges,
    });
  } catch (error) {
    console.error("Get assigned challenges error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch assigned challenges",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// Accept or Reject one assigned challenge
// PATCH /api/challenges/:id/respond
// body: { "action": "accept" }
// OR    { "action": "reject", "rejectionReason": "..." }
// ----------------------------------------------------
const respondToChallenge = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const universityName = req.user.universityName;

    // Only accept/reject allowed
    if (!action || !["accept", "reject"].includes(action.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Action must be either 'accept' or 'reject'",
      });
    }

    const challenge = await Challenge.findOne({
      _id: req.params.id,
      assignedUniversity: universityName,
    });

    // This also prevents one university from changing another university's challenge
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found or not assigned to your university",
      });
    }

    // A university should respond only once
    if (challenge.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: `This challenge has already been ${challenge.status}`,
      });
    }

    if (action.toLowerCase() === "accept") {
      challenge.status = "accepted";
      challenge.rejectionReason = "";
    }

    if (action.toLowerCase() === "reject") {
      challenge.status = "rejected";
      challenge.rejectionReason = rejectionReason || "No reason provided";
    }

    challenge.respondedAt = new Date();

    await challenge.save();

    res.status(200).json({
      success: true,
      message: `Challenge ${challenge.status} successfully`,
      challenge,
    });
  } catch (error) {
    console.error("Respond to challenge error:", error.message);

    // Invalid MongoDB ID ke case mein
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid challenge ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to update challenge response",
      error: error.message,
    });
  }
};

module.exports = {
  createChallenge,
  getAssignedChallenges,
  respondToChallenge,
};
