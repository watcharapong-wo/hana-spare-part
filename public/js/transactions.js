// public/js/transactions.js
// Modal + Form + API สำหรับเบิก-คืนอะไหล่

window.showTransactionModal = async function showTransactionModal(type) {
  // type: 'issue' หรือ 'return'
  const isIssue = type === 'issue';
  let modal = document.getElementById("modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }
  // โหลดรายการอะไหล่
  let spareparts = [];
  try {
    const res = await window.apiFetch("/spareparts");
    spareparts = Array.isArray(res?.data) ? res.data : [];
  } catch (e) {}
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${isIssue ? '📤 เบิกของ' : '📥 คืนของ'}</h2>
      <form id="transactionForm">
        <div class="form-group">
          <label>เลือกอะไหล่ *</label>
          <select name="sparepart_id" required>
            <option value="">-- เลือกอะไหล่ --</option>
            ${spareparts.map(sp => `<option value="${sp.id}">${sp.name} (${sp.quantity})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>จำนวน *</label>
          <input name="quantity" type="number" min="1" required />
        </div>
        <div class="form-group">
          <label>ผู้${isIssue ? 'เบิก' : 'คืน'} *</label>
          <input name="requester" required />
        </div>
        <div class="form-group">
          <label>วันที่</label>
          <input name="date" type="date" value="${(new Date()).toISOString().slice(0,10)}" />
        </div>
        <div class="form-group">
          <label>หมายเหตุ</label>
          <input name="remark" />
        </div>
        <input type="hidden" name="type" value="${isIssue ? 'ISSUE' : 'RETURN'}" />
        <div style="display:flex;gap:12px;margin-top:16px;">
          <button type="submit" class="btn btn-primary">💾 บันทึก</button>
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">ยกเลิก</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add("show");

  document.getElementById("transactionForm").onsubmit = async function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    data.quantity = Number(data.quantity) || 0;
    try {
      const apiPath = data.type === 'ISSUE' ? '/transactions/issue' : '/transactions/return';
      await window.apiFetch(apiPath, {
        method: "POST",
        body: JSON.stringify(data),
      });
      window.closeModal();
      if (window.loadTransactions) window.loadTransactions();
      if (window.loadSpareparts) window.loadSpareparts(); // อัปเดตจำนวนอะไหล่ทันที
      alert("บันทึกสำเร็จ");
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };
};

// Loader สำหรับแสดงรายการเบิก-คืนอะไหล่ (ตัวอย่างเรียกใหม่หลังเพิ่ม)
window.loadTransactions = async function loadTransactions() {
  const res = await window.apiFetch("/transactions");
  const list = Array.isArray(res?.data) ? res.data : [];
  const box = document.getElementById("transactionsList");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<div class="muted">ไม่มีข้อมูลเบิก-คืนอะไหล่</div>';
    return;
  }
  box.innerHTML = list.map(it => `
    <div class="list-row">
      <b>${it.type === 'ISSUE' ? '📤 เบิก' : '📥 คืน'}</b> ${it.sparepart_name || ''} | จำนวน: ${it.qty} | ผู้${it.type === 'ISSUE' ? 'เบิก' : 'คืน'}: ${it.requester} | ${it.date || ''}
    </div>
  `).join("");
};

document.addEventListener("DOMContentLoaded", () => {
  // ให้ปุ่ม "เบิกของ" และ "คืนของ" เรียก modal
  const issueBtn = document.getElementById("issueBtn");
  if (issueBtn) issueBtn.onclick = () => window.showTransactionModal('issue');
  const returnBtn = document.getElementById("returnBtn");
  if (returnBtn) returnBtn.onclick = () => window.showTransactionModal('return');
  // โหลดรายการเบิก-คืนเมื่อเข้า view
  if (window.loadTransactions) window.loadTransactions();
});

window.closeModal = function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.remove("show");
};
