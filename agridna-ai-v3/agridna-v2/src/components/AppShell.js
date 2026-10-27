import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslations } from '../hooks/useTranslate';
import { LANGUAGES } from '../services/translate';
import Dashboard from '../pages/app/Dashboard';
import ScanPage from '../pages/app/ScanPage';
import { HistoryPage } from '../pages/app/OtherPages';
import { SoilPage } from '../pages/app/OtherPages';
import { VillageMapPage } from '../pages/app/OtherPages';
import { AlertsPage } from '../pages/app/OtherPages';
import { SettingsPage } from '../pages/app/OtherPages';
import CropMemoryPage from '../pages/app/CropMemoryPage';

const navItems = [
  { id: 'dashboard', icon: GridIcon },
  { id: 'scan', icon: ScanIcon, badge: null },
  { id: 'history', icon: ListIcon },
  { id: 'memory', icon: DnaIcon, badge: 'New', badgeType: 'teal' },
  { id: 'soil', icon: SoilIcon },
  { id: 'map', icon: MapIcon },
  { id: 'alerts', icon: BellIcon },
  { id: 'settings', icon: SettingsIcon },
];

const navLabels = {
  dashboard: 'Dashboard', scan: 'Scan Leaf', history: 'History',
  memory: 'Crop Memory', soil: 'Soil Vitality', map: 'Village Map',
  alerts: 'Alerts', settings: 'Settings',
};

const strings = {
  ...navLabels,
  newScan: 'New Scan', search: 'Search crops, diseases...',
};

export default function AppShell() {
  const { user, logout, lang, setLang } = useApp();
  const [activePage, setActivePage] = useState('dashboard');
  const [showNotif, setShowNotif] = useState(false);
  const { t } = useTranslations(strings);

  const pages = {
    dashboard: <Dashboard setActivePage={setActivePage} />,
    scan:      <ScanPage />,
    history:   <HistoryPage />,
    memory:    <CropMemoryPage />,
    soil:      <SoilPage />,
    map:       <VillageMapPage />,
    alerts:    <AlertsPage />,
    settings:  <SettingsPage />,
  };

  const initials = (user?.name || 'RK').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path d="M11 2C7 2 4 5.5 4 9.5c0 2.5 1.2 4.7 3 6.2L11 19l4-3.3c1.8-1.5 3-3.7 3-6.2C18 5.5 15 2 11 2z" fill="white" opacity="0.95"/>
              <path d="M11 5v9M8 8.5l3-3.5 3 3.5" stroke="#0F2011" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-name">Agri<span>DNA</span></div>
            <div className="sidebar-logo-sub">AI Crop Intelligence</div>
          </div>
        </div>

        <div className="sidebar-farm-badge">
          <div className="sfb-dot"></div>
          <div className="sfb-text">
            <div className="sfb-season">Kharif 2025 · Active</div>
            <div className="sfb-crop">{user?.crop || 'Paddy (Rice)'} · {user?.village || 'Thanjavur'}</div>
          </div>
        </div>

        {/* Language switcher */}
        <div className="sidebar-lang">
          {LANGUAGES.map(l => (
            <button key={l.code} className={`sidebar-lang-btn ${lang === l.code ? 'active' : ''}`}
              onClick={() => setLang(l.code)} title={l.native}>
              {l.flag}
            </button>
          ))}
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">Main</div>
          {navItems.slice(0, 3).map(item => (
            <NavItem key={item.id} item={item} active={activePage} setActive={setActivePage} label={t[item.id] || navLabels[item.id]} />
          ))}
          <div className="sidebar-nav-section">Intelligence</div>
          {navItems.slice(3, 7).map(item => (
            <NavItem key={item.id} item={item} active={activePage} setActive={setActivePage} label={t[item.id] || navLabels[item.id]} />
          ))}
          <div className="sidebar-nav-section">System</div>
          {navItems.slice(7).map(item => (
            <NavItem key={item.id} item={item} active={activePage} setActive={setActivePage} label={t[item.id] || navLabels[item.id]} />
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Ravi Kumar'}</div>
              <div className="sidebar-user-loc">{user?.village || 'Thanjavur'}, {user?.state || 'TN'}</div>
            </div>
            <button className="sidebar-logout" onClick={logout} title="Logout">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l4-3-4-3M14 8H6"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="topbar-title">{t[activePage] || navLabels[activePage]}</div>
            <div className="topbar-breadcrumb">AgriDNA AI · {user?.name || 'Farmer'}</div>
          </div>
          <div className="topbar-actions">
            <div className="topbar-search">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="4"/><path d="M10 10l2.5 2.5"/></svg>
              {t.search || strings.search}
            </div>
            {activePage !== 'scan' && (
              <button className="btn btn-primary btn-sm" onClick={() => setActivePage('scan')}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 1v10M1 6h10"/></svg>
                {t.newScan || 'New Scan'}
              </button>
            )}
            <div className="notif-wrap">
              <button className="topbar-notif-btn" onClick={() => setShowNotif(!showNotif)}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2a5 5 0 0 1 5 5c0 3 1.5 4 1.5 4H1.5S3 10 3 7a5 5 0 0 1 5-5z"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/></svg>
              </button>
              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-dd-header">
                    Notifications
                    <span className="pill pill-danger" style={{ fontSize: 10 }}>3 new</span>
                  </div>
                  {[
                    { e: '🔴', t: 'Blast outbreak — 3 farms nearby', s: '2h ago' },
                    { e: '🟡', t: 'High humidity forecast tomorrow', s: '5h ago' },
                    { e: '🔵', t: 'Zinc deficiency advisory issued', s: '1d ago' },
                  ].map((n, i) => (
                    <div key={i} className="notif-item" onClick={() => { setActivePage('alerts'); setShowNotif(false); }}>
                      <span className="notif-emoji">{n.e}</span>
                      <div>
                        <div className="notif-item-title">{n.t}</div>
                        <div className="notif-item-time">{n.s}</div>
                      </div>
                    </div>
                  ))}
                  <button className="notif-see-all" onClick={() => { setActivePage('alerts'); setShowNotif(false); }}>View all alerts →</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">
          {pages[activePage]}
        </main>
      </div>
    </div>
  );
}

function NavItem({ item, active, setActive, label }) {
  const Icon = item.icon;
  const isActive = active === item.id;
  return (
    <button className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => setActive(item.id)}>
      <span className="nav-icon"><Icon /></span>
      <span className="nav-label">{label}</span>
      {item.badge && <span className={`nav-badge ${item.badgeType || 'warn'}`}>{item.badge}</span>}
    </button>
  );
}

function GridIcon() { return <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v5H2V2zm7 0h5v5H9V2zM2 9h5v5H2V9zm7 0h5v5H9V9z"/></svg>; }
function ScanIcon() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><path d="M9 11.5h5M11.5 9v5"/></svg>; }
function ListIcon() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M3 8h7M3 12h5"/></svg>; }
function DnaIcon() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 2c0 2 6 3 6 6S5 12 5 14M11 2c0 2-6 3-6 6s6 4 6 6"/><path d="M3.5 5h9M3.5 11h9"/></svg>; }
function SoilIcon() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 13c0-4 2-6 5-8 3 2 5 4 5 8"/><circle cx="8" cy="9" r="2"/></svg>; }
function MapIcon() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 2a8 8 0 0 1 0 12M8 2a8 8 0 0 0 0 12M2 8h12"/></svg>; }
function BellIcon() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2a5 5 0 0 1 5 5c0 3 1.5 4 1.5 4H1.5S3 10 3 7a5 5 0 0 1 5-5z"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/></svg>; }
function SettingsIcon() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg>; }
