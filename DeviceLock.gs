/**
 * Device lock: Firestore paths (server-only via service account; clients have no direct access).
 *   deviceBindings/{uid}/devices/{fpHash}  → registeredAt, expiresAt?, fingerprintHint
 *   auditDevices/{uid}/history/{autoId}    → action, fingerprintHint, at, meta
 *
 * Script properties:
 *   FIREBASE_SERVICE_ACCOUNT_JSON — JSON string of Firebase/Google service account (Firestore access).
 *   DEVICE_DEV_PIN — optional; overrides built-in default (still prefer property in prod).
 *   DEVICE_LOCK_DISABLED — if "true", skips lock (dev only).
 */

var DEVICE_DEV_PIN_DEFAULT_ = 'DEV2026BUCARA';
var DEVICE_LOCK_SCOPE_ = 'https://www.googleapis.com/auth/datastore';
/** Segundos a restar de `iat` para tolerar reloj adelantado (VPN / cliente) frente a Google. */
var JWT_IAT_SKEW_SECS_ = 180;

function getDeviceDevPin_() {
  var p = PropertiesService.getScriptProperties().getProperty('DEVICE_DEV_PIN');
  return (p && String(p).trim()) || DEVICE_DEV_PIN_DEFAULT_;
}

function isDeviceLockDisabled_() {
  return (
    String(PropertiesService.getScriptProperties().getProperty('DEVICE_LOCK_DISABLED') || '')
      .toLowerCase() === 'true'
  );
}

function getFirebaseApiKey_() {
  var k = PropertiesService.getScriptProperties().getProperty('FIREBASE_API_KEY');
  if (!k) throw new Error('Falta FIREBASE_API_KEY en Script properties.');
  return k;
}

function getFirebaseProjectId_() {
  var k = PropertiesService.getScriptProperties().getProperty('FIREBASE_PROJECT_ID');
  if (!k) throw new Error('Falta FIREBASE_PROJECT_ID en Script properties.');
  return k;
}

/**
 * Normaliza PEM tras pegar en Script properties (escapes \\n literales, CRLF, trim).
 */
function normalizePrivateKeyPem_(raw) {
  if (raw == null) return '';
  var s = String(raw);
  s = s.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  s = s.replace(/[ \t]+\n/g, '\n');
  return s.trim();
}

function parseServiceAccount_() {
  var raw = PropertiesService.getScriptProperties().getProperty('FIREBASE_SERVICE_ACCOUNT_JSON');
  if (!raw || !String(raw).trim()) return null;
  var rawTrim = String(raw).replace(/^\uFEFF/, '').trim();
  try {
    var o = JSON.parse(rawTrim);
    if (o && o.private_key) {
      o.private_key = normalizePrivateKeyPem_(o.private_key);
    }
    return o;
  } catch (e) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no es JSON válido.');
  }
}

/**
 * Depuración manual (▶): devuelve un objeto y lo imprime con console.log para copiar desde el panel de ejecución.
 * No incluye la clave privada, solo metadatos y comprobaciones PEM.
 */
function debugServiceAccountKeyStats() {
  var results = {
    fecha_diagnostico: new Date().toISOString(),
    propiedad_presente: false,
    raw_property_length: 0,
    json_valido: false,
    client_email: 'N/A',
    key_length: 0,
    starts_with_begin: false,
    ends_with_end: false,
    contains_line_breaks: false,
    possible_truncation: false,
  };

  var raw = PropertiesService.getScriptProperties().getProperty('FIREBASE_SERVICE_ACCOUNT_JSON');
  if (!raw || !String(raw).trim()) {
    results.error = 'FIREBASE_SERVICE_ACCOUNT_JSON vacío o ausente en Script Properties.';
    console.log('=== COPIA ESTE RESULTADO (debug service account) ===');
    console.log(JSON.stringify(results, null, 2));
    console.log('===');
    return results;
  }

  results.propiedad_presente = true;
  results.raw_property_length = String(raw).length;

  var sa;
  try {
    sa = parseServiceAccount_();
  } catch (e) {
    results.error = e && e.message ? e.message : String(e);
    console.log('=== COPIA ESTE RESULTADO (debug service account) ===');
    console.log(JSON.stringify(results, null, 2));
    console.log('===');
    return results;
  }

  if (!sa) {
    results.error = 'parseServiceAccount_ devolvió null.';
    console.log('=== COPIA ESTE RESULTADO (debug service account) ===');
    console.log(JSON.stringify(results, null, 2));
    console.log('===');
    return results;
  }

  results.json_valido = true;
  results.client_email = sa.client_email || 'N/A';

  var pk = sa.private_key || '';
  results.key_length = pk.length;
  results.starts_with_begin = pk.indexOf('-----BEGIN PRIVATE KEY-----') === 0;
  results.ends_with_end = pk.indexOf('-----END PRIVATE KEY-----') !== -1;
  results.contains_line_breaks = pk.indexOf('\n') !== -1;
  results.possible_truncation = pk.length < 1500;

  console.log('=== COPIA ESTE RESULTADO (debug service account) ===');
  console.log(JSON.stringify(results, null, 2));
  console.log('===');

  return results;
}

/**
 * Una vez: valida JSON, lo minifica y guarda en Script properties (evita saltos raros al pegar en la UI).
 * Ejecutar desde el editor con argumento, p. ej. función temporal:
 *   function _tmp() { return forceSaveServiceAccount('...json una línea...'); }
 *
 * @param {string} jsonString Contenido completo del JSON de la cuenta de servicio.
 * @return {Object} { ok, message, savedLength? }
 */
function forceSaveServiceAccount(jsonString) {
  if (!jsonString || !String(jsonString).trim()) {
    return {
      ok: false,
      message:
        'Pasa el JSON como argumento. Ej.: crea _tmp() { return forceSaveServiceAccount("..."); } y ejecútala una vez.',
    };
  }
  try {
    var rawTrim = String(jsonString).replace(/^\uFEFF/, '').trim();
    var o = JSON.parse(rawTrim);
    var normalized = JSON.stringify(o);
    PropertiesService.getScriptProperties().setProperty('FIREBASE_SERVICE_ACCOUNT_JSON', normalized);
    return {
      ok: true,
      message: 'Guardado. Ejecuta debugServiceAccountKeyStats() y prueba validateDevice.',
      savedLength: normalized.length,
    };
  } catch (e) {
    return { ok: false, message: 'JSON inválido: ' + (e && e.message ? e.message : String(e)) };
  }
}

function fingerprintDocId_(fp) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(fp || ''), Utilities.Charset.UTF_8);
  var hex = [];
  for (var i = 0; i < digest.length; i++) {
    var x = (digest[i] + 256) % 256;
    hex.push((x < 16 ? '0' : '') + x.toString(16));
  }
  return hex.join('').substring(0, 40);
}

function toIso_(d) {
  return new Date(d).toISOString();
}

function verifyIdTokenAndUser_(idToken) {
  if (!idToken || !String(idToken).trim()) throw new Error('idToken requerido.');
  var apiKey = getFirebaseApiKey_();
  var url =
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(apiKey);
  var resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ idToken: String(idToken) }),
    muteHttpExceptions: true,
  });
  var code = resp.getResponseCode();
  var body = resp.getContentText();
  if (code !== 200) {
    throw new Error('Token inválido o expirado (Auth ' + code + ').');
  }
  var data = JSON.parse(body);
  if (!data.users || !data.users.length) throw new Error('Usuario no encontrado para el token.');
  var u = data.users[0];
  return { uid: u.localId, email: u.email || '' };
}

function createServiceJwt_(sa) {
  var email = String(sa.client_email || '').trim();
  if (!email) throw new Error('client_email vacío en JSON de cuenta de servicio.');
  var header = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  var now = Math.floor(Date.now() / 1000);
  var skew = JWT_IAT_SKEW_SECS_;
  if (skew < 0) skew = 0;
  if (skew > 300) skew = 300;
  // Google: (exp - iat) <= 3600 s.
  var iat = now - skew;
  var exp = iat + 3600;
  var claim = {
    iss: email,
    sub: email,
    scope: String(DEVICE_LOCK_SCOPE_ || '').trim(),
    aud: 'https://oauth2.googleapis.com/token',
    iat: iat,
    exp: exp,
  };
  var payload = Utilities.base64EncodeWebSafe(JSON.stringify(claim));
  var toSign = header + '.' + payload;
  var pk = normalizePrivateKeyPem_(sa.private_key || '');
  if (!pk || pk.indexOf('BEGIN PRIVATE KEY') === -1) {
    throw new Error('private_key vacía o no es PEM PKCS#8 (BEGIN PRIVATE KEY).');
  }
  var sigBytes;
  try {
    sigBytes = Utilities.computeRsaSha256Signature(Utilities.newBlob(toSign).getBytes(), pk);
  } catch (e) {
    throw new Error(
      'Error al firmar JWT (RSA): revisa que la clave esté completa en Script properties. ' +
        (e && e.message ? e.message : String(e))
    );
  }
  var sig = Utilities.base64EncodeWebSafe(sigBytes);
  return toSign + '.' + sig;
}

function getDatastoreAccessToken_() {
  var sa = parseServiceAccount_();
  if (!sa) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT_JSON en Script properties.');
  var jwt = createServiceJwt_(sa);
  var grant = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
  var formBody =
    'grant_type=' + encodeURIComponent(grant) + '&assertion=' + encodeURIComponent(jwt);
  var resp = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: formBody,
    muteHttpExceptions: true,
  });
  var http = resp.getResponseCode();
  var body = resp.getContentText();
  if (http !== 200) {
    throw new Error('OAuth2 token HTTP ' + http + ': ' + body);
  }
  var data = JSON.parse(body);
  if (!data.access_token) {
    throw new Error('No se pudo obtener access_token: ' + body);
  }
  return data.access_token;
}

/** Decodifica el payload del JWT (solo diagnóstico; no incluye la firma). */
function jwtPayloadPreview_(jwt) {
  var parts = String(jwt || '').split('.');
  if (parts.length < 2) return '';
  try {
    var dec = Utilities.base64DecodeWebSafe(parts[1]).getDataAsString();
    return dec.length > 500 ? dec.substring(0, 500) + '\u2026' : dec;
  } catch (e) {
    return e && e.message ? e.message : String(e);
  }
}

/**
 * Paso 3 — diagnóstico completo (▶ en el editor): firma JWT + canje OAuth2 + GET mínimo a Firestore.
 * Copia el JSON impreso en Registros / resultado de ejecución (no incluye el token completo).
 */
function DIAGNOSTICO_MAESTRO() {
  var r = {
    ts: new Date().toISOString(),
    proyecto_script: getFirebaseProjectId_(),
    jwt_firma: 'pendiente',
    oauth2: 'pendiente',
    firestore_list_http: null,
    error: null,
  };
  try {
    var sa = parseServiceAccount_();
    if (!sa) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT_JSON');
    var jwt0 = createServiceJwt_(sa);
    r.jwt_firma = 'ok';
    r.client_email = String(sa.client_email || '').trim();
    r.jwt_claim_preview = jwtPayloadPreview_(jwt0);
  } catch (e) {
    r.jwt_firma = 'error';
    r.error = e && e.message ? e.message : String(e);
    console.log(JSON.stringify(r, null, 2));
    return r;
  }
  try {
    var tok = getDatastoreAccessToken_();
    r.oauth2 = 'ok';
    r.access_token_length = String(tok).length;
    r.access_token_prefix = String(tok).substring(0, 12) + '…';
    var probe =
      'https://firestore.googleapis.com/v1/projects/' +
      encodeURIComponent(getFirebaseProjectId_()) +
      '/databases/(default)/documents?pageSize=1';
    var fr = UrlFetchApp.fetch(probe, {
      method: 'get',
      headers: { Authorization: 'Bearer ' + tok },
      muteHttpExceptions: true,
    });
    r.firestore_list_http = fr.getResponseCode();
  } catch (e2) {
    r.oauth2 = 'error';
    r.error = e2 && e2.message ? e2.message : String(e2);
  }
  console.log('=== DIAGNOSTICO_MAESTRO (copiar) ===');
  console.log(JSON.stringify(r, null, 2));
  console.log('===');
  return r;
}

function firestoreBase_() {
  return (
    'https://firestore.googleapis.com/v1/projects/' +
    encodeURIComponent(getFirebaseProjectId_()) +
    '/databases/(default)/documents'
  );
}

function firestoreGetDoc_(token, docPathSegments) {
  var path = firestoreBase_() + '/' + docPathSegments.join('/');
  var resp = UrlFetchApp.fetch(path, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true,
  });
  var code = resp.getResponseCode();
  if (code === 404) return null;
  if (code !== 200) throw new Error('Firestore GET ' + code + ': ' + resp.getContentText());
  return JSON.parse(resp.getContentText());
}

function firestorePatchDoc_(token, docPathSegments, fields, fieldMaskList) {
  var path = firestoreBase_() + '/' + docPathSegments.join('/');
  var q = fieldMaskList
    .map(function (f) {
      return 'updateMask.fieldPaths=' + encodeURIComponent(f);
    })
    .join('&');
  var url = path + '?' + q;
  var resp = UrlFetchApp.fetch(url, {
    method: 'patch',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ fields: fields }),
    muteHttpExceptions: true,
  });
  if (resp.getResponseCode() !== 200) {
    throw new Error('Firestore PATCH ' + resp.getResponseCode() + ': ' + resp.getContentText());
  }
  return JSON.parse(resp.getContentText());
}

function firestoreDeleteDoc_(token, docPathSegments) {
  var path = firestoreBase_() + '/' + docPathSegments.join('/');
  var resp = UrlFetchApp.fetch(path, {
    method: 'delete',
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true,
  });
  var code = resp.getResponseCode();
  if (code !== 200 && code !== 204) {
    throw new Error('Firestore DELETE ' + code + ': ' + resp.getContentText());
  }
}

function firestoreListChildren_(token, parentSegments) {
  var parent = firestoreBase_() + '/' + parentSegments.join('/');
  var url = parent + '?pageSize=100';
  var resp = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true,
  });
  if (resp.getResponseCode() !== 200) {
    throw new Error('Firestore LIST ' + resp.getResponseCode() + ': ' + resp.getContentText());
  }
  var raw = resp.getContentText();
  if (!raw || raw === '[]') return { documents: [] };
  var parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return { documents: parsed };
  return parsed;
}

function firestoreTimestampField_(d) {
  return { timestampValue: toIso_(d) };
}

function firestoreStringField_(s) {
  return { stringValue: String(s) };
}

function parseFirestoreTimestamp_(doc, field) {
  if (!doc || !doc.fields || !doc.fields[field] || !doc.fields[field].timestampValue) return null;
  var t = Date.parse(doc.fields[field].timestampValue);
  return isNaN(t) ? null : t;
}

function appendAudit_(token, uid, action, fingerprintHint, meta) {
  var docId = Utilities.getUuid().replace(/-/g, '').substring(0, 20);
  var url =
    firestoreBase_() +
    '/auditDevices/' +
    encodeURIComponent(uid) +
    '/history?documentId=' +
    encodeURIComponent(docId);
  var fields = {
    action: firestoreStringField_(action),
    fingerprintHint: firestoreStringField_(fingerprintHint || ''),
    at: firestoreTimestampField_(new Date()),
  };
  if (meta) {
    fields.meta = firestoreStringField_(JSON.stringify(meta).substring(0, 1500));
  }
  var resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ fields: fields }),
    muteHttpExceptions: true,
  });
  if (resp.getResponseCode() !== 200) {
    // No bloquear login si falla auditoría
    console.warn('audit write failed', resp.getContentText());
  }
}

/**
 * @param {string} idToken - Firebase ID token (cliente, recién autenticado).
 * @param {string} fingerprint - visitorId / hash del navegador (FingerprintJS).
 * @param {string} devPin - PIN maestro opcional para registrar dispositivo nuevo (24h).
 * @return {Object} { allowed, reason?, fingerprintHint? }
 */
function validateDevice(idToken, fingerprint, devPin) {
  try {
    if (isDeviceLockDisabled_()) {
      return { allowed: true, disabled: true };
    }
    var user = verifyIdTokenAndUser_(idToken);
    var uid = user.uid;
    var fp = String(fingerprint || '').trim();
    if (!fp) {
      return { allowed: false, reason: 'no_fingerprint', message: 'No se pudo leer la huella del dispositivo.' };
    }
    var sa = parseServiceAccount_();
    if (!sa) {
      return {
        allowed: false,
        reason: 'service_account_required',
        message:
          'Bloqueo por dispositivo requiere FIREBASE_SERVICE_ACCOUNT_JSON en Script properties (cuenta de servicio con rol Firestore).',
      };
    }
    var token = getDatastoreAccessToken_();
    var fpHash = fingerprintDocId_(fp);
    var hint = fp.length > 6 ? fp.substring(0, 3) + '…' + fp.substring(fp.length - 2) : '…';
    var devPath = ['deviceBindings', uid, 'devices', fpHash];
    var existing = firestoreGetDoc_(token, devPath);
    if (existing && existing.fields) {
      var exp = parseFirestoreTimestamp_(existing, 'expiresAt');
      if (exp && exp < Date.now()) {
        try {
          firestoreDeleteDoc_(token, devPath);
        } catch (e) {
          console.warn(e);
        }
        appendAudit_(token, uid, 'device_expired_removed', hint, { fpHash: fpHash });
      } else {
        return { allowed: true, fingerprintHint: hint };
      }
    }
    var listResp = firestoreListChildren_(token, ['deviceBindings', uid, 'devices']);
    var docs = Array.isArray(listResp.documents) ? listResp.documents : [];
    var hasOther = false;
    for (var j = 0; j < docs.length; j++) {
      var d = docs[j];
      if (!d || !d.name) continue;
      var leaf = d.name.split('/').pop();
      if (leaf === fpHash) continue;
      hasOther = true;
      break;
    }
    if (!hasOther) {
      var now = new Date();
      var fields = {
        fingerprintHint: firestoreStringField_(hint),
        registeredAt: firestoreTimestampField_(now),
        source: firestoreStringField_('first_auto'),
      };
      firestorePatchDoc_(token, devPath, fields, ['fingerprintHint', 'registeredAt', 'source']);
      appendAudit_(token, uid, 'first_device_bound', hint, { fpHash: fpHash });
      return { allowed: true, firstDevice: true, fingerprintHint: hint };
    }
    var pin = String(devPin || '').trim();
    var expected = getDeviceDevPin_();
    if (pin && pin === expected) {
      var until = new Date(Date.now() + 24 * 60 * 60 * 1000);
      var regFields = {
        fingerprintHint: firestoreStringField_(hint),
        registeredAt: firestoreTimestampField_(new Date()),
        expiresAt: firestoreTimestampField_(until),
        source: firestoreStringField_('dev_pin'),
      };
      firestorePatchDoc_(token, devPath, regFields, [
        'fingerprintHint',
        'registeredAt',
        'expiresAt',
        'source',
      ]);
      appendAudit_(token, uid, 'dev_pin_device_registered', hint, { fpHash: fpHash, expiresAt: toIso_(until) });
      return { allowed: true, pinUnlock: true, fingerprintHint: hint };
    }
    appendAudit_(token, uid, 'device_blocked', hint, { fpHash: fpHash });
    return {
      allowed: false,
      reason: 'unknown_device',
      deviceBlocked: true,
      message: 'Este equipo no está autorizado. Usa el PIN de desbloqueo o pide a un admin que borre dispositivos viejos.',
    };
  } catch (e) {
    return {
      allowed: false,
      reason: 'error',
      message: e && e.message ? e.message : String(e),
    };
  }
}

/**
 * Solo admins (documento admins/{uid}). Borra todos los deviceBindings del usuario objetivo.
 * @param {string} adminIdToken
 * @param {string} targetUserId
 */
function adminWipeUserDevices(adminIdToken, targetUserId) {
  try {
    var admin = verifyIdTokenAndUser_(adminIdToken);
    var token = getDatastoreAccessToken_();
    var adminDoc = firestoreGetDoc_(token, ['admins', admin.uid]);
    if (!adminDoc || !adminDoc.name) {
      return { ok: false, message: 'Solo administradores pueden borrar dispositivos.' };
    }
    var tid = String(targetUserId || '').trim();
    if (!tid) return { ok: false, message: 'targetUserId vacío.' };
    var listResp = firestoreListChildren_(token, ['deviceBindings', tid, 'devices']);
    var docs = Array.isArray(listResp.documents) ? listResp.documents : [];
    var n = 0;
    for (var i = 0; i < docs.length; i++) {
      var name = docs[i].name;
      if (!name) continue;
      var parts = name.split('/documents/')[1];
      if (!parts) continue;
      var segs = parts.split('/');
      firestoreDeleteDoc_(token, segs);
      n++;
    }
    appendAudit_(token, tid, 'admin_wipe_devices', '', { by: admin.uid, removed: n });
    return { ok: true, removed: n };
  } catch (e) {
    return { ok: false, message: e && e.message ? e.message : String(e) };
  }
}
