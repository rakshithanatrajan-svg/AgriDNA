import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function CropMemoryPage({ setActivePage }) {
  const { user } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.user_id) return;
      try {
        const hRes = await fetch(`http://localhost:5000/api/history/${user.user_id}`);
        const hData = await hRes.json();
        if (hData.success) {
          setHistory(hData.history);
        }
      } catch (e) {} finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) return <div className="fade-in" style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading Crop Memory...</div>;

  if (history.length === 0) {
    return (
      <div className="fade-in" style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🗃️</div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Crop Memory is Empty</div>
        <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24, maxWidth: 300, marginInline: 'auto' }}>
          We have no recorded treatments, soil readings, or AI decisions for this farm. Upload a crop photo to build your true memory footprint.
        </div>
        <button className="btn btn-primary" onClick={() => setActivePage('scan')} style={{ marginInline: 'auto' }}>Start First Scan</button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Crop Memory Archive</h1>
        <p>A true historical record of every disease and treatment your soil has endured.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { icon: '📅', label: 'History Records', val: history.length, color: 'var(--teal)' },
          { icon: '🦠', label: 'Diseases Spotted', val: history.filter(h=>h.disease !== 'healthy').length, color: 'var(--warn)' },
          { icon: '🟢', label: 'Healthy Scans', val: history.filter(h=>h.disease === 'healthy').length, color: 'var(--accent)' },
        ].map((k, i) => (
          <div key={i} className="panel" style={{ padding: '18px 20px', borderBottom: `2px solid ${k.color}` }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{k.icon}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, color: k.color, marginBottom: 2 }}>{k.val}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, marginBottom: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Your Master Scan Log</div>
        </div>
        <div style={{ padding: '10px 0', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Date Logged</th><th>Location</th><th>Result/Disease</th><th>Action Prescribed</th><th>Confidence/Risk</th></tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{new Date(r.date).toLocaleString()}</td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{r.location}</td>
                  <td>
                    <span className={`pill pill-${r.disease === 'healthy' ? 'success' : 'warn'}`} style={{ textTransform: 'capitalize' }}>
                       {r.disease.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text)' }}>
                     {r.disease === 'healthy' ? 'None' : (r.recommendation?.pesticide || r.recommendation?.bio_solution || '—')}
                  </td>
                  <td>
                    <span className={`pill pill-${r.disease === 'healthy' ? 'success' : 'danger'}`}>
                       {r.disease === 'healthy' ? 'Low Risk' : (r.recommendation?.risk || 'High Risk')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
