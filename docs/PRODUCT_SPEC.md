# Mini ERP — product spec (draft → Firestore)

Stack: **Google Apps Script (HtmlService) + Firestore + Auth + Storage**.  
Your earlier draft mentioned Realtime DB; this repo uses **Firestore** with equivalent collections.

## Bootstrap admin

Create **`admins/{tu_uid}`** (empty map `{}` is fine) in Firestore for each administrator UID. Only those UIDs can **write** `productos/{codigo}`.

## Data model (high level)

| Concept | Firestore path |
|--------|----------------|
| Per-user ERP data | `users/{uid}/…` |
| Catálogo global | `productos/{codigo}` |
| Admin flag | `admins/{uid}` (existence only) |

### `users/{uid}/cajaEvents`

Fields: `type` (`OPEN` \| `CLOSE` \| `VENTA` \| `GASTO` \| `ABONO`), `amount`, `note`, `createdAt`.

### `users/{uid}/purchases`

`vendor`, `lines[]`, `source`, optional `photoUrl`, `createdAt`.

### `traslados/{id}` (colección global)

`ownerUid`, `fromPlace`, `toPlace`, `lines[]`, `estado` (`pendiente` \| `aprobado`), `note`, `createdAt`, `updatedAt`.  
**Admin** puede leer todos y **Aprobar**; cada usuario ve los suyos (`ownerUid`).

*(Los documentos antiguos en `users/{uid}/transfers` ya no los usa la UI; puedes borrarlos o migrarlos a mano.)*

### `users/{uid}/payrollEntries`

`employee`, `periodLabel`, `amount`, `note`, `kind` (`registro` \| `adelanto`) — extend as needed.

### `users/{uid}/transferPayments`

`amount`, `medio`, `beneficiary`, `photoUrl`, `createdAt`.

### `productos/{codigo}`

`nombre`, `costo`, `precio`, `stock`, `cat`, `updatedAt`.

## Implemented vs roadmap

| Area | Status |
|------|--------|
| Google login | Done |
| Caja + tipos + Informe Z CSV | Done (draft Informe columns) |
| Compras + OCR texto + verificación vs catálogo (heurística) | Partial |
| Catálogo búsqueda + CSV import (admin) + muestra | Done |
| Traslados + aprobación admin | Done (`traslados` global) |
| Nómina | Basic |
| Pagos transferencia + foto (Storage) | Done |
| Roles cajero/empleado (ocultar tabs) | Roadmap (use `admins` + future `profile`) |
| OCR foto nativo (Camera → Vision / Drive) | Roadmap (GAS server or client API) |
| Excel export compras (SpreadsheetApp) | Roadmap |
| `catalogoA.xlsx` directo | Roadmap — usar **CSV** exportado desde Excel por ahora |

## Android “app”

Ver `mobile/android-webview/README.md`: WebView APK que abre la URL del Web App desplegado.
