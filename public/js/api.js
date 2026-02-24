
// public/js/api.js
// ===== REAL API ONLY =====

window.API_BASE = "http://localhost:3001/api"; // Keep only one definition
window.apiFetch = async function apiFetch(path, options = {}) { // Keep only one definition
  const base = window.API_BASE.replace(/\/$/, "");
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = localStorage.getItem("token") || "";
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      (typeof data === "string" ? data : "") ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
};

// ===== getApi adapter (ให้ app.js เรียกแบบเดิมได้) =====
window.getApi = function getApi() {
  return {
    // auth
    login: (username, password) =>
      window.apiFetch(`/auth/login`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),

    // spareparts
    getSpareparts: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/spareparts${qs ? `?${qs}` : ""}`);
    },
    getSparepartById: (id) => window.apiFetch(`/spareparts/${id}`),
    createSparepart: (body) =>
      window.apiFetch(`/spareparts`, { method: "POST", body: JSON.stringify(body) }),
    updateSparepart: (id, body) =>
      window.apiFetch(`/spareparts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteSparepart: (id) =>
      window.apiFetch(`/spareparts/${id}`, { method: "DELETE" }),

    // transactions
    getTransactions: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/transactions${qs ? `?${qs}` : ""}`);
    },
    issueSparepart: (body) =>
      window.apiFetch(`/transactions/issue`, { method: "POST", body: JSON.stringify(body) }),
    returnSparepart: (body) =>
      window.apiFetch(`/transactions/return`, { method: "POST", body: JSON.stringify(body) }),
    deleteTransaction: (id) =>
      window.apiFetch(`/transactions/${id}`, { method: "DELETE" }),

    // users
    getUsers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/users${qs ? `?${qs}` : ""}`);
    },
    getUserById: (id) => window.apiFetch(`/users/${id}`),
    createUser: (body) =>
      window.apiFetch(`/users`, { method: "POST", body: JSON.stringify(body) }),
    updateUser: (id, body) =>
      window.apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteUser: (id) =>
      window.apiFetch(`/users/${id}`, { method: "DELETE" }),

    // settings / others
    getActivityLogs: () => window.apiFetch(`/activity-logs`),
    getBrandingSettings: () => window.apiFetch(`/settings/branding`),
    saveBrandingSettings: (body) =>
      window.apiFetch(`/settings/branding`, { method: "POST", body: JSON.stringify(body) }),
    getUserPermissions: () => window.apiFetch(`/settings/permissions`)
  };
};

window.API_BASE = "http://localhost:3001/api";
window.apiFetch = async function apiFetch(path, options = {}) {
  const base = window.API_BASE.replace(/\/$/, "");
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = localStorage.getItem("token") || "";
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      (typeof data === "string" ? data : "") ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
};

// ===== getApi adapter (ให้ app.js เรียกแบบเดิมได้) =====
window.getApi = function getApi() {
  return {
    // auth
    login: (username, password) =>
      window.apiFetch(`/auth/login`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),

    // spareparts
    getSpareparts: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/spareparts${qs ? `?${qs}` : ""}`);
    },
    getSparepartById: (id) => window.apiFetch(`/spareparts/${id}`),
    createSparepart: (body) =>
      window.apiFetch(`/spareparts`, { method: "POST", body: JSON.stringify(body) }),
    updateSparepart: (id, body) =>
      window.apiFetch(`/spareparts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteSparepart: (id) =>
      window.apiFetch(`/spareparts/${id}`, { method: "DELETE" }),

    // transactions
    getTransactions: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/transactions${qs ? `?${qs}` : ""}`);
    },
    issueSparepart: (body) =>
      window.apiFetch(`/transactions/issue`, { method: "POST", body: JSON.stringify(body) }),
    returnSparepart: (body) =>
      window.apiFetch(`/transactions/return`, { method: "POST", body: JSON.stringify(body) }),
    deleteTransaction: (id) =>
      window.apiFetch(`/transactions/${id}`, { method: "DELETE" }),

    // users
    getUsers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/users${qs ? `?${qs}` : ""}`);
    },
    getUserById: (id) => window.apiFetch(`/users/${id}`),
    createUser: (body) =>
      window.apiFetch(`/users`, { method: "POST", body: JSON.stringify(body) }),
    updateUser: (id, body) =>
      window.apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteUser: (id) =>
      window.apiFetch(`/users/${id}`, { method: "DELETE" }),

    // settings / others
    getActivityLogs: () => window.apiFetch(`/activity-logs`),
    getBrandingSettings: () => window.apiFetch(`/settings/branding`),
    saveBrandingSettings: (body) =>
      window.apiFetch(`/settings/branding`, { method: "POST", body: JSON.stringify(body) }),
    getUserPermissions: () => window.apiFetch(`/settings/permissions`)
  };
};

window.API_BASE = "http://localhost:3001/api";
window.apiFetch = async function apiFetch(path, options = {}) {
  const base = window.API_BASE.replace(/\/$/, "");
  const url = path.startsWith("http")
  ? path
  : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = localStorage.getItem("token") || "";
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type") && options.body !== undefined) {
  headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
  headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
  ? await res.json().catch(() => null)
  : await res.text().catch(() => "");

  if (!res.ok) {
  const msg =
  (data && (data.message || data.error)) ||
  (typeof data === "string" ? data : "") ||
  `Request failed (${res.status})`;
  throw new Error(msg);
  }

  return data;
};

// ===== getApi adapter (ให้ app.js เรียกแบบเดิมได้) =====
window.getApi = function getApi() {
  return {
  // auth
  login: (username, password) =>
  window.apiFetch(`/auth/login`, {
  method: "POST",
  body: JSON.stringify({ username, password }),
  }),

  // spareparts
  getSpareparts: (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return window.apiFetch(`/spareparts${qs ? `?${qs}` : ""}`);
  },
  getSparepartById: (id) => window.apiFetch(`/spareparts/${id}`),
  createSparepart: (body) =>
  window.apiFetch(`/spareparts`, { method: "POST", body: JSON.stringify(body) }),
  updateSparepart: (id, body) =>
  window.apiFetch(`/spareparts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteSparepart: (id) =>
  window.apiFetch(`/spareparts/${id}`, { method: "DELETE" }),

  // transactions
  getTransactions: (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return window.apiFetch(`/transactions${qs ? `?${qs}` : ""}`);
  },
  issueSparepart: (body) =>
  window.apiFetch(`/transactions/issue`, { method: "POST", body: JSON.stringify(body) }),
  returnSparepart: (body) =>
  window.apiFetch(`/transactions/return`, { method: "POST", body: JSON.stringify(body) }),
  deleteTransaction: (id) =>
  window.apiFetch(`/transactions/${id}`, { method: "DELETE" }),

  // users
  getUsers: (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return window.apiFetch(`/users${qs ? `?${qs}` : ""}`);
  },
  getUserById: (id) => window.apiFetch(`/users/${id}`),
  createUser: (body) =>
  window.apiFetch(`/users`, { method: "POST", body: JSON.stringify(body) }),
  updateUser: (id, body) =>
  window.apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteUser: (id) =>
  window.apiFetch(`/users/${id}`, { method: "DELETE" }),

  // settings / others
  getActivityLogs: () => window.apiFetch(`/activity-logs`),
  getBrandingSettings: () => window.apiFetch(`/settings/branding`),
  saveBrandingSettings: (body) =>
  window.apiFetch(`/settings/branding`, { method: "POST", body: JSON.stringify(body) }),
  getUserPermissions: () => window.apiFetch(`/settings/permissions`)
  };
};

window.API_BASE = "http://localhost:3001/api";

window.apiFetch = async function apiFetch(path, options = {}) {
  const base = window.API_BASE.replace(/\/$/, "");
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = localStorage.getItem("token") || "";
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      (typeof data === "string" ? data : "") ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
};

// ===== getApi adapter (ให้ app.js เรียกแบบเดิมได้) =====
window.getApi = function getApi() {
  return {
    // auth
    login: (username, password) =>
      window.apiFetch(`/auth/login`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),

    // spareparts
    getSpareparts: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/spareparts${qs ? `?${qs}` : ""}`);
    },
    getSparepartById: (id) => window.apiFetch(`/spareparts/${id}`),
    createSparepart: (body) =>
      window.apiFetch(`/spareparts`, { method: "POST", body: JSON.stringify(body) }),
    updateSparepart: (id, body) =>
      window.apiFetch(`/spareparts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteSparepart: (id) =>
      window.apiFetch(`/spareparts/${id}`, { method: "DELETE" }),

    // transactions
    getTransactions: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/transactions${qs ? `?${qs}` : ""}`);
    },
    issueSparepart: (body) =>
      window.apiFetch(`/transactions/issue`, { method: "POST", body: JSON.stringify(body) }),
    returnSparepart: (body) =>
      window.apiFetch(`/transactions/return`, { method: "POST", body: JSON.stringify(body) }),
    deleteTransaction: (id) =>
      window.apiFetch(`/transactions/${id}`, { method: "DELETE" }),

    // users
    getUsers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/users${qs ? `?${qs}` : ""}`);
    },
    createUser: (body) =>
      window.apiFetch(`/users`, { method: "POST", body: JSON.stringify(body) }),
    updateUser: (id, body) =>
      window.apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    deleteUser: (id) =>
      window.apiFetch(`/users/${id}`, { method: "DELETE" }),

    // activity logs (ถ้ามี route นี้จริง)
    getActivityLogs: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/activity-logs${qs ? `?${qs}` : ""}`);
    },

    // settings (ถ้ามี route นี้จริง)
    getBrandingSettings: () => window.apiFetch(`/settings/branding`),
  };
};
window.API_BASE = "http://localhost:3001/api";

window.apiFetch = async function apiFetch(path, options = {}) {
  const base = window.API_BASE.replace(/\/$/, "");
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = localStorage.getItem("token") || "";
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      (typeof data === "string" ? data : "") ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
};

// ===== getApi() adapter (เพื่อรองรับโค้ดเดิมใน app.js) =====
window.getApi = function getApi() {
  return {
    // spareparts
    getSpareparts: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/spareparts${qs ? `?${qs}` : ""}`);
    },
    getSparepartById: (id) => window.apiFetch(`/spareparts/${id}`),
    createSparepart: (body) => window.apiFetch(`/spareparts`, { method: "POST", body: JSON.stringify(body) }),
    updateSparepart: (id, body) => window.apiFetch(`/spareparts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteSparepart: (id) => window.apiFetch(`/spareparts/${id}`, { method: "DELETE" }),

    // transactions (ปรับตาม backend จริงของคุณ)
    getTransactions: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/transactions${qs ? `?${qs}` : ""}`);
    },
    issueSparepart: (body) => window.apiFetch(`/transactions/issue`, { method: "POST", body: JSON.stringify(body) }),
    returnSparepart: (body) => window.apiFetch(`/transactions/return`, { method: "POST", body: JSON.stringify(body) }),
    deleteTransaction: (id) => window.apiFetch(`/transactions/${id}`, { method: "DELETE" }),

    // users
    getUsers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/users${qs ? `?${qs}` : ""}`);
    },
    createUser: (body) => window.apiFetch(`/users`, { method: "POST", body: JSON.stringify(body) }),
    updateUser: (id, body) => window.apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    deleteUser: (id) => window.apiFetch(`/users/${id}`, { method: "DELETE" }),

    // activity logs
    getActivityLogs: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return window.apiFetch(`/activity-logs${qs ? `?${qs}` : ""}`);
    },

    // branding/settings (ปรับตาม backend จริง)
    getBrandingSettings: () => window.apiFetch(`/settings/branding`),
  };
};
// public/js/api.js

