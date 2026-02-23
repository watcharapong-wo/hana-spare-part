// ===== NAVIGATION (ONLY ONE) =====
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

        if (viewKey === "dashboard" && window.loadDashboard) window.loadDashboard();
        if (viewKey === "spareparts" && window.loadSpareparts) window.loadSpareparts();
        if (viewKey === "transactions" && window.loadTransactions) window.loadTransactions();
        if (viewKey === "reports" && window.loadReports) window.loadReports?.();
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
            if (a.id === "logoutMenuBtn") return;

            const viewKey = a.dataset.view;
            if (!viewKey) return;

            e.preventDefault();
            showView(viewKey);
        });

        showView("dashboard");
    });
})();
// ===== API BASE URL & apiFetch helper =====
window.API_BASE = "http://127.0.0.1:3001";
const API_BASE = window.API_BASE;

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("token") || "";

    const isFormData = options.body instanceof FormData;

    // clone headers (อย่าใส่ Content-Type ถ้าเป็น FormData)
    // ...existing code...

    // Only one robust editUser definition
// Only one robust editUser definition
async function editUser(id) {
        // ====== EDIT USER (ONLY ONE) ======
        window.editUser = async function editUser(id) {
            try {
                const result = await getApi().getUsers();
                const foundUser = (result.data || []).find(u => Number(u.id) === Number(id));
                if (!foundUser) return alert("ไม่พบผู้ใช้");

                const modalBody = document.getElementById("modalBody");
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

                document.getElementById("editUserForm").addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const data = Object.fromEntries(new FormData(e.target));
                    if (!data.password) delete data.password;

                    await getApi().updateUser(Number(id), data);
                    closeModal();
                    if (window.loadUsers) window.loadUsers();
                    alert("แก้ไขผู้ใช้สำเร็จ");
                });

                showModal();
            } catch (err) {
                alert("เกิดข้อผิดพลาด: " + err.message);
            }
        };
        reset: 'รีเซ็ต',
        saveSettings: 'บันทึกการตั้งค่า',
        
        // Table Headers
        no: 'ลำดับ',
        name: 'ชื่อ',
        location: 'ตำแหน่ง',
        quantity: 'จำนวน',
        minStock: 'สต็อกขั้นต่ำ',
        status: 'สถานะ',
        actions: 'จัดการ',
        type: 'ประเภท',
        requestedBy: 'ผู้ขอ',
        date: 'วันที่',
        partName: 'ชื่ออะไหล่',
        quantityRemaining: 'จำนวนคงเหลือ',
        storageLocation: 'สถานที่จัดเก็บ',
        
        // Confirm
        confirmDelete: 'ต้องการลบรายการนี้?',
        confirmLogout: 'ต้องการออกจากระบบ?'
    },
    en: {
        // Header
        appTitle: 'IT Spare Parts Management',
        
        // Menu
        dashboard: 'Dashboard',
        spareparts: 'Spare Parts',
        transactions: 'Transactions',
        reports: 'Reports & Export',
        users: 'User Management',
        activity: 'Activity Logs',
        settings: 'System Settings',
        logout: 'Logout',
        
        // Dashboard
        dashboardTitle: 'Dashboard',
        dashboardSubtitle: 'Welcome back! Here\'s your system overview',
        refresh: 'Refresh',
        totalItems: 'Total Items',
        totalQuantity: 'Total Quantity',
        lowStockItems: 'Low Stock',
        alertsTitle: 'Stock Alerts',
        recentTransactionsTitle: 'Recent Transactions',
        stockAnalysisTitle: 'Stock Analysis',
        transactionTrendsTitle: 'Transaction Trends',
        topItemsTitle: 'Top Items',
        
        // Spareparts
        sparepartsTitle: 'Spare Parts Management',
        sparepartsSubtitle: 'Manage all spare parts in the system',
        addSparepart: 'Add New Part',
        searchPlaceholder: 'Search spare part name...',
        filterByLocation: 'Location',
        allLocations: 'All',
        filterByStatus: 'Status',
        allStatus: 'All',
        normal: 'Normal',
        low: 'Low Stock',
        outOfStock: 'Out of Stock',
        
        // Transactions
        transactionsTitle: 'Transactions',
        transactionsSubtitle: 'Record spare part withdrawals and returns',
        newTransaction: 'New Transaction',
        filterByType: 'Type',
        allTypes: 'All',
        withdraw: 'Withdraw',
        return: 'Return',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        
        // Reports
        reportsTitle: 'Reports & Export',
        reportsSubtitle: 'Export data and generate reports',
        exportStockSummary: 'Export Stock Summary',
        exportTransactions: 'Export Transactions',
        selectDateRange: 'Select Date Range',
        from: 'From',
        to: 'To',
        generateReport: 'Generate Report',
        
        // Users
        usersTitle: 'User Management',
        usersSubtitle: 'Manage system user accounts',
        addUser: 'Add New User',
        filterByRole: 'Role',
        allRoles: 'All',
        admin: 'Administrator',
        staff: 'Staff',
        viewer: 'Viewer',
        username: 'Username',
        password: 'Password',
        fullName: 'Full Name',
        email: 'Email',
        role: 'Role',
        createdAt: 'Created At',
        
        // Activity Logs
        activityTitle: 'Activity Logs',
        activitySubtitle: 'Track user activities in the system',
        user: 'User',
        action: 'Action',
        details: 'Details',
        timestamp: 'Timestamp',
        
        // Settings
        settingsTitle: 'System Settings',
        settingsSubtitle: 'Customize system settings',
        brandingSettings: 'Branding Settings',
        systemName: 'System Name',
        systemSubtitle: 'System Description',
        companyName: 'Company Name',
        logoText: 'Logo Text',
        primaryColor: 'Primary Color',
        secondaryColor: 'Secondary Color',
        successColor: 'Success Color',
        warningColor: 'Warning Color',
        dangerColor: 'Danger Color',
        infoColor: 'Info Color',
        backgroundColor: 'Background Color',
        sidebarColor: 'Sidebar Color',
        textColor: 'Text Color',
        theme: 'Theme Mode',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        menuOrder: 'Menu Order',
        showDemoCredentials: 'Show Demo Credentials on Login Page',
        systemInfo: 'System Information',
        version: 'Version',
        dbStatus: 'Database Status',
        totalUsers: 'Total Users',
        totalSpareparts: 'Spare Parts Items',
        
        // Buttons
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        close: 'Close',
        search: 'Search',
        export: 'Export',
        import: 'Import',
        reset: 'Reset',
        saveSettings: 'Save Settings',
        
        // Table Headers
        no: 'No.',
        name: 'Name',
        location: 'Location',
        quantity: 'Quantity',
        minStock: 'Min. Stock',
        status: 'Status',
        actions: 'Actions',
        type: 'Type',
        requestedBy: 'Requested By',
        date: 'Date',
        partName: 'Part Name',
        quantityRemaining: 'Quantity Remaining',
        storageLocation: 'Storage Location',
        
        // Confirm
        confirmDelete: 'Delete this item?',
        confirmLogout: 'Logout from system?'
    }
};

function initializeHeaderControls() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    // Load saved language - save default if not set
    let savedLang = localStorage.getItem('language');
    if (!savedLang) {
        savedLang = 'th';
        localStorage.setItem('language', savedLang);
    }
    currentLanguage = savedLang;
    updateLanguageDisplay(savedLang);
    applyLanguage(savedLang);
    console.log(`[i18n] Initialized language to: ${savedLang}`);
}

async function editUser(id) {
// Only one robust editUser definition
async function editUser(id) {
    try {
        const result = await getApi().getUsers();
        const foundUser = (result.data || []).find(u => Number(u.id) === Number(id));
        if (!foundUser) return alert("ไม่พบผู้ใช้");

        const modalBody = document.getElementById("modalBody");
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
                    <input type="text" name="full_name" value="${foundUser.full_name || ''}" />
                </div>

                <div class="form-group">
                    <label>Role *</label>
                    <select name="role" required>
                        <option value="admin" ${foundUser.role === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="coadmin" ${foundUser.role === 'coadmin' ? 'selected' : ''}>Co-Admin</option>
                        <option value="staff" ${foundUser.role === 'staff' ? 'selected' : ''}>Staff</option>
                    </select>
                </div>

                <div style="display:flex;gap:12px;">
                    <button type="submit" class="btn btn-primary">💾 บันทึก</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                </div>
            </form>
        `;

        document.getElementById("editUserForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target));
            if (!data.password) delete data.password;

            await getApi().updateUser(Number(id), data);
            closeModal();
            loadUsers();
            alert("แก้ไขผู้ใช้สำเร็จ");
        });

        showModal();
    } catch (error) {
        alert("เกิดข้อผิดพลาด: " + error.message);
    }
}
function applyLanguageToCurrentPage() {
    const t = translations[currentLanguage] || translations.th;

    const activeView = document.querySelector(".view.active");
    const viewId = activeView?.id || "";

    if (viewId === "dashboardView") updateDashboardTexts(t);
    else if (viewId === "sparepartsView") updateSparepartsTexts(t);
    else if (viewId === "transactionsView") updateTransactionsTexts(t);
    else if (viewId === "reportsView") updateReportsTexts(t);
    else if (viewId === "usersView") updateUsersTexts(t);
    else if (viewId === "activityView") updateActivityTexts(t);
    else if (viewId === "settingsView") updateSettingsTexts(t);

    translateHardcodedElements(t);

    const activityLogsMenuText = document.getElementById("activityLogsMenuText");
    if (activityLogsMenuText) activityLogsMenuText.textContent = t.activity;
}

// ===== Custom Fields Management (Settings) =====
// (Fixed: event handler and modal logic are now in showAddCustomFieldModal)
// ...existing code...

async function editCustomField(id) {
    // โหลดข้อมูลฟิลด์เดิม
    try {
        const result = await apiFetch('/custom_fields');
        const field = (result.data || []).find(f => f.id === id);
        if (!field) return alert('ไม่พบฟิลด์');
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>✏️ แก้ไขฟิลด์</h2>
            <form id="editCustomFieldForm">
                <div class="form-group"><label>ชื่อฟิลด์ *</label><input type="text" name="name" value="${field.name}" required /></div>
                <div class="form-group"><label>ประเภท *</label>
                    <select name="field_type" required>
                        <option value="text" ${field.field_type==='text'?'selected':''}>ข้อความ</option>
                        <option value="number" ${field.field_type==='number'?'selected':''}>ตัวเลข</option>
                        <option value="date" ${field.field_type==='date'?'selected':''}>วันที่</option>
                        <option value="select" ${field.field_type==='select'?'selected':''}>ตัวเลือก</option>
                        <option value="boolean" ${field.field_type==='boolean'?'selected':''}>ใช่/ไม่ใช่</option>
                    </select>
                </div>
                <div class="form-group"><label>จำเป็นต้องกรอก</label><input type="checkbox" name="is_required" value="1" ${field.is_required ? 'checked' : ''} /></div>
                <div style="display:flex;gap:12px;">
                    <button type="submit" class="btn btn-primary">บันทึก</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                </div>
            </form>
        `;
        document.getElementById('editCustomFieldForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.is_required = data.is_required ? 1 : 0;
            try {
                await apiFetch(`/custom_fields/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
                    },
                    body: JSON.stringify(data)
                });
                closeModal();
                loadCustomFields();
                alert('แก้ไขฟิลด์สำเร็จ');
            } catch (err) {
                alert('เกิดข้อผิดพลาด: ' + err.message);
            }
        });
        showModal();
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    }
}

async function deleteCustomField(id) {
    if (!confirm('ต้องการลบฟิลด์นี้ใช่หรือไม่?')) return;
    try {
        await apiFetch(`/custom_fields/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
            },
            body: JSON.stringify({ is_active: 0 })
        });
        loadCustomFields();
        alert('ลบฟิลด์สำเร็จ');
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    }
}

function applyLanguage(lang) {
    const t = translations[lang];
    
    // Update header title
    const headerTitle = document.getElementById('headerTitle');
    if (headerTitle) headerTitle.textContent = t.appTitle;

    // Update sidebar header
    const sidebarTitle = document.querySelector('.sidebar-header h2');
    if (sidebarTitle) sidebarTitle.textContent = t.appTitle;

    // Update sidebar menu items by ID
    const sidebarDashboardText = document.getElementById('sidebarDashboardText');
    if (sidebarDashboardText) sidebarDashboardText.textContent = t.dashboard;
    const sidebarSparepartsText = document.getElementById('sidebarSparepartsText');
    if (sidebarSparepartsText) sidebarSparepartsText.textContent = t.spareparts;
    const sidebarTransactionsText = document.getElementById('sidebarTransactionsText');
    if (sidebarTransactionsText) sidebarTransactionsText.textContent = t.transactions;
    const sidebarReportsText = document.getElementById('sidebarReportsText');
    if (sidebarReportsText) sidebarReportsText.textContent = t.reports;
    const sidebarUsersText = document.getElementById('sidebarUsersText');
    if (sidebarUsersText) sidebarUsersText.textContent = t.users;
    const sidebarSettingsText = document.getElementById('sidebarSettingsText');
    if (sidebarSettingsText) sidebarSettingsText.textContent = t.settings;
    const sidebarLogoutText = document.getElementById('sidebarLogoutText');
    if (sidebarLogoutText) sidebarLogoutText.textContent = t.logout;
    // Activity Logs menu handled below

    // Update logout menu text
    const logoutMenu = document.querySelector('.sidebar-nav .nav-item[onclick*="logout"]');
    if (logoutMenu) {
        const icon = logoutMenu.querySelector('span') ? logoutMenu.querySelector('span').textContent : '🚪';
        logoutMenu.innerHTML = `<span>${icon}</span> ${t.logout}`;
        logoutMenu.setAttribute('onclick', 'logout()');
    }
    
    // Translate all static content
    translateStaticContent(lang);
    
    // Translate hardcoded elements
    translateHardcodedElements(t);
    
    // Apply comprehensive text translation for common patterns
    translatePageContent(lang, t);
    
    // Update all pages
    updateDashboardTexts(t);
    updateSparepartsTexts(t);
    updateTransactionsTexts(t);
    updateReportsTexts(t);
    updateUsersTexts(t);
    updateActivityTexts(t);
    updateSettingsTexts(t);
}

function translatePageContent(lang, t) {
    // Direct translation of all page content
    // This scans for common text patterns and replaces them based on language
    
    // Get all elements that might contain translatable text
    const allElements = document.querySelectorAll('h1, h2, h3, h4, p, button, label, input, select, th, td, span');
    
    // Translation mappings
    const translations_map = {
        'th': {
            'จัดการอะไหล่': 'จัดการอะไหล่',
            'เบิก-คืนอะไหล่': 'เบิก-คืนอะไหล่',
            'รายงาน & ส่งออก': 'รายงาน & ส่งออก',
            'จัดการผู้ใช้': 'จัดการผู้ใช้',
            'ประวัติกิจกรรม': 'ประวัติกิจกรรม',
            'ตั้งค่าระบบ': 'ตั้งค่าระบบ',
            'Dashboard': 'Dashboard',
            'Spare Parts Management': 'Spare Parts Management',
            'Transactions': 'Transactions',
            'Reports & Export': 'Reports & Export',
            'User Management': 'User Management',
            'Activity Logs': 'Activity Logs',
            'System Settings': 'System Settings'
        },
        'en': {
            'จัดการอะไหล่': 'Spare Parts Management',
            'เบิก-คืนอะไหล่': 'Transactions',
            'รายงาน & ส่งออก': 'Reports & Export',
            'จัดการผู้ใช้': 'User Management',
            'ประวัติกิจกรรม': 'Activity Logs',
            'ตั้งค่าระบบ': 'System Settings',
            'บริหารและติดตามสต็อกอะไหล่ IT ของคุณ': 'Manage all spare parts in the system',
            'บันทึกการเบิกและคืนอะไหล่': 'Record spare part withdrawals and returns',
            'ส่งออกข้อมูลและสร้างรายงาน': 'Export data and generate reports',
            'จัดการบัญชีผู้ใช้ระบบ': 'Manage system user accounts',
            'ติดตามกิจกรรมผู้ใช้ในระบบ': 'Track user activities in the system',
            'ปรับแต่งการตั้งค่าระบบ': 'Customize system settings'
        }
    };
    
    const langMap = translations_map[lang] || translations_map['th'];
    
    // Update page content
    allElements.forEach(el => {
        let text = el.textContent.trim();
        
        // Skip elements that are inputs or have child elements (to avoid re-translating parent elements)
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.children.length > 0) {
            return;
        }
        
        // Check if text matches any translation key
        for (const [key, value] of Object.entries(langMap)) {
            if (text === key || text.includes(key)) {
                const newText = text.replace(key, value);
                if (newText !== text && el.parentNode) {
                    el.textContent = newText;
                }
                break;
            }
        }
    });
}

function translateStaticContent(lang) {
    const t = translations[lang];
    
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    // Translate all elements with data-i18n-html attribute
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key]) {
            el.innerHTML = t[key];
        }
    });
    
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });
    
    // Translate specific hardcoded elements
    translateHardcodedElements(t);
}

    

function updateDashboardTexts(t) {
    const dashboardView = document.getElementById('dashboardView');
    if (!dashboardView) return;
    
    // Update title and subtitle
    const title = dashboardView.querySelector('h1');
    if (title) title.textContent = `📊 ${t.dashboardTitle}`;
    
    const subtitle = dashboardView.querySelector('.page-header p');
    if (subtitle) subtitle.textContent = t.dashboardSubtitle;
    
    // Update stat cards
    const statCards = dashboardView.querySelectorAll('.stat-card');
    const statLabels = [t.totalItems, t.totalQuantity, t.lowStockItems];
    statCards.forEach((card, index) => {
        const label = card.querySelector('.stat-label');
        if (label && statLabels[index]) {
            label.textContent = statLabels[index];
        }
    });
    
    // Update section titles (charts and dashboard blocks)
    const sections = dashboardView.querySelectorAll('.section h3');
    sections.forEach(h3 => {
        const text = h3.textContent;
        if (text.includes('📋')) h3.textContent = `📋 ${t.alertsTitle}`;
        else if (text.includes('📊')) h3.textContent = `📊 ${t.recentTransactionsTitle}`;
        else if (text.includes('📈')) h3.textContent = `📈 ${t.stockAnalysisTitle}`;
        else if (text.includes('📉')) h3.textContent = `📉 ${t.transactionTrendsTitle}`;
    });
    // Also update chart titles if present
    const chartTitles = dashboardView.querySelectorAll('.chart-title, .dashboard-chart-title');
    chartTitles.forEach(el => {
        if (el.textContent.includes('สถานะสต็อก') || el.textContent.includes('Stock Analysis')) {
            el.textContent = `📈 ${t.stockAnalysisTitle}`;
        } else if (el.textContent.includes('รายการเบิก vs คืน') || el.textContent.includes('Transaction Trends')) {
            el.textContent = `📉 ${t.transactionTrendsTitle}`;
        }
    });
    
    // Update button
    const refreshBtn = dashboardView.querySelector('.btn-primary');
    if (refreshBtn) {
        refreshBtn.innerHTML = `🔄 ${t.refresh}`;
    }
}

function updateSparepartsTexts(t) {
    const sparepartsView = document.getElementById('sparepartsView');
    if (!sparepartsView) return;
    
    // Update ALL h1 elements in this view
    sparepartsView.querySelectorAll('h1').forEach(h1 => {
        h1.textContent = `⚙️ ${t.sparepartsTitle}`;
    });
    
    // Update ALL p elements in page-header
    const pageHeader = sparepartsView.querySelector('.page-header');
    if (pageHeader) {
        const p = pageHeader.querySelector('p');
        if (p) p.textContent = t.sparepartsSubtitle;
        
        // Update add button
        const addBtn = pageHeader.querySelector('.btn-primary');
        if (addBtn) {
            addBtn.innerHTML = `➕ ${t.addSparepart}`;
        }
    }
    
    // Update search input placeholder
    const searchInput = sparepartsView.querySelector('#searchSpareparts');
    if (searchInput) {
        searchInput.placeholder = `🔍 ${t.searchPlaceholder}`;
    }
    
    // Update filter select options
    const filterLocation = sparepartsView.querySelector('#filterLocation');
    if (filterLocation) {
        const firstOption = filterLocation.options[0];
        if (firstOption) {
            firstOption.textContent = `📍 ${t.allLocations}`;
        }
    }
    
    // Update table headers
    const table = sparepartsView.querySelector('table');
    if (table) {
        const headers = table.querySelectorAll('thead th');
        const headerTexts = [t.no, t.name, t.location, t.quantity, t.minStock, t.status, t.actions];
        headers.forEach((th, index) => {
            if (headerTexts[index]) {
                th.textContent = headerTexts[index];
            }
        });
    }
}

function updateTransactionsTexts(t) {
    const transactionsView = document.getElementById('transactionsView');
    if (!transactionsView) return;
    
    // Update ALL h1 elements
    transactionsView.querySelectorAll('h1').forEach(h1 => {
        h1.textContent = `📤 ${t.transactionsTitle}`;
    });
    
    // (Removed invalid settingsView block and misplaced logic)
    // Update filter select
    const filterType = transactionsView.querySelector('#filterTxType');
    if (filterType) {
        const firstOption = filterType.options[0];
        if (firstOption) {
            firstOption.textContent = `📋 ${t.allTypes}`;
        }
    }
    // Update table headers
    const table = transactionsView.querySelector('table');
    if (table) {
        const headers = table.querySelectorAll('thead th');
        const headerTexts = [t.no, t.name, t.type, t.quantity, t.requestedBy, t.date, t.status, t.actions];
        headers.forEach((th, index) => {
            if (headerTexts[index]) {
                th.textContent = headerTexts[index];
            }
        });
    }
}

function updateReportsTexts(t) {
    const reportsView = document.getElementById('reportsView');
    if (!reportsView) return;
    
    // Update title
    reportsView.querySelectorAll('h1').forEach(h1 => {
        h1.textContent = `📈 ${t.reportsTitle}`;
    });
    
    // Update subtitle
    const pageHeader = reportsView.querySelector('.page-header');
    if (pageHeader) {
        const p = pageHeader.querySelector('p');
        if (p) p.textContent = t.reportsSubtitle;
    }
}

async function editUser(id) {
    try {
        const result = await getApi().getUsers();
        const foundUser = (result.data || []).find(u => Number(u.id) === Number(id));
        if (!foundUser) return alert("ไม่พบผู้ใช้");

        const modalBody = document.getElementById("modalBody");
        modalBody.innerHTML = `
            <h2 class="mb-2">✏️ แก้ไขผู้ใช้</h2>
            <form id="editUserForm">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" value="${foundUser.username}" disabled>
                </div>
                <div class="form-group">
                    <label>Password ใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)</label>
                    <input type="password" name="password" minlength="8">
                </div>
                <div class="form-group">
                    <label>ชื่อ-นามสกุล</label>
                    <input type="text" name="full_name" value="${foundUser.full_name || ""}">
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

        document.getElementById("editUserForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target));
            if (!data.password) delete data.password;

            await getApi().updateUser(Number(id), data);
            closeModal();
            loadUsers();
            alert("แก้ไขผู้ใช้สำเร็จ");
        });

        showModal();
    } catch (error) {
        alert("เกิดข้อผิดพลาด: " + error.message);
    }
}


}

function updateSettingsTexts(t) {
    const settingsView = document.getElementById('settingsView');
    if (!settingsView) return;
    // Always use currentLanguage for settings texts
    const lang = currentLanguage;
    const t2 = translations[lang];
    // Update main header
    settingsView.querySelectorAll('h1').forEach(h1 => {
        h1.textContent = `⚙️ ${t2.settingsTitle}`;
    });
    // Update subtitle
    const pageHeader = settingsView.querySelector('.page-header');
    if (pageHeader) {
        const p = pageHeader.querySelector('p');
        if (p) p.textContent = t2.settingsSubtitle;
    }
    // Update section headers
    const sectionHeaders = settingsView.querySelectorAll('.section h2, .section h3');
    sectionHeaders.forEach(h => {
        if (h.textContent.includes('🎨')) h.textContent = `🎨 ${t2.brandingSettings}`;
        if (h.textContent.includes('📊')) h.textContent = `📊 ${t2.systemInfo}`;
    });
    // Update all labels in settings
    const labelMap = {
        'ชื่อระบบ': t2.systemName,
        'คำอธิบายระบบ': t2.systemSubtitle,
        'ชื่อบริษัท': t2.companyName,
        'โลโก้ (ข้อความ)': t2.logoText,
        'สีหลัก': t2.primaryColor,
        'สีรอง': t2.secondaryColor,
        'สีสำเร็จ': t2.successColor,
        'สีเตือน': t2.warningColor,
        'สีอันตราย': t2.dangerColor,
        'สีข้อมูล': t2.infoColor,
        'สีพื้นหลัง': t2.backgroundColor,
        'สี Sidebar': t2.sidebarColor,
        'สีตัวอักษร': t2.textColor,
        'แสดง Demo Credentials บนหน้า Login': t2.showDemoCredentials,
        'โหมดธีม': t2.theme,
        'ลำดับเมนู': t2.menuOrder
    };
    settingsView.querySelectorAll('label').forEach(label => {
        const text = label.textContent.replace(/\*/g, '').trim();
        if (labelMap[text]) label.childNodes[0].textContent = labelMap[text];
    });
    // Update button texts
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) saveBtn.innerHTML = `💾 ${t2.saveSettings}`;
    // Update placeholders
    const placeholders = [
        { id: 'settingAppName', key: 'systemName' },
        { id: 'settingAppSubtitle', key: 'systemSubtitle' },
        { id: 'settingCompanyName', key: 'companyName' },
        { id: 'settingLogoText', key: 'logoText' }
    ];
    placeholders.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && t2[item.key]) el.placeholder = t2[item.key];
    });
    // Update info box labels
    const infoLabels = settingsView.querySelectorAll('.info-label');
    if (infoLabels.length >= 4) {
        infoLabels[0].textContent = t2.version;
        infoLabels[1].textContent = t2.dbStatus;
        infoLabels[2].textContent = t2.totalUsers;
        infoLabels[3].textContent = t2.totalSpareparts;
    }
}

// Logout
function logout() {
    // ✅ ใช้ fallback ถ้า translations ยังไม่พร้อม
    const t = (window.translations && typeof window.translations === 'object') ? window.translations : {};
    const msg = t.logoutConfirm || 'Logout?';

    if (!confirm(msg)) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = '/index.html';
}

function showLogoutModal(message) {
    let modal = document.getElementById('logoutModal');
    if (!modal) {
        // Create modal if not exists
        modal = document.createElement('div');
        modal.id = 'logoutModal';
        modal.innerHTML = `
            <div class="modal-overlay" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:9999;display:flex;align-items:center;justify-content:center;">
                <div class="modal-content" style="background:#fff;padding:24px 32px;border-radius:8px;box-shadow:0 2px 16px rgba(0,0,0,0.2);min-width:280px;max-width:90vw;text-align:center;">
                    <div style="font-size:1.1em;margin-bottom:18px;">${message}</div>
                    <button id="logoutModalConfirm" style="margin:0 8px 0 0;padding:6px 18px;background:#d32f2f;color:#fff;border:none;border-radius:4px;">ออกจากระบบ</button>
                    <button id="logoutModalCancel" style="padding:6px 18px;background:#eee;color:#333;border:none;border-radius:4px;">ยกเลิก</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.querySelector('.modal-content div').textContent = message;
        modal.style.display = 'flex';
    }
    modal.style.display = 'flex';
    document.getElementById('logoutModalConfirm').onclick = function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    };
    document.getElementById('logoutModalCancel').onclick = function() {
        modal.style.display = 'none';
    };
}

// ===== Dashboard Functions =====
async function loadDashboard() {
    // ✅ ถ้าไม่มี element หลัก แปลว่าไม่ได้อยู่หน้า dashboard
    if (!document.getElementById('totalItems')) {
        console.log('DEBUG: loadDashboard skipped (not on dashboard page)');
        return;
    }
    // MOCK DATA ตัวอย่าง
    document.getElementById('totalItems').textContent = 25;
    document.getElementById('totalQuantity').textContent = 120;
    document.getElementById('lowStockItems').textContent = 3;

    // ตัวอย่างอะไหล่ใกล้หมด
    const lowStockList = document.getElementById('lowStockList');
    lowStockList.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>ชื่ออะไหล่</th>
                    <th>จำนวนคงเหลือ</th>
                    <th>จำนวนขั้นต่ำ</th>
                    <th>สถานที่</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>RAM DDR4 8GB</strong></td>
                    <td><span class="status-badge status-issue">2</span></td>
                    <td>5</td>
                    <td>คลังหลัก</td>
                </tr>
                <tr>
                    <td><strong>SSD 256GB</strong></td>
                    <td><span class="status-badge status-issue">1</span></td>
                    <td>3</td>
                    <td>คลังย่อย</td>
                </tr>
                <tr>
                    <td><strong>สาย LAN CAT6</strong></td>
                    <td><span class="status-badge status-issue">0</span></td>
                    <td>10</td>
                    <td>ห้อง IT</td>
                </tr>
            </tbody>
        </table>
    `;

    // ตัวอย่างรายการเบิก-คืนล่าสุด
    const recentList = document.getElementById('recentTransactions');
    recentList.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>วันที่</th>
                    <th>ประเภท</th>
                    <th>อะไหล่</th>
                    <th>จำนวน</th>
                    <th>ผู้เบิก/คืน</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>17/02/2026 09:15</td>
                    <td><span class="status-badge status-issue">📤 เบิก</span></td>
                    <td>RAM DDR4 8GB</td>
                    <td>2</td>
                    <td>สมชาย</td>
                </tr>
                <tr>
                    <td>16/02/2026 14:30</td>
                    <td><span class="status-badge status-return">📥 คืน</span></td>
                    <td>SSD 256GB</td>
                    <td>1</td>
                    <td>วิภา</td>
                </tr>
                <tr>
                    <td>15/02/2026 10:00</td>
                    <td><span class="status-badge status-issue">📤 เบิก</span></td>
                    <td>สาย LAN CAT6</td>
                    <td>5</td>
                    <td>อนุชา</td>
                </tr>
            </tbody>
        </table>
    `;

    // ตัวอย่างข้อมูลสำหรับกราฟ (mock)
    setTimeout(() => {
        createStockStatusChart({ good: 15, warning: 7, critical: 3 });
        createTransactionTrendChart();
        createTopItemsChart();
        applyLanguageToCurrentPage();
    }, 100);
}

// ===== Spareparts Functions =====
async function loadSpareparts() {
    try {
        const q = document.getElementById('searchSpareparts').value;
        const location = document.getElementById('filterLocation').value;
        const minQty = document.getElementById('minQty').value;
        const maxQty = document.getElementById('maxQty').value;
        const minStock = document.getElementById('minStock').value;
        const maxStock = document.getElementById('maxStock').value;
        
        const params = {};
        if (q) params.q = q;
        if (location) params.location = location;
        if (minQty) params.min_qty = minQty;
        if (maxQty) params.max_qty = maxQty;
        if (minStock) params.min_stock = minStock;
        if (maxStock) params.max_stock = maxStock;
        
        const result = await getApi().getSpareparts(params);
        const list = document.getElementById('sparepartsList');
        
        if (result.data && result.data.length > 0) {
            const u = getCurrentUser();
            const isAdmin = String(u?.role || '').toLowerCase() === 'admin';
            
            list.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>ชื่ออะไหล่</th>
                            <th>จำนวน</th>
                            <th>ขั้นต่ำ</th>
                            <th>สถานที่</th>
                            <th>หมายเหตุ</th>
                            ${isAdmin ? '<th>จัดการ</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${result.data.map(item => `
                            <tr>
                                <td><strong>${item.name}</strong></td>
                                <td><span class="status-badge ${item.quantity <= item.min_stock ? 'status-issue' : ''}">${item.quantity}</span></td>
                                <td>${item.min_stock}</td>
                                <td>${item.location || '-'}</td>
                                <td>${item.note || '-'}</td>
                                ${isAdmin ? `
                                    <td>
                                        <button class="btn btn-info" onclick="editSparepart(${item.id})" style="padding: 6px 12px; font-size: 13px;">✏️ แก้ไข</button>
                                        <button class="btn btn-danger" onclick="deleteSparepart(${item.id}, '${item.name}')" style="padding: 6px 12px; font-size: 13px;">🗑️ ลบ</button>
                                    </td>
                                ` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><p>ไม่พบข้อมูลอะไหล่</p></div>';
        }
        
        // Do not auto-apply language here; navigation handles it
    } catch (error) {
        console.error('Load spareparts error:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

async function showAddSparepartModal() {
    const modalBody = document.getElementById('modalBody');

    // โหลด custom fields
    let customFieldsHtml = '';
    try {
        const result = await apiFetch('/custom_fields');
        const fields = result.data || [];
        fields.forEach(f => {
            customFieldsHtml += `
                <div class="form-group">
                    <label>${f.name}${f.is_required ? ' *' : ''}</label>
                    <input type="text" name="custom_${f.id}" ${f.is_required ? 'required' : ''}>
                </div>
            `;
        });
    } catch {}

    modalBody.innerHTML = `
        <h2 class="mb-2">➕ เพิ่มอะไหล่ใหม่</h2>
        <form id="addSparepartForm">
            <div class="form-group">
                <label>ชื่ออะไหล่ *</label>
                <input type="text" name="name" required>
            </div>

            <div class="form-group">
                <label>จำนวน *</label>
                <input type="number" name="quantity" required min="0">
            </div>

            <div class="form-group">
                <label>จำนวนขั้นต่ำ *</label>
                <input type="number" name="min_stock" required min="0" value="5">
            </div>

            <div class="form-group">
                <label>หมายเลข Sparepart No.</label>
                <input type="text" name="part_no" placeholder="กรอกหมายเลขอะไหล่ (Sparepart No.)">
            </div>

            <div class="form-group">
                <label>สถานที่จัดเก็บ</label>
                <input type="text" name="location" placeholder="เช่น คลังหลัก, ห้อง IT">
            </div>

            <div class="form-group">
                <label>หมายเหตุ</label>
                <textarea name="note" rows="3"></textarea>
            </div>

            ${customFieldsHtml}

            <div style="display:flex; gap:12px;">
                <button type="submit" class="btn btn-primary">💾 บันทึก</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
            </div>
        </form>
    `;

    document.getElementById('addSparepartForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // แยก custom fields
        const customValues = {};
        for (const [k, v] of Object.entries(data)) {
            if (k.startsWith('custom_')) {
                customValues[k.replace('custom_', '')] = v;
                delete data[k];
            }
        }

        try {
            const created = await getApi().createSparepart(data);

            if (created?.data?.id && Object.keys(customValues).length > 0) {
                await apiFetch(`/custom_fields/spareparts/${created.data.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ values: customValues })
                });
            }

            closeModal();
            loadSpareparts();
            alert('เพิ่มอะไหล่สำเร็จ');
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    });

    showModal();
}

async function editSparepart(id) {
    try {
        const item = await getApi().getSparepartById(id);
        if (!item) {
            alert("ไม่พบข้อมูลอะไหล่ หรือเกิดข้อผิดพลาด");
            return;
        }
        // โหลด custom fields และค่าปัจจุบัน
        let customFieldsHtml = '';
        let customValues = {};
        try {
            const result = await apiFetch(`/custom_fields/spareparts/${id}`);
            const fields = result.data || [];
            fields.forEach(f => {
                customFieldsHtml += `
                    <div class="form-group">
                        <label>${f.name}${f.is_required ? ' *' : ''}</label>
                        <input type="text" name="custom_${f.field_id}" value="${f.value_text || ''}" ${f.is_required ? 'required' : ''}>
                    </div>
                `;
                customValues[f.field_id] = f.value_text || '';
            });
        } catch {}
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2 class="mb-2">✏️ แก้ไขอะไหล่</h2>
            <form id="editSparepartForm">
                <div class="form-group">
                    <label>ชื่ออะไหล่ *</label>
                    <input type="text" name="name" value="${item.name}" required>
                </div>
                <div class="form-group">
                    <label>จำนวน *</label>
                    <input type="number" name="quantity" value="${item.quantity}" required min="0">
                </div>
                <div class="form-group">
                    <label>จำนวนขั้นต่ำ *</label>
                    <input type="number" name="min_stock" value="${item.min_stock}" required min="0">
                </div>
                <div class="form-group">
                    <label>สถานที่จัดเก็บ</label>
                    <input type="text" name="location" value="${item.location || ''}">
                </div>
                <div class="form-group">
                    <label>หมายเหตุ</label>
                    <textarea name="note" rows="3">${item.note || ''}</textarea>
                </div>
                ${customFieldsHtml}
                <div style="display: flex; gap: 12px;">
                    <button type="submit" class="btn btn-primary">💾 บันทึก</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                </div>
            </form>
        `;
        document.getElementById('editSparepartForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            // แยก custom fields
            const customValuesUpdate = {};
            for (const [k, v] of Object.entries(data)) {
                if (k.startsWith('custom_')) {
                    customValuesUpdate[k.replace('custom_', '')] = v;
                    delete data[k];
                }
            }
            try {
                await getApi().updateSparepart(id, data);
                // อัปเดต custom fields
                if (Object.keys(customValuesUpdate).length > 0) {
                    await apiFetch(`/custom_fields/spareparts/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
                        },
                        body: JSON.stringify({ values: customValuesUpdate })
                    });
                }
                closeModal();
                loadSpareparts();
                alert('แก้ไขอะไหล่สำเร็จ');
            } catch (error) {
                alert('เกิดข้อผิดพลาด: ' + error.message);
            }
        });
        showModal();
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

async function showTransactionModal(type) {
    try {
        const result = await getApi().getSpareparts();
        const spareparts = result.data;
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2 class="mb-2">${type === 'issue' ? '📤 เบิกของ' : '📥 คืนของ'}</h2>
            <form id="transactionForm">
                <div class="form-group">
                    <label>เลือกอะไหล่ *</label>
                    <select name="sparepart_id" required>
                        <option value="">-- เลือกอะไหล่ --</option>
                        ${spareparts.map(item => `
                            <option value="${item.id}">${item.name} (คงเหลือ: ${item.quantity})</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>จำนวน *</label>
                    <input type="number" name="qty" required min="1">
                </div>
                <div class="form-group">
                    <label>Request Number</label>
                    <input type="text" name="request_number" placeholder="กรอกหมายเลข Request หรือเว้นว่าง">
                </div>
                <div class="form-group">
                    <label>ผู้${type === 'issue' ? 'เบิก' : 'คืน'} *</label>
                    <input type="text" name="requester" required placeholder="ชื่อผู้${type === 'issue' ? 'เบิก' : 'คืน'}">
                </div>
                <div class="form-group">
                    <label>หมายเหตุ</label>
                    <textarea name="note" rows="3"></textarea>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button type="submit" class="btn btn-primary">💾 บันทึก</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                </div>
            </form>
        `;
        
        document.getElementById('transactionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                if (type === 'issue') {
                    await getApi().issueSparepart(data);
                } else {
                    await getApi().returnSparepart(data);
                }
                closeModal();
                loadTransactions();
                alert(`${type === 'issue' ? 'เบิก' : 'คืน'}ของสำเร็จ`);
            } catch (error) {
                alert('เกิดข้อผิดพลาด: ' + error.message);
            }
        });
        
        showModal();
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

async function deleteTransaction(id) {
    if (!confirm('ต้องการลบรายการนี้ใช่หรือไม่?\n⚠️ การลบจะไม่ปรับสต็อกย้อนกลับ')) return;
    
    try {
        await getApi().deleteTransaction(id);
        loadTransactions();
        alert('ลบรายการสำเร็จ');
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}
// ================== NAVIGATION (sidebar) ==================
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
        if (viewKey === "activity" && window.loadActivityLogs) window.loadActivityLogs();
        if (viewKey === "users" && window.loadUsers) window.loadUsers();
        if (viewKey === "settings" && window.loadSettings) window.loadSettings();
    }

    document.addEventListener("DOMContentLoaded", () => {
        const nav = document.getElementById("sidebarNav");
        if (!nav) return;

        nav.addEventListener("click", (e) => {
            const a = e.target.closest(".nav-item");
            if (!a) return;

            if (a.id === "logoutMenuBtn") return; // logout separate
            const viewKey = a.dataset.view;
            if (!viewKey) return;

            e.preventDefault();
            showView(viewKey);
        });

        showView("dashboard");
    });
})();

// ===== API BASE + apiFetch =====
window.API_BASE = window.API_BASE || "http://127.0.0.1:3001";

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

// ===== getApi adapter =====
window.getApi = function getApi() {
    return {
        getUsers: (params = {}) => {
            const qs = new URLSearchParams(params).toString();
            return window.apiFetch(`/users${qs ? `?${qs}` : ""}`);
        },
        updateUser: (id, body) =>
            window.apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    };
};
        alert('บันทึกสิทธิ์เมนูสำเร็จ'); // Saved menu permissions successfully
        closePermissionsModal();
        // Reload page to update sidebar menu for coadmin
        window.location.reload();
    };
}

function closePermissionsModal() {
    // ===== ฟังก์ชันปิด modal สิทธิ์เมนู (Close permissions modal) =====
    document.getElementById('permissionsModal').style.display = 'none';
}

function showAddUserModal() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 class="mb-2">➕ เพิ่มผู้ใช้ใหม่</h2>
        <form id="addUserForm">
            <div class="form-group">
                <label>Username *</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>Password *</label>
                <input type="password" name="password" required minlength="8" placeholder="อย่างน้อย 8 ตัวอักษร">
                <div id="addUserPwdError" style="color:#d32f2f;font-size:0.95em;margin-top:4px;display:none;"></div>
            </div>
            <div class="form-group">
                <label>ชื่อ-นามสกุล</label>
                <input type="text" name="full_name">
            </div>
            <div class="form-group">
                <label>Role *</label>
                <select name="role" required>
                    <option value="admin">Admin</option>
                    <option value="coadmin">Co-Admin</option>
                    <option value="staff">Staff</option>
                </select>
            </div>
            <div style="display: flex; gap: 12px;">
                <button type="submit" class="btn btn-primary">💾 บันทึก</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
            </div>
        </form>
    `;
    
    document.getElementById('addUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const pwd = data.password || '';
        const pwdErrorElem = document.getElementById('addUserPwdError');
        if (pwd.length < 8) {
            pwdErrorElem.textContent = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
            pwdErrorElem.style.display = 'block';
            return;
        } else {
            pwdErrorElem.style.display = 'none';
        }
        try {
            await getApi().createUser(data);
            closeModal();
            loadUsers();
            alert('เพิ่มผู้ใช้สำเร็จ');
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    });
    
    showModal();
}

async function editUser(id) {
    try {
        const result = await getApi().getUsers();
        const foundUser = result.data.find(u => u.id === id);
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2 class="mb-2">✏️ แก้ไขผู้ใช้</h2>
            <form id="editUserForm">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" value="${user.username}" disabled>
                </div>
                <div class="form-group">
                    <label>Password ใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)</label>
                    <input type="password" name="password" minlength="6">
                </div>
                <div class="form-group">
                    <label>ชื่อ-นามสกุล</label>
                    <input type="text" name="full_name" value="${user.full_name || ''}">
                </div>
                <div class="form-group">
                    <label>Role *</label>
                    <select name="role" required>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="coadmin" ${user.role === 'coadmin' ? 'selected' : ''}>Co-Admin</option>
                        <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
                    </select>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button type="submit" class="btn btn-primary">💾 บันทึก</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
                </div>
            </form>
        `;
        
        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            // Remove password if empty
            if (!data.password) delete data.password;

            try {
                // Ensure id is a number
                await getApi().updateUser(Number(id), data);
                closeModal();
                loadUsers();
                alert('แก้ไขผู้ใช้สำเร็จ');
            } catch (error) {
                alert('เกิดข้อผิดพลาด: ' + error.message);
            }
        });
        
        showModal();
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

async function deleteUser(id, username) {
    if (!confirm(`ต้องการลบผู้ใช้ "${username}" ใช่หรือไม่?`)) return;
    
    try {
        await getApi().deleteUser(id);
        loadUsers();
        alert('ลบผู้ใช้สำเร็จ');
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

// ===== Reports Functions =====
async function exportStockSummary() {
    try {
        await getApi().exportStockSummary();
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

async function exportRecentTransactions() {
    try {
        await getApi().exportRecentTransactions(50);
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

// ===== Activity Logs Functions =====
async function loadActivityLogs() {
        try {
            const actionElem = document.getElementById('filterAction');
            const limitElem = document.getElementById('filterLimit');
            const action = actionElem ? actionElem.value : '';
            const limit = limitElem ? limitElem.value : 50;

            const params = {};
            if (action) params.action = action;
            if (limit) params.limit = limit;
        
            const result = await getApi().getActivityLogs(params);
            const list = document.getElementById('activityLogsList');
        
            if (result.data && result.data.length > 0) {
                const actionEmojis = {
                    'LOGIN': '🔐',
                    'CREATE_SPAREPART': '➕',
                    'UPDATE_SPAREPART': '✏️',
                    'DELETE_SPAREPART': '🗑️',
                    'ISSUE_TRANSACTION': '📤',
                    'RETURN_TRANSACTION': '📥',
                    'CREATE_USER': '👤➕',
                    'UPDATE_USER': '👤✏️',
                    'DELETE_USER': '👤🗑️'
                };
            
                list.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>วันที่/เวลา</th>
                                <th>ผู้ใช้</th>
                                <th>การกระทำ</th>
                                <th>Entity</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.data.map(log => `
                                <tr>
                                    <td>${new Date(log.created_at).toLocaleString('th-TH')}</td>
                                    <td><strong>${log.username || '-'}</strong></td>
                                    <td><span class="status-badge">${actionEmojis[log.action] || '📋'} ${log.action}</span></td>
                                    <td>${log.entity_type ? `${log.entity_type} #${log.entity_id}` : '-'}</td>
                                    <td><code>${log.ip_address || '-'}</code></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📜</div><p>ไม่พบ Activity Logs</p></div>';
            }
            
            // Apply language translation after page content is loaded
            applyLanguageToCurrentPage();
        } catch (error) {
            console.error('Load activity logs error:', error);
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
}

// ===== Modal Functions =====
function showModal() {
    document.getElementById('modal').classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

// Close modal when clicking outside
window.onclick = (event) => {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};

// ===== Analytics & Charts Functions =====
let stockStatusChartInstance = null;
let transactionTrendChartInstance = null;
let topItemsChartInstance = null;

async function createStockStatusChart(statusData) {
    if (!statusData) return;
    
    const ctx = document.getElementById('stockStatusChart');
    if (!ctx) return;
    
    // Destroy previous instance
    if (stockStatusChartInstance) stockStatusChartInstance.destroy();
    
    const labels = [];
    const data = [];
    const colors = ['#10b981', '#f59e0b', '#ef4444'];
    
    if (statusData.good) { labels.push('ปกติ'); data.push(statusData.good); }
    if (statusData.warning) { labels.push('เตือน'); data.push(statusData.warning); }
    if (statusData.critical) { labels.push('วิกฤต'); data.push(statusData.critical); }
    
    stockStatusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 12, family: "'Segoe UI', sans-serif" } }
                }
            }
        }
    });
}

async function createTransactionTrendChart() {
    const ctx = document.getElementById('transactionTrendChart');
    if (!ctx) return;
    
    try {
        // Get transaction counts by type
        const allTransactions = await getApi().getTransactions({});
        const txData = allTransactions.data || [];
        
        const issueCount = txData.filter(t => t.type.toLowerCase() === 'issue').length;
        const returnCount = txData.filter(t => t.type.toLowerCase() === 'return').length;
        
        // Destroy previous instance
        if (transactionTrendChartInstance) transactionTrendChartInstance.destroy();
        
        transactionTrendChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['📤 เบิก', '📥 คืน'],
                datasets: [{
                    label: 'จำนวนรายการ',
                    data: [issueCount, returnCount],
                    backgroundColor: ['#ef4444', '#10b981'],
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, labels: { font: { size: 12 } } }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating transaction trend chart:', error);
    }
}

async function createTopItemsChart() {
    const ctx = document.getElementById('topItemsChart');
    if (!ctx) return;
    
    try {
        // Get all spareparts and their transaction counts
        const sparepartsRes = await getApi().getSpareparts({ q: '' });
        const allSpareparts = sparepartsRes.data || [];
        const allTransactions = await getApi().getTransactions({});
        const txData = allTransactions.data || [];
        
        // Count issues per sparepart
        const issueCounts = {};
        txData.filter(t => t.type.toLowerCase() === 'issue').forEach(tx => {
            issueCounts[tx.sparepart_id] = (issueCounts[tx.sparepart_id] || 0) + tx.qty;
        });
        
        // Get top 10 items
        const topItems = allSpareparts
            .map(sp => ({
                name: sp.name,
                count: issueCounts[sp.id] || 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        // Destroy previous instance
        if (topItemsChartInstance) topItemsChartInstance.destroy();
        
        topItemsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topItems.map(item => item.name),
                datasets: [{
                    label: 'จำนวนที่เบิก',
                    data: topItems.map(item => item.count),
                    backgroundColor: '#3b82f6',
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'x',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, labels: { font: { size: 12 } } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating top items chart:', error);
    }
}

// ===== Settings Functions =====
// (ลบ async function loadSettings() เวอร์ชันที่ไม่มี callback ทิ้ง)

function updateColorDisplay() {
    const colors = {
        primary: document.getElementById('settingPrimaryColor').value,
        secondary: document.getElementById('settingSecondaryColor').value,
        success: document.getElementById('settingSuccessColor').value,
        warning: document.getElementById('settingWarningColor').value,
        danger: document.getElementById('settingDangerColor').value,
        info: document.getElementById('settingInfoColor').value,
        background: document.getElementById('settingBackgroundColor').value,
        sidebar: document.getElementById('settingSidebarColor').value,
        text: document.getElementById('settingTextColor').value
    };
    
    // Update code display spans
    document.getElementById('primaryColorCode').textContent = colors.primary;
    document.getElementById('secondaryColorCode').textContent = colors.secondary;
    document.getElementById('successColorCode').textContent = colors.success;
    document.getElementById('warningColorCode').textContent = colors.warning;
    document.getElementById('dangerColorCode').textContent = colors.danger;
    document.getElementById('infoColorCode').textContent = colors.info;
    document.getElementById('backgroundColorCode').textContent = colors.background;
    document.getElementById('sidebarColorCode').textContent = colors.sidebar;
    document.getElementById('textColorCode').textContent = colors.text;
    
    // Update CSS variables for live preview
    document.documentElement.style.setProperty('--primary', colors.primary);
    document.documentElement.style.setProperty('--secondary', colors.secondary);
    document.documentElement.style.setProperty('--success', colors.success);
    document.documentElement.style.setProperty('--warning', colors.warning);
    document.documentElement.style.setProperty('--danger', colors.danger);
    document.documentElement.style.setProperty('--info', colors.info);
    document.documentElement.style.setProperty('--background', colors.background);
    document.documentElement.style.setProperty('--text', colors.text);
    
    // Update sidebar background
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.backgroundColor = colors.sidebar;
    }
}

document.addEventListener('input', (e) => {
    if (e.target.id.startsWith('setting') && e.target.id.endsWith('Color')) {
        updateColorDisplay();
    }
});

// Fix: Add renderMenuOrder function (was missing and caused template literal/HTML errors)
function renderMenuOrder(menuOrder) {
    const container = document.getElementById('menuOrderList');
    if (!container) return;
    container.innerHTML = menuOrder.map((menu, index) => {
        return `
        <div class="menu-order-item" data-menu="${menu}">
            <span>${menu}</span>
            <div style="display:inline-block;float:right">
                <button class="btn-menu-move" onclick="moveMenuItem(${index}, 'up')"${index === 0 ? ' disabled' : ''}>
                    <i class="fa fa-chevron-up"></i>
                </button>
                <button class="btn-menu-move" onclick="moveMenuItem(${index}, 'down')"${index === menuOrder.length - 1 ? ' disabled' : ''}>
                    <i class="fa fa-chevron-down"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

async function loadSettings(callback) {
    try {
        const response = await getApi().getBrandingSettings();
        const settings = response;
        if (!settings) throw new Error('settings is undefined!');
        // Fill form inputs
        document.getElementById('settingAppName').value = settings.app_name || '';
        document.getElementById('settingAppSubtitle').value = settings.app_subtitle || '';
        document.getElementById('settingCompanyName').value = settings.company_name || '';
        document.getElementById('settingLogoText').value = settings.logo_text || '';
        document.getElementById('settingPrimaryColor').value = settings.primary_color || '#3b82f6';
        document.getElementById('settingSecondaryColor').value = settings.secondary_color || '#8b5cf6';
        document.getElementById('settingSuccessColor').value = settings.success_color || '#10b981';
        document.getElementById('settingWarningColor').value = settings.warning_color || '#f59e0b';
        document.getElementById('settingDangerColor').value = settings.danger_color || '#ef4444';
        document.getElementById('settingInfoColor').value = settings.info_color || '#06b6d4';
        document.getElementById('settingBackgroundColor').value = settings.background_color || '#f9fafb';
        document.getElementById('settingSidebarColor').value = settings.sidebar_color || '#ffffff';
        document.getElementById('settingTextColor').value = settings.text_color || '#111827';
        document.getElementById('settingShowDemoCredentials').checked = settings.show_demo_credentials !== false;
        // Set theme
        const theme = settings.theme || 'light';
        if (theme === 'dark') {
            document.getElementById('settingThemeDark').checked = true;
        } else {
            document.getElementById('settingThemeLight').checked = true;
        }
        applyTheme(theme);
        // Update color code display
        updateColorDisplay();
        // Load menu order
        renderMenuOrder(settings.menu_order || ['dashboard', 'spareparts', 'transactions', 'reports', 'users', 'activity', 'settings']);
        // Apply menu order to sidebar
        applyMenuOrder(settings.menu_order || ['dashboard', 'spareparts', 'transactions', 'reports', 'users', 'activity', 'settings']);
        // Load system info
        try {
            const users = await getApi().getUsers({});
            const spareparts = await getApi().getSpareparts({});
            document.getElementById('totalUsersInfo').textContent = (users.data || []).length;
            document.getElementById('totalSparepartsInfo').textContent = (spareparts.data || []).length;
        } catch (e) {
            console.log('Could not load system info');
        }
        // Now that all DOM/menu is ready, call callback for language update
        if (typeof callback === 'function') callback();
    } catch (error) {
        console.error('Load settings error:', error);
        alert('ไม่สามารถโหลดการตั้งค่าได้');
    }
}

// ====== ให้แน่ใจว่าฟังก์ชันถูก bind หลังสุดของไฟล์ ======
window.editUserMenuPermissions = editUserMenuPermissions;
window.closePermissionsModal = closePermissionsModal;
window.logout = logout;
window.editUser = editUser;

// Fix logoutConfirm translation key usage
function confirmLogout() {
  const msg = (translations?.[currentLanguage]?.confirmLogout) || "Logout?";
  if (confirm(msg)) logout();
}