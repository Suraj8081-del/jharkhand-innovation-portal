import React, { useState } from 'react';
import './Government.css';

const GovernmentProjects = () => {
  // Pre-loaded with realistic Jharkhand SIH data
  const [projects] = useState([
    {
      _id: 'proj1',
      title: 'Solar Water Pump Low-Voltage Protection Board',
      university: 'BIT Mesra, Ranchi',
      district: 'Latehar',
      progress: 65,
      stage: 'Prototype Field Testing',
      milestones: [
        { name: 'Circuit Design & Simulation', done: true },
        { name: 'Microcontroller Firmware', done: true },
        { name: 'Field Testing in Latehar', done: false },
        { name: 'Govt Pilot Handover', done: false }
      ]
    },
    {
      _id: 'proj2',
      title: 'Ergonomic Lac Resin Scraper with Safety Guard',
      university: 'NIT Jamshedpur',
      district: 'Khunti',
      progress: 30,
      stage: 'CAD Fabrication',
      milestones: [
        { name: 'Farmer Requirement Survey', done: true },
        { name: 'Mechanical Blade Prototype', done: false },
        { name: 'Safety Certification', done: false }
      ]
    }
  ]);

  return (
    <div>
      <div className="gov-page-header">
        <h2>Active University Projects & Milestone Tracker</h2>
        <p>Monitor physical prototype progress, milestones completion, and lab-to-land delivery.</p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {projects.map((proj) => (
          <div key={proj._id} className="gov-card" style={{ display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="gov-tag gov-tag-cat">{proj.district} District Pilot</span>
                <h3 className="gov-card-title" style={{ fontSize: '1.15rem' }}>{proj.title}</h3>
                <p className="gov-meta-text">Technical Lead: <strong>{proj.university}</strong></p>
              </div>
              <span className="gov-tag gov-tag-status-assigned">{proj.stage}</span>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                <span>Milestone Completion</span>
                <span style={{ color: '#065f46' }}>{proj.progress}%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${proj.progress}%`, height: '100%', background: '#059669', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Milestones Checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              {proj.milestones.map((m, idx) => (
                <div key={idx} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', color: m.done ? '#065f46' : '#94a3b8' }}>
                  <span>{m.done ? '✓' : '○'}</span>
                  <span style={{ textDecoration: m.done ? 'none' : 'none', fontWeight: m.done ? 600 : 400 }}>
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GovernmentProjects;
