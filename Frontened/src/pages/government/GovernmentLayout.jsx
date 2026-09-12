import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, Layers, LogOut, Shield } from 'lucide-react';
import './Government.css';

const GovernmentLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Dr. Anjali Sharma"}');

  const navItems = [
    { name: 'Overview & KPIs', path: '/government/dashboard', icon: LayoutDashboard },
    { name: 'Review & Assign Desk', path: '/government/challenges', icon: FileText },
    { name: 'University Proposals', path: '/government/proposals', icon: CheckSquare },
    { name: 'Project & Milestones', path: '/government/projects', icon: Layers },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="gov-container">
      {/* Sidebar */}
      <aside className="gov-sidebar">
        <div className="gov-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={28} color="#f59e0b" />
            <div>
              <h1 className="gov-logo-title">JSIP Portal</h1>
              <p className="gov-logo-sub">Govt. of Jharkhand</p>
            </div>
          </div>
        </div>

        <div className="gov-officer-badge">
          <span style={{ fontSize: '10px', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Logged Officer
          </span>
          <p className="gov-officer-name">{user.name}</p>
          <span className="gov-officer-role">Govt Authority</span>
        </div>

        <nav className="gov-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`gov-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} className="gov-logout-btn">
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="gov-main-area">
        <header className="gov-topbar">
          <div>
            <h2>Higher & Technical Education Directorate</h2>
            <p>Grassroot Societal Innovation & University Allotment Desk</p>
          </div>
          <span className="gov-badge-live">Live Database Connected</span>
        </header>

        <main className="gov-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GovernmentLayout;
