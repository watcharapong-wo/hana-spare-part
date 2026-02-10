// API Configuration
const API_BASE_URL = 'http://localhost:3000';

// API Helper Functions
const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            throw new Error('Unauthorized');
        }
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    },
    
    // Auth APIs
    async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },
    
    // User APIs
    async getUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/users${query ? '?' + query : ''}`);
    },
    
    async createUser(userData) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },
    
    async updateUser(id, userData) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },
    
    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    },
    
    // Spareparts APIs
    async getSpareparts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/spareparts${query ? '?' + query : ''}`);
    },
    
    async getSparepartById(id) {
        return this.request(`/spareparts/${id}`);
    },
    
    async getLowStock() {
        return this.request('/spareparts/low-stock');
    },
    
    async createSparepart(data) {
        return this.request('/spareparts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    async updateSparepart(id, data) {
        return this.request(`/spareparts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    
    async deleteSparepart(id) {
        return this.request(`/spareparts/${id}`, {
            method: 'DELETE',
        });
    },
    
    // Transaction APIs
    async getTransactions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/transactions${query ? '?' + query : ''}`);
    },
    
    async issueSparepart(data) {
        return this.request('/transactions/issue', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    async returnSparepart(data) {
        return this.request('/transactions/return', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    async deleteTransaction(id) {
        return this.request(`/transactions/${id}`, {
            method: 'DELETE',
        });
    },
    
    // Reports APIs
    async getStockSummary() {
        return this.request('/reports/stock-summary');
    },
    
    async getRecentTransactions(limit = 20) {
        return this.request(`/reports/recent-transactions?limit=${limit}`);
    },
    
    async exportStockSummary() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/reports/export/stock-summary`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-summary-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
    
    async exportRecentTransactions(limit = 50) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/reports/export/recent-transactions?limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recent-transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
    
    // Activity Logs APIs
    async getActivityLogs(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/activity-logs${query ? '?' + query : ''}`);
    },
    
    async getMyActivityLogs() {
        return this.request('/activity-logs/my');
    },
    
    // Settings APIs
    async getBrandingSettings() {
        return this.request('/settings/branding');
    },
    
    async saveBrandingSettings(data) {
        return this.request('/settings/branding', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};
