# Mini ERP (Google Apps Script + Firestore)

Web app with **Firebase Auth (Google)** and **Firestore** in the browser (offline cache). Works on desktop and Android Chrome.

**Support / AI agents:** read [`AGENT_SETUP_STATUS.md`](AGENT_SETUP_STATUS.md) first for what is known vs still unknown (no secrets stored there).

## Prerequisites

- Google account
- Firebase project with **Firestore** enabled
- Optional: [`clasp`](https://github.com/google/clasp) to push files from this folder

## Firebase console

1. Create a project → enable **Firestore** (production mode after you paste rules).
2. Authentication → **Sign-in method**:
   - **Email/Password** → Enable (requerido para usuarios con correo + contraseña).
   - **Google** → opcional (solo si quieres el bloque «Opcional: Google» en la pantalla de login).
3. Authentication → **Settings** → **Authorized domains** → **Add domain** (solo el **host**, sin `https://` y sin rutas como `/macros/.../exec`):
   - `script.google.com`
   - `script.googleusercontent.com`
   - Si tras eso sigue `auth/unauthorized-domain`, abre la Web App, pulsa login y lee el mensaje rojo: incluirá el **hostname exacto** de la vista (p. ej. `n-xxxx.script.googleusercontent.com`) y debes añadir **esa misma** línea en Authorized domains.
4. Project settings → **Your apps** → Web app → copy config values.

## Firestore rules

From this folder (after `firebase login`):

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Traslados usan la colección **`traslados`** con índice `ownerUid` + `createdAt` (incluido en `firestore.indexes.json`). Si el cliente pide crear un índice, vuelve a desplegar índices.

Rules include:

- `users/{uid}/**` — only that signed-in user.
- `productos/{codigo}` — **read** any signed-in user; **write** only if document **`admins/{yourUid}`** exists (create it manually in Firestore for shop admins).
- `admins/{uid}` — each user may **read** only their own admin marker (used for UI).

## Catálogo + Informe Z + Pagos

- **Catálogo:** tab *Catálogo* — carga Firestore, búsqueda local; **admin** puede sembrar muestra e importar **CSV** (`codigo,nombre,costo,precio,stock,cat`). Para miles de filas, exporta `catalogoA.xlsx` → **CSV** desde Excel.
- **Informe Z:** tab *Caja* — CSV por día (America/Bogota) según sumas de movimientos.
- **Pagos:** captura a **Firebase Storage** bajo `users/{uid}/pagos/…` + registro en `transferPayments`.

## App Android (WebView)

Ver `mobile/android-webview/README.md` y `MainActivity.kt` (pega en un proyecto **Empty Activity** de Android Studio y configura `webapp_url`).

## Storage rules

```bash
firebase deploy --only storage
```

Rules live in `storage.rules` (scoped to `users/{uid}/**` in the bucket).

## Apps Script properties

If the web app shows **Faltan Script properties**, open the script editor → **Project Settings → Script properties** and add each key (values from Firebase **Web** config). Name list only: `script-properties.example.txt`.

In the Apps Script editor: **Project Settings → Script properties**:

| Property | Example |
|----------|---------|
| `FIREBASE_API_KEY` | from web config |
| `FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `your-project` |
| `FIREBASE_APP_ID` | `1:...:web:...` |
| `FIREBASE_STORAGE_BUCKET` | recommended (required for **Pagos** capturas) |
| `FIREBASE_MESSAGING_SENDER_ID` | optional |

## Deploy with clasp

```bash
clasp login
clasp create --type standalone --title "Mini ERP" --rootDir .
```

Copy the returned script ID into `.clasp.json` → `"scriptId": "..."`, then:

```bash
clasp push
```

In the script editor: **Deploy → New deployment → Web app**  
Execute as: **User accessing the web app**  
Who has access: start with **Only myself**, then widen for your team.

## Files

- `Code.gs` — serves `Index.html`, exposes `getFirebaseWebConfig()`.
- `Index.html` — UI + Firebase (Caja + Informe Z, Compras + verificación catálogo, Traslados, Nómina, Pagos, Catálogo).
- `firestore.rules` — usuarios, `productos`, `admins` (ver README arriba).
- `docs/PRODUCT_SPEC.md` — borrador funcional vs implementado.
- `mobile/android-webview/` — plantilla WebView para Android Studio.
- `examples/` — muestra Informe POS (`pos_z_inform_export.json`) y CSV catálogo; no va a Apps Script con clasp.
- `script-properties.example.txt` — nombres de propiedades para copiar en Apps Script.
- `firebase.json` / `.firebaserc` — CLI deploy for Firestore + Storage rules.
- `firestore.indexes.json` — indexes (empty until you add composite queries).

Server-side Vision OCR is not wired; use **Compras → pegar texto OCR** or extend `Code.gs` with Cloud Vision and the right OAuth scopes.
"# Mini-ERP" 
