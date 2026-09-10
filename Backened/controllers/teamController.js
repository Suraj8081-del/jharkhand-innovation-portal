const Team = require("../models/Team");
const Challenge = require("../models/Challenge");

// ----------------------------------------------------
// Create a team for an accepted challenge
// POST /api/teams
// ----------------------------------------------------
const createTeam = async (req, res) => {
  try {
    const { teamName, challengeId, members } = req.body;
    const universityName = req.user.universityName;

    if (!teamName || !challengeId) {
      return res.status(400).json({
        success: false,
        message: "Team name and challenge ID are required",
      });
    }

    // Verify that the challenge belongs to this university
    // and has already been accepted.
    const challenge = await Challenge.findOne({
      _id: challengeId,
      assignedUniversity: universityName,
      status: "accepted",
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message:
          "Accepted challenge not found or it is not assigned to your university",
      });
    }

    // One team per challenge for our first version
    const existingTeam = await Team.findOne({
      challenge: challengeId,
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: "A team has already been created for this challenge",
      });
    }

    const team = await Team.create({
      teamName,
      challenge: challengeId,
      universityName,
      members: members || [],
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    console.error("Create team error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid challenge ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to create team",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// Get all teams of logged-in university
// GET /api/teams
// ----------------------------------------------------
const getMyTeams = async (req, res) => {
  try {
    const universityName = req.user.universityName;

    const teams = await Team.find({
      universityName,
    })
      .populate("challenge", "title district category priority status deadline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      message: "Teams fetched successfully",
      teams,
    });
  } catch (error) {
    console.error("Get teams error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch teams",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// Add one faculty/student member to a team
// POST /api/teams/:id/members
// ----------------------------------------------------
const addTeamMember = async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    const universityName = req.user.universityName;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email and role are required",
      });
    }

    if (!["faculty", "student"].includes(role.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'faculty' or 'student'",
      });
    }

    // Sirf logged-in university ki team update ho sakti hai
    const team = await Team.findOne({
      _id: req.params.id,
      universityName,
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found or it does not belong to your university",
      });
    }

    // Same email ko duplicate add na karne do
    const memberAlreadyExists = team.members.some(
      (member) => member.email.toLowerCase() === email.toLowerCase()
    );

    if (memberAlreadyExists) {
      return res.status(409).json({
        success: false,
        message: "A member with this email already exists in the team",
      });
    }

    team.members.push({
      name,
      email,
      role: role.toLowerCase(),
      department: department || "",
    });

    await team.save();

    res.status(200).json({
      success: true,
      message: "Team member added successfully",
      team,
    });
  } catch (error) {
    console.error("Add team member error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to add team member",
      error: error.message,
    });
  }
};

module.exports = {
  createTeam,
  getMyTeams,
  addTeamMember,
};
