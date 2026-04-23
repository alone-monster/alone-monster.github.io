// ============================================
//   admin_logout.js — Alone Monster Coding Hub
//   Auto-injects an "Admin Logout" button into the
//   topbar (.tb-btns) ONLY when an admin session
//   is active. Theme-matched (pink/violet gradient).
//
//   Usage: include AFTER auth.js on any protected page:
//     <script src="auth.js"></script>
//     <script src="admin_logout.js"></script>
// ============================================

(function () {
  function isAdminSession() {
    try { return localStorage.getItem('am_admin_session') === '1'; }
    catch (_) { return false; }
  }

  function logoutAdmin() {
    if (!confirm('Admin session se logout karna hai?')) return;
    try {
      localStorage.removeItem('am_admin_session');
      localStorage.removeItem('am_admin_since');
      sessionStorage.removeItem('__am_admin_redirect');
    } catch (_) {}
    // Firebase signOut bhi fire kardo (agar koi session ho)
    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().catch(() => {});
      }
    } catch (_) {}
    // Login page pe redirect
    window.location.href = 'login.html';
  }
  // Globally expose karo
  window.adminLogout = logoutAdmin;

  function injectStyles() {
    if (document.getElementById('am-admin-logout-style')) return;
    var s = document.createElement('style');
    s.id = 'am-admin-logout-style';
    s.textContent = [
      '.am-admin-logout{',
      '  font-family:Rajdhani,Syne,sans-serif;font-weight:700;font-size:.84rem;',
      '  letter-spacing:.8px;border:none;cursor:pointer;border-radius:6px;',
      '  height:40px;padding:0 16px;display:inline-flex;align-items:center;',
      '  gap:7px;white-space:nowrap;color:#fff;text-decoration:none;',
      '  background:linear-gradient(135deg,#f72585,#7209b7);',
      '  box-shadow:0 4px 16px rgba(247,37,133,.35);',
      '  transition:transform .15s ease, box-shadow .15s ease, opacity .15s;',
      '  position:relative;overflow:hidden;',
      '}',
      '.am-admin-logout:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(247,37,133,.5);}',
      '.am-admin-logout:active{transform:translateY(0);opacity:.9;}',
      '.am-admin-logout .am-dot{',
      '  width:8px;height:8px;border-radius:50%;background:#fff;',
      '  box-shadow:0 0 8px #fff;animation:amPulse 1.4s ease-in-out infinite;',
      '}',
      '@keyframes amPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.7);}}',
      '@media(max-width:600px){.am-admin-logout span.am-lbl{display:none;}.am-admin-logout{padding:0 12px;}}',
      '.am-admin-pill{',
      '  position:fixed;bottom:18px;right:18px;z-index:9999;',
      '  font-family:Syne,sans-serif;font-weight:700;font-size:.78rem;',
      '  padding:11px 18px;border-radius:50px;color:#fff;cursor:pointer;',
      '  background:linear-gradient(135deg,#f72585,#7209b7);border:none;',
      '  box-shadow:0 6px 24px rgba(247,37,133,.45);',
      '  display:inline-flex;align-items:center;gap:8px;',
      '}',
      '.am-admin-pill:hover{transform:translateY(-2px);}',
    ].join('');
    document.head.appendChild(s);
  }

  function buildButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'am-admin-logout';
    btn.id = 'amAdminLogoutBtn';
    btn.title = 'Logout from Admin Mode';
    btn.innerHTML = '<span class="am-dot"></span><i class="fas fa-user-shield"></i> <span class="am-lbl">Admin Logout</span>';
    btn.addEventListener('click', logoutAdmin);
    return btn;
  }

  function buildFloatingPill() {
    var p = document.createElement('button');
    p.type = 'button';
    p.className = 'am-admin-pill';
    p.id = 'amAdminLogoutPill';
    p.title = 'Logout from Admin Mode';
    p.innerHTML = '<span class="am-dot"></span> 🔐 Admin Logout';
    p.addEventListener('click', logoutAdmin);
    return p;
  }

  function inject() {
    if (!isAdminSession()) return;
    if (document.getElementById('amAdminLogoutBtn') ||
        document.getElementById('amAdminLogoutPill')) return;

    injectStyles();

    // Try to put it inside the existing topbar buttons row first
    var host = document.querySelector('.tb-btns');
    if (host) {
      host.appendChild(buildButton());
    } else {
      // No topbar found → floating pill in bottom-right
      document.body.appendChild(buildFloatingPill());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
  // Re-check after a beat in case the topbar is rendered late
  setTimeout(inject, 600);
})();
