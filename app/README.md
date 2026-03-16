# ProjE – Mobile App (Expo)

Expo (React Native) app for ProjE. Users can sign in, take tests, attempt mock tests, browse sample papers, use interview prep, read blogs, and manage billing.

## Get started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Ensure the ProjE API is running (see `api/README.md`), typically at `http://localhost:3000`.

3. Start the app:

   ```bash
   npx expo start
   ```

   Then open in a development build, Android emulator, iOS simulator, or Expo Go.

## Configuration

- The app talks to the API; set the API base URL in your app config or env (e.g. via `app.config.js` / `app.config.ts`) if it is not at the default (e.g. `http://localhost:3000` for dev).
- Google Sign-In and Razorpay require the backend to be configured with the same client/keys.

## Project structure

- **app/** – File-based routes (Expo Router).
- **components/** – Reusable UI and home dashboard pieces.
- **lib/** – API client (axios), auth, formatting.
- **store/** – Zustand stores (auth, theme, etc.).

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
