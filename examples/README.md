# Example data (reference only)

These files are **not** loaded by the web app automatically. Use them as references when shaping imports and Informe Z.

## `pos_z_inform_export.json`

Export-style dump (tabla de ventas con consecutivo, cliente, subtotal, IVA, total, forma de pago). The in-app **Informe Z CSV** is a **simplified cash summary** (apertura / ventas / egresos / abonos / cierre / faltante) from `cajaEvents` in Firestore. Use this JSON to align column names or to build a future **import** from your POS.

## `products_IMPORT_example.csv`

Template for **Catálogo → Importar CSV** in the app (admin). Headers must include **`codigo`** and **`nombre`**.

**`products.xls` / `catalogoA.xlsx`:** Excel cannot be parsed in the browser with the current stack. In Excel use **Save As → CSV UTF-8** with the same columns as the example, then import that CSV in the app.
