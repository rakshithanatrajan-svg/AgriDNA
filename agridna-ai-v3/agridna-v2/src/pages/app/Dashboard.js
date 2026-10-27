import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslations } from '../../hooks/useTranslate';

const strings = {
  farmArea: 'Farm Area (Acres)', soilScore: 'Soil Vitality',
  totalScans: 'Total Scans', hi: 'Good morning', scanHistory: 'Recent Scan History',
};

export default function Dashboard({ setActivePage }) {
  const { user } = useApp();
  const { t } = useTranslations(strings);
  
  const [history, setHistory] = useState([]);
  const [soil, setSoil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.user_id) return;
      try {
        const hRes = await fetch(`http://localhost:5000/api/history/${user.user_id}`);
        const hData = await hRes.json();
        
        const sRes = await fetch(`http://localhost:5000/api/soil/${user.user_id}`);
        const sData = await sRes.json();
        
        if (hData.success) setHistory(hData.history);
        if (sData.success) setSoil(sData);
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const sevClass = { HIGH: 'danger', MEDIUM: 'warn', LOW: 'success' };
  
  // Calculate Soil Score average
  const soilAvg = soil ? Math.round((soil.soil.N + soil.soil.P + soil.soil.K) / 3) : 0;
  const soilColor = soilAvg > 50 ? 'success' : soilAvg > 30 ? 'warn' : 'danger';

  // Count diseases vs healthy
  const diseaseCount = history.filter(h => h.disease !== 'healthy').length;

  const kpiCards = [
    {
      color: 'green', icon: 'green',
      iconSvg: <svg viewBox="0 0 16 16" fill="none" stroke="#8ECB2A" strokeWidth="1.5"><path d="M3 12C3 8 5 4 8 2c3 2 5 6 5 10"/><path d="M8 2v10"/></svg>,
      val: user?.land_size || '0', unit: ' acres', label: t.farmArea, change: 'Recorded in Profile', up: true,
    },
    {
      color: soilColor, icon: soilColor,
      iconSvg: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12l4-4 3 3 5-6"/></svg>,
      val: soilAvg.toString(), unit: '/100', label: t.soilScore, change: soil?.level === 'critical' ? 'Requires Attention' : 'Maintained', up: soilAvg > 50,
    },
    {
      color: 'blue', icon: 'blue',
      iconSvg: <svg viewBox="0 0 16 16" fill="none" stroke="#4A9EF5" strokeWidth="1.5"><rect x="2" y="4" width="12" height="10" rx="2"/><path d="M5 4V3a3 3 0 0 1 6 0v1"/></svg>,
      val: history.length.toString(), unit: '', label: t.totalScans, change: `${diseaseCount} diseases detected`, up: true,
    }
  ];

  if (loading) return <div className="fade-in" style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading your dashboard...</div>;

  return (
    <div className="fade-in">
      {/* Welcome + Weather row */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 22, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 200, flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24, color: 'var(--text)', marginBottom: 4 }}>
            {t.hi}, {user?.name?.split(' ')[0] || 'Farmer'} 👋
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Dashboard · {user?.place || 'Unknown Place'}</div>
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        {kpiCards.map((c, i) => (
          <div key={i} className={`stat-card ${c.color}`} style={{ animationDelay: `${i * 0.04}s` }}>
            <div className={`stat-icon ${c.icon}`}>{c.iconSvg}</div>
            <div className="stat-val">
              {c.val}<span style={{ fontSize: 14, fontWeight: 500 }}>{c.unit}</span>
            </div>
            <div className="stat-label">{c.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text4)' }}>{c.change}</div>
          </div>
        ))}
      </div>

      {history.length === 0 ? (
        <div className="panel" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Your Dashboard is Empty</div>
          <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24, maxWidth: 300, marginInline: 'auto' }}>
            Start by scanning a leaf. Your crop memory, soil vitality charts, and treatment history will automatically build up here over time.
          </div>
          <button className="btn btn-primary" onClick={() => setActivePage('scan')} style={{ marginInline: 'auto' }}>Go to Scan Page</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18, marginBottom: 22 }}>
          {/* Latest scan result panel */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><path d="M9 11.5h5M11.5 9v5"/></svg>
                Latest Scan Status
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setActivePage('scan')}>+ New Scan</button>
            </div>
            <div className="panel-body">
              {history[0] && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: history[0].disease !== 'healthy' ? 'var(--danger)' : 'var(--accent)', flexShrink: 0, animation: 'pulse 2s infinite' }}></div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: 'var(--text)', flex: 1, textTransform: 'capitalize' }}>
                      {history[0].disease.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12.5 }}>
                    <div>
                      <span style={{ color: 'var(--text4)', fontSize: 11 }}>Date</span>
                      <div style={{ color: 'var(--text2)', fontWeight: 500, marginTop: 1 }}>{new Date(history[0].date).toLocaleString()}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text4)', fontSize: 11 }}>Location Context</span>
                      <div style={{ color: 'var(--text2)', fontWeight: 500, marginTop: 1 }}>{history[0].location}</div>
                    </div>
                  </div>
                  {history[0].disease !== 'healthy' && history[0].recommendation && (
                    <div style={{ padding: '0 16px 14px' }}>
                      <div style={{ padding: '10px 12px', borderRadius: 'var(--r-sm)', background: 'rgba(232,83,74,0.06)', border: '1px solid rgba(232,83,74,0.15)' }}>
                        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>Treatment Issued</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                           {history[0].recommendation.pesticide || history[0].recommendation.bio_solution}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                          {history[0].recommendation.how_to_spray}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Scan history table */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{t.scanHistory}</div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Date</th><th>Disease Diagnosed</th><th>Risk Level</th></tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 5).map((r, i) => (
                        <tr key={i}>
                          <td style={{ color: 'var(--text3)', fontSize: 12 }}>{new Date(r.date).toLocaleDateString()}</td>
                          <td style={{ textTransform: 'capitalize' }}>
                            <span className={`pill pill-${r.disease === 'healthy' ? 'success' : 'warn'}`}>
                               <span className="pill-dot"></span>{r.disease.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ fontSize: 12 }}>{r.recommendation?.risk || (r.disease==='healthy'?'LOW':'HIGH')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setActivePage('memory')} style={{ width: '100%', justifyContent: 'center', marginTop: 12, color: 'var(--accent)' }}>View Full Memory</button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Soil shortcut pointer to the new SoilPage */}
            <div className="panel" style={{ padding: '24px 20px', textAlign: 'center' }}>
               <div style={{ fontSize: 36, marginBottom: 12 }}>🌱</div>
               <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Soil Vitality Center</div>
               <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>Your farm's interactive N-P-K nutrient breakdown and timeline.</div>
               <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActivePage('soil')}>Open Soil Metrics</button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
