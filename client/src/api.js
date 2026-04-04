const BASE = "/api";

function getToken() {
  return localStorage.getItem("mindmate_token");
}

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let message = data.error;
    if (!message && res.status === 500) {
      message =
        "Cannot reach the API. Start the project from the root with npm run dev, then check http://localhost:5000/api/health.";
    }
    const err = new Error(message || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export { getToken };
