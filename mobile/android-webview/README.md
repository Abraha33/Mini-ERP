# Mini ERP — contenedor Android (WebView)

La app real vive en **Apps Script Web App** (HTML + Firebase). Este módulo es un **APK mínimo** que solo abre tu URL en un `WebView` (útil para fijar en pantalla / distribuir sin Play Store).

## Requisitos

- [Android Studio](https://developer.android.com/studio) (Hedgehog o más nuevo).
- URL final del despliegue: **Deploy → Web app** en Apps Script (cópiala con `https://…`).

## Pasos

1. **File → New → New Project → Empty Activity**  
   Nombre paquete sugerido: `com.minierp.app`, mínimo SDK 24+, Kotlin.
2. Reemplaza el contenido de `MainActivity.kt` por el de este folder.
3. Crea `app/src/main/res/values/strings.xml` (o edita el generado) y define `webapp_url` con tu URL **entre comillas**.
4. En `AndroidManifest.xml`, asegura `<uses-permission android:name="android.permission.INTERNET" />` (suele venir ya).
5. **Run** en un dispositivo o emulador con Play Services si usas Google Sign-In en el WebView.

## Google Sign-In en WebView

Si el login falla, en Firebase **Authentication → Authorized domains** agrega también el host que use el WebView si aplica, y prueba Chrome en el dispositivo primero.

## Archivos

- `MainActivity.kt` — WebView + configuración básica.
