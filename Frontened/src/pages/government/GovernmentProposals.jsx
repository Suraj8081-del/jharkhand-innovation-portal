import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X } from 'lucide-react';
import './Government.css';

const GovernmentProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [actionType, setActionType] = useState('approved');
  const [remarks, setRemarks] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const loadProposals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/government/proposals', config);
      setProposals(res.data.proposals || res.data || []);
    } catch (err) {
      // Fallback demo data
      setProposals([
        {
          _id: 'p1',
          challenge: { title: 'Solar Water Pump Inverters Failure', district: 'Latehar' },
          team: { teamName: 'Solar Innovators', universityName: 'BIT Mesra' },
          status: 'submitted',
          estimatedBudget: 45000,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleDecision = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `http://localhost:5000/api/government/proposals/${reviewModal._id}/review`,
        { action: actionType, remarks },
        config
      );
      alert(`Proposal ${actionType} successfully!`);
      setReviewModal(null);
      setRemarks('');
      loadProposals();
    } catch (err) {
      setProposals(prev =>
        prev.map(p => p._id === reviewModal._id ? { ...p, status: actionType } : p)
      );
      setReviewModal(null);
      alert(`Proposal ${actionType} successfully (Demo Mode)!`);
    }
  };

  return (
    <div>
      <div className="gov-page-header">
        <h2>University Proposals Review & Sanction Desk</h2>
        <p>Approve or reject technical proposals submitted by universities for allocated challenges.</p>
      </div>

      <div>
        {proposals.length === 0 ? (
          <div className="gov-card" style={{ justifyContent: 'center', color: '#64748b' }}>
            No proposals currently submitted by universities.
          </div>
        ) : (
          proposals.map((p) => (
            <div key={p._id} className="gov-card">
              <div style={{ flex: 1, paddingRight: '20px' }}>
                <span className={`gov-tag gov-tag-status-${p.status || 'pending'}`}>
                  {p.status || 'submitted'}
                </span>
                <h3 className="gov-card-title">
                  {p.challenge?.title || 'Solar Water Pump Inverters Failure'}
                </h3>
                <p className="gov-meta-text">
                  Institution: <strong style={{ color: '#0f172a' }}>{p.team?.universityName || 'BIT Mesra'}</strong> | Team: {p.team?.teamName || 'Solar Innovators'}
                </p>
                {p.estimatedBudget && (
                  <p className="gov-budget-highlight">
                    Grant Sanction Request: ₹{Number(p.estimatedBudget).toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              <div>
                {p.status === 'submitted' || p.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => { setReviewModal(p); setActionType('approved'); }}
                      className="gov-btn-approve"
                    >
                      <Check size={15} /> Sanction & Approve
                    </button>
                    <button
                      onClick={() => { setReviewModal(p); setActionType('rejected'); }}
                      className="gov-btn-reject"
                    >
                      <X size={15} /> Reject
                    </button>
                  </div>
                ) : (
                  <span className={`gov-tag gov-tag-status-${p.status}`}>
                    {p.status === 'approved' ? 'Sanctioned' : 'Rejected'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Confirmation Modal */}
      {reviewModal && (
        <div className="gov-modal-overlay">
          <div className="gov-modal">
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 700, textTransform: 'capitalize' }}>
              {actionType} Proposal
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#64748b' }}>
              {reviewModal.challenge?.title}
            </p>

            <form onSubmit={handleDecision}>
              <div className="gov-form-group">
                <label className="gov-form-label">Government Remarks / Sanction Notes</label>
                <textarea
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={actionType === 'rejected' ? "Specify reason for rejection..." : "Approved for prototyping. Funds cleared for milestone 1."}
                  className="gov-input"
                  style={{ resize: 'vertical' }}
                  required={actionType === 'rejected'}
                />
              </div>

              <div className="gov-modal-actions">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  style={{ background: '#e2e8f0', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={actionType === 'approved' ? 'gov-btn-approve' : 'gov-btn-reject'}
                >
                  Confirm {actionType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentProposals;
