import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

export function OTPPage() {
  const { goTo } = useApp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const refs = useRef([]);

  function handleChange(i, v) {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v;
    setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
    if (next.every(d => d !== '') && next.join('') === '123456') {
      setTimeout(() => goTo('onboarding'), 300);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease both', maxWidth: 400, padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>📱</div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>Verify your number</h2>
        <p style={{ color: 'var(--text3)', marginBottom: 32, fontSize: 14 }}>Enter the 6-digit OTP sent to your mobile. (Try 1-2-3-4-5-6)</p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus(); }}
              maxLength={1}
              style={{
                width: 48, height: 52, textAlign: 'center',
                fontSize: 22, fontFamily: 'var(--font-head)', fontWeight: 700,
                background: 'var(--surface)', border: `1px solid ${d ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 10, color: 'var(--text)', outline: 'none',
                transition: 'all 0.15s',
              }}
            />
          ))}
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => goTo('login')} style={{ marginTop: 8 }}>← Back</button>
      </div>
    </div>
  );
}

export default OTPPage;

const steps = [
  {
    title: 'Tell us about you', sub: 'Basic information to personalise your experience',
    fields: [
      { key: 'name', label: 'Full Name', placeholder: 'Ravi Kumar', type: 'text' },
      { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', type: 'tel' },
      { key: 'village', label: 'Village / Town', placeholder: 'Thanjavur', type: 'text' },
      { key: 'state', label: 'State', placeholder: 'Tamil Nadu', type: 'text' },
    ]
  },
  {
    title: 'Your farm details', sub: 'Help us give you more accurate recommendations',
    fields: [
      { key: 'farmSize', label: 'Farm Size (hectares)', placeholder: '2.4', type: 'number' },
      { key: 'crop', label: 'Primary Crop', placeholder: 'Paddy (Rice)', type: 'text' },
      { key: 'season', label: 'Current Season', placeholder: 'Kharif 2025', type: 'text' },
      { key: 'soilType', label: 'Soil Type', placeholder: 'Clay / Sandy / Loam', type: 'text' },
    ]
  },
  {
    title: 'Almost done!', sub: 'Your AgriDNA AI dashboard is ready',
    fields: null,
  },
];

export function OnboardingPage() {
  const { goTo, login } = useApp();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: 'Ravi Kumar', phone: '+91 98765 43210', village: 'Thanjavur', state: 'Tamil Nadu',
    farmSize: '2.4', crop: 'Paddy (Rice)', season: 'Kharif 2025', soilType: 'Clay',
  });

  function next() {
    if (step < 2) setStep(s => s + 1);
    else login({ ...data, crops: [data.crop] });
  }

  const current = steps[step];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeIn 0.3s ease both' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8, fontWeight: 600 }}>
          Step {step + 1} of {steps.length}
        </div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24, color: 'var(--text)', marginBottom: 6 }}>{current.title}</h2>
        <p style={{ color: 'var(--text3)', fontSize: 13.5, marginBottom: 28 }}>{current.sub}</p>

        {current.fields ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            {current.fields.map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input
                  className="form-input" type={f.type}
                  placeholder={f.placeholder}
                  value={data[f.key] || ''}
                  onChange={e => setData(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0 28px' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🌾</div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 10 }}>
              Welcome, {data.name?.split(' ')[0] || 'Farmer'}!
            </div>
            <div style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7 }}>
              Your Living Farm Intelligence Profile for<br />
              <strong style={{ color: 'var(--accent)' }}>{data.crop || 'your crop'}</strong> in <strong style={{ color: 'var(--text2)' }}>{data.village || 'your village'}</strong> is ready.
            </div>
          </div>
        )}

        <button className="btn btn-primary" onClick={next} style={{ width: '100%', justifyContent: 'center' }}>
          {step < 2 ? 'Continue →' : 'Go to Dashboard →'}
        </button>
      </div>
    </div>
  );
}
