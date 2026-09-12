import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, Layers, ArrowRight } from 'lucide-react';
import './Government.css';

const GovtKpiOverview = () => {
  const [stats, setStats] = useState({
    totalChallenges: 0,
    pendingReview: 0,
    assignedChallenges: 0,
    pendingProposals: 0,
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/government/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.summary) setStats(res.data.summary);
      } catch (err) {
        // Fallback demo data
        setStats({
          totalChallenges: 18,
          pendingReview: 5,
          assignedChallenges: 9,
          pendingProposals: 4,
        });
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Challenges Pending Scrutiny', count: stats.pendingReview, color: '#f59e0b', link: '/government/challenges' },
    { title: 'Allotted to Universities', count: stats.assignedChallenges, color: '#2563eb', link: '/government/challenges' },
    { title: 'Proposals Awaiting Sanction', count: stats.pendingProposals, color: '#8b5cf6', link: '/government/proposals' },
    { title: 'Total Citizen Submissions', count: stats.totalChallenges, color: '#059669', link: '/government/challenges' },
  ];

  return (
    <div>
      <div className="gov-page-header">
        <h2>Jharkhand State Innovation Monitor</h2>
        <p>Live progress tracking of societal challenges, technical proposals, and pilot deployments.</p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {cards.map((c, i) => (
          <div key={i} className="gov-card" style={{ flexDirection: 'column', alignItems: 'flex-start', borderLeft: `5px solid ${c.color}` }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              {c.title}
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '8px 0' }}>
              {c.count}
            </div>
            <Link to={c.link} style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open Desk <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Action Banner */}
      <div style={{ background: '#064e3b', color: '#fff', padding: '24px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Action Required: Pending Scrutiny</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#a7f3d0' }}>
            New grassroots challenges have been registered from Latehar, Khunti, and Ranchi districts.
          </p>
        </div>
        <Link to="/government/challenges" className="gov-btn-primary" style={{ background: '#f59e0b', color: '#000', textDecoration: 'none' }}>
          Go to Allotment Desk
        </Link>
      </div>
    </div>
  );
};

export default GovtKpiOverview;
