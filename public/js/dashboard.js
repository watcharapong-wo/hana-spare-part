// แสดงรายการล่าสุด (Recent Transactions)
async function renderRecentTransactions() {
  const box = document.getElementById("recentTransactions");
  if (!box) return;
  let txRes;
  try {
    txRes = await window.apiFetch("/transactions?limit=10");
  } catch (e) {
    box.innerHTML = '<div class="muted">โหลดข้อมูลไม่สำเร็จ</div>';
    return;
  }
  const txList = Array.isArray(txRes?.data) ? txRes.data : [];
  if (!txList.length) {
    box.innerHTML = '<div class="muted">ไม่มีข้อมูล</div>';
    return;
  }
  box.innerHTML = txList.slice(0, 10).map(tx => `
    <div class="list-row">
      <b>${tx.type === 'ISSUE' ? '📤 เบิก' : '📥 คืน'}</b> ${tx.sparepart_name || tx.sparepart_id} | จำนวน: ${tx.qty} | ผู้${tx.type === 'ISSUE' ? 'เบิก' : 'คืน'}: ${tx.requester} | ${tx.created_at ? tx.created_at.slice(0, 16).replace('T', ' ') : ''}
    </div>
  `).join("");
}

import { requireAuth, getUser } from "/js/auth.js";

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[dashboard] missing element #${id}`);
    return;
  }
  el.textContent = String(value);
}

function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function renderLowStockList(items) {
  const box = document.getElementById("lowStockList");
  if (!box) return;

  if (!items.length) {
    box.innerHTML = `<div class="muted">ไม่มีอะไหล่ใกล้หมด</div>`;
    return;
  }

  box.innerHTML = items
    .map(
      (it) => `
      <div class="list-row">
        <div><b>${it.name ?? "-"}</b></div>
        <div>คงเหลือ: ${toNum(it.quantity)} (ขั้นต่ำ: ${toNum(it.min_stock)})</div>
        <div>ที่เก็บ: ${it.location ?? "-"}</div>
      </div>`
    )
    .join("");
}


async function loadDashboard() {
  console.log("[dashboard] loading...");

  const res = await window.apiFetch("/spareparts");
  const list = Array.isArray(res?.data) ? res.data : [];

  console.log("[dashboard] spareparts:", list.length);

  const totalItems = list.length;
  const totalQuantity = list.reduce((sum, it) => sum + toNum(it.quantity), 0);

  // low stock: ต้องมี min_stock > 0 ถึงจะนับว่าใกล้หมด (กันเคส null/0)
  const lowStockList = list.filter((it) => {
    const qty = toNum(it.quantity);
    const min = toNum(it.min_stock, 0);
    return min > 0 && qty <= min;
  });

  setText("totalItems", totalItems);
  setText("totalQuantity", totalQuantity);
  setText("lowStockItems", lowStockList.length);

  renderLowStockList(lowStockList);

  // --- กราฟสถานะสต็อก ---
    const ctx = document.getElementById("stockStatusChart");
    if (ctx && window.Chart) {
      const normal = list.filter(it => toNum(it.quantity) > toNum(it.min_stock, 0)).length;
      const low = lowStockList.length;
      const out = list.filter(it => toNum(it.quantity) === 0).length;
      if (window.stockStatusChartObj) window.stockStatusChartObj.destroy();
      window.stockStatusChartObj = new window.Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['ปกติ', 'ใกล้หมด', 'หมด'],
          datasets: [{
            data: [normal, low, out],
            backgroundColor: ['#4caf50', '#ffeb3b', '#f44336'],
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // --- กราฟ รายการเบิก vs คืน ---
    const txRes = await window.apiFetch("/transactions");
    const txList = Array.isArray(txRes?.data) ? txRes.data : [];
    // สร้างข้อมูลกราฟ: group by date, type
    const txByDate = {};
    txList.forEach(tx => {
      const d = (tx.created_at || '').slice(0, 10);
      if (!txByDate[d]) txByDate[d] = { ISSUE: 0, RETURN: 0 };
      if (tx.type === 'ISSUE') txByDate[d].ISSUE += toNum(tx.qty);
      if (tx.type === 'RETURN') txByDate[d].RETURN += toNum(tx.qty);
    });
    const txDates = Object.keys(txByDate).sort();
    const issueData = txDates.map(d => txByDate[d].ISSUE);
    const returnData = txDates.map(d => txByDate[d].RETURN);
    const txChartCtx = document.getElementById("transactionTrendChart");
    if (txChartCtx && window.Chart) {
      if (window.txTrendChartObj) window.txTrendChartObj.destroy();
      window.txTrendChartObj = new window.Chart(txChartCtx, {
        type: 'bar',
        data: {
          labels: txDates,
          datasets: [
            { label: 'เบิก', data: issueData, backgroundColor: '#2196f3' },
            { label: 'คืน', data: returnData, backgroundColor: '#ff9800' }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'top' } },
          scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
      });
    }

    // --- กราฟ อะไหล่ที่เบิกมากที่สุด ---
    // รวม qty ของ ISSUE ตามชื่ออะไหล่
    const issueByPart = {};
    txList.forEach(tx => {
      if (tx.type === 'ISSUE') {
        const name = tx.sparepart_name || tx.sparepart_id;
        if (!issueByPart[name]) issueByPart[name] = 0;
        issueByPart[name] += toNum(tx.qty);
      }
    });
    const topParts = Object.entries(issueByPart)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);
    const topNames = topParts.map(([name]) => name);
    const topQtys = topParts.map(([, qty]) => qty);
    const topChartCtx = document.getElementById("topItemsChart");
    if (topChartCtx && window.Chart) {
      if (window.topItemsChartObj) window.topItemsChartObj.destroy();
      window.topItemsChartObj = new window.Chart(topChartCtx, {
        type: 'bar',
        data: {
          labels: topNames,
          datasets: [{ label: 'จำนวนเบิก', data: topQtys, backgroundColor: '#e91e63' }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          indexAxis: 'y',
          scales: { x: { beginAtZero: true } }
        }
      });
    }
  // โหลดรายการล่าสุด
  renderRecentTransactions();
}

// ให้ปุ่มรีเฟรชเรียกได้
window.loadDashboard = () => loadDashboard().catch((e) => console.error("[dashboard] error:", e));

document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;

  const user = getUser();
  if (user) {
    const nameEl = document.getElementById("headerUserName");
    const roleEl = document.getElementById("headerUserRole");
    if (nameEl) nameEl.textContent = user.username || "";
    if (roleEl) roleEl.textContent = user.role || "";
  }

  loadDashboard().catch((e) => console.error("[dashboard] init error:", e));
});
