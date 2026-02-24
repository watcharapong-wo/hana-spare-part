// public/js/spareparts.js
// Modal + Form + API สำหรับเพิ่มอะไหล่

window.showAddSparepartModal = function showAddSparepartModal() {
  // ลบ modal เดิมถ้ามี (ป้องกันซ้อน)
  let old = document.getElementById("modal");
  if (old) old.remove();
  let modal = document.createElement("div");
  modal.id = "modal";
  modal.className = "modal";
  document.body.appendChild(modal);
  modal.innerHTML = `
    <div class="modal-content">
      <h2>➕ เพิ่มอะไหล่</h2>
      <form id="addSparepartForm">
        <div class="form-group"><label>ชื่ออะไหล่ *</label><input name="name" required /></div>
        <div class="form-group"><label>จำนวน *</label><input name="quantity" type="number" min="0" required /></div>
        <div class="form-group"><label>สถานที่</label><input name="location" /></div>
        <div class="form-group"><label>หมวดหมู่</label><input name="category" /></div>
        <div class="form-group"><label>Part No.</label><input name="part_no" /></div>
        <div class="form-group"><label>ขั้นต่ำ min_stock</label><input name="min_stock" type="number" min="0" /></div>
        <div class="form-group"><label>หน่วย</label><input name="unit" /></div>
        <div style="display:flex;gap:12px;margin-top:16px;">
          <button type="submit" class="btn btn-primary">💾 บันทึก</button>
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">ยกเลิก</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add("show");
  // เพิ่ม style modal ถ้ายังไม่มี
  if (!document.getElementById('modal-style')) {
    const style = document.createElement('style');
    style.id = 'modal-style';
    style.innerHTML = `.modal{position:fixed;z-index:9999;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center}.modal-content{background:#fff;padding:32px 24px;border-radius:12px;min-width:320px;max-width:90vw;box-shadow:0 2px 16px #0002}`;
    document.head.appendChild(style);
  }
  document.getElementById("addSparepartForm").onsubmit = async function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    data.quantity = Number(data.quantity) || 0;
    data.min_stock = Number(data.min_stock) || 0;
    try {
      await window.apiFetch("/spareparts", {
        method: "POST",
        body: JSON.stringify(data),
      });
      window.closeModal();
      if (window.loadSpareparts) window.loadSpareparts();
      alert("เพิ่มอะไหล่สำเร็จ");
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
	};
}

window.loadSpareparts = async function loadSpareparts() {
  const res = await window.apiFetch("/spareparts");
  const list = Array.isArray(res?.data) ? res.data : [];
  const box = document.getElementById("sparepartsList");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<div class="muted">ไม่มีข้อมูลอะไหล่</div>';
    return;
  }
  box.innerHTML = list.map(it => `
    <div class="sparepart-card">
      <div class="sparepart-header">
        <b>${it.name}</b>
      </div>
      <div class="sparepart-body">
        <div>จำนวน: <span>${it.quantity ?? 0}</span></div>
        <div>สถานที่: <span>${it.location || "-"}</span></div>
        <div>หมวดหมู่: <span>${it.category || "-"}</span></div>
        <div>Part No.: <span>${it.part_no || "-"}</span></div>
        <div>ขั้นต่ำ: <span>${it.min_stock ?? 0}</span></div>
        <div>หน่วย: <span>${it.unit || "-"}</span></div>
      </div>
      <div class="sparepart-actions">
        <button class="btn btn-xs btn-edit" onclick="window.showEditSparepartModal(${it.id})">แก้ไข</button>
        <button class="btn btn-xs btn-danger" onclick="window.deleteSparepart(${it.id})">ลบ</button>
      </div>
    </div>
  `).join("");

  // ปรับสไตล์บล็อคอะไหล่
  if (!document.getElementById('sparepart-style')) {
    const style = document.createElement('style');
    style.id = 'sparepart-style';
    style.innerHTML = `
      .sparepart-card {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px #0001;
        margin: 12px 0;
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .sparepart-header { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
      .sparepart-body { display: flex; flex-wrap: wrap; gap: 16px; font-size: 15px; color: #333; }
      .sparepart-body > div { min-width: 120px; }
      .sparepart-actions { margin-top: 8px; }
      .btn-xs{font-size:13px;padding:4px 12px;margin-right:8px;border-radius:6px;}
      .btn-edit{background:#1976d2;color:#fff;}
      .btn-danger{background:#e53935;color:#fff;}
    `;
    document.head.appendChild(style);
  }
};

// Modal แก้ไขอะไหล่
window.showEditSparepartModal = async function showEditSparepartModal(id) {
  let modal = document.getElementById("modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }
  let data = {};
  try {
    const res = await window.apiFetch(`/spareparts/${id}`);
    data = res?.data || {};
  } catch {}
  modal.innerHTML = `
    <div class="modal-content">
      <h2>✏️ แก้ไขอะไหล่</h2>
      <form id="editSparepartForm">
        <div class="form-group"><label>ชื่ออะไหล่ *</label><input name="name" value="${data.name || ''}" required /></div>
        <div class="form-group"><label>จำนวน *</label><input name="quantity" type="number" min="0" value="${data.quantity ?? 0}" required /></div>
        <div class="form-group"><label>สถานที่</label><input name="location" value="${data.location || ''}" /></div>
        <div class="form-group"><label>หมวดหมู่</label><input name="category" value="${data.category || ''}" /></div>
        <div class="form-group"><label>Part No.</label><input name="part_no" value="${data.part_no || ''}" /></div>
        <div class="form-group"><label>ขั้นต่ำ min_stock</label><input name="min_stock" type="number" min="0" value="${data.min_stock ?? 0}" /></div>
        <div class="form-group"><label>หน่วย</label><input name="unit" value="${data.unit || ''}" /></div>
        <div style="display:flex;gap:12px;margin-top:16px;">
          <button type="submit" class="btn btn-primary">💾 บันทึก</button>
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">ยกเลิก</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add("show");
  document.getElementById("editSparepartForm").onsubmit = async function (e) {
    e.preventDefault();
    const form = new FormData(this);
    const body = Object.fromEntries(form);
    body.quantity = Number(body.quantity) || 0;
    body.min_stock = Number(body.min_stock) || 0;
    try {
      await window.apiFetch(`/spareparts/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      window.closeModal();
      if (window.loadSpareparts) window.loadSpareparts();
      alert("บันทึกสำเร็จ");
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };
};

// ลบอะไหล่
window.deleteSparepart = async function deleteSparepart(id) {
  if (!confirm("ยืนยันการลบอะไหล่นี้?")) return;
  try {
    await window.apiFetch(`/spareparts/${id}`, { method: "DELETE" });
    if (window.loadSpareparts) window.loadSpareparts();
    alert("ลบสำเร็จ");
  } catch (err) {
    alert("เกิดข้อผิดพลาด: " + err.message);
  }
  };

window.closeModal = function() {
  console.log('closeModal called'); // debug log
  // ลบ modal ทุกชนิดในหน้า (id หรือ class ชื่อ modal)
  document.querySelectorAll('[id*="modal"], .modal').forEach(m => m.remove());
};

window.forceCloseAllModals = function() {
  console.log('forceCloseAllModals called');
  document.querySelectorAll('[id*="modal"], .modal').forEach(m => m.remove());
};

// โหลดรายการอะไหล่เมื่อเข้า view
document.addEventListener("DOMContentLoaded", () => {
  // ให้ปุ่ม "เพิ่มอะไหล่" เรียก modal
  const btn = document.getElementById("addSparepartBtn");
  if (btn) btn.onclick = window.showAddSparepartModal;
  // โหลดรายการอะไหล่เมื่อเข้า view
  if (window.loadSpareparts) window.loadSpareparts();
});
