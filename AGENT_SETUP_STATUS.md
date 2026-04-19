# Agent setup status (read this first)

**Purpose:** When answering questions about Mini ERP (Firebase, Apps Script, clasp, Auth, Firestore), use this file as the **source of truth for what is known vs unknown**. Do **not** ask the user to paste secrets here; only yes/no or non-secret identifiers.

**Maintainer:** After you change Firebase, Script properties, or deployments, update the tables below (especially “Last verified”).

---

## Last verified

| Field        | Value        |
| ------------ | ------------ |
| Date         | 2026-04-19   |
| Notes        | Web App **dev** URL registrada abajo; auth email/password + Firebase props reportados OK por usuario. |

---

## Non-secret identifiers (safe in git)

| Item                         | Status / value |
| ---------------------------- | -------------- |
| Firebase `projectId`         | `mini-erp-f0d21` (user-provided; confirm in Firebase console if renamed) |
| Firebase `authDomain`        | `mini-erp-f0d21.firebaseapp.com` |
| Apps Script `scriptId` (clasp) | `1YQsvi-PbNoxG2_LtvL_LLAVAbQ8S7wUgRslUaPntkg04_ubrUGe_GI6j` |
| Web app deployment URL (test / **dev**) | `https://script.google.com/macros/s/AKfycbzWTP8aiGfh_VjzfSK8FsxYrGHufQJKrGsllRljBZAH/dev` — para producción suele usarse `/exec` en un despliegue “nuevo”. |

---

## Apps Script Script properties (values never go in this file)

`Code.gs` requires these keys in **Project Settings → Script properties**. Record only **present?** (y/n/unknown).

| Property                         | Present? | Notes |
| -------------------------------- | -------- | ----- |
| `FIREBASE_API_KEY`               | unknown  | User mapped from `firebaseConfig`; confirm in Apps Script UI. |
| `FIREBASE_AUTH_DOMAIN`           | unknown  | Should match `authDomain` above. |
| `FIREBASE_PROJECT_ID`            | unknown  | Should match `projectId` above. |
| `FIREBASE_APP_ID`                | unknown  | Required; from `firebaseConfig.appId`. |
| `FIREBASE_STORAGE_BUCKET`        | unknown  | Optional for current code. |
| `FIREBASE_MESSAGING_SENDER_ID`   | unknown  | Optional for current code. |

---

## Firebase console (manual; not fully visible from repo)

| Check                                      | Done? | Notes |
| ------------------------------------------ | ----- | ----- |
| Firestore Database created                 | unknown | |
| Firestore **Rules** match repo intent (`firestore.rules`: user-scoped `users/{uid}/**`) | unknown | Publishing happens in console / CLI, not only in repo. |
| Authentication → Google provider enabled   | unknown | User intent: yes; verify. |
| Auth → Settings → **Authorized domains** includes `script.google.com` | unknown | Required for GAS web app sign-in. |

---

## Repo / codebase (known from files)

| Item                                      | Status |
| ----------------------------------------- | ------ |
| Client: Firestore + Auth + persistence    | **HAVE** — `Index.html` |
| Server: `getFirebaseWebConfig()`          | **HAVE** — `Code.gs` |
| Firestore rules file in repo              | **HAVE** — `firestore.rules` |
| `firebase.json` includes Firestore + Storage | **HAVE** — deploy with `firebase deploy --only firestore:rules,firestore:indexes,storage` |
| Firestore paths used by UI                  | **HAVE** — under `users/{uid}/`: `cajaEvents`, `purchases`, `payrollEntries`, `transferPayments`; global `productos/{codigo}`, **`traslados/{id}`** (con `ownerUid`); `admins/{uid}` para admin |
| Android WebView wrapper                   | **HAVE** — `mobile/android-webview/` (paste into Android Studio project) |
| Full draft spec (modules / OCR / roles)   | **HAVE** — `docs/PRODUCT_SPEC.md` (roadmap vs implemented) |
| Example POS Informe + CSV catálogo        | **HAVE** — `examples/pos_z_inform_export.json`, `examples/products_IMPORT_example.csv` |
| `products.xls` in repo                      | **UNKNOWN** — app import is **CSV**; export XLS → CSV UTF-8 |
| Server-side Cloud Vision OCR              | **MISSING** — stub only in `Code.gs` |
| In-app “setup status” UI                  | **MISSING** — not required; this file is for agents/support. |

---

## clasp / local workspace

| Item            | Status |
| --------------- | ------ |
| `.clasp.json` `scriptId` | **HAVE** (see non-secret table) — confirm matches your Apps Script project. |
| `clasp push` succeeded recently | **UNKNOWN** |

---

## When the user reports an error (quick routing)

| Symptom / error hint                         | Likely cause |
| -------------------------------------------- | ------------ |
| `Missing Script Properties` from `google.script.run` | One of the required four properties is empty or misnamed. |
| Auth / `unauthorized-domain`                 | Authorized domains in Firebase Auth. |
| Firestore `permission-denied`                | Rules not published or user not signed in / wrong `users/{uid}` path. |
| Blank after load, no boot banner             | Check browser console; Firebase SDK or CSP issues. |

---

## What agents should ask for next (only if blocked)

1. Exact **error string** from browser console or Apps Script **Executions** log.  
2. Whether **Web app** is deployed as **User accessing** (recommended for per-user data).  
3. Screenshot or list of **Script property names** (not values) present in the editor.
