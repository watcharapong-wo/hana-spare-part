const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { ok, fail } = require('../utils/respond');

// GET /settings/branding - Get branding settings
router.get('/branding', (req, res) => {
  db.get(`SELECT * FROM settings WHERE key = 'branding'`, [], (err, row) => {
    if (err) return fail(res, 'DB error', 500, err.message);
    
    if (!row) {
      // Return default settings
      const defaults = {
        app_name: 'IT Spare Parts Management',
        app_subtitle: 'ระบบจัดการอะไหล่ IT',
        company_name: 'Your Company',
        primary_color: '#3b82f6',
        secondary_color: '#8b5cf6',
        success_color: '#10b981',
        warning_color: '#f59e0b',
        danger_color: '#ef4444',
        info_color: '#06b6d4',
        background_color: '#f9fafb',
        sidebar_color: '#ffffff',
        text_color: '#111827',
        logo_text: 'IT',
        show_demo_credentials: true,
        menu_order: ['dashboard', 'spareparts', 'transactions', 'reports', 'users', 'activity', 'settings']
      };
      return ok(res, { message: 'Default settings', data: defaults });
    }
    
    const settings = JSON.parse(row.value || '{}');
    return ok(res, { message: 'Branding settings', data: settings });
  });
});

// POST /settings/branding - Update branding settings (admin only)
router.post('/branding', requireAuth, requireRole('admin'), (req, res) => {
  try {
    const { 
      app_name, app_subtitle, company_name, 
      primary_color, secondary_color, 
      success_color, warning_color, danger_color, info_color,
      background_color, sidebar_color, text_color,
      logo_text, show_demo_credentials, theme,
      menu_order
    } = req.body;
    
    const settings = {
      app_name: app_name || 'IT Spare Parts Management',
      app_subtitle: app_subtitle || 'ระบบจัดการอะไหล่ IT',
      company_name: company_name || 'Your Company',
      primary_color: primary_color || '#3b82f6',
      secondary_color: secondary_color || '#8b5cf6',
      success_color: success_color || '#10b981',
      warning_color: warning_color || '#f59e0b',
      danger_color: danger_color || '#ef4444',
      info_color: info_color || '#06b6d4',
      background_color: background_color || '#f9fafb',
      sidebar_color: sidebar_color || '#ffffff',
      text_color: text_color || '#111827',
      logo_text: logo_text || 'IT',
      show_demo_credentials: show_demo_credentials === true || show_demo_credentials === 'true',
      theme: theme || 'light',
      menu_order: menu_order || ['dashboard', 'spareparts', 'transactions', 'reports', 'users', 'activity', 'settings']
    };
    
    db.run(
      `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))`,
      ['branding', JSON.stringify(settings)],
      function(err) {
        if (err) return fail(res, 'DB error', 500, err.message);
        return ok(res, { message: 'Branding updated', data: settings });
      }
    );
  } catch (error) {
    fail(res, 'Error', 500, error.message);
  }
});

module.exports = router;
