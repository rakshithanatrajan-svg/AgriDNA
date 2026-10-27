// ─────────────────────────────────────────────────────────
// AgriDNA Voice Assistant v2 — Tamil & English
// Upgraded: Robust speech synthesis with guaranteed fallback
// ─────────────────────────────────────────────────────────

// ---- SPEAK ENGINE ----
let _voices = [];
let _voicesReady = false;

function _loadVoices() {
  _voices = window.speechSynthesis.getVoices();
  _voicesReady = _voices.length > 0;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  _loadVoices();
  window.speechSynthesis.onvoiceschanged = _loadVoices;
}

function _pickVoice() {
  if (!_voicesReady) _loadVoices();
  // Priority: ta-IN → any ta → en-IN → en → first available
  return (
    _voices.find(v => v.lang === 'ta-IN') ||
    _voices.find(v => v.lang.startsWith('ta')) ||
    _voices.find(v => v.lang === 'en-IN') ||
    _voices.find(v => v.lang.startsWith('en')) ||
    _voices[0] ||
    null
  );
}

export function speakInTamil(text) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('[Voice] speechSynthesis not available');
    return;
  }

  // Cancel any current speech first
  window.speechSynthesis.cancel();

  const voice = _pickVoice();
  const utter = new SpeechSynthesisUtterance(text);

  if (voice) {
    utter.voice = voice;
    // Use Tamil lang if Tamil voice found, else fall back to en-IN  
    utter.lang = voice.lang.startsWith('ta') ? 'ta-IN' : (voice.lang || 'en-IN');
  } else {
    utter.lang = 'ta-IN';
  }

  utter.rate = 0.88;
  utter.pitch = 1.05;
  utter.volume = 1;

  utter.onerror = (e) => console.error('[Voice] Speech error:', e.error);
  utter.onstart = () => console.log('[Voice] Speaking:', text.substring(0, 40));

  // Chrome bug: speechSynthesis pauses after ~15 sec. Use resume workaround.
  const resumeTimer = setInterval(() => {
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
  }, 5000);
  utter.onend = () => clearInterval(resumeTimer);

  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ---- BUILD TAMIL SPEECH FOR DISEASE RESULT ----
export function buildTamilSpeech(result) {
  if (!result) return 'முடிவு கிடைக்கவில்லை.';

  if (result.disease === 'healthy' || result.disease === 'Healthy') {
    return 'உங்கள் பயிர் ஆரோக்கியமாக உள்ளது. தொடர்ந்து கவனிக்கவும். வாழ்த்துக்கள்!';
  }

  const diseaseTamil = {
    blast: 'பஸ்ட் நோய்',
    bacterial_leaf_blight: 'இலை கருகல் நோய்',
    bacterial_leaf_streak: 'இலை கோடு நோய்',
    bacterial_panicle_blight: 'கதிர் கருகல் நோய்',
    tungro: 'தங்க்ரோ வைரஸ் நோய்',
    dead_heart: 'தண்டு துளைப்பான் நோய்',
    brown_spot: 'பழுப்பு புள்ளி நோய்',
    downy_mildew: 'இலை அழுகல் நோய்',
    hispa: 'ஹிஸ்பா வண்டு தாக்குதல்',
  };

  const dName = diseaseTamil[result.disease] || result.disease.replace(/_/g, ' ');
  const risk = result.risk === 'HIGH' ? 'அதிக ஆபத்து கொண்ட' : 'குறைந்த ஆபத்து கொண்ட';

  let treatmentSpeech = '';
  if (result.pesticide) {
    treatmentSpeech = `மருந்து ${result.pesticide} பயன்படுத்தவும். அளவு: ${result.quantity || 'பரிந்துரைக்கப்பட்ட அளவு'}. தெளிக்கும் முறை: ${result.how_to_spray || 'சீரான முறையில் தெளிக்கவும்'}.`;
  } else if (result.bio_solution) {
    treatmentSpeech = `இயற்கை மருந்து ${result.bio_solution} பயன்படுத்தவும். தயாரிப்பு: ${result.preparation || 'பரிந்துரைக்கப்பட்ட முறையில்'}. தெளிக்கும் முறை: ${result.how_to_spray || 'இலைகள் மேல் சீராக தெளிக்கவும்'}.`;
  }

  const weatherLine = result.weather_advice
    ? `வானிலை தகவல்: ${result.weather_advice.replace(/[✅❌⚠️]/g, '')}.`
    : '';

  const soilLine = result.soil_level === 'critical'
    ? 'எச்சரிக்கை! மண் ஆரோக்கியம் மிகவும் மோசமாக உள்ளது. உடனடி நடவடிக்கை அவசியம்.'
    : result.soil_level === 'medium'
    ? 'மண் ஆரோக்கியம் சற்று குறைந்துள்ளது. கவனிக்கவும்.'
    : 'மண் நிலை நல்லபடியாக உள்ளது.';

  return `கவனிக்கவும்! உங்கள் பயிரில் ${dName} கண்டறியப்பட்டது. இது ${risk} நோய். ${treatmentSpeech} ${weatherLine} ${soilLine} மேலும் தகவலுக்கு திரையை பாருங்கள்.`;
}

// ---- SOIL SPEECH ----
export function buildSoilSpeech(soilData) {
  if (!soilData) return 'மண் தகவல் கிடைக்கவில்லை.';
  const levels = {
    healthy: 'உங்கள் மண் ஆரோக்கியமாக உள்ளது. தொடர்ந்து விவசாயம் செய்யலாம்!',
    medium: 'உங்கள் மண் சற்று பலவீனமாக உள்ளது. விரைவில் நடவடிக்கை எடுக்கவும்.',
    critical: 'எச்சரிக்கை! உங்கள் மண் மிகவும் மோசமாக உள்ளது. உடனடியாக வேளாண் உரம் போடவும்!'
  };
  return levels[soilData.level] || 'மண் நிலை அறியப்படவில்லை.';
}

// ─────────────────────────────────────────────────────────
// LISTEN ENGINE — Voice Command Recognition
// ─────────────────────────────────────────────────────────

const SpeechRecognition =
  (typeof window !== 'undefined') &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

// Tamil and English commands → action keys
const COMMAND_MAP = [
  { keys: ['scan', 'ஸ்கேன்', 'leaf', 'படம்', 'image', 'பார்', 'photo', 'detect', 'நோய்'], action: 'scan' },
  { keys: ['soil', 'மண்', 'npk', 'நைட்ரஜன்', 'vitality', 'soil health', 'fertilizer', 'உரம்'], action: 'soil' },
  { keys: ['history', 'வரலாறு', 'memory', 'நினைவு', 'past', 'record', 'crop memory'], action: 'memory' },
  { keys: ['home', 'dashboard', 'வீடு', 'முகப்பு', 'main', 'back'], action: 'dashboard' },
  { keys: ['help', 'உதவி', 'what to do', 'என்ன செய்வது', 'guide', 'instructions'], action: 'help' },
  { keys: ['alert', 'warning', 'எச்சரிக்கை', 'alarm', 'notification'], action: 'alerts' },
  { keys: ['settings', 'அமைப்பு', 'configure', 'language', 'மொழி'], action: 'settings' },
  { keys: ['stop', 'cancel', 'நிறுத்து', 'quiet', 'மவுனம்', 'silent', 'pause'], action: 'stop' },
];

function matchCommand(transcript) {
  const lower = transcript.toLowerCase().trim();
  console.log('[Voice] Heard:', lower);
  for (const cmd of COMMAND_MAP) {
    if (cmd.keys.some(k => lower.includes(k.toLowerCase()))) {
      console.log('[Voice] Matched command:', cmd.action);
      return cmd.action;
    }
  }
  return null;
}

let _recognition = null;

export function startListening({ onCommand, onInterim, onEnd, onError }) {
  if (!SpeechRecognition) {
    onError && onError('not_supported');
    return;
  }

  if (_recognition) {
    try { _recognition.stop(); } catch(e) {}
    _recognition = null;
  }

  _recognition = new SpeechRecognition();
  // Listen for both Tamil and English by cycling — ta-IN first
  _recognition.lang = 'ta-IN';
  _recognition.interimResults = true;
  _recognition.maxAlternatives = 5;
  _recognition.continuous = false;

  _recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      // Try all alternatives for better matching
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        // Check all alternatives
        for (let j = 0; j < event.results[i].length; j++) {
          const alt = event.results[i][j].transcript;
          final += alt + ' ';
        }
      } else {
        interim += transcript;
      }
    }
    if (interim && onInterim) onInterim(interim);
    if (final.trim()) {
      const action = matchCommand(final.trim());
      if (onCommand) onCommand(action, final.trim());
    }
  };

  _recognition.onerror = (e) => {
    console.error('[Voice] Recognition error:', e.error);
    if (e.error === 'no-speech') {
      speakInTamil('கேட்கவில்லை. மீண்டும் பேசவும்.');
    } else if (e.error === 'not-allowed') {
      speakInTamil('மைக்ரோஃபோன் அனுமதி தேவை.');
    }
    onEnd && onEnd();
  };

  _recognition.onend = () => {
    _recognition = null;
    onEnd && onEnd();
  };

  try {
    _recognition.start();
  } catch(e) {
    console.error('[Voice] Could not start recognition:', e);
    onEnd && onEnd();
  }
}

export function stopListening() {
  if (_recognition) {
    try { _recognition.stop(); } catch(e) {}
    _recognition = null;
  }
}

export function isSpeechAvailable() {
  return !!(
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}
