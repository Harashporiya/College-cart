const API_URL = import.meta.env.VITE_BACKEND_API_URL;

let warmed;

export const warmBackend = () => {
  if (warmed) return warmed;
  if (!API_URL) return Promise.resolve();

  let target;
  try {
    target = new URL(API_URL).origin;
  } catch {
    return Promise.resolve();
  }

  warmed = fetch(target, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-store',
    credentials: 'omit',
  }).catch(() => {
    warmed = undefined;
  });

  return warmed;
};

export default warmBackend;
