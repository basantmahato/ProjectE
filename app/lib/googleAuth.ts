import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_ISSUER = "https://accounts.google.com";

// Backend redirect URI (Google only accepts http/https with domain or localhost, not myapp://).
// Prefer env; fallback to localhost so we never send myapp:// (which causes 400 on Web client).
// On Android emulator, localhost goes to the emulator—use EXPO_PUBLIC_GOOGLE_REDIRECT_URI with ngrok URL for device/emulator testing.
const DEFAULT_BACKEND_REDIRECT = "http://localhost:3000/auth/google/redirect";

export function useGoogleAuthRequest() {
  const discovery = AuthSession.useAutoDiscovery(GOOGLE_ISSUER);
  const redirectUri =
    (process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI as string)?.trim() ||
    DEFAULT_BACKEND_REDIRECT;

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      scopes: ["openid", "profile", "email"],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    },
    discovery
  );

  return {
    request,
    response,
    promptAsync,
    redirectUri,
  };
}
