# Google Sign-In Setup (Fix "Access blocked" / 400 invalid_request)

Google’s **Web application** OAuth client does **not** accept custom schemes like `myapp://redirect`. Redirect URIs must be **http** or **https** with a valid domain (e.g. `.com`) or `http://localhost`.

This project uses a **backend redirect**: Google redirects to your API, and the API redirects the browser to `myapp://redirect?code=...` so the app can complete sign-in.

## 1. Backend redirect (already in the API)

The API has a public GET route:

- **`GET /auth/google/redirect`** — Receives `code`, `state`, etc. from Google and redirects (302) to `myapp://redirect?code=...&state=...` so the app receives the auth code.

## 2. Web client in Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com) → your project.
2. Go to **APIs & Services** → **Credentials**.
3. Create (or edit) an OAuth 2.0 client with **Application type**: **Web application** (e.g. "Web client 1").
4. **Authorized JavaScript origins**  
   - Leave empty, or use your real web origin (e.g. `https://yourdomain.com`).  
   - Do **not** put `myapp://redirect` here (Google will show "must end with a public top-level domain").
5. **Authorized redirect URIs**  
   Add the **backend** URL that Google will redirect to (must be http/https with a valid domain or localhost), for example:
   - Production: `https://your-api-domain.com/auth/google/redirect`
   - Local (same machine): `http://localhost:3000/auth/google/redirect`
   - Dev from device/emulator: use a tunnel (e.g. ngrok): `https://xxxx.ngrok.io/auth/google/redirect`
6. Save and copy the **Client ID** and **Client secret**.

## 3. App and API configuration

- **App** (`app/.env`):  
  - `EXPO_PUBLIC_GOOGLE_CLIENT_ID` = Web client ID from step 2.  
  - `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` = **exact** redirect URI you added in Google (e.g. `https://your-api.com/auth/google/redirect` or your ngrok URL). The app sends this as `redirect_uri` in the OAuth request so Google redirects to your backend.
- **API** (`api/.env`):  
  - `GOOGLE_CLIENT_ID` = same Web client ID.  
  - `GOOGLE_CLIENT_SECRET` = Web client secret from step 2.

## 4. OAuth consent screen

- **APIs & Services** → **OAuth consent screen**.
- If the app is in **Testing**, add your Google account under **Test users**.

## Summary

| What | Value |
|------|--------|
| Redirect URI in Google (Web client) | Your backend URL, e.g. `https://your-api.com/auth/google/redirect` (must be http/https, valid domain or localhost) |
| Redirect URI in app env | Same URL in `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` |
| Client type | **Web application** (not Android) for this browser-based flow |

The Android client (package name + SHA-1) is separate and can stay for Firebase/Play; for this sign-in flow you use the **Web** client and the **backend redirect** URL above.

---

## Still getting "Access blocked" / 400 invalid_request on Android emulator?

1. **App must send a Web redirect URI**  
   The code now defaults to `http://localhost:3000/auth/google/redirect` so Google accepts the request. Restart the app (and Metro with `npx expo start --clear`) so the config is picked up.

2. **On Android emulator, localhost is the emulator**  
   After sign-in, Google redirects the browser to your redirect URI. If that URI is `http://localhost:3000/...`, the emulator’s browser opens *the emulator’s* localhost, not your PC. Your API never sees the redirect.

   **Fix for emulator/device:** use **ngrok** (or another tunnel):
   - Run your API on port 3000, then: `ngrok http 3000`
   - Copy the HTTPS URL (e.g. `https://abc123.ngrok.io`)
   - In Google Cloud (Web client), add **Authorized redirect URI**: `https://abc123.ngrok.io/auth/google/redirect`
   - In **Authorized JavaScript origins** add: `https://abc123.ngrok.io`
   - In `app/.env` set: `EXPO_PUBLIC_GOOGLE_REDIRECT_URI=https://abc123.ngrok.io/auth/google/redirect`
   - Restart the app and try again. The redirect will go to ngrok → your API → `myapp://redirect`, and the app will receive the code.
