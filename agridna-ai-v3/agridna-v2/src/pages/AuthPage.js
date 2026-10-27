import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AuthPage({ mode }) {
  const { goTo, login } = useApp();
  const [form, setForm] = useState({ phone: '', name: '', place: '', land_size: '', password: '' });
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const payload = isLogin ? { user_id: form.phone, password: form.password } : { user_id: form.phone, name: form.name, place: form.place, land_size: form.land_size, password: form.password };
      
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      setLoading(false);
      
      if (data.success) {
        if (isLogin) {
          login({ name: data.name, user_id: data.user_id });
        } else {
          login({ name: form.name, user_id: form.phone });
        }
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (err) {
      setLoading(false);
      alert('Network error. Is the backend running?');
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg)', fontFamily: 'var(--font-body)',
    }}>
      {/* Left brand panel */}
      <div style={{
        width: '42%', background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '-20%',
          width: '60%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(142,203,42,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #5E8F1A, #22C99A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 28px rgba(142,203,42,0.35)',
          }}>
            <svg width="32" height="32" viewBox="0 0 22 22" fill="none">
              <path d="M11 2C7 2 4 5.5 4 9.5c0 2.5 1.2 4.7 3 6.2L11 19l4-3.3c1.8-1.5 3-3.7 3-6.2C18 5.5 15 2 11 2z" fill="white" opacity="0.9"/>
              <path d="M11 5v9M8 8.5l3-3.5 3 3.5" stroke="#0F2011" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>
            Agri<span style={{ color: 'var(--accent)' }}>DNA</span> AI
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 260 }}>
            Precision crop intelligence for every Indian farmer — powered by AI and accessible on any smartphone.
          </div>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '🌿', t: 'Instant leaf disease diagnosis' },
              { icon: '🧬', t: 'Multi-season crop memory tracking' },
              { icon: '🗺️', t: 'Village-level outbreak prediction' },
              { icon: '🎙️', t: 'Full Tamil voice support' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>{f.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', padding: '48px',
      }}>
        <div style={{ width: '100%', maxWidth: 380, animation: 'fadeIn 0.3s ease both' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 26, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.3px' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ color: 'var(--text3)', fontSize: 13.5, marginBottom: 32 }}>
            {isLogin ? 'Sign in to your AgriDNA AI dashboard' : 'Start your free precision agriculture journey'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!isLogin && (
              <>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
                  <input className="form-input" placeholder="e.g. Ravi Kumar" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Place (Village/Town)</label>
                  <input className="form-input" placeholder="e.g. Thanjavur" value={form.place} onChange={e => setForm(p => ({ ...p, place: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Land Size (Acres) <span style={{fontWeight:400}}>(Optional)</span></label>
                  <input className="form-input" placeholder="e.g. 5" type="number" value={form.land_size} onChange={e => setForm(p => ({ ...p, land_size: e.target.value }))} />
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Mobile Number</label>
              <input className="form-input" placeholder="+91 98765 43210" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
              <input className="form-input" placeholder="Enter password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0A1A06', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                isLogin ? 'Sign In →' : 'Sign Up →'
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text4)' }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => goTo(isLogin ? 'signup' : 'login')} style={{ color: 'var(--accent)', padding: '0 4px' }}>
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => goTo('landing')} style={{ color: 'var(--text4)' }}>
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
