import { useConvexAuth } from "@convex-dev/auth/react";

/**
 * SSR-safe wrapper around useConvexAuth.
 *
 * `useConvexAuth()` returns `undefined` during server-side rendering because the
 * Convex React context is only available on the client. This hook provides safe
 * defaults so components don't crash when destructuring during SSR.
 */
export function useSsrConvexAuth() {
  const auth = useConvexAuth();

  if (!auth) {
    return {
      isLoading: true,
      isAuthenticated: false,
      isLoggedIn: false,
    };
  }

  return auth;
}
