import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Search,
  Users,
  PlusSquare,
  UserRound,
  BriefcaseBusiness,
  FileCheck2,
  Bell,
  CircleHelp,
  LogOut,
  ChevronDown,
  Menu,
  Building2,
  Languages,
} from "lucide-react";
import "./Dashboard.css";



const API_BASE_URL = "http://localhost:5000/api";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [challenges, setChallenges] = useState([]);
  const [teams, setTeams] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


    //accepting challenges states
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [actionMessage, setActionMessage] = useState("");

    
    
    //team making states
    const [selectedTeamChallenge, setSelectedTeamChallenge] = useState(null);
    const [teamName, setTeamName] = useState("");
    const [teamMembers, setTeamMembers] = useState([
        {
            name: user?.name || "",
            email: user?.email || "",
            role: "Team Lead",
        },
    ]);
    const [teamLoading, setTeamLoading] = useState(false);

    //proposal of submitted challenges
    const [selectedProposalTeam, setSelectedProposalTeam] = useState(null);
    const [proposalTitle, setProposalTitle] = useState("");
    const [solutionSummary, setSolutionSummary] = useState("");
    const [detailedPlan, setDetailedPlan] = useState("");
    const [estimatedBudget, setEstimatedBudget] = useState("");
    const [estimatedTimelineMonths, setEstimatedTimelineMonths] = useState("");
    const [proposalLoading, setProposalLoading] = useState(false);
    const [proposalMessage, setProposalMessage] = useState("");

    // Milestone Modal states
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [milestoneLoading, setMilestoneLoading] = useState(false);
    const [milestoneForm, setMilestoneForm] = useState({
      milestoneTitle: "",
      status: "in-progress",
      completionPercentage: 0,
      description: "",
      evidenceLinks: "",
    });


    const [successMessage, setSuccessMessage] = useState("");



  // Har protected request mein JWT token jayega
  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Chaar APIs ek saath call ho rahi hain
      const [
        challengesResponse,
        teamsResponse,
        proposalsResponse,
        milestonesResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/challenges/assigned`, {
          headers: authHeaders,
        }),
        fetch(`${API_BASE_URL}/teams`, {
          headers: authHeaders,
        }),
        fetch(`${API_BASE_URL}/proposals/my`, {
          headers: authHeaders,
        }),
        fetch(`${API_BASE_URL}/milestones/my`, {
          headers: authHeaders,
        }),
      ]);

      const challengesData = await challengesResponse.json();
      const teamsData = await teamsResponse.json();
      const proposalsData = await proposalsResponse.json();
      const milestonesData = await milestonesResponse.json();

      // Token invalid/expired ho sakta hai
      if (
        challengesResponse.status === 401 ||
        teamsResponse.status === 401 ||
        proposalsResponse.status === 401 ||
        milestonesResponse.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        return;
      }

      // Koi API error de toh clear message show hoga
      if (
        !challengesResponse.ok ||
        !teamsResponse.ok ||
        !proposalsResponse.ok ||
        !milestonesResponse.ok
      ) {
        setError(
          challengesData.message ||
            teamsData.message ||
            proposalsData.message ||
            milestonesData.message ||
            "Unable to load dashboard data."
        );
        return;
      }

      setChallenges(challengesData.challenges || []);
      setTeams(teamsData.teams || []);
      setProposals(proposalsData.proposals || []);
      setMilestones(milestonesData.milestoneUpdates || []);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      setError(
        "Unable to connect to the backend. Check that your backend server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);
  


  //inserting responding Chanllenges
  const respondToChallenge = async (challengeId, action, rejectionReason = "") => {
  try {
    setActionLoadingId(challengeId);
    setActionMessage("");

    if (action === "reject" && !rejectionReason.trim()) {
      setActionMessage("Please enter a reason before rejecting the challenge.");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/challenges/${challengeId}/respond`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          rejectionReason,
        }),
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
      return;
    }

    if (!response.ok || !data.success) {
      setActionMessage(data.message || "Unable to update the challenge.");
      return;
    }

    setActionMessage(data.message || `Challenge ${action}ed successfully.`);

    // Modal close and input reset
    setSelectedChallenge(null);
    setRejectReason("");

    // Live API data dobara load hoga, so status immediately update dikhega
    await loadDashboardData();
  } catch (error) {
    console.error("Challenge response error:", error);
    setActionMessage(
      "Unable to connect to the backend. Please check your server."
    );
  } finally {
    setActionLoadingId(null);
  }
};

const handleAccept = (challengeId) => {
  const confirmAccept = window.confirm(
    "Are you sure you want to accept this challenge?"
  );

  if (confirmAccept) {
    respondToChallenge(challengeId, "accept");
  }
};

const handleRejectSubmit = (event) => {
  event.preventDefault();

  if (!selectedChallenge) return;

  respondToChallenge(selectedChallenge._id, "reject", rejectReason);
};




//create team handle team
const openCreateTeamModal = (challenge) => {
  setSelectedTeamChallenge(challenge);
  setTeamName("");
  setTeamMembers([
    {
      name: user?.name || "",
      email: user?.email || "",
      role: "Team Lead",
    },
  ]);
  setActionMessage("");
};

const closeCreateTeamModal = () => {
  if (teamLoading) return;

  setSelectedTeamChallenge(null);
  setTeamName("");
  setTeamMembers([]);
};

const handleMemberChange = (index, field, value) => {
  const updatedMembers = [...teamMembers];
  updatedMembers[index][field] = value;
  setTeamMembers(updatedMembers);
};

const addTeamMemberField = () => {
  setTeamMembers([
    ...teamMembers,
    {
      name: "",
      email: "",
      role: "Member",
    },
  ]);
};

const removeTeamMemberField = (index) => {
  // Kam se kam ek member hona zaroori hai
  if (teamMembers.length === 1) {
    setActionMessage("A team must have at least one member.");
    return;
  }

  const updatedMembers = teamMembers.filter(
    (_, memberIndex) => memberIndex !== index
  );

  setTeamMembers(updatedMembers);
};

const handleCreateTeam = async (event) => {
  event.preventDefault();

  if (!selectedTeamChallenge) return;

  if (!teamName.trim()) {
    setActionMessage("Please enter a team name.");
    return;
  }

  const hasIncompleteMember = teamMembers.some(
    (member) =>
      !member.name.trim() || !member.email.trim() || !member.role.trim()
  );

  if (hasIncompleteMember) {
    setActionMessage("Please fill name, email, and role for every team member.");
    return;
  }

  try {
    setTeamLoading(true);
    setActionMessage("");

    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        teamName: teamName.trim(),
        challengeId: selectedTeamChallenge._id,
        members: teamMembers,
      }),
    });

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
      return;
    }

    if (!response.ok || !data.success) {
      setActionMessage(data.message || "Unable to create the team.");
      return;
    }

    setActionMessage(data.message || "Team created successfully.");
    closeCreateTeamModal();

    // Nayi team turant My Teams section mein show hogi
    await loadDashboardData();
  } catch (error) {
    console.error("Create team error:", error);
    setActionMessage(
      "Unable to connect to the backend. Please check your server."
    );
  } finally {
    setTeamLoading(false);
  }
};


  // Proposal modal open karne ke liye
const openProposalModal = (team) => {
  if (!team.challenge?._id) {
    setActionMessage(
      "This team is not linked to a challenge, so a proposal cannot be submitted."
    );
    return;
  }

  setSelectedProposalTeam(team);

  // Form fields ko fresh/empty rakhenge
  setProposalTitle("");
  setSolutionSummary("");
  setDetailedPlan("");
  setEstimatedBudget("");
  setEstimatedTimelineMonths("");
  setProposalMessage("");
};


// Proposal modal band karne ke liye
const closeProposalModal = () => {
  if (proposalLoading) return;

  setSelectedProposalTeam(null);
  setProposalMessage("");
};





const handleSubmitProposal = async (event) => {
  event.preventDefault();

  if (!selectedProposalTeam) return;

  // Form validation
  if (!proposalTitle.trim()) {
    setProposalMessage("Please enter a proposal title.");
    return;
  }

  if (!solutionSummary.trim()) {
    setProposalMessage("Please enter a solution summary.");
    return;
  }

  if (!detailedPlan.trim()) {
    setProposalMessage("Please enter a detailed plan.");
    return;
  }

  if (!estimatedBudget || Number(estimatedBudget) <= 0) {
    setProposalMessage("Please enter a valid estimated budget.");
    return;
  }

  if (
    !estimatedTimelineMonths ||
    Number(estimatedTimelineMonths) <= 0
  ) {
    setProposalMessage("Timeline must be at least 1 month.");
    return;
  }

  try {
    setProposalLoading(true);
    setProposalMessage("");

    const response = await fetch(`${API_BASE_URL}/proposals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: proposalTitle.trim(),
        solutionSummary: solutionSummary.trim(),
        detailedPlan: detailedPlan.trim(),
        estimatedBudget: Number(estimatedBudget),
        estimatedTimelineMonths: Number(estimatedTimelineMonths),
        teamId: selectedProposalTeam._id,
        challengeId: selectedProposalTeam.challenge._id,
      }),
    });

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
      return;
    }

    if (!response.ok || !data.success) {
      setProposalMessage(data.message || "Unable to submit proposal.");
      return;
    }

    closeProposalModal();

    setActionMessage(
      data.message || "Proposal submitted successfully and sent for review."
    );

    // My Proposals list aur count turant update honge
    await loadDashboardData();
  } catch (error) {
    console.error("Proposal submission error:", error);

    setProposalMessage(
      "Unable to connect to the backend. Please check your server."
    );
  } finally {
    setProposalLoading(false);
  }
};




      // Open Milestone Modal
  const openMilestoneModal = (proposal) => {
    setSelectedProposal(proposal);
    setMilestoneForm({
      milestoneTitle: "",
      status: "on-track",
      completionPercentage: 0,
      description: "",
      evidenceLinks: "",
    });
    setIsMilestoneModalOpen(true);
  };

  // Close Milestone Modal
  const closeMilestoneModal = () => {
    setIsMilestoneModalOpen(false);
    setSelectedProposal(null);
  };

  // Submit Milestone Update
  const handleSubmitMilestone = async (e) => {
    e.preventDefault();

    if (!milestoneForm.milestoneTitle.trim() || !milestoneForm.description.trim()) {
      setError("Milestone title and description are required.");
      return;
    }

    const percentage = Number(milestoneForm.completionPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError("Completion percentage must be between 0 and 100.");
      return;
    }

    try {
      setMilestoneLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const evidenceArray = milestoneForm.evidenceLinks
        ? milestoneForm.evidenceLinks.split(",").map((link) => link.trim()).filter(Boolean)
        : [];

      const res = await fetch("http://localhost:5000/api/milestones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proposalId: selectedProposal._id,
          milestoneTitle: milestoneForm.milestoneTitle.trim(),
          status: milestoneForm.status,
          completionPercentage: percentage,
          description: milestoneForm.description.trim(),
          evidenceLinks: evidenceArray,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage("Milestone update submitted successfully!");
        closeMilestoneModal();
        window.location.reload();
      } else {
        setError(data.message || "Failed to submit milestone");
      }
      } catch (err) {
        console.error("Actual Milestone Error:", err); // 👈 Ye line add karo
        setError(err.message || "Network error while submitting milestone"); // 👈 err.message dikhao
      } finally {
        setMilestoneLoading(false);
      }

  };

  


  

  const scrollToSection = (sectionId) => {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};




  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Accepted challenges count
  const acceptedChallenges = challenges.filter(
    (challenge) => challenge.status === "accepted"
  ).length;

  // Approved proposals count
  const approvedProposals = proposals.filter(
    (proposal) => proposal.status === "approved"
  ).length;

  // Latest milestone overall progress ke liye
  const latestMilestone = milestones.length > 0 ? milestones[0] : null;

  return (

 <div className="dashboard-layout">
  <aside className="sidebar">

      <div className="logo-section">
        <div className="logo-icon">🌿</div>

        <div>
            <h2 className="logo-title">

            Jharkhand Societal
            <br />
            Innovation Collabor...
          </h2>
        </div>
      </div>

       <nav style={styles.nav}>
        {/* 1. Dashboard */}
        <button 
            type="button" 
            className="dash-nav-btn active"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <LayoutDashboard size={21} />
          <span>Dashboard</span>
        </button>

        <button 
          style={styles.navItem}
          className="dash-nav-btn" 
          onClick={() => navigate("/assigned-challenges")}
        >
          <Building2 size={21} />
          <span>Assigned Challenges</span>
        </button>

        <button 
          type="button" 
          style={styles.navItem}
          className="dash-nav-btn"
          onClick={() => navigate("/assigned-challenges")}
        >
          <Search size={21} />
          <span>Explore Challenges</span>
        </button>


        {/* 4. My Teams */}
        <button 
          type="button" 
          style={styles.navItem}
          className="dash-nav-btn"
          onClick={() => scrollToSection("my-teams-section")}
        >
          <Users size={21} />
          <span>My Teams</span>
        </button>

        {/* 5. Create Team */}
        <button 
          type="button" 
          className="dash-nav-btn"
          style={styles.navItem}
          onClick={() => {
            const accepted = challenges.find((c) => c.status === "accepted");
            if (accepted) {
              openTeamModal(accepted._id);
            } else {
              alert("Pehele ek challenge accept karein tabhi team create kar sakte hain.");
              navigate("/assigned-challenges");
            }
          }}
        >
          <PlusSquare size={21} />
          <span>Create Team</span>
        </button>

       {/* 6. Faculty Mentors */}
        <button 
          type="button" 
          className="dash-nav-btn"
          style={styles.navItem}
          onClick={() => alert(`Department of ${user?.department || "Engineering"} Faculty Mentors: \n1. Dr. R. K. Singh (Advisor)\n2. Prof. Anita Sharma (Technical Lead)`)}
        >
          <UserRound size={21} />
          <span>Faculty Mentors</span>
        </button>
      
      
        <button
            onClick={() => navigate("/government-dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "10px 14px",
              marginTop: "16px",
              backgroundColor: "#134e4a", // dark teal contrast
              color: "#a7f3d0",
              border: "1px dashed #2dd4bf",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            🏛️ Switch to Govt Portal
          </button>




         {/* 7. Submit Proposal */}
        <button 
          type="button" 
          className="dash-nav-btn"
          style={styles.navItem}
          onClick={() => scrollToSection("my-proposals-section")}
        >
          <FileCheck2 size={21} />
          <span>Submit Proposal</span>
        </button>

        {/* 8. Notifications */}
        <button 
          type="button" 
          className="dash-nav-btn"
          style={styles.navItem}
          onClick={() => alert(`🔔 Notifications:\n• New Challenge assigned: Smart Water System\n• Proposal #1 Approved by Government\n• Milestone review pending`)}
        >
          <Bell size={21} />
          <span>Notifications</span>
          <span style={styles.notificationCount}>3</span>
        </button>

        {/* 9. Profile */}
        <button 
          type="button" 
          className="dash-nav-btn"
          style={styles.navItem}
          onClick={() => alert(`👤 User Profile:\nName: ${user?.name || "BIT Mesra Lead"}\nEmail: ${user?.email || "bitmesra@jharkhand.edu"}\nRole: ${user?.role || "University"}\nDepartment: ${user?.department || "Computer Science & Water Tech"}`)}
        >
          <UserRound size={21} />
          <span>Profile</span>
        </button>
      </nav>

      <div className="sidebar-bottom">

        <div style={styles.languageBox}>
          <div>
            <p style={styles.languageLabel}>Switch Language:</p>
            <p style={styles.languageText}>English / हिन्दी / বাংলা</p>
          </div>

          <div style={styles.switchTrack}>
            <div style={styles.switchCircle} />
          </div>
        </div>

        <button onClick={handleLogout} style={styles.sidebarLogoutButton}>
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>

    {/* MAIN AREA */}
    <main className="main-area">
      {/* TOP HEADER */}
       <header className="top-header">
        <div style={styles.headerTitleArea}>
          <div style={styles.mobileMenu}>
            <Menu size={22} />
          </div>

          <div>
            <h1 style={styles.dashboardTitle}>University Dashboard</h1>

            <div style={styles.universityLine}>
              <Building2 size={17} />
              <span>{user?.universityName || "BIT Mesra"}</span>
              <span style={styles.verifiedDot}>✓</span>
            </div>
          </div>
        </div>

        <div style={styles.topHeaderRight}>
          <div style={styles.searchBox}>
            <Search size={19} color="#94a3b8" />
           <input
                type="text"
                placeholder="Search challenges, projects, teams..."
                className="search-input"
            />

          </div>

          <button style={styles.headerIconButton}>
            <CircleHelp size={25} />
          </button>

          <button style={{ ...styles.headerIconButton, position: "relative" }}>
            <Bell size={25} />
            <span style={styles.bellNotification}>3</span>
          </button>

          <div className="profile-box">
              <div className="profile-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div style={styles.profileText}>
              <p style={styles.profileName}>{user?.name || "Dr. Anjali Sharma"}</p>
              <p style={styles.profileRole}>Faculty Coordinator</p>
            </div>

            <ChevronDown size={18} color="#64748b" />
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <div style={styles.pageContent}>
        {error && (
          <div style={styles.errorBox}>
            <strong>Unable to load dashboard:</strong> {error}
          </div>
        )}

        {actionMessage && (
          <div
            style={{
              ...styles.actionMessage,
              background: actionMessage.toLowerCase().includes("successfully")
                ? "#dcfce7"
                : "#fee2e2",
              color: actionMessage.toLowerCase().includes("successfully")
                ? "#166534"
                : "#991b1b",
              borderColor: actionMessage.toLowerCase().includes("successfully")
                ? "#bbf7d0"
                : "#fecaca",
            }}
          >
            {actionMessage}
          </div>
        )}

          {/* Welcome Hero Banner */}
          <div className="dash-hero-banner">
            <div className="dash-hero-content">
              <div className="dash-hero-badge">🎓 Higher Education Innovation Portal</div>
              <h1 className="dash-hero-title">Welcome back, {user.universityName || "BIT Mesra"}</h1>
              <p className="dash-hero-desc">
                Track assigned societal challenges, manage departmental research teams, and monitor verified field milestones.
              </p>
            </div>
            <div className="dash-hero-actions">
              <button
                onClick={() => navigate("/government")}
                className="dash-hero-btn dash-hero-btn-ghost"
              >
                🏛️ Switch to Govt Portal
              </button>
            </div>
          </div>

          {/* 4 Wired Stat Cards Grid */}
          <div className="dash-stats-grid">
            {/* Card 1: Assigned Challenges */}
            <div className="dash-stat-card border-teal">
              <div className="dash-stat-top">
                <span className="dash-stat-label">Assigned Challenges</span>
                <div className="dash-stat-icon-wrapper bg-teal-soft text-teal">
                  🎯
                </div>
              </div>
              <div className="dash-stat-value">{challenges?.length || 0}</div>
              <div className="dash-stat-footer">
                <span className="dash-stat-tag tag-amber">
                  {challenges?.filter((c) => c.status === "assigned").length || 0} Pending Action
                </span>
                <span className="dash-stat-subtext">Assigned by State</span>
              </div>
            </div>

            {/* Card 2: Active Teams */}
            <div className="dash-stat-card border-blue">
              <div className="dash-stat-top">
                <span className="dash-stat-label">Active Teams</span>
                <div className="dash-stat-icon-wrapper bg-blue-soft text-blue">
                  👥
                </div>
              </div>
              <div className="dash-stat-value">{teams?.length || 0}</div>
              <div className="dash-stat-footer">
                <span className="dash-stat-tag tag-blue">
                  {teams?.reduce((acc, t) => acc + (t.members?.length || 0), 0)} Total Members
                </span>
                <span className="dash-stat-subtext">Formed Solutions</span>
              </div>
            </div>

            {/* Card 3: Submitted Proposals */}
            <div className="dash-stat-card border-amber">
              <div className="dash-stat-top">
                <span className="dash-stat-label">Submitted Proposals</span>
                <div className="dash-stat-icon-wrapper bg-amber-soft text-amber">
                  📑
                </div>
              </div>
              <div className="dash-stat-value">{proposals?.length || 0}</div>
              <div className="dash-stat-footer">
                <span className="dash-stat-tag tag-green">
                  {proposals?.filter((p) => p.status === "approved").length || 0} Approved
                </span>
                <span className="dash-stat-subtext">
                  {proposals?.filter((p) => p.status === "rejected").length || 0} Rejected
                </span>
              </div>
            </div>

            {/* Card 4: Milestones & Progress */}
            <div className="dash-stat-card border-green">
              <div className="dash-stat-top">
                <span className="dash-stat-label">Milestone Updates</span>
                <div className="dash-stat-icon-wrapper bg-green-soft text-green">
                  ⚡
                </div>
              </div>
              <div className="dash-stat-value">{milestones?.length || 0}</div>
              <div className="dash-stat-footer">
                <span className="dash-stat-tag tag-emerald">
                  {milestones?.length > 0
                    ? `${Math.round(
                        milestones.reduce((acc, m) => acc + (Number(m.completionPercentage) || 0), 0) /
                          milestones.length
                      )}% Avg Progress`
                    : "0% Progress"}
                </span>
                <span className="dash-stat-subtext">Verified Submissions</span>
              </div>
            </div>
          </div>


        {loading ? (
          <div style={styles.loadingBox}>Loading your live dashboard data...</div>
        ) : (
          <>

            {/* Abhi ke liye tumhara existing content grid same rakho */}
            <section style={styles.contentGrid}>
              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Assigned Challenges</h2>
                  <span style={styles.countBadge}>{challenges.length}</span>
                </div>

                {challenges.length === 0 ? (
                  <EmptyState text="No challenges are assigned to your university yet." />
                ) : (
                  <>
                    {challenges.slice(0, 3).map((challenge) => (
                      <div style={styles.challengeItem} key={challenge._id}>
                        <div style={styles.listItem}>
                          <div>
                            <h3 style={styles.itemTitle}>{challenge.title}</h3>
                            <p style={styles.itemInfo}>
                              {challenge.district} · {challenge.category} · Priority: {challenge.priority}
                            </p>
                          </div>
                          <StatusBadge status={challenge.status} />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => navigate("/assigned-challenges")}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "12px",
                        background: "#f0fdfa",
                        color: "#0d9488",
                        border: "1px solid #ccfbf1",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      View All & Manage Challenges →
                    </button>
                  </>
                )}
              </div>


              <div style={styles.sectionCard} id="my-teams-section">

                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>My Teams</h2>
                  <span style={styles.countBadge}>{teams.length}</span>
                </div>

                {teams.length === 0 ? (
                  <EmptyState text="Create a team after accepting a challenge." />
                ) : (
                  teams.slice(0, 4).map((team) => (
                    <div style={styles.listItem} key={team._id}>
                      <div>
                        <h3 style={styles.itemTitle}>{team.teamName}</h3>
                        <p style={styles.itemInfo}>
                          {team.members?.length || 0} members ·{" "}
                          {team.challenge?.title || "Challenge unavailable"}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <StatusBadge status={team.status} />

                        <button
                          type="button"
                          onClick={() => openProposalModal(team)}
                          style={styles.submitProposalButton}
                        >
                          Submit Proposal
                        </button>
                    </div>

                    </div>
                  ))
                )}
              </div>

              <div style={styles.sectionCard} id="my-proposals-section">
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>My Proposals</h2>
                  <span style={styles.countBadge}>{proposals.length}</span>
                </div>



                    {proposals.length === 0 ? (
                      <EmptyState text="No proposal has been submitted yet." />
                    ) : (
                      proposals.slice(0, 4).map((proposal) => (
                        <div style={styles.listItem} key={proposal._id}>
                          <div>
                            <h3 style={styles.itemTitle}>{proposal.title}</h3>
                            <p style={styles.itemInfo}>
                              ₹{proposal.estimatedBudget?.toLocaleString("en-IN")} ·{" "}
                              {proposal.estimatedTimelineMonths} months
                            </p>

                            {/* Milestone Action Button / Status Tag */}
                            {proposal.status === "approved" ? (
                              <button
                                onClick={() => openMilestoneModal(proposal)}
                                style={{
                                  marginTop: "8px",
                                  backgroundColor: "#0f766e",
                                  color: "#fff",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  fontWeight: "500",
                                }}
                              >
                                + Add Milestone Update
                              </button>
                            ) : (
                              <span
                                style={{
                                  marginTop: "8px",
                                  display: "inline-block",
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  backgroundColor: "#f3f4f6",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                }}
                              >
                                Pending Govt Approval
                              </span>
                            )}
                          </div>
                          <StatusBadge status={proposal.status} />
                        </div>
                      ))
                    )}

              </div>

              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Recent Milestones</h2>
                  <span style={styles.countBadge}>{milestones.length}</span>
                </div>

                {milestones.length === 0 ? (
                  <EmptyState text="No milestone update submitted yet." />
                ) : (
                  milestones.slice(0, 4).map((milestone) => (
                    <div style={styles.milestoneItem} key={milestone._id}>
                      <div style={styles.progressTop}>
                        <div>
                          <h3 style={styles.itemTitle}>
                            {milestone.milestoneTitle}
                          </h3>
                          <p style={styles.itemInfo}>
                            {milestone.challenge?.title || "Linked challenge"}
                          </p>
                        </div>

                        <span style={styles.progressText}>
                          {milestone.completionPercentage}%
                        </span>
                      </div>

                      <div style={styles.progressBackground}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${milestone.completionPercentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}


                {selectedTeamChallenge && (
          <div style={styles.modalOverlay}>
            <div style={styles.teamModal}>
              <div style={styles.teamModalHeader}>
                <div>
                  <h2 style={styles.teamModalTitle}>Create Team</h2>

                  <p style={styles.teamModalText}>
                    Challenge: <strong>{selectedTeamChallenge.title}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCreateTeamModal}
                  style={styles.closeModalButton}
                  disabled={teamLoading}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateTeam}>
                <label style={styles.formLabel}>Team Name</label>

                <input
                  type="text"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  placeholder="Example: BIT Water Innovation Team"
                  style={styles.formInput}
                  disabled={teamLoading}
                />

                <div style={styles.membersHeading}>
                  <h3 style={styles.membersTitle}>Team Members</h3>

                  <button
                    type="button"
                    onClick={addTeamMemberField}
                    style={styles.addMemberButton}
                    disabled={teamLoading}
                  >
                    + Add Member
                  </button>
                </div>

                {teamMembers.map((member, index) => (
                  <div style={styles.memberFormCard} key={index}>
                    <div style={styles.memberCardTop}>
                      <p style={styles.memberNumber}>Member {index + 1}</p>

                      {teamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTeamMemberField(index)}
                          style={styles.removeMemberButton}
                          disabled={teamLoading}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={member.name}
                      onChange={(event) =>
                        handleMemberChange(index, "name", event.target.value)
                      }
                      placeholder="Member name"
                      style={styles.formInput}
                      disabled={teamLoading}
                    />

                    <input
                      type="email"
                      value={member.email}
                      onChange={(event) =>
                        handleMemberChange(index, "email", event.target.value)
                      }
                      placeholder="Member email"
                      style={styles.formInput}
                      disabled={teamLoading}
                    />

                    <select
                      value={member.role}
                      onChange={(event) =>
                        handleMemberChange(index, "role", event.target.value)
                      }
                      style={styles.formInput}
                      disabled={teamLoading}
                    >
                      <option value="Team Lead">Team Lead</option>
                      <option value="Member">Member</option>
                      <option value="Faculty Mentor">Faculty Mentor</option>
                      <option value="Researcher">Researcher</option>
                    </select>
                  </div>
                ))}

                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={closeCreateTeamModal}
                    style={styles.cancelButton}
                    disabled={teamLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={styles.createTeamSubmitButton}
                    disabled={teamLoading}
                  >
                    {teamLoading ? "Creating Team..." : "Create Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}



{/* 
                    YAHAN SE PROPOSAL MODAL  */}
            {selectedProposalTeam && (
              <div style={styles.modalOverlay}>
                <div style={styles.teamModal}>
                  <h2 style={styles.teamModalTitle}>Submit Proposal</h2>

                  <p style={styles.teamModalText}>
                    Team: <strong>{selectedProposalTeam.teamName}</strong>
                    <br />
                    Challenge:{" "}
                    <strong>
                      {selectedProposalTeam.challenge?.title || "Linked challenge"}
                    </strong>
                  </p>

                  {/* YEH FORM YAHAN HAI */}
                  <form onSubmit={handleSubmitProposal}>
                    <label style={styles.formLabel}>Proposal Title</label>
                    <input
                      type="text"
                      value={proposalTitle}
                      onChange={(event) => setProposalTitle(event.target.value)}
                      placeholder="Example: Solar Water Purification System"
                      style={styles.formInput}
                      disabled={proposalLoading}
                    />

                    <label style={styles.formLabel}>Solution Summary</label>
                    <textarea
                      value={solutionSummary}
                      onChange={(event) => setSolutionSummary(event.target.value)}
                      placeholder="Briefly explain your proposed solution."
                      style={styles.rejectTextarea}
                      rows="3"
                      disabled={proposalLoading}
                    />

                    <label style={styles.formLabel}>Detailed Implementation Plan</label>
                    <textarea
                      value={detailedPlan}
                      onChange={(event) => setDetailedPlan(event.target.value)}
                      placeholder="Explain the steps, technology, work plan, and expected outcome."
                      style={styles.rejectTextarea}
                      rows="5"
                      disabled={proposalLoading}
                    />

                    <label style={styles.formLabel}>Estimated Budget (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={estimatedBudget}
                      onChange={(event) => setEstimatedBudget(event.target.value)}
                      placeholder="Example: 250000"
                      style={styles.formInput}
                      disabled={proposalLoading}
                    />

                    <label style={styles.formLabel}>Estimated Timeline (Months)</label>
                    <input
                      type="number"
                      min="1"
                      value={estimatedTimelineMonths}
                      onChange={(event) =>
                        setEstimatedTimelineMonths(event.target.value)
                      }
                      placeholder="Example: 6"
                      style={styles.formInput}
                      disabled={proposalLoading}
                    />

                    {proposalMessage && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "10px",
                          borderRadius: "7px",
                          background: "#fee2e2",
                          color: "#b91c1c",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        {proposalMessage}
                      </div>
                    )}

                    <div style={styles.modalActions}>
                      <button
                        type="button"
                        onClick={closeProposalModal}
                        style={styles.cancelButton}
                        disabled={proposalLoading}
                      >
                        Cancel
                      </button>

                      {/* ACTUAL SUBMIT BUTTON */}
                      <button
                        type="submit"
                        style={styles.createTeamSubmitButton}
                        disabled={proposalLoading}
                      >
                        {proposalLoading ? "Submitting..." : "Submit Proposal"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* PROPOSAL MODAL YAHAN KHATAM */}


                      {/* 👇 YAHAN SE MILESTONE MODAL SHURU */}
                      {isMilestoneModalOpen && selectedProposal && (
                        <div style={styles.modalOverlay}>
                          <div style={styles.modalContent}>
                            <h3>Submit Milestone Update</h3>
                            <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "16px" }}>
                              Proposal: <strong>{selectedProposal.title}</strong>
                            </p>

                            <form onSubmit={handleSubmitMilestone}>
                              <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>Milestone Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={milestoneForm.milestoneTitle}
                                  onChange={(e) => setMilestoneForm({ ...milestoneForm, milestoneTitle: e.target.value })}
                                  placeholder="e.g. IoT Sensor Calibration Completed"
                                  style={styles.inputField}
                                />
                              </div>

                              <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>Status *</label>
                                <select
                                  value={milestoneForm.status}
                                  onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                                  style={styles.inputField}
                                >
                                  <option value="on-track">on-track</option>
                                  <option value="completed">Completed</option>
                                  <option value="delayed">Delayed</option>
                                </select>
                              </div>

                              <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>
                                  Completion Percentage ({milestoneForm.completionPercentage}%) *
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  required
                                  value={milestoneForm.completionPercentage}
                                  onChange={(e) => setMilestoneForm({ ...milestoneForm, completionPercentage: e.target.value })}
                                  style={styles.inputField}
                                />
                              </div>

                              <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>Work Description *</label>
                                <textarea
                                  rows="3"
                                  required
                                  value={milestoneForm.description}
                                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                                  placeholder="Detail what tasks were completed..."
                                  style={{ ...styles.inputField, resize: "vertical" }}
                                />
                              </div>

                              <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}>Evidence Links (comma-separated)</label>
                                <input
                                  type="text"
                                  value={milestoneForm.evidenceLinks}
                                  onChange={(e) => setMilestoneForm({ ...milestoneForm, evidenceLinks: e.target.value })}
                                  placeholder="https://github.com/..., https://drive.google.com/..."
                                  style={styles.inputField}
                                />
                              </div>

                              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button
                                  type="button"
                                  onClick={closeMilestoneModal}
                                  disabled={milestoneLoading}
                                  style={{ ...styles.actionBtn, backgroundColor: "#9ca3af" }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={milestoneLoading}
                                  style={{ ...styles.actionBtn, backgroundColor: "#0f766e" }}
                                >
                                  {milestoneLoading ? "Submitting..." : "Submit Milestone"}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                      {/* 👆 YAHAN KHATAM */}

                    </div>
                  </main>
                </div>
              );
          }



function StatCard({ title, value, description, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <p style={styles.statTitle}>{title}</p>
      <h2 style={{ ...styles.statValue, color }}>{value}</h2>
      <p style={styles.statDescription}>{description}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return <p style={styles.emptyText}>{text}</p>;
}

function StatusBadge({ status }) {
  const colors = {
    assigned: { background: "#dbeafe", color: "#1d4ed8" },
    accepted: { background: "#dcfce7", color: "#15803d" },
    rejected: { background: "#fee2e2", color: "#b91c1c" },
    active: { background: "#dcfce7", color: "#15803d" },
    inactive: { background: "#f1f5f9", color: "#475569" },
    submitted: { background: "#fef3c7", color: "#a16207" },
    "under-review": { background: "#e0e7ff", color: "#4338ca" },
    approved: { background: "#dcfce7", color: "#15803d" },
    "on-track": { background: "#dcfce7", color: "#15803d" },
    delayed: { background: "#fee2e2", color: "#b91c1c" },
    completed: { background: "#dbeafe", color: "#1d4ed8" },
  };

  const style = colors[status] || {
    background: "#f1f5f9",
    color: "#475569",
  };

  return (
    <span
      style={{
        ...styles.statusBadge,
        background: style.background,
        color: style.color,
      }}
    >
      {status || "unknown"}
    </span>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    padding: "32px",
    fontFamily: "Arial, sans-serif",
    color: "#1e293b",
  },

  header: {
    maxWidth: "1200px",
    margin: "0 auto 28px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
  },

  portalName: {
    color: "#166534",
    fontWeight: "700",
    margin: "0 0 6px",
    fontSize: "14px",
  },

  heading: {
    margin: "0",
    fontSize: "30px",
    color: "#0f172a",
  },

  welcomeText: {
    color: "#64748b",
    margin: "8px 0 0",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
  },

  refreshButton: {
    border: "1px solid #cbd5e1",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#ffffff",
    color: "#334155",
    fontWeight: "600",
  },

  logoutButton: {
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#b91c1c",
    color: "#ffffff",
    fontWeight: "600",
  },

  errorBox: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    padding: "14px",
    color: "#991b1b",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
  },

  loadingBox: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "28px",
    background: "#ffffff",
    borderRadius: "12px",
    textAlign: "center",
    color: "#64748b",
  },

  statsGrid: {
    maxWidth: "1200px",
    margin: "0 auto 24px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
  },

  statCard: {
    padding: "20px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)",
  },

  statTitle: {
    margin: "0",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },

  statValue: {
    margin: "12px 0 5px",
    fontSize: "31px",
  },

  statDescription: {
    margin: "0",
    color: "#94a3b8",
    fontSize: "13px",
  },

  contentGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "20px",
  },

  sectionCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "13px",
    marginBottom: "4px",
  },

  sectionTitle: {
    margin: "0",
    fontSize: "18px",
    color: "#0f172a",
  },

  countBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "13px",
    fontWeight: "700",
  },

  listItem: {
    padding: "15px 0",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
  },

  itemTitle: {
    margin: "0 0 6px",
    fontSize: "15px",
    lineHeight: "1.35",
    color: "#1e293b",
  },

  itemInfo: {
    margin: "0",
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.45",
  },

  statusBadge: {
    padding: "5px 9px",
    whiteSpace: "nowrap",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
  },

  emptyText: {
    margin: "20px 0 8px",
    color: "#94a3b8",
    fontSize: "14px",
  },

  milestoneItem: {
    padding: "15px 0",
    borderBottom: "1px solid #f1f5f9",
  },

  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },

  progressText: {
    fontWeight: "700",
    color: "#166534",
    fontSize: "15px",
  },

  progressBackground: {
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "20px",
    overflow: "hidden",
    marginTop: "12px",
  },

  progressFill: {
    height: "100%",
    background: "#16a34a",
    borderRadius: "20px",
  },

  milestoneFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
    gap: "10px",
  },

  evidenceText: {
    color: "#64748b",
    fontSize: "12px",
  },



    actionMessage: {
        maxWidth: "1200px",
        margin: "0 auto 20px",
        padding: "14px",
        border: "1px solid",
        borderRadius: "10px",
        fontWeight: "600",
    },

    challengeItem: {
        padding: "15px 0",
        borderBottom: "1px solid #f1f5f9",
    },

    challengeActions: {
        display: "flex",
        gap: "10px",
        marginTop: "4px",
    },

    acceptButton: {
        border: "none",
        borderRadius: "7px",
        padding: "8px 13px",
        background: "#15803d",
        color: "#ffffff",
        fontWeight: "700",
        cursor: "pointer",
    },

    rejectButton: {
        border: "1px solid #fecaca",
        borderRadius: "7px",
        padding: "8px 13px",
        background: "#ffffff",
        color: "#b91c1c",
        fontWeight: "700",
        cursor: "pointer",
    },

    modalOverlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000,
    },

    modal: {
        width: "100%",
        maxWidth: "460px",
        background: "#ffffff",
        borderRadius: "14px",
        padding: "24px",
        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.25)",
    },

    modalTitle: {
        margin: "0 0 12px",
        color: "#991b1b",
        fontSize: "21px",
    },

    modalText: {
        margin: "0 0 16px",
        color: "#475569",
        lineHeight: "1.5",
    },

    rejectTextarea: {
        width: "100%",
        boxSizing: "border-box",
        resize: "vertical",
        padding: "11px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
    },

    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "16px",
    },

    cancelButton: {
        border: "1px solid #cbd5e1",
        borderRadius: "7px",
        padding: "9px 14px",
        background: "#ffffff",
        color: "#334155",
        fontWeight: "700",
        cursor: "pointer",
    },

    confirmRejectButton: {
        border: "none",
        borderRadius: "7px",
        padding: "9px 14px",
        background: "#b91c1c",
        color: "#ffffff",
        fontWeight: "700",
        cursor: "pointer",
    },

        dashboardLayout: {
    minHeight: "100vh",
    display: "flex",
    background: "#f5f9fb",
    fontFamily: "Arial, sans-serif",
    color: "#1e293b",
    },

    sidebar: {
        width: "278px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        background:
            "linear-gradient(180deg, #06344b 0%, #04283d 55%, #021d31 100%)",
        color: "#ffffff",
        zIndex: 10,

        // Zoom ya chhoti screen par sidebar ke andar scroll enable hoga
        overflowY: "auto",
        overflowX: "hidden",
    },


    logoSection: {
    minHeight: "83px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.13)",
    },

    logoIcon: {
    width: "40px",
    height: "40px",
    display: "grid",
    placeItems: "center",
    fontSize: "28px",
    borderRadius: "9px",
    background: "rgba(16, 185, 129, 0.18)",
    },

    logoTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "1.35",
    fontWeight: "700",
    color: "#ffffff",
    },

    sidebarNav: {
    padding: "17px 13px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    },

    navItem: {
    width: "100%",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "13px 15px",
    boxSizing: "border-box",
    color: "#e2edf3",
    background: "transparent",
    borderRadius: "9px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "15px",
    },

    activeNavItem: {
    color: "#ffffff",
    fontWeight: "700",
    background: "linear-gradient(90deg, #11ae83, #078a70)",
    boxShadow: "0 5px 12px rgba(0, 0, 0, 0.16)",
    },

    notificationCount: {
    minWidth: "21px",
    height: "21px",
    display: "grid",
    placeItems: "center",
    marginLeft: "auto",
    borderRadius: "50%",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "700",
    },

    sidebarBottom: {
        marginTop: "auto",
        padding: "18px 22px 24px",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        flexShrink: 0,
    },


    languageBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "20px",
    },

    languageLabel: {
    margin: "0 0 7px",
    color: "#d8e6eb",
    fontSize: "13px",
    },

    languageText: {
    margin: 0,
    color: "#ffffff",
    fontSize: "13px",
    },

    switchTrack: {
    width: "39px",
    height: "22px",
    padding: "3px",
    boxSizing: "border-box",
    borderRadius: "20px",
    background: "#20c996",
    },

    switchCircle: {
    width: "16px",
    height: "16px",
    marginLeft: "17px",
    borderRadius: "50%",
    background: "#ffffff",
    },

    sidebarLogoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "11px",
    border: "1px solid rgba(255,255,255,0.45)",
    borderRadius: "8px",
    color: "#ffffff",
    background: "transparent",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    },

    mainArea: {
    width: "calc(100% - 278px)",
    minHeight: "100vh",
    marginLeft: "278px",
    },

    topHeader: {
    minHeight: "83px",
    padding: "0 32px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    background: "#ffffff",
    borderBottom: "1px solid #dce7ed",
    },

    headerTitleArea: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    },

    mobileMenu: {
    display: "none",
    },

    dashboardTitle: {
    margin: "0 0 8px",
    color: "#102049",
    fontSize: "27px",
    lineHeight: "1",
    },

    universityLine: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#26435a",
    fontSize: "14px",
    fontWeight: "700",
    },

    verifiedDot: {
    width: "17px",
    height: "17px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    color: "#ffffff",
    background: "#16a34a",
    fontSize: "11px",
    },

    topHeaderRight: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "18px",
    },

    searchBox: {
    width: "315px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 14px",
    boxSizing: "border-box",
    border: "1px solid #e1e8ee",
    borderRadius: "12px",
    background: "#fafdff",
    },

    searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    color: "#334155",
    background: "transparent",
    fontSize: "13px",
    },

    headerIconButton: {
    border: "none",
    display: "grid",
    placeItems: "center",
    padding: "4px",
    color: "#102049",
    background: "transparent",
    cursor: "pointer",
    },

    bellNotification: {
    position: "absolute",
    top: "-4px",
    right: "-7px",
    minWidth: "18px",
    height: "18px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    color: "#ffffff",
    background: "#ef4444",
    fontSize: "10px",
    fontWeight: "700",
    },

    profileBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingLeft: "8px",
    },

    profileAvatar: {
    width: "42px",
    height: "42px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    color: "#475569",
    background: "#e2e8f0",
    fontSize: "18px",
    fontWeight: "700",
    },

    profileText: {
    minWidth: "120px",
    },

    profileName: {
    margin: "0 0 4px",
    color: "#102049",
    fontSize: "13px",
    fontWeight: "700",
    },

    profileRole: {
    margin: 0,
    color: "#64748b",
    fontSize: "11px",
    },

    pageContent: {
    padding: "20px 28px 35px",
    },

    welcomeQuickGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2.1fr) minmax(325px, 1fr)",
    gap: "20px",
    marginBottom: "21px",
    },

    welcomeBanner: {
    minHeight: "116px",
    position: "relative",
    overflow: "hidden",
    border: "1px solid #cce9e4",
    borderRadius: "10px",
    background:
        "linear-gradient(100deg, #eefcf7 0%, #e1f6ee 55%, #b8e4db 100%)",
    },

    welcomeOverlay: {
    position: "relative",
    zIndex: 2,
    maxWidth: "510px",
    padding: "18px 20px",
    },

    welcomeBannerTitle: {
    margin: "0 0 11px",
    color: "#102049",
    fontSize: "22px",
    },

    welcomeBannerText: {
    maxWidth: "430px",
    margin: 0,
    color: "#36536a",
    fontSize: "14px",
    lineHeight: "1.5",
    },

    bannerUniversityBadge: {
    position: "absolute",
    top: "13px",
    right: "15px",
    zIndex: 3,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    border: "1px solid #daf0e8",
    borderRadius: "8px",
    color: "#166534",
    background: "rgba(255,255,255,0.88)",
    fontSize: "13px",
    fontWeight: "700",
    },

    bannerIllustration: {
    position: "absolute",
    right: "36px",
    bottom: "-8px",
    display: "flex",
    alignItems: "flex-end",
    gap: "9px",
    opacity: 0.85,
    fontSize: "38px",
    },

    quickActionsCard: {
    padding: "16px 18px",
    border: "1px solid #cce9e4",
    borderRadius: "10px",
    background: "#f3fffb",
    },

    quickActionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    margin: "0 0 16px",
    color: "#17465a",
    fontSize: "15px",
    },

    quickActionButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "11px",
    },

    primaryQuickButton: {
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "13px 8px",
    borderRadius: "8px",
    color: "#ffffff",
    background: "#087c64",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    },

    secondaryQuickButton: {
    border: "1px solid #75c8b4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "13px 8px",
    borderRadius: "8px",
    color: "#087c64",
    background: "#ffffff",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    },

    //CREATE TEAM


    createTeamButton: {
  border: "none",
  borderRadius: "7px",
  padding: "8px 13px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: "700",
  cursor: "pointer",
},

teamModal: {
  width: "100%",
  maxWidth: "620px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "14px",
  padding: "24px",
  boxShadow: "0 20px 40px rgba(15, 23, 42, 0.25)",
},

teamModalHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "20px",
},

teamModalTitle: {
  margin: "0 0 8px",
  color: "#0f172a",
  fontSize: "22px",
},

teamModalText: {
  margin: "0",
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "1.5",
},

closeModalButton: {
  border: "none",
  background: "transparent",
  color: "#64748b",
  fontSize: "28px",
  lineHeight: "1",
  cursor: "pointer",
},

formLabel: {
  display: "block",
  marginBottom: "7px",
  color: "#334155",
  fontWeight: "700",
  fontSize: "14px",
},

formInput: {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px",
  marginBottom: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  color: "#1e293b",
  background: "#ffffff",
},

membersHeading: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginTop: "18px",
  marginBottom: "12px",
},

membersTitle: {
  margin: "0",
  fontSize: "16px",
  color: "#0f172a",
},

addMemberButton: {
  border: "1px solid #bfdbfe",
  borderRadius: "7px",
  padding: "7px 10px",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontWeight: "700",
  cursor: "pointer",
},

memberFormCard: {
  padding: "14px",
  marginBottom: "12px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  background: "#f8fafc",
},

memberCardTop: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
},

memberNumber: {
  margin: "0",
  color: "#334155",
  fontSize: "13px",
  fontWeight: "700",
},

removeMemberButton: {
  border: "none",
  background: "transparent",
  color: "#b91c1c",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "13px",
},

createTeamSubmitButton: {
  border: "none",
  borderRadius: "7px",
  padding: "9px 14px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: "700",
  cursor: "pointer",
},


//Submit Proposal
submitProposalButton: {
  border: "none",
  borderRadius: "7px",
  padding: "8px 11px",
  background: "#087c64",
  color: "#ffffff",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "12px",
},


createTeamSubmitButton: {
  border: "none",
  borderRadius: "7px",
  padding: "9px 14px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: "700",
  cursor: "pointer",
},

submitProposalButton: {
  border: "none",
  borderRadius: "7px",
  padding: "8px 11px",
  background: "#087c64",
  color: "#ffffff",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "12px",
},

//milestone 

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    width: "100%",
    maxWidth: "520px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  inputField: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },
  actionBtn: {
    border: "none",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },





};

export default Dashboard;
