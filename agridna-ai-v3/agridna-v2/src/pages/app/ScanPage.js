import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from '../../hooks/useTranslate';
import { useApp } from '../../context/AppContext';
import {
  speakInTamil, stopSpeaking, buildTamilSpeech,
  startListening, stopListening, isSpeechAvailable
} from '../../services/voice';

const strings = {
  title: 'AI Leaf Scan', sub: 'Upload a leaf photo for instant disease diagnosis',
  drop: 'Drop leaf image here', dropSub: 'Or click to browse · JPG, PNG, HEIC',
  chooseFile: 'Browse File', openCamera: 'Open Camera',
  analyzing: 'Analysing leaf texture…', diagnosing: 'Evaluating soil & context…', generating: 'Generating smart plan…',
  result: 'Diagnosis Result', cause: 'Why It Happens', severity: 'Risk Level', stage: 'Crop Stage',
  treatment: 'Action Plan', chemical: 'Chemical Option', bio: 'Bio Solution',
  prevent: 'Weather Context',
  dosage: 'Dosage', spray: 'Spray Rules',
  newScan: 'Scan Another Leaf', scanReady: 'Ready to Scan',
  scanReadySub: 'Upload or take a photo of the affected leaf',
  confidence: 'AI Confidence', soilCheck: 'Soil Health Check',
  tips: 'Photo Tips', buy: 'Buy Online',
  tip1: 'Shoot in natural daylight', tip2: 'Focus on affected area',
  tip3: 'Include full leaf edge', tip4: 'Avoid blurry or dark shots',
  locWait: 'Locating farm context...'
};

export default function ScanPage({ setActivePage }) {
  const { t } = useTranslations(strings);
  const { user, voiceEnabled, isListening, setIsListening } = useApp();
  const [stage, setStage] = useState('idle'); // idle, analyzing, disease_popup, weather_prompt, analyzing_final, result
  const [result, setResult] = useState(null);
  const [predictedDisease, setPredictedDisease] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [interimText, setInterimText] = useState('');

  // Weather
  const [weatherMode, setWeatherMode] = useState('auto');
  const [manualWeather, setManualWeather] = useState({ temp: '', isRaining: false });
  const [autoWeather, setAutoWeather] = useState({ code: null, temp: null, locStr: 'Unknown Location' });
  const fileRef = useRef();

  // Auto-fetch GPS weather
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const req = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
          const data = await req.json();
          if (data.current_weather) {
            setAutoWeather({
              code: data.current_weather.weathercode,
              temp: data.current_weather.temperature,
              locStr: `${lat.toFixed(2)}, ${lon.toFixed(2)}`
            });
          }
        } catch (e) { console.error('Weather fetch error', e); }
      }, () => console.log('Location denied'));
    }
  }, []);

  // Auto-speak when result arrives
  useEffect(() => {
    if (stage === 'result' && result && voiceEnabled) {
      const speech = buildTamilSpeech(result);
      setTimeout(() => speakInTamil(speech), 600); // slight delay for UX
    }
  }, [stage, result, voiceEnabled]);

  // Voice command handler
  const handleVoiceCommand = useCallback((action, transcript) => {
    setIsListening(false);
    setInterimText('');
    if (action === 'scan') {
      speakInTamil('சரி, படத்தை தேர்வு செய்யவும்.');
      setTimeout(() => fileRef.current && fileRef.current.click(), 700);
    } else if (action === 'soil' && setActivePage) {
      speakInTamil('மண் ஆரோக்கிய பக்கத்திற்கு செல்கிறோம்.');
      setActivePage('soil');
    } else if (action === 'memory' && setActivePage) {
      speakInTamil('பயிர் வரலாறு பக்கத்திற்கு செல்கிறோம்.');
      setActivePage('memory');
    } else if (action === 'dashboard' && setActivePage) {
      speakInTamil('முகப்பு பக்கத்திற்கு செல்கிறோம்.');
      setActivePage('dashboard');
    } else if (action === 'alerts' && setActivePage) {
      speakInTamil('எச்சரிக்கை பக்கம் திறக்கிறோம்.');
      setActivePage('alerts');
    } else if (action === 'settings' && setActivePage) {
      speakInTamil('அமைப்புகள் பக்கம் திறக்கிறோம்.');
      setActivePage('settings');
    } else if (action === 'stop') {
      stopSpeaking();
    } else if (action === 'help') {
      speakInTamil('நான் பயிரில் நோயை கண்டறிய உதவுவேன். ஸ்கேன் என்று சொல்லுங்கள் படம் பதிவேற்ற. மண் என்று சொல்லுங்கள் மண் நிலை பார்க்க. வரலாறு என்று சொல்லுங்கள் கடந்த பதிவுகள் பார்க்க.');
    } else {
      // Unknown command — echo back what was heard
      speakInTamil(`நீங்கள் சொன்னது: ${transcript}. புரியவில்லை. ஸ்கேன், மண், உதவி, வீடு என்று சொல்லுங்கள்.`);
    }
  }, [setActivePage, setIsListening]);

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      setInterimText('');
      return;
    }
    if (!isSpeechAvailable()) {
      alert('உங்கள் உலாவியில் குரல் அங்கீகாரம் இல்லை. Google Chrome பயன்படுத்தவும்.');
      return;
    }
    setIsListening(true);
    speakInTamil('நான் கேட்டுக்கொண்டிருக்கிறேன்.');
    startListening({
      lang: 'ta-IN',
      onCommand: handleVoiceCommand,
      onInterim: (text) => setInterimText(text),
      onEnd: () => { setIsListening(false); setInterimText(''); },
      onError: () => { setIsListening(false); setInterimText(''); },
    });
  }, [isListening, handleVoiceCommand, setIsListening]);

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setStage('analyzing');
    setAnalyzeStep(0);
    setTimeout(() => setAnalyzeStep(1), 500);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('dry_run', 'true');
    try {
      const res = await fetch('http://localhost:5000/api/scan', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setPredictedDisease(data.disease);
        if (voiceEnabled) {
          const msg = data.disease === 'healthy'
            ? 'உங்கள் பயிர் ஆரோக்கியமாக உள்ளது!'
            : `${data.disease.replace(/_/g, ' ')} நோய் கண்டறியப்பட்டது. சிகிச்சை திட்டம் தயாரிக்க தொடரவும்.`;
          setTimeout(() => speakInTamil(msg), 400);
        }
        setTimeout(() => setStage('disease_popup'), 300);
      } else {
        alert(data.error || 'Failed to scan');
        reset();
      }
    } catch (e) {
      alert('Network error. Is the backend running on port 5000?');
      reset();
    }
  }

  async function proceedToFinal() {
    setStage('analyzing_final');
    setAnalyzeStep(2);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('user_id', user?.user_id || 'anonymous');
    if (weatherMode === 'auto') {
      formData.append('location', autoWeather.locStr);
      if (autoWeather.code !== null) formData.append('weather_code', autoWeather.code);
      if (autoWeather.temp !== null) formData.append('temperature', autoWeather.temp);
    } else {
      formData.append('location', 'Manual Entry');
      formData.append('weather_code', manualWeather.isRaining ? 61 : 0);
      formData.append('temperature', manualWeather.temp);
    }
    try {
      const res = await fetch('http://localhost:5000/api/scan', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setResult(data.recommendation);
        setTimeout(() => setStage('result'), 400);
      } else {
        alert(data.error || 'Failed to scan final');
        reset();
      }
    } catch (e) {
      alert('Network error.');
      reset();
    }
  }

  function reset() {
    setStage('idle'); setResult(null); setPreview(null); setImageFile(null);
    setAnalyzeStep(0); setPredictedDisease(null);
    stopSpeaking();
  }

  return (
    <div className="fade-in" style={{ position: 'relative' }}>
      <div className="page-header">
        <h1>{t.title}</h1>
        <p>{t.sub}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: upload / states */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="panel-title">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5h2l1.5-2h5L12 5h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><circle cx="8" cy="9.5" r="2.5"/></svg>
                Leaf Image
              </div>
              {stage === 'result' && (
                <button className="btn btn-outline btn-sm" onClick={reset}>{t.newScan}</button>
              )}
            </div>
            <div className="panel-body">
              {stage === 'idle' && (
                <>
                  <div
                    className={`upload-zone${drag ? ' drag' : ''}`}
                    onClick={() => fileRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                    style={{
                      border: `2px dashed ${drag ? 'var(--accent)' : 'var(--border2)'}`,
                      borderRadius: 'var(--r)', padding: '40px 24px', textAlign: 'center',
                      cursor: 'pointer', marginBottom: 14, transition: 'all 0.15s',
                      background: drag ? 'rgba(142,203,42,0.04)' : 'var(--bg3)',
                    }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 14 }}>🌿</div>
                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontSize: 14 }}>{t.drop}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{t.dropSub}</div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => fileRef.current.click()}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v10M3 7l5-5 5 5"/><rect x="2" y="13" width="12" height="2" rx="1"/></svg>
                      {t.chooseFile}
                    </button>
                    <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => fileRef.current.click()}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5h2l1.5-2h5L12 5h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><circle cx="8" cy="9.5" r="2.5"/></svg>
                      {t.openCamera}
                    </button>
                  </div>
                </>
              )}

              {(stage === 'analyzing' || stage === 'analyzing_final') && (
                <div style={{ position: 'relative', borderRadius: 'var(--r)', overflow: 'hidden', minHeight: 200 }}>
                  {preview && (
                    <img src={preview} alt="leaf" style={{ width: '100%', display: 'block', borderRadius: 'var(--r)', maxHeight: 280, objectFit: 'cover', filter: 'brightness(0.7)' }} />
                  )}
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(12,26,9,0.8)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
                    borderRadius: 'var(--r)',
                  }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', animation: 'scanBeam 1.6s ease-in-out infinite', top: 0 }} />
                    <div style={{ width: 36, height: 36, border: '3px solid rgba(142,203,42,0.2)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '80%' }}>
                      {[t.analyzing, t.diagnosing, t.generating].map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12 }}>
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: analyzeStep > i ? 'var(--accent)' : analyzeStep === i ? 'rgba(142,203,42,0.2)' : 'var(--surface)',
                            fontSize: 9, color: analyzeStep > i ? '#0A1A06' : 'var(--text3)',
                            fontWeight: 700, transition: 'all 0.3s',
                          }}>
                            {analyzeStep > i ? '✓' : i + 1}
                          </div>
                          <span style={{ color: analyzeStep >= i ? 'var(--text2)' : 'var(--text4)', transition: 'color 0.3s' }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(stage === 'result' || stage === 'disease_popup' || stage === 'weather_prompt') && preview && (
                <div className="fade-in" style={{ position: 'relative' }}>
                  <img src={preview} alt="Leaf" style={{ width: '100%', borderRadius: 'var(--r)', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
                </div>
              )}
            </div>
          </div>

          {/* Photo Tips */}
          {stage === 'idle' && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5h.01"/></svg>
                  {t.tips}
                </div>
              </div>
              <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[t.tip1, t.tip2, t.tip3, t.tip4].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(142,203,42,0.1)', border: '1px solid rgba(142,203,42,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: 'var(--accent)', flexShrink: 0, marginTop: 1,
                    }}>{i + 1}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{tip}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weather Prompt */}
          {stage === 'weather_prompt' && (
            <div className="panel fade-slide">
              <div className="panel-header">
                <div className="panel-title" style={{ color: 'var(--accent)' }}>
                  ☁️ Weather Context
                </div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <button className={`btn btn-sm ${weatherMode==='auto'?'btn-primary':'btn-outline'}`} onClick={()=>setWeatherMode('auto')} style={{flex:1}}>Auto Location</button>
                  <button className={`btn btn-sm ${weatherMode==='manual'?'btn-primary':'btn-outline'}`} onClick={()=>setWeatherMode('manual')} style={{flex:1}}>Enter Manually</button>
                </div>
                {weatherMode === 'auto' ? (
                  <div style={{ padding: 12, borderRadius: 'var(--r-sm)', background: 'var(--bg3)', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>📍</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>Location Detected</div>
                    <div style={{ fontSize: 11, color: 'var(--text4)' }}>Temp: {autoWeather.temp}°c &nbsp;·&nbsp; Weather ID: {autoWeather.code}</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text4)', marginBottom: 4, display: 'block', fontWeight: 600 }}>Temperature (°C)</label>
                      <input className="form-input" type="number" placeholder="e.g. 35" value={manualWeather.temp} onChange={e=>setManualWeather(p=>({...p, temp: e.target.value}))}/>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={()=>setManualWeather(p=>({...p, isRaining: !p.isRaining}))}>
                      <div className={`toggle ${manualWeather.isRaining?'on':'off'}`}><div className="toggle-knob"></div></div>
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>Rain Expected / Heavy Humidity</span>
                    </div>
                  </div>
                )}
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }} onClick={proceedToFinal}>
                  Get Action Plan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: POPUPS and result */}
        <div>
          {(stage === 'idle' || stage === 'analyzing') && (
            <div className="panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 56, marginBottom: 18 }}>🌿</div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, color: 'var(--text2)', marginBottom: 8 }}>{t.scanReady}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 260 }}>{t.scanReadySub}</div>
                {voiceEnabled && (
                  <div style={{ marginTop: 16, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                    🎙️ Say "ஸ்கேன்" to scan
                  </div>
                )}
              </div>
            </div>
          )}

          {stage === 'disease_popup' && (
            <div className="panel fade-in" style={{ padding: '30px 24px', textAlign: 'center', border: '2px solid var(--border2)' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>{predictedDisease === 'healthy' ? '🟢' : '⚠️'}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8, textTransform: 'capitalize' }}>
                {predictedDisease === 'healthy' ? 'Healthy Crop' : `${predictedDisease.replace(/_/g, ' ')} Disease Detected`}
              </div>
              <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 24, maxWidth: 300, marginInline: 'auto' }}>
                {predictedDisease === 'healthy'
                  ? 'Your crop is in optimal normal condition. Keep up the good farm practices!'
                  : 'We have identified the root cause. Proceed to get weather-aware treatment and soil recommendations.'}
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => predictedDisease === 'healthy' ? reset() : setStage('weather_prompt')}>
                {predictedDisease === 'healthy' ? 'Close' : 'Generate Treatment Plan'}
              </button>
            </div>
          )}

          {stage === 'result' && result && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Main result */}
              <div className="panel" style={{ borderTop: `4px solid ${result.disease === 'healthy' ? 'var(--accent)' : result.risk === 'HIGH' ? 'var(--danger)' : 'var(--warn)'}` }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24, color: 'var(--text)', textTransform: 'capitalize' }}>
                        {result.disease.replace(/_/g, ' ')}
                      </div>
                    </div>
                    {result.disease !== 'healthy' && <span className={`pill pill-${result.risk === 'HIGH' ? 'danger' : 'warn'}`}>{result.risk} RISK</span>}
                    {/* Repeat Voice Button */}
                    {voiceEnabled && (
                      <button
                        title="பேசு (Speak Again)"
                        onClick={() => speakInTamil(buildTamilSpeech(result))}
                        style={{
                          background: 'rgba(142,203,42,0.1)', border: '1px solid rgba(142,203,42,0.3)',
                          borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16,
                          color: 'var(--accent)', transition: 'all 0.15s',
                        }}>
                        🔊
                      </button>
                    )}
                  </div>
                </div>
                {result.disease !== 'healthy' && (
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, fontWeight: 600 }}>{t.cause}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{result.why_occurs}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, fontWeight: 600 }}>{t.prevent}</div>
                      <div style={{ fontSize: 13, color: result.weather_advice?.includes('❌') ? 'var(--danger)' : 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {result.weather_advice}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Treatment */}
              {result.disease !== 'healthy' && (
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v12M2 6h12M4 4l8 8M12 4L4 12"/></svg>
                      {t.treatment}
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {result.pesticide ? (
                      <div style={{ padding: '16px', borderRadius: 'var(--r-sm)', background: 'rgba(232,83,74,0.05)', border: `1px solid rgba(232,83,74,0.18)` }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800, color: 'var(--danger)', marginBottom: 8 }}>{t.chemical}</div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>{result.pesticide}</div>
                        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, display: 'grid', gridTemplateColumns: '70px 1fr', gap: 4 }}>
                          <span style={{ color: 'var(--text4)' }}>{t.dosage}:</span> <span>{result.quantity}</span>
                          <span style={{ color: 'var(--text4)' }}>{t.spray}:</span> <span>{result.how_to_spray} ({result.when_to_spray})</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '16px', borderRadius: 'var(--r-sm)', background: 'rgba(34,201,154,0.05)', border: `1px solid rgba(34,201,154,0.18)` }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800, color: 'var(--teal)', marginBottom: 8 }}>{t.bio}</div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>{result.bio_solution}</div>
                        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                          <div><span style={{ color: 'var(--text4)', display: 'inline-block', width: 70 }}>Prepare:</span> {result.preparation}</div>
                          <div style={{ marginTop: 4 }}><span style={{ color: 'var(--text4)', display: 'inline-block', width: 70 }}>{t.spray}:</span> {result.how_to_spray} ({result.when_to_spray})</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Soil Status */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 4,
                padding: '16px 20px', borderRadius: 'var(--r)',
                background: result.soil_level === 'critical' ? 'var(--danger-bg)' : result.soil_level === 'medium' ? 'var(--warn-bg)' : 'var(--teal-bg)',
                border: `1px solid ${result.soil_level === 'critical' ? 'rgba(232,83,74,0.3)' : result.soil_level === 'medium' ? 'rgba(245,166,35,0.3)' : 'rgba(34,201,154,0.3)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 24 }}>{result.soil_level === 'critical' ? '🔴' : result.soil_level === 'medium' ? '🟡' : '🟢'}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>
                    {result.soil_level === 'critical' ? 'Soil Health Critical' : result.soil_level === 'medium' ? 'Soil Getting Weak' : 'Soil Healthy'}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500, paddingLeft: 32 }}>Next Step: {result.soil_action}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Floating Voice Button ─── */}
      {voiceEnabled && (
        <div style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          {/* Interim transcript bubble */}
          {interimText && (
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '8px 14px', fontSize: 12,
              color: 'var(--text2)', maxWidth: 200, textAlign: 'center',
              boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.2s ease',
            }}>
              {interimText}
            </div>
          )}
          {/* Listening Rings */}
          {isListening && (
            <>
              <div style={{
                position: 'absolute', width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(142,203,42,0.15)', animation: 'pulse 1.2s infinite',
                top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              }} />
              <div style={{
                position: 'absolute', width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(142,203,42,0.2)', animation: 'pulse 1.2s 0.3s infinite',
                top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              }} />
            </>
          )}
          <button
            id="voice-mic-btn"
            onClick={handleMicClick}
            title={isListening ? 'நிறுத்து' : 'Tamil Voice Command'}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: isListening
                ? 'linear-gradient(135deg, #E8534A, #c0392b)'
                : 'linear-gradient(135deg, var(--accent), #6ab01a)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
              transition: 'all 0.2s', position: 'relative', zIndex: 2,
              transform: isListening ? 'scale(1.08)' : 'scale(1)',
            }}>
            {isListening ? '⏹' : '🎙️'}
          </button>
          <div style={{ fontSize: 10, color: 'var(--text4)', fontWeight: 600, letterSpacing: '0.5px' }}>
            {isListening ? 'கேட்கிறேன்...' : 'VOICE'}
          </div>
        </div>
      )}
    </div>
  );
}
