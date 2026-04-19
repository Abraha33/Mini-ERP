/**
 * Mini ERP — Firestore + Firebase Auth (client).
 * Configure Script Properties (Project Settings → Script properties):
 *   FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_APP_ID
 * Optional: FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID
 */

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Mini ERP')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Safe for google.script.run — lists missing required keys (no secret values).
 */
function getSetupStatus() {
  var p = PropertiesService.getScriptProperties();
  var required = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_APP_ID',
  ];
  var missing = [];
  for (var i = 0; i < required.length; i++) {
    if (!p.getProperty(required[i])) missing.push(required[i]);
  }
  return {
    missing: missing,
    ready: missing.length === 0,
    hasStorageBucket: !!p.getProperty('FIREBASE_STORAGE_BUCKET'),
  };
}

function getFirebaseWebConfig() {
  var p = PropertiesService.getScriptProperties();
  var apiKey = p.getProperty('FIREBASE_API_KEY');
  var authDomain = p.getProperty('FIREBASE_AUTH_DOMAIN');
  var projectId = p.getProperty('FIREBASE_PROJECT_ID');
  var appId = p.getProperty('FIREBASE_APP_ID');
  if (!apiKey || !authDomain || !projectId || !appId) {
    var st = getSetupStatus();
    throw new Error(
      'Faltan Script properties: ' +
        (st.missing.length ? st.missing.join(', ') : '(desconocido)') +
        '. En Apps Script: Project Settings → Script properties. Ver script-properties.example.txt en el repo.'
    );
  }
  return {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: p.getProperty('FIREBASE_STORAGE_BUCKET') || '',
    messagingSenderId: p.getProperty('FIREBASE_MESSAGING_SENDER_ID') || '',
    appId: appId,
  };
}

/**
 * Placeholder for server-side OCR (e.g. Cloud Vision). Wire credentials separately.
 */
function ocrPlaceholder_() {
  throw new Error('Server OCR not wired. Use Compras → pegar texto OCR en el cliente.');
}
