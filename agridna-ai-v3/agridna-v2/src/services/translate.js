// AI-powered translation service using Claude API
// Translates any UI text dynamically into the selected language

const LANG_NAMES = {
  en: 'English',
  ta: 'Tamil (தமிழ்)',
};

// Cache to avoid repeated API calls
const translationCache = {};

export async function translateText(text, targetLang) {
  if (targetLang === 'en') return text;
  if (!text || typeof text !== 'string') return text;

  const cacheKey = `${targetLang}::${text}`;
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { "Content-Type": "application/json", ...(process.env.REACT_APP_ANTHROPIC_KEY && { "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-iab": "true" }) },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a professional agricultural translator specializing in Indian regional languages. 
Translate the given UI text accurately into ${LANG_NAMES[targetLang]}.
Rules:
- Keep technical/scientific terms (like "Tricyclazole", "NPK", "pH") in English
- Keep crop names in both languages: "Rice (நெல்)" style if space allows, else native script
- Preserve numbers, units (ha, kg/L, %) as-is  
- Return ONLY the translated text, nothing else
- Match the tone: professional but accessible to farmers
- Keep it concise — UI labels should be short`,
        messages: [{ role: 'user', content: `Translate to ${LANG_NAMES[targetLang]}: "${text}"` }],
      }),
    });

    const data = await response.json();
    const translated = data.content?.[0]?.text?.trim() || text;
    // Remove surrounding quotes if Claude added them
    const clean = translated.replace(/^["']|["']$/g, '');
    translationCache[cacheKey] = clean;
    return clean;
  } catch {
    return text; // Fallback to English on error
  }
}

// Translate an entire object of strings at once (batch)
export async function translateBatch(strings, targetLang) {
  if (targetLang === 'en') return strings;

  const keys = Object.keys(strings);
  const values = Object.values(strings);

  // Check cache for each
  const results = {};
  const toFetch = [];

  keys.forEach((key, i) => {
    const cacheKey = `${targetLang}::${values[i]}`;
    if (translationCache[cacheKey]) {
      results[key] = translationCache[cacheKey];
    } else {
      toFetch.push({ key, value: values[i], index: i });
    }
  });

  if (toFetch.length === 0) return results;

  try {
    const textList = toFetch.map((item, i) => `${i + 1}. ${item.value}`).join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { "Content-Type": "application/json", ...(process.env.REACT_APP_ANTHROPIC_KEY && { "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-iab": "true" }) },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are a professional agricultural translator for Indian regional languages.
Translate each numbered item into ${LANG_NAMES[targetLang]}.
Rules:
- Keep technical terms (Tricyclazole, NPK, pH, ha, kg/L) in English
- Keep numbers and units as-is
- Return ONLY numbered translations matching the input numbers, one per line
- Format: "1. [translation]" exactly
- Be concise for UI labels`,
        messages: [{
          role: 'user',
          content: `Translate each to ${LANG_NAMES[targetLang]}:\n${textList}`,
        }],
      }),
    });

    const data = await response.json();
    const responseText = data.content?.[0]?.text || '';
    const lines = responseText.split('\n').filter(l => l.match(/^\d+\./));

    lines.forEach((line, i) => {
      if (i < toFetch.length) {
        const translation = line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim();
        const item = toFetch[i];
        results[item.key] = translation;
        translationCache[`${targetLang}::${item.value}`] = translation;
      }
    });

    // Fill any missing with originals
    toFetch.forEach(item => {
      if (!results[item.key]) results[item.key] = item.value;
    });
  } catch {
    toFetch.forEach(item => { results[item.key] = item.value; });
  }

  return results;
}

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
];
