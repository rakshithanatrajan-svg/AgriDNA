import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslations } from '../../hooks/useTranslate';
import { LANGUAGES } from '../../services/translate';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

/* ──────────────────────────────── */
/* HISTORY PAGE                     */
/* ──────────────────────────────── */
/* ──────────────────────────────── */
/* HISTORY PAGE                     */
/* ──────────────────────────────── */
export function HistoryPage() {
  const { user } = useApp();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [histData, setHistoryData] = useState([]);

  React.useEffect(() => {
    if (user?.user_id) {
      fetch(`http://localhost:5000/api/history/${user.user_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setHistoryData(data.history.map(item => ({
              id: item.scan_id,
              date: new Date(item.date).toLocaleDateString(),
              time: new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              block: item.location || 'Unknown',
              disease: item.disease === 'healthy' || item.disease === 'Healthy' ? 'Healthy' : item.disease.replace(/_/g, ' '),
              sev: item.recommendation?.risk === 'HIGH' ? 'high' : item.recommendation?.risk === 'LOW' ? 'medium' : 'low',
              tx: item.recommendation?.pesticide || item.recommendation?.bio_solution || '—',
              status: 'resolved',
              img: item.disease === 'healthy' ? '🌱' : '🌿'
            })));
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const sevC = { high:'danger', medium:'warn', low:'success' };
  const stC  = { ongoing:'warn', resolved:'success', clear:'teal' };

  const rows = histData.filter(r => {
    const m = tab==='all' || (tab==='diseases'&&r.sev!=='low') || (tab==='treated'&&r.status==='resolved') || (tab==='healthy'&&r.sev==='low');
    const s = r.disease.toLowerCase().includes(search.toLowerCase()) || r.block.toLowerCase().includes(search.toLowerCase());
    return m && s;
  });

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Scan History</h1><p>All past crop scans and AI diagnoses from your farm</p></div>
      <div className="panel">
        <div className="panel-header">
          <input className="form-input" style={{ maxWidth: 280 }} placeholder="Search disease or block…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-outline btn-sm">Export CSV</button>
        </div>
        <div className="tab-row">
          {[['all','All Scans'],['diseases','Diseases'],['treated','Treated'],['healthy','Healthy']].map(([id,lbl])=>(
            <div key={id} className={`tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{lbl}</div>
          ))}
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead><tr><th>#</th><th>Date</th><th>Location</th><th>Disease</th><th>Treatment</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id}>
                  <td><div style={{ width:32,height:32,borderRadius:8,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>{r.img}</div></td>
                  <td><div style={{ fontSize:13 }}>{r.date}</div><div style={{ fontSize:11,color:'var(--text4)' }}>{r.time}</div></td>
                  <td>{r.block}</td>
                  <td style={{textTransform:'capitalize'}}><span className={`pill pill-${sevC[r.sev]}`}><span className="pill-dot"></span>{r.disease}</span></td>
                  <td style={{ fontSize:12 }}>{r.tx}</td>
                  <td><span className={`pill pill-${stC[r.status]}`} style={{ fontSize:11 }}>{r.status}</span></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding: '20px', color: 'var(--text4)'}}>No history found. Try uploading an image on the Scan page!</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'12px 20px',borderTop:'1px solid var(--border)',fontSize:12,color:'var(--text4)' }}>
          Showing {rows.length} records {histData.length > 0 ? '' : '(No scans performed)'}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── */
/* SOIL VITALITY PAGE               */
/* ──────────────────────────────── */
export function SoilPage() {
  const { user } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSoil = () => {
    if (!user?.user_id) return;
    fetch(`http://localhost:5000/api/soil/${user.user_id}`)
      .then(res => res.json())
      .then(d => { if (d.success) setData(d); })
      .finally(() => setLoading(false));
  };

  React.useEffect(() => { fetchSoil(); }, [user]);

  const handleHeal = () => {
    fetch('http://localhost:5000/api/soil/heal', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id })
    }).then(() => fetchSoil());
  };

  if (loading) return <div className="fade-in" style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading Soil Data...</div>;
  if (!data) return null;

  const { soil, level, action, timeline } = data;

  const statusMap = {
    healthy: { e: '🟢', txt: 'HEALTHY', c: 'var(--accent)', bg: 'rgba(142,203,42,0.1)' },
    medium: { e: '🟡', txt: 'MODERATE', c: 'var(--warn)', bg: 'rgba(245,166,35,0.1)' },
    critical: { e: '🔴', txt: 'CRITICAL', c: 'var(--danger)', bg: 'rgba(232,83,74,0.1)' }
  };
  const sm = statusMap[level];

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Soil Vitality</h1><p>Monitor, analyse and improve your farm's soil health naturally.</p></div>
      
      {/* 1. Top Card */}
      <div className="panel" style={{ padding: '30px 20px', textAlign: 'center', marginBottom: 20, borderTop: `4px solid ${sm.c}`, background: sm.bg }}>
        <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, color: 'var(--text3)', border:0, outline:'none' }}>SOIL HEALTH</div>
        <div style={{ fontSize: 42, margin: '8px 0' }}>{sm.e}</div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color: sm.c, marginBottom: 12 }}>{sm.txt}</div>
        <div style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 400, marginInline: 'auto' }}>
           {level === 'healthy' ? "Your soil is in perfect shape. Keep monitoring!" :
            level === 'medium' ? "Your soil is getting weaker. Take action soon." :
            "Your soil is severely lacking nutrients! Immediate action required."}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* 2. Nutrient Bars */}
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Macronutrients (N-P-K)</div></div>
          <div style={{ padding: '20px 24px', display:'flex', flexDirection:'column', gap: 16 }}>
            {[
              { l: 'Nitrogen (N)', v: soil.N, c: 'var(--blue)' },
              { l: 'Phosphorus (P)', v: soil.P, c: 'var(--warn)' },
              { l: 'Potassium (K)', v: soil.K, c: 'var(--accent)' }
            ].map(m => (
              <div key={m.l}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{m.l}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 12, background: 'var(--bg)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${m.v}%`, height: '100%', background: m.c, borderRadius: 6 }}></div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, width: 30 }}>{m.v}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           {/* 3 & 4. Why happened & Impact */}
           {level !== 'healthy' && (
             <div className="panel">
               <div className="panel-header"><div className="panel-title">⚠️ Why This Happened</div></div>
               <div style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                 <p style={{ marginBottom: 8 }}>• Recent chemical spraying reduced natural microbial soil nutrients.</p>
                 <p>• <strong>Last Impact:</strong> Treatment applied slightly downgraded soil strength.</p>
               </div>
             </div>
           )}

           {/* 6. Future Warning */}
           {level === 'medium' && (
              <div style={{ padding: '16px', borderRadius: 'var(--r-sm)', background: 'var(--danger-bg)', border: '1px solid rgba(232,83,74,0.3)', color: 'var(--danger)' }}>
                 <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>📉 Predictive Warning</div>
                 <div style={{ fontSize: 12 }}>If current chemical treatments continue without recovery phases, your soil may drop to CRITICAL in 2-3 cycles.</div>
              </div>
           )}
        </div>
      </div>

      {/* 5. What to do NOW / 7. Action Button */}
      {level !== 'healthy' && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header"><div className="panel-title">✅ Recommended Action</div></div>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text2)' }}>
                 <span style={{ color: 'var(--accent)' }}>✔</span> Add organic compost or recommended recovery spray
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text2)' }}>
                 <span style={{ color: 'var(--accent)' }}>✔</span> Avoid chemical pesticides for the next 5 days
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text2)' }}>
                 <span style={{ color: 'var(--accent)' }}>✔</span> Consider Crop Rotation (Pulses/Legumes) next season
               </div>
            </div>
            
            <button className="btn btn-primary btn-lg" onClick={handleHeal} style={{ fontSize: 16 }}>
              [ ✅ I have applied treatment ]
            </button>
          </div>
        </div>
      )}

      {/* 8. Activity Timeline */}
      {timeline && timeline.length > 0 && (
         <div className="panel">
           <div className="panel-header"><div className="panel-title">📅 Soil Impact Timeline</div></div>
           <div style={{ padding: '20px' }}>
              {timeline.map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, marginBottom: i < timeline.length - 1 ? 16 : 0, position: 'relative' }}>
                  <div style={{ width: 1, background: i < timeline.length - 1 ? 'var(--border)' : 'transparent', position: 'absolute', left: 7, top: 20, bottom: -20 }}></div>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--warn)', flexShrink: 0, marginTop: 4, zIndex: 2 }}></div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text4)' }}>{act.date}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', margin: '2px 0' }}>{act.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{act.summary}</div>
                  </div>
                </div>
              ))}
           </div>
         </div>
      )}
    </div>
  );
}

/* ──────────────────────────────── */
/* VILLAGE MAP PAGE                 */
/* ──────────────────────────────── */
export function VillageMapPage() {
  const { user } = useApp();
  
  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: 14 }}>
        <h1>Village Disease Map</h1>
        <p>Live outbreak map based on authentic scans from your surrounding area.</p>
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
        position: 'relative', overflow: 'hidden', height: 'calc(100vh - 200px)', minHeight: 400
      }}>
        {/* Placeholder map bg */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at center, var(--surface) 0%, var(--bg) 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8
        }}>
           <div style={{ width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Empty state overlay */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(2px)',
        }}>
          <div style={{ padding: 40, background: 'var(--bg2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow-lg)', maxWidth: 340 }}>
             <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
             <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Secure Ecosystem</div>
             <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>There are currently no confirmed severe outbreaks detected near <strong style={{color:'var(--text)'}}>{user?.place || 'your area'}</strong>. As other farmers push authentic scans, alerts will automatically generate here.</div>
          </div>
        </div>

        {/* Map UI elements overlay */}
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: 'var(--shadow)', pointerEvents: 'auto'
            }}>
              <span className="pill pill-success">0</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Active Hotspots Found</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── */
/* ALERTS PAGE                      */
/* ──────────────────────────────── */
const alertsData = [
  { id:1, type:'info', e:'🔵', title:'Zinc deficiency advisory', sub:'5 nearby farms reported zinc deficiency this week.', time:'1d ago', cat:'Nutrition' },
  { id:2, type:'warn', e:'🟡', title:'Brown Spot spore count elevated', sub:'State agri dept. alert — check your soil nitrogen levels.', time:'2d ago', cat:'Disease' },
  { id:3, type:'danger', e:'🔴', title:'Soil N-P-K Warning', sub:'Local farms showing very low Nitrogen. Consider crop rotation soon.', time:'3d ago', cat:'Soil' },
];

export function AlertsPage() {
  const typeBg = { danger:'var(--danger-bg)', warn:'var(--warn-bg)', info:'var(--blue-bg)' };
  const pillType = { danger:'danger', warn:'warn', info:'blue' };

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Alerts</h1><p>Important farm and soil notifications</p></div>
      <div className="panel">
        {alertsData.map((a,i)=>(
          <div key={a.id} style={{
            display:'flex',alignItems:'flex-start',gap:14,padding:'18px 22px',
            borderBottom: i<alertsData.length-1?'1px solid var(--border)':'none',
            background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.01)',
          }}>
            <div style={{ width:42,height:42,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,background:typeBg[a.type] }}>{a.e}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600,fontSize:14,color:'var(--text)',marginBottom:4 }}>{a.title}</div>
              <div style={{ fontSize:12.5,color:'var(--text3)',lineHeight:1.6,marginBottom:8 }}>{a.sub}</div>
              <span className={`pill pill-${pillType[a.type]}`} style={{ fontSize:10 }}>{a.cat}</span>
            </div>
            <div style={{ fontSize:11,color:'var(--text4)',flexShrink:0,marginTop:2 }}>{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────── */
/* SETTINGS PAGE                    */
/* ──────────────────────────────── */
export function SettingsPage() {
  const { user, setUser, lang, setLang, logout, voiceEnabled, setVoiceEnabled } = useApp();
  const [notif, setNotif] = useState({ email:true, sms:false, push:true });
  const [darkMode, setDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
  const [form, setForm] = useState({
    name: user?.name||'Ravi Kumar', phone: user?.phone||'+91 98765 43210',
    village: user?.village||'Thanjavur', farmSize: user?.farmSize||'2.4',
    crop: user?.crops?.[0]||'Paddy (Rice)', soil: user?.soilType||'Clay',
  });
  const [saved, setSaved] = useState(false);

  function save() {
    setUser(u=>({...u,...form}));
    setSaved(true);
    setTimeout(()=>setSaved(false),2500);
  }

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Settings</h1><p>Manage your account and preferences</p></div>
      <div className="grid-2">
        {/* Language */}
        <div className="panel">
          <div className="panel-header"><div className="panel-title">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 2a8 8 0 0 1 0 12M8 2a8 8 0 0 0 0 12M2 8h12"/></svg>
            Language
          </div></div>
          <div style={{ padding:'16px 22px' }}>
            <div style={{ fontSize:12,color:'var(--text3)',marginBottom:14 }}>Select your preferred language for the app</div>
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {LANGUAGES.map(l=>(
                <button key={l.code} onClick={()=>setLang(l.code)}
                  style={{
                    display:'flex',alignItems:'center',gap:14,padding:'13px 16px',borderRadius:'var(--r)',
                    background:lang===l.code?'rgba(142,203,42,0.08)':'var(--bg3)',
                    border:`1px solid ${lang===l.code?'rgba(142,203,42,0.3)':'var(--border)'}`,
                    cursor:'pointer',transition:'all 0.15s',fontFamily:'var(--font-body)',color:'var(--text)',textAlign:'left'
                  }}>
                  <span style={{ fontSize:24 }}>{l.flag}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:500,color:lang===l.code?'var(--accent)':'var(--text)' }}>{l.native}</div>
                    <div style={{ fontSize:11,color:'var(--text4)' }}>{l.name}</div>
                  </div>
                  {lang===l.code && <span style={{ color:'var(--accent)',fontSize:18,fontWeight:700 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
          {/* Notifications */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2a5 5 0 0 1 5 5c0 3 1.5 4 1.5 4H1.5S3 10 3 7a5 5 0 0 1 5-5z"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/></svg>
              Notifications
            </div></div>
            <div style={{ padding:'12px 22px' }}>
              {[['email','Email Alerts','Disease outbreaks and advisories'],['sms','SMS Notifications','Critical alerts only'],['push','Push Notifications','All app notifications']].map(([id,lbl,sub])=>(
                <div key={id} style={{ display:'flex',alignItems:'center',padding:'12px 0',borderBottom:'1px solid var(--border)' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:500,color:'var(--text)' }}>{lbl}</div>
                    <div style={{ fontSize:11,color:'var(--text4)' }}>{sub}</div>
                  </div>
                  <div className={`toggle ${notif[id]?'on':'off'}`} onClick={()=>setNotif(p=>({...p,[id]:!p[id]}))}>
                    <div className="toggle-knob"></div>
                  </div>
                </div>
              ))}
              <div style={{ display:'flex',alignItems:'center',padding:'12px 0',borderBottom:'1px solid var(--border)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:500,color:'var(--text)' }}>Dark Theme</div>
                  <div style={{ fontSize:11,color:'var(--text4)' }}>Switch to dark mode interface</div>
                </div>
                <div className={`toggle ${darkMode?'on':'off'}`} onClick={()=>{
                  const nextTheme = !darkMode;
                  setDarkMode(nextTheme);
                  if (nextTheme) document.documentElement.setAttribute('data-theme', 'dark');
                  else document.documentElement.removeAttribute('data-theme');
                }}>
                  <div className="toggle-knob"></div>
                </div>
              </div>
              <div style={{ display:'flex',alignItems:'center',padding:'12px 0' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:500,color:'var(--text)' }}>🎙️ Voice Assistant (Tamil)</div>
                  <div style={{ fontSize:11,color:'var(--text4)' }}>Speaks diagnoses & listens to voice commands in Tamil</div>
                </div>
                <div className={`toggle ${voiceEnabled?'on':'off'}`} onClick={()=>setVoiceEnabled(v=>!v)}>
                  <div className="toggle-knob"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Farm Details */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12C3 8 5 4 8 2c3 2 5 6 5 10"/><path d="M8 2v10"/></svg>
              Farm Details
            </div></div>
            <div style={{ padding:'16px 22px',display:'flex',flexDirection:'column',gap:12 }}>
              {[['Full Name','name','Ravi Kumar'],['Phone','phone','+91 98765 43210'],['Village','village','Thanjavur'],['Farm Size (ha)','farmSize','2.4'],['Primary Crop','crop','Paddy (Rice)'],['Soil Type','soil','Clay']].map(([lbl,key,ph])=>(
                <div key={key}>
                  <div style={{ fontSize:11,fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.3px',marginBottom:5 }}>{lbl}</div>
                  <input className="form-input" defaultValue={form[key]} placeholder={ph} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}/>
                </div>
              ))}
              <button className="btn btn-primary" onClick={save} style={{ justifyContent:'center',marginTop:4 }}>
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop:20 }}>
        <div className="panel-header"><div className="panel-title" style={{ color:'var(--danger)' }}>Danger Zone</div></div>
        <div style={{ padding:'16px 22px',display:'flex',gap:14,flexWrap:'wrap',alignItems:'center' }}>
          <button className="btn btn-outline" onClick={logout}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l4-3-4-3M14 8H6"/></svg>
            Sign Out
          </button>
          <div style={{ fontSize:12,color:'var(--text4)' }}>You will be redirected to the login page.</div>
        </div>
      </div>
    </div>
  );
}
