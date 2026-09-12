import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Send } from 'lucide-react';
import './Government.css';

const GovernmentChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [assignedUniv, setAssignedUniv] = useState('');
  const [priority, setPriority] = useState('High');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const loadData = async () => {
    try {
      const [chRes, unRes] = await Promise.all([
        axios.get('http://localhost:5000/api/government/challenges', config),
        axios.get('http://localhost:5000/api/government/universities', config)
      ]);
      setChallenges(chRes.data.challenges || chRes.data || []);
      setUniversities(unRes.data.universities || unRes.data || []);
    } catch (err) {
      setChallenges([
        {
          _id: 'ch1',
          title: 'Solar Water Pump Inverters Failing During High Voltage',
          description: 'Villagers in Latehar face water shortages due to continuous inverter board burnouts during sudden grid fluctuations.',
          district: 'Latehar',
          category: 'Water & Sanitation',
          status: 'pending',
          priority: 'High'
        },
        {
          _id: 'ch2',
          title: 'Lac Resin Automatic Harvester Requirement',
          description: 'Khunti forest farmers need an affordable device to scrape tree resins without twig destruction.',
          district: 'Khunti',
          category: 'Agriculture',
          status: 'pending',
          priority: 'Medium'
        }
      ]);
      setUniversities([
        { _id: 'u1', name: 'BIT Mesra', institutionName: 'Birla Institute of Technology' },
        { _id: 'u2', name: 'NIT Jamshedpur', institutionName: 'National Institute of Technology' },
        { _id: 'u3', name: 'IIT (ISM) Dhanbad', institutionName: 'Indian Institute of Technology' }
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignedUniv) return alert('Kripya University select karein!');

    try {
      await axios.patch(
        `http://localhost:5000/api/government/challenges/${selectedChallenge._id}/assign`,
        { universityId: assignedUniv, priority },
        config
      );
      alert('Challenge successfully university ko assign ho gaya!');
      setSelectedChallenge(null);
      loadData();
    } catch (err) {
      setChallenges(prev =>
        prev.map(c => c._id === selectedChallenge._id ? { ...c, status: 'assigned', priority } : c)
      );
      setSelectedChallenge(null);
      alert('Challenge assigned successfully (Demo)!');
    }
  };

  return (
    <div>
      <div className="gov-page-header">
        <h2>Citizen Challenges Scrutiny & Allotment Desk</h2>
        <p>Review verified problems submitted by citizens and allocate them to technical institutes.</p>
      </div>

      <div>
        {challenges.map((c) => (
          <div key={c._id} className="gov-card">
            <div style={{ flex: 1, paddingRight: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <span className="gov-tag gov-tag-cat">{c.category}</span>
                <span className="gov-tag gov-tag-dist" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {c.district}
                </span>
                <span className={`gov-tag gov-tag-status-${c.status}`}>{c.status}</span>
              </div>
              <h3 className="gov-card-title">{c.title}</h3>
              <p className="gov-card-desc">{c.description}</p>
            </div>

            <div>
              {c.status === 'pending' ? (
                <button
                  onClick={() => setSelectedChallenge(c)}
                  className="gov-btn-primary"
                >
                  Allot to University
                </button>
              ) : (
                <span className="gov-tag gov-tag-status-assigned">Already Allotted</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Popup */}
      {selectedChallenge && (
        <div className="gov-modal-overlay">
          <div className="gov-modal">
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 700 }}>
              Allot Challenge to University
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#64748b' }}>
              {selectedChallenge.title}
            </p>

            <form onSubmit={handleAssign}>
              <div className="gov-form-group">
                <label className="gov-form-label">Select Technical Institution</label>
                <select
                  value={assignedUniv}
                  onChange={(e) => setAssignedUniv(e.target.value)}
                  className="gov-select"
                  required
                >
                  <option value="">-- Choose University --</option>
                  {universities.map(u => (
                    <option key={u._id} value={u._id}>{u.name} - {u.institutionName || 'Jharkhand'}</option>
                  ))}
                </select>
              </div>

              <div className="gov-form-group">
                <label className="gov-form-label">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="gov-select"
                >
                  <option value="Critical">Critical (Immediate Pilot Action)</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="gov-modal-actions">
                <button
                  type="button"
                  onClick={() => setSelectedChallenge(null)}
                  style={{ background: '#e2e8f0', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="gov-btn-primary">
                  <Send size={14} style={{ marginRight: '6px' }} /> Confirm Allotment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentChallenges;
