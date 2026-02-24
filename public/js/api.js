
// ===== API BASE + apiFetch =====
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
// ===== MOCK API (CLEAN VERSION) =====

const mockUser = {
  id: 1,
  username: "admin",
  full_name: "Demo Admin",
  role: "admin"
};

function safeJsonParse(raw, fallback = null) {
  try { return JSON.parse(raw); } catch { return fallback; }
}

let user = safeJsonParse(localStorage.getItem("user"), null) || mockUser;
localStorage.setItem("user", JSON.stringify(user));
localStorage.setItem("token", "demo-token");
window.user = user;

// js/api.js
(() => {
  // ---------- helpers ----------
  function safeJsonParse(raw, fallback = null) {
    if (raw === null || raw === undefined) return fallback;
    if (typeof raw !== "string") return fallback;
    if (raw.trim() === "") return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  // ---------- demo users ----------
  const defaultAdmin = {
    id: 1,
    username: "admin",
    full_name: "Demo Admin",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    // ใส่รหัสผ่าน demo เพื่อให้ login ตรงเงื่อนไขชัดเจน
    password: "admin1234"
  };

  function getMockUsers() {
    const parsed = safeJsonParse(localStorage.getItem("mockUsers"), null);
    if (Array.isArray(parsed) && parsed.length) return parsed;
    const seed = [
      { ...defaultAdmin },
      {
        id: 2,
        username: "staff",
        full_name: "Demo Staff",
        email: "staff@example.com",
        role: "staff",
        status: "active",
        password: "staff1234"
      }
    ];
    localStorage.setItem("mockUsers", JSON.stringify(seed));
    return seed;
  }

  function saveMockUsers(users) {
    localStorage.setItem("mockUsers", JSON.stringify(users));
  }

  // ---------- demo spareparts ----------
  function getMockSpareparts() {
    const parsed = safeJsonParse(localStorage.getItem("mockSpareparts"), null);
    if (Array.isArray(parsed)) return parsed;
    const seed = [
      { id: 1, name: "HDD 1TB", quantity: 5, min_stock: 2, location: "คลังหลัก", note: "พร้อมใช้" },
      { id: 2, name: "RAM 8GB", quantity: 1, min_stock: 2, location: "คลังย่อย", note: "ใกล้หมด" },
      { id: 3, name: "SSD 512GB", quantity: 10, min_stock: 3, location: "ห้อง IT", note: "-" }
    ];
    localStorage.setItem("mockSpareparts", JSON.stringify(seed));
    return seed;
  }

  function saveMockSpareparts(items) {
    localStorage.setItem("mockSpareparts", JSON.stringify(items));
  }

  // ---------- demo transactions ----------
  function getMockTransactions() {
    const parsed = safeJsonParse(localStorage.getItem("mockTransactions"), null);
    if (Array.isArray(parsed)) return parsed;
    const seed = [
      { id: 1, type: "ISSUE", sparepart_id: 1, qty: 1, requester: "user1", created_at: "2026-02-17T09:00:00Z" },
      { id: 2, type: "RETURN", sparepart_id: 2, qty: 1, requester: "user2", created_at: "2026-02-16T09:00:00Z" }
    ];
    localStorage.setItem("mockTransactions", JSON.stringify(seed));
    return seed;
  }

  function saveMockTransactions(items) {
    localStorage.setItem("mockTransactions", JSON.stringify(items));
  }

  // ---------- state ----------
  let mockUsers = getMockUsers();
  let mockSpareparts = getMockSpareparts();
  let mockTransactions = getMockTransactions();

  // ตั้งค่า session demo ครั้งแรก
  const storedUser = safeJsonParse(localStorage.getItem("user"), null);
      window.API_BASE = "http://localhost:3001/api";
      const API_BASE = window.API_BASE;
  if (!localStorage.getItem("token")) localStorage.setItem("token", "demo-token");

  // ---------- API ----------
  const api = {
    login: async (username, password) => {
      return apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
    },

    // spareparts
    getSpareparts: async () => apiFetch('/spareparts'),
    getSparepartById: async (id) => apiFetch(`/spareparts/${id}`),
    createSparepart: async (data) => apiFetch('/spareparts', { method: 'POST', body: JSON.stringify(data) }),
        getUsers: async () => apiFetch('/users'),
        getTransactions: async () => apiFetch('/transactions'),
      const newItem = { ...data, id: Date.now() };
      newItem.quantity = Number(newItem.quantity || 0);
      newItem.min_stock = Number(newItem.min_stock || 0);
      mockSpareparts.push(newItem);
      saveMockSpareparts(mockSpareparts);
      return { data: newItem };
    },
    updateSparepart: async (id, data) => {
      id = Number(id);
      const idx = mockSpareparts.findIndex(sp => sp.id === id);
      if (idx === -1) return { data: null };
      mockSpareparts[idx] = { ...mockSpareparts[idx], ...data, id };
      mockSpareparts[idx].quantity = Number(mockSpareparts[idx].quantity || 0);
      mockSpareparts[idx].min_stock = Number(mockSpareparts[idx].min_stock || 0);
      saveMockSpareparts(mockSpareparts);
      return { data: mockSpareparts[idx] };
    },
    deleteSparepart: async (id) => {
      id = Number(id);
      mockSpareparts = mockSpareparts.filter(sp => sp.id !== id);
      saveMockSpareparts(mockSpareparts);
      return {};
    },

    // transactions
    getTransactions: async () => ({ data: mockTransactions }),
    issueSparepart: async (data) => {
      const sid = Number(data.sparepart_id);
      const qty = Number(data.qty || 1);

      const idx = mockSpareparts.findIndex(sp => sp.id === sid);
      if (idx !== -1) {
        mockSpareparts[idx].quantity = Number(mockSpareparts[idx].quantity || 0) - qty;
        saveMockSpareparts(mockSpareparts);
      }

      const newTx = {
        id: Date.now(),
        type: "ISSUE",
        sparepart_id: sid,
        qty,
        requester: data.requester || "-",
        note: data.note || "",
        created_at: new Date().toISOString()
      };
      mockTransactions.push(newTx);
      saveMockTransactions(mockTransactions);
      return { data: newTx };
    },
    returnSparepart: async (data) => {
      const sid = Number(data.sparepart_id);
      const qty = Number(data.qty || 1);

      const idx = mockSpareparts.findIndex(sp => sp.id === sid);
      if (idx !== -1) {
        mockSpareparts[idx].quantity = Number(mockSpareparts[idx].quantity || 0) + qty;
        saveMockSpareparts(mockSpareparts);
      }

      const newTx = {
        id: Date.now(),
        type: "RETURN",
        sparepart_id: sid,
        qty,
        requester: data.requester || "-",
        note: data.note || "",
        created_at: new Date().toISOString()
      };
      mockTransactions.push(newTx);
      saveMockTransactions(mockTransactions);
      return { data: newTx };
    },
    deleteTransaction: async (id) => {
      id = Number(id);
      mockTransactions = mockTransactions.filter(tx => tx.id !== id);
      saveMockTransactions(mockTransactions);
      return {};
    },

    // users
    getUsers: async () => {
      const cleaned = mockUsers.map(({ password, ...rest }) => ({ ...rest }));
      return { data: cleaned };
    },
    createUser: async (data) => {
      const newUser = {
        id: Date.now(),
        username: data.username,
        full_name: data.full_name || "",
        email: data.email || "",
        status: data.status || "active",
        role: data.role || "staff",
        password: data.password || ""
      };
      mockUsers.push(newUser);
      saveMockUsers(mockUsers);
      const { password, ...noPass } = newUser;
      return { data: noPass };
    },
    updateUser: async (id, data) => {
      id = Number(id);
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx === -1) return { data: null };
      mockUsers[idx] = { ...mockUsers[idx], ...data, id };
      saveMockUsers(mockUsers);
      const { password, ...noPass } = mockUsers[idx];
      return { data: noPass };
    },
    deleteUser: async (id) => {
      id = Number(id);
      mockUsers = mockUsers.filter(u => u.id !== id);
      saveMockUsers(mockUsers);
      return {};
    },

    // settings / others (mock)
    getActivityLogs: async () => ({ data: [] }),
    getBrandingSettings: async () => ({
      app_name: "IT Spare Parts Management",
      app_subtitle: "ระบบจัดการอะไหล่ IT",
      company_name: "Demo Company",
      logo_text: "IT",
      theme: localStorage.getItem("theme") || "light",
      menu_order: ["dashboard", "spareparts", "transactions", "reports", "users", "activity", "settings"]
    }),
    saveBrandingSettings: async (data) => {
      // เก็บไว้ใน localStorage แบบง่าย
      localStorage.setItem("brandingSettings", JSON.stringify(data));
      return {};
    },

    getUserPermissions: async () => {
      // demo: admin เห็นหมด, staff เห็นบางเมนู
      const u = safeJsonParse(localStorage.getItem("user"), null) || { role: "staff" };
      const role = String(u.role || "").toLowerCase();
      const permissions = [
        { menu_key: "dashboard", allowed: true },
        { menu_key: "spareparts", allowed: true },
        { menu_key: "transactions", allowed: true },
        { menu_key: "reports", allowed: true },
        { menu_key: "users", allowed: role === "admin" },
        { menu_key: "settings", allowed: role === "admin" },
        { menu_key: "activity", allowed: true }
      ];
      return { permissions };
    }
  };


  window.api = api;
})();

// ---- Compatibility: provide getApi for app.js ----
window.getApi = async function (path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = Object.assign({}, options.headers || {});
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      (typeof data === "string" ? data : "") ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
};
