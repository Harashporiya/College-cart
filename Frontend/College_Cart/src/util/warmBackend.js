const API_URL = import.meta.env.VITE_BACKEND_API_URL;

let warmed;

/**
 * Nudges the API awake ahead of the first real request.
 *
 * The backend is deployed on a host that suspends idle instances, so the first
 * request after a quiet spell pays the whole container start plus the initial
 * Mongo connection. That cost landed on whatever the user did first - typically
 * pressing "Sign In" - which is why a login with perfectly good credentials
 * could sit there for the better part of a minute.
 *
 * Calling this on app start, and again when an auth screen mounts, moves that
 * wait into the seconds the user spends reading the page and typing. It does not
 * make a cold server fast, but by submit time the instance is usually already up.
 *
 * Deliberately fire-and-forget: the promise is cached so concurrent callers
 * share one request, the response body is ignored, and a failure is swallowed
 * because this is an optimisation and never a precondition.
 */
export const warmBackend = () => {
  if (warmed) return warmed;
  if (!API_URL) return Promise.resolve();

  // VITE_BACKEND_API_URL points at the /api mount; the liveness route is at the
  // origin root, so strip the path rather than provoking a 404.
  let target;
  try {
    target = new URL(API_URL).origin;
  } catch {
    return Promise.resolve();
  }

  warmed = fetch(target, {
    method: 'GET',
    mode: 'no-cors', // the root route sends no CORS headers; we only need the TCP/TLS wake-up
    cache: 'no-store',
    credentials: 'omit',
  }).catch(() => {
    // A cold instance can drop this first request outright. Reset so a later
    // caller (e.g. the login screen mounting) gets to try again.
    warmed = undefined;
  });

  return warmed;
};

export default warmBackend;
