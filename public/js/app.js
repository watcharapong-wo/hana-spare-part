/* public/js/app.js (CLEAN) */

// --------- Helpers ---------
function $(id) { return document.getElementById(id); }

window.showModal = function showModal() {
  const modal = $("modal");
  if (modal) modal.classList.add("show");
};

window.closeModal = function closeModal() {
  const modal = $("modal");
  if (modal) modal.classList.remove("show");
};

// close modal when click overlay
window.addEventListener("click", (e) => {
  const modal = $("modal");
  if (modal && e.target === modal) window.closeModal();
});

// --------- API accessor ---------
function api() {
  // ใช้ api.js เป็นหลัก
  if (window.api) return window.api;
  throw new Error("window.api ไม่พร้อมใช้งาน: กรุณา include /js/api.js ก่อน /js/app.js");
}

// --------- Navigation (ONLY ONE) ---------
(function () {
  const map = {
    dashboard: "dashboardView",
    spareparts: "sparepartsView",
    transactions: "transactionsView",
    reports: "reportsView",
    users: "usersView",
    settings: "settingsView",
    activity: "activityView",
  };

  function showView(viewKey) {
    document.querySelectorAll("#sidebarNav .nav-item").forEach((a) => {
      a.classList.toggle("active", a.dataset.view === viewKey);
    });

    document.querySelectorAll("main .view").forEach((v) => v.classList.remove("active"));

    const id = map[viewKey];
    const target = id ? document.getElementById(id) : null;
    if (target) target.classList.add("active");

    // call loaders if exist
    if (viewKey === "dashboard" && window.loadDashboard) window.loadDashboard();
    if (viewKey === "spareparts" && window.loadSpareparts) window.loadSpareparts();
    if (viewKey === "transactions" && window.loadTransactions) window.loadTransactions();
    if (viewKey === "reports" && window.loadReports) window.loadReports();
    if (viewKey === "users" && window.loadUsers) window.loadUsers();
    if (viewKey === "activity" && window.loadActivityLogs) window.loadActivityLogs();
    if (viewKey === "settings" && window.loadSettings) window.loadSettings();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("sidebarNav");
    if (!nav) return;

    nav.addEventListener("click", (e) => {
      const a = e.target.closest(".nav-item");
      if (!a) return;

      // logout separate
      if (a.id === "logoutMenuBtn") return;

      const viewKey = a.dataset.view;
      if (!viewKey) return;

      e.preventDefault();
      showView(viewKey);
    });

    showView("dashboard");
  });
})();

// --------- User Modal: editUser (ONLY ONE) ---------
window.editUser = async function editUser(id) {
  try {
    const result = await api().getUsers();
    const foundUser = (result.data || []).find((u) => Number(u.id) === Number(id));
    if (!foundUser) return alert("ไม่พบผู้ใช้");

    const modalBody = $("modalBody");
    if (!modalBody) return alert("ไม่พบ modalBody");

    modalBody.innerHTML = `
      <h2 class="mb-2">✏️ แก้ไขผู้ใช้</h2>
      <form id="editUserForm">
        <div class="form-group">
          <label>Username</label>
          <input type="text" value="${foundUser.username}" disabled />
        </div>

        <div class="form-group">
          <label>Password ใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)</label>
          <input type="password" name="password" minlength="8" />
        </div>

        <div class="form-group">
          <label>ชื่อ-นามสกุล</label>
          <input type="text" name="full_name" value="${foundUser.full_name || ""}" />
        </div>

        <div class="form-group">
          <label>Role *</label>
          <select name="role" required>
            <option value="admin" ${foundUser.role === "admin" ? "selected" : ""}>Admin</option>
            <option value="coadmin" ${foundUser.role === "coadmin" ? "selected" : ""}>Co-Admin</option>
            <option value="staff" ${foundUser.role === "staff" ? "selected" : ""}>Staff</option>
          </select>
        </div>

        <div style="display:flex;gap:12px;">
          <button type="submit" class="btn btn-primary">💾 บันทึก</button>
          <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
        </div>
      </form>
    `;

    const form = document.getElementById("editUserForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (!data.password) delete data.password;

      await api().updateUser(Number(id), data);
      window.closeModal();
      if (window.loadUsers) window.loadUsers();
      alert("แก้ไขผู้ใช้สำเร็จ");
    });

    window.showModal();
  } catch (err) {
    alert("เกิดข้อผิดพลาด: " + err.message);
  }
};

// --------- Logout ---------
window.logout = function logout() {
  if (!confirm("ต้องการออกจากระบบ?")) return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  location.href = "/index.html";
};