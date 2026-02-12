const express = require('express');
const router = express.Router();


// Mock in-memory settings
let brandingSettings = {
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
  menu_order: [
    'dashboard', 'spareparts', 'transactions', 'reports', 'users', 'settings', 'activity'
  ]
};

// GET /settings/branding
router.get('/branding', (req, res) => {
  res.json(brandingSettings);
});

// POST /settings/branding
router.post('/branding', (req, res) => {
  brandingSettings = { ...brandingSettings, ...req.body };
  res.json({ message: 'Settings updated', data: brandingSettings });
});

module.exports = router;
