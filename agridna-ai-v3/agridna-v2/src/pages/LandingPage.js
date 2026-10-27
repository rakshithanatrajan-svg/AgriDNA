import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const { goTo } = useApp();
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(142,203,42,${p.opacity})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const features = [
    { icon: '🌿', title: 'AI Leaf Scan', desc: 'CNN-powered instant disease detection from a single photo with 95%+ accuracy' },
    { icon: '🧬', title: 'Crop Memory Model', desc: 'Multi-season nutrient depletion tracking and yield risk intelligence' },
    { icon: '🗺️', title: 'Village Graph AI', desc: 'Cluster farms to predict outbreak spread and coordinate crop rotations' },
    { icon: '🎙️', title: 'Tamil Voice Assistant', desc: 'Full Tamil language support for accessibility in every village' },
    { icon: '🌱', title: 'Soil Vitality Score', desc: 'Real-time organic index, pH, NPK balance and chemical load tracking' },
    { icon: '⚡', title: 'Instant Advisories', desc: 'Hyperlocal disease alerts, weather forecasts, and subsidy notifications' },
  ];

  const stats = [
    { v: '50,000+', l: 'Farmers Helped' },
    { v: '2.3M+', l: 'Scans Processed' },
    { v: '6', l: 'Indian Languages' },
    { v: '95%+', l: 'AI Accuracy' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: 'var(--font-body)', overflow: 'auto', position: 'relative',
    }}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Gradient overlays */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 50% at 20% 20%, rgba(142,203,42,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(34,201,154,0.05) 0%, transparent 60%)',
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 6vw', height: 64,
        background: 'rgba(12,26,9,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #5E8F1A, #22C99A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(142,203,42,0.3)',
          }}>
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <path d="M11 2C7 2 4 5.5 4 9.5c0 2.5 1.2 4.7 3 6.2L11 19l4-3.3c1.8-1.5 3-3.7 3-6.2C18 5.5 15 2 11 2z" fill="white" opacity="0.9"/>
              <path d="M11 5v9M8 8.5l3-3.5 3 3.5" stroke="#0F2011" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Agri<span style={{ color: 'var(--accent)' }}>DNA</span> <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text4)', letterSpacing: '0.5px' }}>AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => goTo('login')}>Sign in</button>
          <button className="btn btn-primary btn-sm" onClick={() => goTo('signup')}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 6vw 64px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 20,
          background: 'rgba(142,203,42,0.09)', border: '1px solid rgba(142,203,42,0.22)',
          fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 28,
          letterSpacing: '0.3px',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
          Powering Precision Agriculture in Rural India
        </div>

        <h1 style={{
          fontFamily: 'var(--font-head)', fontWeight: 800,
          fontSize: 'clamp(36px, 5vw, 64px)',
          color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-1.5px',
          maxWidth: 820, margin: '0 auto 20px',
        }}>
          Your Farm's Living<br />
          <span style={{ color: 'var(--accent)' }}>Intelligence</span> Profile
        </h1>

        <p style={{
          fontSize: 'clamp(14px, 1.5vw, 18px)',
          color: 'var(--text3)', maxWidth: 560,
          margin: '0 auto 40px', lineHeight: 1.7,
        }}>
          Diagnose crop disease from a smartphone photo, track multi-season soil health, and get ahead of disease outbreaks before they spread.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => goTo('signup')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 1v10M1 6h10"/></svg>
            Start Scanning Free
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => goTo('login')}>
            Sign In to Dashboard →
          </button>
        </div>

        {/* Hero visual */}
        <div style={{
          marginTop: 64, position: 'relative', maxWidth: 900, margin: '64px auto 0',
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(142,203,42,0.08)',
        }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {['#E24B4A','#F0A500','#7EC828'].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text4)', fontFamily: 'monospace' }}>AgriDNA AI — Crop Intelligence Dashboard</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--border)', padding: 1 }}>
            {[
              { label: 'Disease Detected', value: 'Rice Blast', color: 'var(--danger)', sub: '96% confidence' },
              { label: 'Soil Health Score', value: '78/100', color: 'var(--accent)', sub: '↑ +5 this month' },
              { label: 'Village Alerts', value: '3 Active', color: 'var(--warn)', sub: '1.2km · Outbreak' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', padding: '22px 20px' }}>
                <div style={{ fontSize: 11, color: 'var(--text4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text4)' }}>{m.sub}</div>
              </div>
            ))}
          </div>
          {/* Fake chart row */}
          <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-end', gap: 4, borderTop: '1px solid var(--border)' }}>
            {[40,55,35,70,85,60,90,78,65,88,72,95].map((h, i) => (
              <div key={i} style={{
                flex: 1, height: h * 0.8, background: i === 11 ? 'var(--accent)' : `rgba(142,203,42,${0.1 + i * 0.06})`,
                borderRadius: '3px 3px 0 0', minHeight: 4, transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '48px 6vw', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '24px 16px',
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 16,
              animation: `fadeIn 0.4s ${i * 0.08}s ease both`,
            }}>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 28, color: 'var(--accent)', marginBottom: 6 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'var(--text4)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '48px 6vw 80px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 32, textAlign: 'center', marginBottom: 8, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Everything your farm needs
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text3)', marginBottom: 48, fontSize: 15 }}>
          Built for Indian farmers. Powered by AI.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              padding: '24px 22px',
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 16, transition: 'all 0.18s', cursor: 'default',
              animation: `fadeIn 0.35s ${i * 0.07}s ease both`,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(142,203,42,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '64px 6vw', textAlign: 'center', position: 'relative', zIndex: 1,
        borderTop: '1px solid var(--border)',
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(142,203,42,0.05) 0%, transparent 70%)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 34, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.5px' }}>
          Start protecting your farm today
        </h2>
        <p style={{ color: 'var(--text3)', marginBottom: 32, fontSize: 15 }}>Free to use. No equipment needed. Just your smartphone.</p>
        <button className="btn btn-primary btn-lg" onClick={() => goTo('signup')}>
          Create Free Account →
        </button>
      </section>
    </div>
  );
}
