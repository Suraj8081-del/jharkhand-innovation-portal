# 🏛️ Jharkhand Societal Innovation Portal
> **Smart India Hackathon (SIH)** — A digital platform to crowdsource societal challenges and facilitate collaborative problem-solving through university and government partnerships.

[![Live Demo](https://img.shields.io/badge/Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://your-project.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://your-backend.onrender.com)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 📌 Problem Statement
Rural and urban communities face pressing societal challenges across water security, healthcare, rural infrastructure, agriculture, and waste management. Traditional channels lack a unified, accountable mechanism to mobilize academic research power toward real-world governance problems.

**Our Solution:** An end-to-end multi-stakeholder governance and research platform where:
1. **Government bodies** post and assign verified ground-level challenges to academic institutions.
2. **Universities (e.g., BIT Mesra)** review, accept, and deploy specialized faculty-student research teams.
3. **Teams submit solution proposals** with detailed budgets, milestones, and timelines.
4. **Government approves proposals and audits ground progress** through milestone updates and evidence tracking.

---

## ✨ Key Features & Role-Based Workflows

### 🎓 1. University Research Dashboard
- **Challenge Lifecycle:** View assigned regional challenges with priority, district, and category tags; accept or reject with remarks.
- **Team Allocation:** Assemble dedicated faculty and student research teams per accepted problem.
- **Proposal Submission:** Detail technical architecture, implementation roadmap, timeline, and estimated budget.
- **Milestone Progress Tracker:** Submit incremental status updates (`on-track`, `delayed`, `completed`) with progress percentage and verification links.

### 🏛️ 2. Government Review Portal
- **Proposal Evaluation Queue:** Review university proposals with full breakdown of budgets and solution methodologies.
- **Status Approvals:** Approve viable solutions or reject with official feedback.
- **Project Monitoring:** Real-time visibility into milestone execution and ground impact across districts.

### 🔐 3. Security & Access Control
- Role-based Access Control (RBAC) via secure JWT authentication and password hashing (`bcryptjs`).
- Protected backend routes preventing cross-role privilege escalation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM, Lucide Icons, Modern CSS3 |
| **Backend** | Node.js, Express.js, REST APIs |
| **Database** | MongoDB Atlas (Cloud Database), Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js |
| **Deployment** | Vercel (Frontend SPA), Render (Backend Web Service) |

---

## 🔄 System Architecture & Lifecycle


---

## 📁 Repository Structure

```text
jharkhand-innovation-portal/
├── backend/
│   ├── config/             # Database connection (MongoDB Atlas)
│   ├── controllers/        # Business logic (Auth, Challenge, Team, Proposal, Milestone)
│   ├── middleware/         # JWT Protect & Role-based Access Control
│   ├── models/             # Mongoose Schemas (User, Challenge, Team, Proposal, MilestoneUpdate)
│   ├── routes/             # RESTful API Route definitions
│   ├── server.js           # Express app entry point
│   └── package.json
└── frontend/
    ├── public/             # Static brand assets & logos
    ├── src/
    │   ├── pages/          # Dashboard, AssignedChallenges, GovernmentDashboard, Login, Register
    │   ├── App.jsx         # Routing and auth guards
    │   ├── Dashboard.css   # Polished UI styles & animations
    │   └── main.jsx
    ├── vercel.json         # SPA fallback routing config
    ├── vite.config.js
    └── package.json


🚀 Getting Started Locally
Prerequisites
Node.js (v18+ recommended)
MongoDB Atlas cluster account
Git
1. Clone the Repository

cd jharkhand-innovation-portal

2. Backend Setup
cd backend
npm install




📄 License
This project is developed for educational and hackathon evaluation purposes under the MIT License.


---

### Tips for Extra Impact:
1. **Live Links:** README ke top par `https://your-project.vercel.app` aur `https://your-backend.onrender.com` ki jagah apne actual live URLs paste kar dena.
2. **Screenshots:** Jab hackathon ke agle rounds ke liye repo share karo, toh `Dashboard` aur `Government Review` screen ke 1-2 screenshots add karke link kar dena—evaluators ko visual proof bohot pasand aata hai!

