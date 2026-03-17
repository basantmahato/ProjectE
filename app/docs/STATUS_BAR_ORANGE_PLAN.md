# Plan: Orange Status Bar on Tab Screens

## Problem

The system status bar (time, battery, signal) stayed **white** while the app header below it was **orange** (primary), so the top of the screen looked disconnected.

## Root Cause

In `app/_layout.tsx`, `StatusBar` was always set to the **page background** (`lightColors.background` / `darkColors.background`), not the header’s **primary** color.

---

## Fix (Implemented)

### 1. Route-aware status bar in root layout

**File:** [app/app/_layout.tsx](app/app/_layout.tsx)

- Use `useSegments()` from `expo-router` to detect when the user is on a tab screen.
- **When `segments[0] === '(tabs)'`:**
  - `backgroundColor` = primary (orange) for both light and dark theme.
  - `style` = `"light"` so status bar content (time, icons) stays readable on orange.
- **On all other screens** (auth, onboarding, blog, etc.):
  - Keep `backgroundColor` = theme background.
  - Keep `style` = theme-based (`"light"` in dark, `"dark"` in light).

Result: On Dashboard, Tests, Notes, Explore, and Settings the status bar background is orange and matches the header.

---

## Platform Notes

| Platform | Behavior |
|----------|----------|
| **Android** | `StatusBar` `backgroundColor` is applied; status bar should appear orange on tab screens. |
| **iOS** | Status bar is often transparent; the system may not paint a solid orange bar. For a stronger match on iOS, use the optional step below. |

---

## Optional: iOS – Extend header under status bar

If on **iOS** the status bar still doesn’t look orange:

1. **Enable translucent status bar**  
   In the root layout (or only when `isTabScreen`), set StatusBar so the bar is translucent (e.g. via `expo-status-bar` / React Native options if supported).

2. **Extend orange header under the status bar**  
   On tab screens that use `DashboardHeader`:
   - Use `SafeAreaView` with `edges={['left', 'right', 'bottom']}` only (no top inset), **or**
   - Add top padding to `DashboardHeader` equal to the status bar height (e.g. `Constants.statusBarHeight` or `useSafeAreaInsets().top`) so the orange header is the first visible content and draws behind the status bar.

3. **Keep status bar content readable**  
   Keep `style="light"` so time and icons stay light on the orange.

No code changes are required for this optional step unless you see the issue on iOS.

---

## Verification

1. **Android:** Open the app, go to Dashboard (or any tab). Status bar background should be orange; time and icons light.
2. **Other screens:** Open auth, onboarding, or a non-tab screen. Status bar should use the normal background (e.g. white in light mode).
3. **Theme switch:** Toggle dark mode on a tab screen; status bar should remain primary (orange) with light content.

---

## Summary

| Step | Status |
|------|--------|
| Route-aware status bar (tabs = primary, others = background) | Done in `_layout.tsx` |
| iOS translucent + extend header (optional) | Not done; add only if needed on iOS |
