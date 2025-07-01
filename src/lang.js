let currentLang = 'en';
let translations = {};

export async function loadTranslations(scene) {
  // Cargar archivo de traducción si aún no está cargado
  if (!scene.cache.json.exists('translations')) {
    scene.load.json('translations', 'assets/lang.json');
    await new Promise(resolve => scene.load.once('complete', resolve));
    scene.load.start();
  }

  translations = scene.cache.json.get('translations');

  // Detectar idioma del navegador
  const browserLang = navigator.language.slice(0, 2);
  currentLang = translations[browserLang] ? browserLang : 'en';
}

export function t(key, vars = {}) {
  let text = translations[currentLang]?.[key] || key;

  // Reemplazar los placeholders tipo {score} por sus valores reales
  for (const [k, v] of Object.entries(vars)) {
    text = text.replaceAll(`{${k}}`, v); // Soporta múltiples ocurrencias
  }

  return text;
}

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
  } else {
    console.warn(`Idioma no soportado: ${lang}`);
  }
}

export function getLang() {
  return currentLang;
}
