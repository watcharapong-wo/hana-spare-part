// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userStr);
    
    // Display user info in sidebar
    const userFullNameElem = document.getElementById('userFullName');
    if (userFullNameElem) userFullNameElem.textContent = user.full_name || user.username;
    const roleElem = document.getElementById('userRole');
    if (roleElem) {
        roleElem.textContent = user.role;
        roleElem.className = `badge ${user.role}`;
    }
    // Display user info in header
    const headerUserNameElem = document.getElementById('headerUserName');
    if (headerUserNameElem) headerUserNameElem.textContent = user.full_name || user.username;
    const headerRoleElem = document.getElementById('headerUserRole');
    if (headerRoleElem) {
        headerRoleElem.textContent = user.role;
        headerRoleElem.className = `badge-sm ${user.role}`;
    }
    
    // Initialize theme and language
    initializeHeaderControls();
    
    // Hide admin-only elements for non-admin
    if (user.role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    // Setup navigation
    setupNavigation();
    
    // Load dashboard by default
    loadDashboard();
});

// Global variable to track current language
let currentLanguage = localStorage.getItem('language') || 'th';

// PDF Import: Handle PDF file upload
document.addEventListener('DOMContentLoaded', () => {
    const importPdfInput = document.getElementById('importPdfInput');
    const importPdfBtn = document.getElementById('importPdfBtn');
    if (importPdfBtn && importPdfInput) {
        importPdfBtn.addEventListener('click', () => {
            importPdfInput.click();
        });
    }
    if (importPdfInput) {
        importPdfInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            // Prepare form data
            const formData = new FormData();
            formData.append('pdf', file);
            // Show loading indicator (optional)
            try {
                const res = await fetch('/api/import-pdf', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
                    }
                });
                const result = await res.json();
                if (res.ok) {
                    alert('นำเข้าข้อมูลจาก PDF สำเร็จ!');
                    // อาจจะ reload ข้อมูลอะไหล่ใหม่
                    if (typeof loadSpareparts === 'function') loadSpareparts();
                } else {
                    let msg = 'เกิดข้อผิดพลาด: ' + (result.message || 'ไม่สามารถนำเข้า PDF ได้');
                    if (result.error) msg += '\nerror: ' + result.error;
                    if (result.ocrError) msg += '\nocrError: ' + result.ocrError;
                    if (result.rawText) msg += '\nrawText: ' + result.rawText;
                    alert(msg);
                }
            } catch (err) {
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
            }
            // Reset input
            importPdfInput.value = '';
        });
    }
});

function setupNavigation() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.dataset.view;
            
            // Update active nav
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show selected view
            document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
            document.getElementById(`${viewName}View`).classList.add('active');
            
            // Load view data
            switch(viewName) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'spareparts':
                    loadSpareparts();
                    break;
                case 'transactions':
                    loadTransactions();
                    break;
                case 'reports':
                    // Reports view is static
                    applyLanguageToCurrentPage();
                    break;
                case 'users':
                    loadUsers();
                    break;
                case 'activity':
                    loadActivityLogs();
                    break;
                case 'settings':
                    loadSettings();
                    break;
            }
        });
    });
}

// ===== Header Controls =====
const translations = {
    th: {
        // Header
        appTitle: 'IT Spare Parts Management',
        
        // Menu
        dashboard: 'Dashboard',
        spareparts: 'จัดการอะไหล่',
        transactions: 'เบิก-คืนอะไหล่',
        reports: 'รายงาน & ส่งออก',
        users: 'จัดการผู้ใช้',
        activity: 'ประวัติกิจกรรม',
        settings: 'ตั้งค่าระบบ',
        logout: 'ออกจากระบบ',
        
        // Dashboard
        dashboardTitle: 'Dashboard',
        dashboardSubtitle: 'ยินดีต้อนรับกลับมา! นี่คือภาพรวมของระบบของคุณ',
        refresh: 'รีเฟรช',
        totalItems: 'รายการทั้งหมด',
        totalQuantity: 'จำนวนทั้งหมด',
        lowStockItems: 'อะไหล่ใกล้หมด',
        alertsTitle: 'การแจ้งเตือนสต็อก',
        recentTransactionsTitle: 'รายการล่าสุด',
        stockAnalysisTitle: 'วิเคราะห์สต็อก',
        transactionTrendsTitle: 'แนวโน้มการเบิก-คืน',
        topItemsTitle: 'อะไหล่ยอดนิยม',
        
        // Spareparts
        sparepartsTitle: 'จัดการอะไหล่',
        sparepartsSubtitle: 'จัดการข้อมูลอะไหล่ทั้งหมดในระบบ',
        addSparepart: 'เพิ่มอะไหล่ใหม่',
        searchPlaceholder: 'ค้นหาชื่ออะไหล่...',
        filterByLocation: 'ตำแหน่ง',
        allLocations: 'ทั้งหมด',
        filterByStatus: 'สถานะ',
        allStatus: 'ทั้งหมด',
        normal: 'ปกติ',
        low: 'ใกล้หมด',
        outOfStock: 'หมดสต็อก',
        
        // Transactions
        transactionsTitle: 'เบิก-คืนอะไหล่',
        transactionsSubtitle: 'บันทึกการเบิกและคืนอะไหล่',
        newTransaction: 'รายการใหม่',
        filterByType: 'ประเภท',
        allTypes: 'ทั้งหมด',
        withdraw: 'เบิก',
        return: 'คืน',
        pending: 'รอดำเนินการ',
        approved: 'อนุมัติ',
        rejected: 'ไม่อนุมัติ',
        
        // Reports
        reportsTitle: 'รายงาน & ส่งออก',
        reportsSubtitle: 'ส่งออกข้อมูลและสร้างรายงาน',
        exportStockSummary: 'ส่งออกสรุปสต็อก',
        exportTransactions: 'ส่งออกรายการเบิก-คืน',
        selectDateRange: 'เลือกช่วงวันที่',
        from: 'จาก',
        to: 'ถึง',
        generateReport: 'สร้างรายงาน',
        
        // Users
        usersTitle: 'จัดการผู้ใช้',
        usersSubtitle: 'จัดการบัญชีผู้ใช้งานระบบ',
        addUser: 'เพิ่มผู้ใช้ใหม่',
        filterByRole: 'บทบาท',
        allRoles: 'ทั้งหมด',
        admin: 'ผู้ดูแลระบบ',
        staff: 'พนักงาน',
        viewer: 'ผู้ดู',
        username: 'ชื่อผู้ใช้',
        password: 'รหัสผ่าน',
        fullName: 'ชื่อ-นามสกุล',
        email: 'อีเมล',
        role: 'บทบาท',
        createdAt: 'วันที่สร้าง',
        
        // Activity Logs
        activityTitle: 'ประวัติกิจกรรม',
        activitySubtitle: 'ติดตามกิจกรรมผู้ใช้ในระบบ',
        user: 'ผู้ใช้',
        action: 'การกระทำ',
        details: 'รายละเอียด',
        timestamp: 'เวลา',
        
        // Settings
        settingsTitle: 'ตั้งค่าระบบ',
        settingsSubtitle: 'ปรับแต่งการตั้งค่าระบบ',
        brandingSettings: 'การตั้งค่าแบรนด์',
        systemName: 'ชื่อระบบ',
        systemSubtitle: 'คำอธิบายระบบ',
        companyName: 'ชื่อบริษัท',
        logoText: 'โลโก้ (ข้อความ)',
        primaryColor: 'สีหลัก',
        secondaryColor: 'สีรอง',
        successColor: 'สีสำเร็จ',
        warningColor: 'สีเตือน',
        dangerColor: 'สีอันตราย',
        infoColor: 'สีข้อมูล',
        backgroundColor: 'สีพื้นหลัง',
        sidebarColor: 'สี Sidebar',
        textColor: 'สีตัวอักษร',
        theme: 'โหมดธีม',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        menuOrder: 'ลำดับเมนู',
        showDemoCredentials: 'แสดง Demo Credentials บนหน้า Login',
        systemInfo: 'ข้อมูลระบบ',
        version: 'เวอร์ชัน',
        dbStatus: 'สถานะฐานข้อมูล',
        totalUsers: 'ผู้ใช้ทั้งหมด',
        totalSpareparts: 'รายการอะไหล่',
        
        // Buttons
        save: 'บันทึก',
        cancel: 'ยกเลิก',
        edit: 'แก้ไข',
        delete: 'ลบ',
        close: 'ปิด',
        search: 'ค้นหา',
        export: 'ส่งออก',
        import: 'นำเข้า',
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

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleLanguage() {
    const oldLang = currentLanguage;
    const newLang = oldLang === 'th' ? 'en' : 'th';
    currentLanguage = newLang;
    localStorage.setItem('language', newLang);
    updateLanguageDisplay(newLang);
    applyLanguage(newLang);
    
    const langName = newLang === 'th' ? 'ไทย' : 'English';
    console.log(`[i18n] Language switched to: ${langName}`);
}

function updateLanguageDisplay(lang) {
    const langText = document.getElementById('languageText');
    if (langText) {
        langText.textContent = lang === 'th' ? 'EN' : 'TH';
    }
}

function applyLanguageToCurrentPage() {
    // Find which view is currently active and apply translations
    const t = translations[currentLanguage];
    
    const activeView = document.querySelector('.view.active');
    if (!activeView) return;
    
    const viewId = activeView.id;
    console.log(`[i18n] Applying ${currentLanguage} translations to: ${viewId}`);
    
    // Apply translations based on which page is visible
    if (viewId === 'dashboardView') {
        updateDashboardTexts(t);
    } else if (viewId === 'sparepartsView') {
        updateSparepartsTexts(t);
    } else if (viewId === 'transactionsView') {
        updateTransactionsTexts(t);
    } else if (viewId === 'reportsView') {
        updateReportsTexts(t);
    } else if (viewId === 'usersView') {
        updateUsersTexts(t);
    } else if (viewId === 'activityView') {
        updateActivityTexts(t);
    } else if (viewId === 'settingsView') {
        updateSettingsTexts(t);
    }
    
    // Also apply hardcoded element translations
    translateHardcodedElements(t);
}

function applyLanguage(lang) {
    const t = translations[lang];
    
    // Update header title
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle) headerTitle.textContent = t.appTitle;
    
    // Update sidebar header
    const sidebarTitle = document.querySelector('.sidebar-header h2');
    if (sidebarTitle) sidebarTitle.textContent = t.appTitle;
    
    // Update menu items
    const menuItems = {
        'dashboard': t.dashboard,
        'spareparts': t.spareparts,
        'transactions': t.transactions,
        'reports': t.reports,
        'users': t.users,
        'activity': t.activity,
        'settings': t.settings
    };
    
    Object.keys(menuItems).forEach(view => {
        const menuItem = document.querySelector(`.nav-item[data-view="${view}"]`);
        if (menuItem) {
            const icon = menuItem.querySelector('span').textContent;
            menuItem.innerHTML = `<span>${icon}</span> ${menuItems[view]}`;
        }
    });
    
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

function translateHardcodedElements(t) {
    // Translate all visible text nodes
    const allElements = document.querySelectorAll('*');
    
    // Translation mappings for common text
    const textMap = {
        'th': {
            'ชื่ออะไหล่': t.partName || 'ชื่ออะไหล่',
            'จำนวนคงเหลือ': t.quantityRemaining || 'จำนวนคงเหลือ',
            'จำนวนขั้นต่ำ': t.minStock || 'จำนวนขั้นต่ำ',
            'สถานที่': t.location || 'สถานที่',
            'สถานที่จัดเก็บ': t.storageLocation || 'สถานที่จัดเก็บ',
            'ทุกสถานที่': t.allLocations || 'ทุกสถานที่',
            'เพิ่มอะไหล่': t.addSparepart || 'เพิ่มอะไหล่',
            'เบิกของ': t.withdraw || 'เบิกของ',
            'คืนของ': t.return || 'คืนของ'
        },
        'en': {
            'ชื่ออะไหล่': t.partName || 'Part Name',
            'จำนวนคงเหลือ': t.quantityRemaining || 'Quantity Remaining',
            'จำนวนขั้นต่ำ': t.minStock || 'Min. Stock',
            'สถานที่': t.location || 'Location',
            'สถานที่จัดเก็บ': t.storageLocation || 'Storage Location',
            'ทุกสถานที่': t.allLocations || 'All',
            'เพิ่มอะไหล่': t.addSparepart || 'Add Part',
            'เบิกของ': t.withdraw || 'Withdraw',
            'คืนของ': t.return || 'Return'
        }
    };
    
    // Dashboard stat labels
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length > 0) {
        const labels = [t.totalItems, t.totalQuantity, t.lowStockItems];
        statLabels.forEach((label, index) => {
            if (labels[index]) label.textContent = labels[index];
        });
    }
    
    // Section titles
    const sectionTitles = {
        'alertsTitle': 'การแจ้งเตือนสต็อก',
        'recentTransactionsTitle': 'รายการล่าสุด',
        'stockAnalysisTitle': 'วิเคราะห์สต็อก'
    };
    
    document.querySelectorAll('.section h3').forEach(h3 => {
        const text = h3.textContent.trim();
        // Update based on emoji or position
        if (text.includes('📋')) {
            h3.textContent = `📋 ${t.alertsTitle}`;
        } else if (text.includes('📊')) {
            h3.textContent = `📊 ${t.recentTransactionsTitle}`;
        } else if (text.includes('📈')) {
            h3.textContent = `📈 ${t.stockAnalysisTitle}`;
        } else if (text.includes('📉')) {
            h3.textContent = `📉 ${t.transactionTrendsTitle}`;
        } else if (text.includes('🔝')) {
            h3.textContent = `🔝 ${t.topItemsTitle}`;
        }
    });
    
    // Button texts
    document.querySelectorAll('.btn').forEach(btn => {
        const btnText = btn.textContent.trim();
        if (btnText.includes('บันทึก') || btnText.includes('Save')) {
            const icon = btn.innerHTML.match(/^[^A-Za-z]*/)?.[0] || '💾';
            btn.innerHTML = `${icon} ${t.save}`;
        } else if (btnText.includes('ยกเลิก') || btnText.includes('Cancel')) {
            btn.textContent = t.cancel;
        } else if (btnText.includes('แก้ไข') || btnText.includes('Edit')) {
            btn.textContent = t.edit;
        } else if (btnText.includes('ลบ') || btnText.includes('Delete')) {
            btn.textContent = t.delete;
        } else if (btnText.includes('ปิด') || btnText.includes('Close')) {
            btn.textContent = t.close;
        } else if (btnText.includes('ค้นหา') || btnText.includes('Search')) {
            btn.textContent = t.search;
        } else if (btnText.includes('ส่งออก') || btnText.includes('Export')) {
            btn.textContent = t.export;
        } else if (btnText.includes('นำเข้า') || btnText.includes('Import')) {
            btn.textContent = t.import;
        } else if (btnText.includes('รีเซ็ต') || btnText.includes('Reset')) {
            btn.textContent = t.reset;
        }
    });
    
    // Table headers
    const thElements = document.querySelectorAll('table thead th');
    thElements.forEach(th => {
        const text = th.textContent.trim();
        if (text === 'ลำดับ' || text === 'No.') th.textContent = t.no || 'ลำดับ';
        if (text === 'ชื่อ' || text === 'Name') th.textContent = t.name || 'ชื่อ';
        if (text === 'ชื่ออะไหล่' || text === 'Part Name') th.textContent = t.partName || 'ชื่ออะไหล่';
        if (text === 'ตำแหน่ง' || text === 'Location') th.textContent = t.location || 'ตำแหน่ง';
        if (text === 'จำนวน' || text === 'Quantity') th.textContent = t.quantity || 'จำนวน';
        if (text === 'จำนวนคงเหลือ' || text === 'Quantity Remaining') th.textContent = t.quantityRemaining || 'จำนวนคงเหลือ';
        if (text === 'สต็อกขั้นต่ำ' || text === 'Min. Stock') th.textContent = t.minStock || 'สต็อกขั้นต่ำ';
        if (text === 'จำนวนขั้นต่ำ' || text === 'Min. Quantity') th.textContent = t.minStock || 'จำนวนขั้นต่ำ';
        if (text === 'สถานะ' || text === 'Status') th.textContent = t.status || 'สถานะ';
        if (text === 'สถานที่จัดเก็บ' || text === 'Storage Location') th.textContent = t.storageLocation || 'สถานที่จัดเก็บ';
        if (text === 'จัดการ' || text === 'Actions') th.textContent = t.actions || 'จัดการ';
        if (text === 'ประเภท' || text === 'Type') th.textContent = t.type || 'ประเภท';
        if (text === 'ผู้ขอ' || text === 'Requested By') th.textContent = t.requestedBy || 'ผู้ขอ';
        if (text === 'วันที่' || text === 'Date') th.textContent = t.date || 'วันที่';
        if (text === 'ชื่อผู้ใช้' || text === 'Username') th.textContent = t.username || 'ชื่อผู้ใช้';
        if (text === 'ชื่อ-นามสกุล' || text === 'Full Name') th.textContent = t.fullName || 'ชื่อ-นามสกุล';
        if (text === 'อีเมล' || text === 'Email') th.textContent = t.email || 'อีเมล';
        if (text === 'บทบาท' || text === 'Role') th.textContent = t.role || 'บทบาท';
        if (text === 'ผู้ใช้' || text === 'User') th.textContent = t.user || 'ผู้ใช้';
        if (text === 'การกระทำ' || text === 'Action') th.textContent = t.action || 'การกระทำ';
        if (text === 'รายละเอียด' || text === 'Details') th.textContent = t.details || 'รายละเอียด';
        if (text === 'เวลา' || text === 'Timestamp') th.textContent = t.timestamp || 'เวลา';
    });
    
    // Update label texts in forms and filters
    document.querySelectorAll('label').forEach(label => {
        const text = label.textContent.trim();
        if (text === 'ชื่ออะไหล่ *' || text === 'Part Name *') label.textContent = t.partName ? `${t.partName} *` : 'ชื่ออะไหล่ *';
        if (text === 'จำนวนขั้นต่ำ *' || text === 'Min. Stock *') label.textContent = t.minStock ? `${t.minStock} *` : 'จำนวนขั้นต่ำ *';
        if (text === 'สถานที่จัดเก็บ' || text === 'Storage Location') label.textContent = t.storageLocation || 'สถานที่จัดเก็บ';
        if (text === 'ตำแหน่ง' || text === 'Location') label.textContent = t.location || 'ตำแหน่ง';
        if (text === 'สถานะ' || text === 'Status') label.textContent = t.status || 'สถานะ';
        if (text === 'ประเภท' || text === 'Type') label.textContent = t.type || 'ประเภท';
        if (text === 'บทบาท' || text === 'Role') label.textContent = t.role || 'บทบาท';
    });
    
    // Update input placeholders
    document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="password"]').forEach(input => {
        const placeholder = input.placeholder.trim();
        if (placeholder === 'จำนวนขั้นต่ำ' || placeholder === 'Min. Stock') input.placeholder = t.minStock || 'จำนวนขั้นต่ำ';
        if (placeholder === '🔍 ค้นหาอะไหล่...' || placeholder === '🔍 Search spare part...') input.placeholder = `🔍 ${t.searchPlaceholder}`;
    });
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
    
    // Update section titles
    const sections = dashboardView.querySelectorAll('.section h3');
    sections.forEach(h3 => {
        const text = h3.textContent;
        if (text.includes('📋')) h3.textContent = `📋 ${t.alertsTitle}`;
        else if (text.includes('📊')) h3.textContent = `📊 ${t.recentTransactionsTitle}`;
        else if (text.includes('📈')) h3.textContent = `📈 ${t.stockAnalysisTitle}`;
        else if (text.includes('📉')) h3.textContent = `📉 ${t.transactionTrendsTitle}`;
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
    
    // Update subtitle
    const pageHeader = transactionsView.querySelector('.page-header');
    if (pageHeader) {
        const p = pageHeader.querySelector('p');
        if (p) p.textContent = t.transactionsSubtitle;
        
        // Update action buttons
        const buttons = pageHeader.querySelectorAll('.btn');
        buttons.forEach(btn => {
            const text = btn.textContent.trim();
            if (text.includes('เบิก') || text.includes('Withdraw')) {
                btn.innerHTML = `📤 ${t.withdraw}`;
            } else if (text.includes('คืน') || text.includes('Return')) {
                btn.innerHTML = `📥 ${t.return}`;
            }
        });
    }
    
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

function updateUsersTexts(t) {
    const usersView = document.getElementById('usersView');
    if (!usersView) return;
    
    // Update title
    usersView.querySelectorAll('h1').forEach(h1 => {
        h1.textContent = `👥 ${t.usersTitle}`;
    });
    
    // Update subtitle
    const pageHeader = usersView.querySelector('.page-header');
    if (pageHeader) {
        const p = pageHeader.querySelector('p');
        if (p) p.textContent = t.usersSubtitle;
        
        // Update add button
        const addBtn = pageHeader.querySelector('.btn-primary');
        if (addBtn) {
            addBtn.innerHTML = `➕ ${t.addUser}`;
        }
    }
    
    // Update table headers
    const table = usersView.querySelector('table');
    if (table) {
        const headers = table.querySelectorAll('thead th');
        const headerTexts = [t.no, t.username, t.fullName, t.email, t.role, t.actions];
        headers.forEach((th, index) => {
            if (headerTexts[index]) {
                th.textContent = headerTexts[index];
            }
        });
    }
}

function updateActivityTexts(t) {
    const activityView = document.getElementById('activityView');
    if (!activityView) return;
    
    // Update title
    activityView.querySelectorAll('h1').forEach(h1 => {
        h1.textContent = `📋 ${t.activityTitle}`;
    });
    
    // Update subtitle
    const pageHeader = activityView.querySelector('.page-header');
    if (pageHeader) {
        const p = pageHeader.querySelector('p');
        if (p) p.textContent = t.activitySubtitle;
    }
    
    // Update table headers
    const table = activityView.querySelector('table');
    if (table) {
        const headers = table.querySelectorAll('thead th');
        const headerTexts = [t.no, t.user, t.action, t.details, t.timestamp];
        headers.forEach((th, index) => {
            if (headerTexts[index]) {
                th.textContent = headerTexts[index];
            }
        });
    }
}

function updateSettingsTexts(t) {
    const settingsView = document.getElementById('settingsView');
    if (!settingsView) return;
    
    // Update title
    settingsView.querySelectorAll('h1').forEach(h1 => {
        h1.textContent = `⚙️ ${t.settingsTitle}`;
    });
    
    // Update subtitle
    const pageHeader = settingsView.querySelector('.page-header');
    if (pageHeader) {
        const p = pageHeader.querySelector('p');
        if (p) p.textContent = t.settingsSubtitle;
    }
}

// Logout
function logout() {
    const lang = localStorage.getItem('language') || 'th';
    const confirmMsg = translations[lang].confirmLogout;
    
    if (confirm(confirmMsg)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// ===== Dashboard Functions =====
async function loadDashboard() {
    try {
        const [summary, lowStock, recentTx] = await Promise.all([
            api.getStockSummary(),
            api.getLowStock(),
            api.getRecentTransactions(10)
        ]);
        
        // Update stats
        document.getElementById('totalItems').textContent = summary.summary.total_items;
        document.getElementById('totalQuantity').textContent = summary.summary.total_quantity;
        document.getElementById('lowStockItems').textContent = summary.summary.low_stock_items;
        
        // Display low stock items
        const lowStockList = document.getElementById('lowStockList');
        if (summary.low_stock && summary.low_stock.length > 0) {
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
                        ${summary.low_stock.map(item => `
                            <tr>
                                <td><strong>${item.name}</strong></td>
                                <td><span class="status-badge status-issue">${item.quantity}</span></td>
                                <td>${item.min_stock}</td>
                                <td>${item.location || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            lowStockList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><p>ไม่มีอะไหล่ที่ใกล้หมด</p></div>';
        }
        
        // Display recent transactions
        const recentList = document.getElementById('recentTransactions');
        if (recentTx.data && recentTx.data.length > 0) {
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
                        ${recentTx.data.map(tx => `
                            <tr>
                                <td>${new Date(tx.created_at).toLocaleString('th-TH')}</td>
                                <td><span class="status-badge status-${tx.type}">${tx.type === 'issue' ? '📤 เบิก' : '📥 คืน'}</span></td>
                                <td>${tx.sparepart_name}</td>
                                <td>${tx.qty}</td>
                                <td>${tx.requester}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            recentList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>ยังไม่มีรายการเบิก-คืน</p></div>';
        }
        
        // Create charts
        setTimeout(() => {
            createStockStatusChart(summary.status);
            createTransactionTrendChart();
            createTopItemsChart();
            // Apply language translation after page content is loaded
            applyLanguageToCurrentPage();
        }, 100);
    } catch (error) {
        console.error('Load dashboard error:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
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
        
        const result = await api.getSpareparts(params);
        const list = document.getElementById('sparepartsList');
        
        if (result.data && result.data.length > 0) {
            const user = JSON.parse(localStorage.getItem('user'));
            const isAdmin = user.role === 'admin';
            
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
        
        // Apply language translation after page content is loaded
        applyLanguageToCurrentPage();
    } catch (error) {
        console.error('Load spareparts error:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

function showAddSparepartModal() {
    const modalBody = document.getElementById('modalBody');
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
            <div style="display: flex; gap: 12px;">
                <button type="submit" class="btn btn-primary">💾 บันทึก</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
            </div>
        </form>
    `;
    
    document.getElementById('addSparepartForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await api.createSparepart(data);
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
        const result = await api.getSparepartById(id);
        const item = result.data;
        
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
            
            try {
                await api.updateSparepart(id, data);
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

async function deleteSparepart(id, name) {
    if (!confirm(`ต้องการลบอะไหล่ "${name}" ใช่หรือไม่?`)) return;
    
    try {
        await api.deleteSparepart(id);
        loadSpareparts();
        alert('ลบอะไหล่สำเร็จ');
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

// ===== Transactions Functions =====
async function loadTransactions() {
    try {
    const type = document.getElementById('filterTxType')?.value;
    const requester = document.getElementById('filterRequester')?.value;
    const dateFrom = document.getElementById('filterDateFrom')?.value;
    const dateTo = document.getElementById('filterDateTo')?.value;

    const params = {};
    if (type) params.type = type;
    if (requester) params.requester = requester;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    const result = await api.getTransactions(params);
        const list = document.getElementById('transactionsList');
        
        if (result.data && result.data.length > 0) {
            const user = JSON.parse(localStorage.getItem('user'));
            const isAdmin = user.role === 'admin';
            
            list.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>วันที่</th>
                            <th>ประเภท</th>
                            <th>อะไหล่</th>
                            <th>จำนวน</th>
                            <th>ผู้เบิก/คืน</th>
                            <th>หมายเหตุ</th>
                            <th>ผู้บันทึก</th>
                            ${isAdmin ? '<th>จัดการ</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${result.data.map(tx => {
                            const normalizedType = String(tx.type || '').toLowerCase();
                            const typeLabel = normalizedType === 'issue' ? '📤 เบิก' : '📥 คืน';
                            const typeClass = normalizedType === 'issue' ? 'issue' : 'return';
                            return `
                                <tr>
                                    <td>${new Date(tx.created_at).toLocaleString('th-TH')}</td>
                                    <td><span class="status-badge status-${typeClass}">${typeLabel}</span></td>
                                    <td>${tx.sparepart_name}</td>
                                    <td>${tx.qty}</td>
                                    <td>${tx.requester}</td>
                                    <td>${tx.note || '-'}</td>
                                    <td>${tx.created_by_full_name || tx.created_by_username || '-'}</td>
                                    ${isAdmin ? `
                                        <td>
                                            <button class="btn btn-danger" onclick="deleteTransaction(${tx.id})" style="padding: 6px 12px; font-size: 13px;">🗑️ ลบ</button>
                                        </td>
                                    ` : ''}
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } else {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>ยังไม่มีรายการเบิก-คืน</p></div>';
        }
        
        // Apply language translation after page content is loaded
        applyLanguageToCurrentPage();
    } catch (error) {
        console.error('Load transactions error:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

async function showTransactionModal(type) {
    try {
        const result = await api.getSpareparts();
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
                    await api.issueSparepart(data);
                } else {
                    await api.returnSparepart(data);
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
        await api.deleteTransaction(id);
        loadTransactions();
        alert('ลบรายการสำเร็จ');
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}
// ===== Users Functions =====
async function loadUsers() {
    try {
        const q = document.getElementById('searchUsers')?.value;
        const role = document.getElementById('filterUserRole')?.value;
        const isActive = document.getElementById('filterUserStatus')?.value;

        const params = {};
        if (q) params.q = q;
        if (role) params.role = role;
        if (isActive !== undefined && isActive !== '') params.is_active = isActive;

        const result = await api.getUsers(params);
        const list = document.getElementById('usersList');
        
        if (result.data && result.data.length > 0) {
            list.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>Role</th>
                            <th>สถานะ</th>
                            <th>วันที่สร้าง</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.data.map(user => `
                            <tr>
                                <td><strong>${user.username}</strong></td>
                                <td>${user.full_name || '-'}</td>
                                <td><span class="badge ${user.role}">${user.role}</span></td>
                                <td><span class="status-badge ${user.is_active ? 'status-return' : 'status-issue'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                                <td>${new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                                <td>
                                    <button class="btn btn-info" onclick="editUser(${user.id})" style="padding: 6px 12px; font-size: 13px;">✏️ แก้ไข</button>
                                    <button class="btn btn-danger" onclick="deleteUser(${user.id}, '${user.username}')" style="padding: 6px 12px; font-size: 13px;">🗑️ ลบ</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><p>ไม่พบข้อมูลผู้ใช้</p></div>';
        }
        
        // Apply language translation after page content is loaded
        applyLanguageToCurrentPage();
    } catch (error) {
        console.error('Load users error:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
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
                <input type="password" name="password" required minlength="6">
            </div>
            <div class="form-group">
                <label>ชื่อ-นามสกุล</label>
                <input type="text" name="full_name">
            </div>
            <div class="form-group">
                <label>Role *</label>
                <select name="role" required>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
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
        
        try {
            await api.createUser(data);
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
        const result = await api.getUsers();
        const user = result.data.find(u => u.id === id);
        
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
                        <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
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
                await api.updateUser(id, data);
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
        await api.deleteUser(id);
        loadUsers();
        alert('ลบผู้ใช้สำเร็จ');
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

// ===== Reports Functions =====
async function exportStockSummary() {
    try {
        await api.exportStockSummary();
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

async function exportRecentTransactions() {
    try {
        await api.exportRecentTransactions(50);
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

// ===== Activity Logs Functions =====
async function loadActivityLogs() {
        try {
            const action = document.getElementById('filterAction').value;
            const limit = document.getElementById('filterLimit').value || 50;
        
            const params = {};
            if (action) params.action = action;
            if (limit) params.limit = limit;
        
            const result = await api.getActivityLogs(params);
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
        const allTransactions = await api.getTransactions({});
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
        const sparepartsRes = await api.getSpareparts({ q: '' });
        const allSpareparts = sparepartsRes.data || [];
        const allTransactions = await api.getTransactions({});
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
async function loadSettings() {
    try {
        const response = await api.getBrandingSettings();
        const settings = response.data;
        
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
        
        // Load system info
        try {
            const users = await api.getUsers({});
            const spareparts = await api.getSpareparts({});
            document.getElementById('totalUsersInfo').textContent = (users.data || []).length;
            document.getElementById('totalSparepartsInfo').textContent = (spareparts.data || []).length;
        } catch (e) {
            console.log('Could not load system info');
        }
        
        // Apply language translation after page content is loaded
        applyLanguageToCurrentPage();
    } catch (error) {
        console.error('Load settings error:', error);
        alert('ไม่สามารถโหลดการตั้งค่าได้');
    }
}

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

async function saveSettings() {
    try {
        const data = {
            app_name: document.getElementById('settingAppName').value || 'IT Spare Parts Management',
            app_subtitle: document.getElementById('settingAppSubtitle').value || 'ระบบจัดการอะไหล่ IT',
            company_name: document.getElementById('settingCompanyName').value || 'Your Company',
            logo_text: document.getElementById('settingLogoText').value || 'IT',
            primary_color: document.getElementById('settingPrimaryColor').value || '#3b82f6',
            secondary_color: document.getElementById('settingSecondaryColor').value || '#8b5cf6',
            success_color: document.getElementById('settingSuccessColor').value || '#10b981',
            warning_color: document.getElementById('settingWarningColor').value || '#f59e0b',
            danger_color: document.getElementById('settingDangerColor').value || '#ef4444',
            info_color: document.getElementById('settingInfoColor').value || '#06b6d4',
            background_color: document.getElementById('settingBackgroundColor').value || '#f9fafb',
            sidebar_color: document.getElementById('settingSidebarColor').value || '#ffffff',
            text_color: document.getElementById('settingTextColor').value || '#111827',
            show_demo_credentials: document.getElementById('settingShowDemoCredentials').checked,
            theme: document.querySelector('input[name="theme"]:checked').value || 'light',
            menu_order: getMenuOrder()
        };
        
        const response = await api.saveBrandingSettings(data);
        
        // Apply settings to the page
        document.title = `${data.app_name} - Dashboard`;
        document.querySelector('.sidebar-header h2').textContent = data.app_name;
        
        // Apply menu order
        applyMenuOrder(data.menu_order);
        
        // Apply theme
        applyTheme(data.theme);
        
        alert('✅ บันทึกการตั้งค่าสำเร็จ');
    } catch (error) {
        console.error('Save settings error:', error);
        alert('❌ เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
    }
}

function resetSettings() {
    if (confirm('ต้องการรีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นหรือไม่?')) {
        const defaults = {
            app_name: 'IT Spare Parts Management',
            app_subtitle: 'ระบบจัดการอะไหล่ IT',
            company_name: 'Your Company',
            logo_text: 'IT',
            primary_color: '#3b82f6',
            secondary_color: '#8b5cf6',
            success_color: '#10b981',
            warning_color: '#f59e0b',
            danger_color: '#ef4444',
            info_color: '#06b6d4',
            background_color: '#f9fafb',
            sidebar_color: '#ffffff',
            text_color: '#111827',
            show_demo_credentials: true,
            theme: 'light',
            menu_order: ['dashboard', 'spareparts', 'transactions', 'reports', 'users', 'activity', 'settings']
        };
        
        document.getElementById('settingAppName').value = defaults.app_name;
        document.getElementById('settingAppSubtitle').value = defaults.app_subtitle;
        document.getElementById('settingCompanyName').value = defaults.company_name;
        document.getElementById('settingLogoText').value = defaults.logo_text;
        document.getElementById('settingPrimaryColor').value = defaults.primary_color;
        document.getElementById('settingSecondaryColor').value = defaults.secondary_color;
        document.getElementById('settingSuccessColor').value = defaults.success_color;
        document.getElementById('settingWarningColor').value = defaults.warning_color;
        document.getElementById('settingDangerColor').value = defaults.danger_color;
        document.getElementById('settingInfoColor').value = defaults.info_color;
        document.getElementById('settingBackgroundColor').value = defaults.background_color;
        document.getElementById('settingSidebarColor').value = defaults.sidebar_color;
        document.getElementById('settingTextColor').value = defaults.text_color;
        document.getElementById('settingShowDemoCredentials').checked = defaults.show_demo_credentials;
        document.getElementById('settingThemeLight').checked = true;
        
        renderMenuOrder(defaults.menu_order);
        applyTheme(defaults.theme);
        updateColorDisplay();
    }
}

// Theme Management
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
}

// Listen for theme changes from settings panel
document.addEventListener('change', (e) => {
    if (e.target.name === 'theme') {
        applyTheme(e.target.value);
    }
});

// Menu Order Management
const menuLabels = {
    dashboard: '📊 Dashboard',
    spareparts: '🔧 อะไหล่',
    transactions: '📦 สถานะการเบิก-คืน',
    reports: '📈 รายงาน',
    users: '👥 ผู้ใช้งาน',
    activity: '📋 Activity Logs',
    settings: '⚙️ การตั้งค่า'
};

function renderMenuOrder(menuOrder) {
    const container = document.getElementById('menuOrderList');
    if (!container) return;
    
    container.innerHTML = menuOrder.map((item, index) => `
        <div class="menu-order-item" data-menu="${item}">
            <span class="menu-order-label">${menuLabels[item] || item}</span>
            <div class="menu-order-controls">
                <button class="btn-menu-move" onclick="moveMenuItem(${index}, 'up')" ${index === 0 ? 'disabled' : ''}>▲</button>
                <button class="btn-menu-move" onclick="moveMenuItem(${index}, 'down')" ${index === menuOrder.length - 1 ? 'disabled' : ''}>▼</button>
            </div>
        </div>
    `).join('');
}

function getMenuOrder() {
    const container = document.getElementById('menuOrderList');
    if (!container) return ['dashboard', 'spareparts', 'transactions', 'reports', 'users', 'activity', 'settings'];
    
    const items = container.querySelectorAll('.menu-order-item');
    return Array.from(items).map(item => item.dataset.menu);
}

function moveMenuItem(index, direction) {
    const currentOrder = getMenuOrder();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= currentOrder.length) return;
    
    // Swap items
    [currentOrder[index], currentOrder[newIndex]] = [currentOrder[newIndex], currentOrder[index]];
    
    renderMenuOrder(currentOrder);
}

function applyMenuOrder(menuOrder) {
    const sidebar = document.querySelector('.sidebar-nav');
    if (!sidebar) return;
    
    // Get all menu items
    const menuItems = {};
    sidebar.querySelectorAll('.nav-item').forEach(item => {
        const view = item.dataset.view;
        if (view) menuItems[view] = item;
    });
    
    // Clear sidebar
    sidebar.innerHTML = '';
    
    // Re-append in new order
    menuOrder.forEach(itemName => {
        if (menuItems[itemName]) {
            sidebar.appendChild(menuItems[itemName]);
        }
    });
}