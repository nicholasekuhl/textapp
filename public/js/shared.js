// shared.js — shared utilities loaded on every page

let currentUser = null

// ─── GLOBAL ERROR BOUNDARY ───────────────────────────────────────────────────

window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason)
})

/**
 * Show a friendly error state inside a container element.
 * @param {string} containerId  - ID of the element to render the error into
 * @param {string} sectionName  - Human-readable name shown in the error message
 * @param {Function} retryFn    - Called when the user clicks Retry
 * @param {string} [message]    - Optional custom error message
 */
const showPageError = (containerId, sectionName, retryFn, message) => {
  const el = document.getElementById(containerId)
  if (!el) return
  el.innerHTML = `
    <div style="text-align:center;padding:48px 24px;color:var(--color-text-secondary);">
      <div style="font-size:32px;margin-bottom:12px;">⚠️</div>
      <div style="font-size:15px;font-weight:600;color:var(--gray-700);margin-bottom:6px;">Could not load ${sectionName}</div>
      <div style="font-size:13px;margin-bottom:20px;">${message || 'An error occurred. Check your connection and try again.'}</div>
      <button class="btn btn-secondary" onclick="(${retryFn.toString()})()">Retry</button>
    </div>
  `
}

// ─── AUTH ───────────────────────────────────────────────────────────────────

const checkAuth = async () => {
  try {
    const res = await fetch('/auth/me')
    if (res.status === 401) { window.location.href = '/login.html'; return false }
    if (res.status === 403) {
      const data = await res.json()
      if (data.error === 'tos_required') { window.location.href = '/tos-required.html'; return false }
      if (data.error === 'suspended') { window.location.href = '/suspended.html'; return false }
      window.location.href = '/login.html'
      return false
    }
    return true
  } catch {
    window.location.href = '/login.html'
    return false
  }
}

const logout = async () => {
  await fetch('/auth/logout', { method: 'POST' })
  window.location.href = '/login.html'
}

// ─── PROFILE COMPLETION CHECK ─────────────────────────────────────────────────

const checkProfileComplete = (profile) => {
  const exempt = ['/onboarding.html', '/login.html', '/invite.html']
  if (exempt.some(p => window.location.pathname.includes(p))) return
  if (!profile.profile_complete) {
    window.location.href = '/onboarding.html'
  }
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

const loadProfile = async () => {
  try {
    const res = await fetch('/auth/me')
    if (!res.ok) return
    const data = await res.json()
    const p = data.user
    currentUser = p
    checkProfileComplete(p)
    const displayName = p.agent_name || p.email || ''
    const headerName = document.getElementById('header-agent-name')
    if (headerName) headerName.textContent = displayName
    const headerAgency = document.getElementById('header-agency-name')
    if (headerAgency) headerAgency.textContent = p.agency_name || ''
    const userAvatarEl = document.getElementById('user-avatar-initials')
    if (userAvatarEl) userAvatarEl.textContent = getInitials(p.agent_name?.split(' ')[0], p.agent_name?.split(' ')[1])
    const ddName = document.getElementById('profile-dropdown-name')
    if (ddName) ddName.textContent = displayName
    const ddEmail = document.getElementById('profile-dropdown-email')
    if (ddEmail) ddEmail.textContent = p.email || ''
    const drawerName = document.getElementById('drawer-agent-name')
    if (drawerName) drawerName.textContent = displayName
    if (p.is_admin) {
      const adminLink = document.getElementById('admin-nav-link')
      if (adminLink) adminLink.style.display = 'inline-flex'
      const adminDrawerBtn = document.getElementById('drawer-btn-admin')
      if (adminDrawerBtn) adminDrawerBtn.style.display = 'flex'
      const profileAdminLink = document.getElementById('profile-admin-link')
      if (profileAdminLink) profileAdminLink.style.display = 'flex'
    }
    // Settings-page-only fields
    const agentNameEl = document.getElementById('profile-agent-name')
    if (agentNameEl) agentNameEl.value = p.agent_name || ''
    const agencyNameEl = document.getElementById('profile-agency-name')
    if (agencyNameEl) agencyNameEl.value = p.agency_name || ''
    const nicknameEl = document.getElementById('profile-agent-nickname')
    if (nicknameEl) nicknameEl.value = p.agent_nickname || ''
    const calendlyEl = document.getElementById('profile-calendly-url')
    if (calendlyEl) calendlyEl.value = p.calendly_url || ''
    const tzEl = document.getElementById('profile-timezone')
    if (tzEl) tzEl.value = p.timezone || 'America/New_York'
    const emailEl = document.getElementById('profile-email')
    if (emailEl) emailEl.value = p.email || ''
    const complianceEnabled = document.getElementById('compliance-enabled')
    if (complianceEnabled) {
      complianceEnabled.checked = p.compliance_footer_enabled !== false
      const complianceFooter = document.getElementById('compliance-footer')
      if (complianceFooter) complianceFooter.value = p.compliance_footer || ''
      if (typeof updateCompliancePreview === 'function') updateCompliancePreview()
      const note = document.getElementById('campaign-footer-note')
      if (note) note.style.display = (p.compliance_footer_enabled !== false) ? 'block' : 'none'
    }
    const personalPhone = document.getElementById('profile-personal-phone')
    if (personalPhone) personalPhone.value = p.personal_phone || ''
    const smsNotif = document.getElementById('sms-notif-enabled')
    if (smsNotif) smsNotif.checked = p.sms_notifications_enabled !== false
    const inappNotif = document.getElementById('inapp-notif-enabled')
    if (inappNotif) inappNotif.checked = p.inapp_notifications_enabled !== false
    const apptNotif = document.getElementById('appt-notif-enabled')
    if (apptNotif) apptNotif.checked = p.notify_appointment_sms !== false
    const afterHours = document.getElementById('ai-afterhours-response')
    if (afterHours) afterHours.value = p.ai_afterhours_response || 'queue'
    if (typeof loadChecklist === 'function') loadChecklist(p)
  } catch (err) { console.error('Profile load error:', err) }
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

let notifPanelOpen = false

const toggleNotifPanel = (e) => {
  e.stopPropagation()
  notifPanelOpen = !notifPanelOpen
  document.getElementById('notif-panel').style.display = notifPanelOpen ? 'block' : 'none'
  if (notifPanelOpen) loadNotifications()
}

const loadNotifications = async () => {
  try {
    const res = await fetch('/notifications')
    const data = await res.json()
    renderNotifications(data.notifications || [])
    updateNotifBadge(data.unread_count || 0)
  } catch (err) { console.error('Notifications load error:', err) }
}

const renderNotifications = (notifs) => {
  const list = document.getElementById('notif-list')
  if (!notifs.length) {
    list.innerHTML = `<div class="notif-empty"><div class="notif-empty-icon">🔔</div><p>No new notifications</p><span>Lead replies will appear here</span></div>`
    return
  }
  list.innerHTML = notifs.map(n => {
    const preview = (n.body || '').slice(0, 60) + ((n.body || '').length > 60 ? '…' : '')
    const icon = n.type === 'appointment_booked' ? '&#128197;' :
      n.type === 'hot_lead' ? '&#128293;' : '&#128172;'
    return `<div class="notif-item ${n.is_read ? 'read' : 'unread'}" onclick="handleNotifClick('${n.id}','${n.lead_id || ''}','${n.conversation_id || ''}')">
      <div class="notif-avatar">?</div>
      <div class="notif-content">
        <div class="notif-name">${icon} ${n.title}</div>
        <div class="notif-preview">${preview}</div>
        <div class="notif-time">${timeAgo(n.created_at)}</div>
      </div>
    </div>`
  }).join('')
}

const handleNotifClick = async (notifId, leadId, convId) => {
  document.getElementById('notif-panel').style.display = 'none'
  notifPanelOpen = false
  if (notifId) fetch(`/notifications/read/${notifId}`, { method: 'POST' }).catch(() => {})
  if (convId) {
    window.location.href = `/conversations.html?conv=${convId}`
  } else if (leadId) {
    window.location.href = `/conversations.html?lead=${leadId}`
  }
  loadNotifBadge()
}

const markAllNotifRead = async () => {
  await fetch('/notifications/read', { method: 'POST' }).catch(() => {})
  loadNotifications()
  updateNotifBadge(0)
}

const updateNotifBadge = (count) => {
  const badge = document.getElementById('notif-badge')
  if (!badge) return
  if (count <= 0) { badge.style.display = 'none'; return }
  badge.style.display = 'inline'
  badge.textContent = count > 9 ? '9+' : count
}

const updateConvNavBadge = (count) => {
  const convLink = document.querySelector('a[href="/conversations.html"]')
  if (!convLink) return
  let badge = convLink.querySelector('.conv-nav-badge')
  if (count <= 0) {
    if (badge) badge.remove()
    return
  }
  if (!badge) {
    badge = document.createElement('span')
    badge.className = 'conv-nav-badge'
    badge.style.cssText = 'position:absolute;top:4px;right:4px;background:#ef4444;color:white;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;padding:0 4px;display:flex;align-items:center;justify-content:center;pointer-events:none;'
    convLink.style.position = 'relative'
    convLink.appendChild(badge)
  }
  badge.textContent = count > 99 ? '99+' : count
}

const loadNotifBadge = async () => {
  if (document.hidden) return
  try {
    const res = await fetch('/notifications/unread-count')
    const data = await res.json()
    updateNotifBadge(data.count || 0)
    updateConvNavBadge(data.count || 0)
  } catch {}
}

// Close notif panel when clicking outside
document.addEventListener('click', (e) => {
  if (notifPanelOpen && !document.getElementById('notif-wrap')?.contains(e.target)) {
    const panel = document.getElementById('notif-panel')
    if (panel) panel.style.display = 'none'
    notifPanelOpen = false
  }
})

// ─── CALENDAR BADGE ──────────────────────────────────────────────────────────

const loadCalBadge = async () => {
  try {
    const res = await fetch('/appointments?upcoming=true')
    const data = await res.json()
    const badge = document.getElementById('today-appt-badge')
    if (!badge) return
    if (data.count > 0) { badge.style.display = 'inline-block' }
    else badge.style.display = 'none'
  } catch {}
}

// ─── PROFILE DROPDOWN ────────────────────────────────────────────────────────

const toggleProfileMenu = (e) => {
  e.stopPropagation()
  document.getElementById('profile-menu').classList.toggle('open')
}

const closeProfileMenu = () => {
  document.getElementById('profile-menu').classList.remove('open')
}

const goToSettings = (panel) => {
  window.location.href = '/settings.html?panel=' + panel
}

const goToSettingsNotif = () => {
  window.location.href = '/settings.html?panel=notifications'
}

document.addEventListener('click', (e) => {
  if (!document.getElementById('profile-menu')?.contains(e.target)) closeProfileMenu()
})

// ─── MOBILE NAV DRAWER ───────────────────────────────────────────────────────

const openNavDrawer = () => {
  document.getElementById('nav-drawer').classList.add('open')
  document.getElementById('nav-overlay').classList.add('open')
}

const closeNavDrawer = () => {
  document.getElementById('nav-drawer').classList.remove('open')
  document.getElementById('nav-overlay').classList.remove('open')
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNavDrawer() })

// ─── FORMATTERS ──────────────────────────────────────────────────────────────

const getInitials = (first, last) => ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || '?'

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const formatTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso), now = new Date(), diff = now - d
  if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getLocalTime = (tz) => {
  try { return new Date().toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }) } catch { return '' }
}

const fmtComm = (n) => n > 0 ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'

const timeAgo = (isoStr) => {
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  if (diff < 172800) return 'Yesterday'
  return new Date(isoStr).toLocaleDateString()
}

// ─── CLIPBOARD ───────────────────────────────────────────────────────────────

const COPY_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><rect x="9" y="2" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
const CHECK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><polyline points="20 6 9 17 4 12"/></svg>`

const copyToClipboard = async (text, btn) => {
  if (!text) return
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
      document.body.appendChild(ta); ta.select()
      if (!document.execCommand('copy')) throw new Error()
      document.body.removeChild(ta)
    }
    btn.innerHTML = CHECK_SVG
    btn.classList.add('copied')
    btn.title = 'Copied!'
    setTimeout(() => { btn.innerHTML = COPY_SVG; btn.classList.remove('copied'); btn.title = 'Copy' }, 2000)
  } catch (e) { toast.error('Could not copy', 'Please copy manually') }
}

// ─── KEYWORD CHIPS ───────────────────────────────────────────────────────────

const insertAtCursor = (textarea, value) => {
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = textarea.value.substring(0, start)
  const after = textarea.value.substring(end)
  textarea.value = before + value + after
  const newPos = start + value.length
  textarea.setSelectionRange(newPos, newPos)
  textarea.focus()
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
}

const kwChipFlash = (chip) => {
  chip.style.background = '#c7d2fe'
  chip.style.borderColor = '#818cf8'
  chip.style.color = '#4338ca'
  setTimeout(() => { chip.style.background = ''; chip.style.borderColor = ''; chip.style.color = '' }, 150)
}

const KW_CHIPS = [
  ['First Name', '[First Name]'], ['Last Name', '[Last Name]'], ['Full Name', '[Full Name]'],
  ['Phone', '[Phone]'], ['Email', '[Email]'], ['State', '[State]'],
  ['City', '[City]'], ['Zip', '[Zip]'], ['Agent Name', '[Agent Name]'],
  ['Agency Name', '[Agency Name]'], ['Calendly Link', '[Calendly Link]'],
  ['Date', '[Date]'], ['Time', '[Time]'],
]

const kwChipsRowHTML = (taExpr) => {
  const chips = KW_CHIPS.map(([label, val]) =>
    `<button type="button" class="kw-chip" onclick="kwChipFlash(this);insertAtCursor(${taExpr},'${val}')">${label}</button>`
  ).join('')
  return `<div class="kw-chips"><span class="kw-chips-label">Insert variable:</span>${chips}</div>`
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

const renderSidebar = () => {
  const root = document.getElementById('sidebar-root')
  if (!root) return
  const p = window.location.pathname
  const a = (href) => (p === href || p.endsWith(href)) ? ' active' : ''

  const SVG_LEADS = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`
  const SVG_BUCKETS = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
  const SVG_CONV = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
  const SVG_CAMP = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
  const SVG_STATS = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
  const SVG_CAL = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
  const SVG_SETTINGS = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
  const SVG_ADMIN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  const SVG_BELL = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`

  root.innerHTML = `
<div class="sidebar" id="nav-drawer">
  <div class="sidebar-logo">
    <div class="logo">
      <div class="logo-mark">
        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
          <path d="M4 10h9" stroke="rgba(255,255,255,0.25)" stroke-width="1" stroke-linecap="round"/>
          <path d="M4 7h6" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-linecap="round"/>
          <path d="M4 13h5" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-linecap="round"/>
          <path d="M11 5.5L16 10L11 14.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="logo-text"><span class="logo-velox">velox</span>o</span>
    </div>
  </div>
  <nav class="sidebar-nav">
    <a href="/leads.html" class="nav-item${a('/leads.html')}">${SVG_LEADS}<span>Leads</span></a>
    <a href="/buckets.html" class="nav-item${a('/buckets.html')}">${SVG_BUCKETS}<span>Buckets</span></a>
    <a href="/archive.html" class="nav-item${a('/archive.html')}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg><span>Archive</span></a>
    <a href="/pipeline.html" class="nav-item${a('/pipeline.html')}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><span>Pipeline</span></a>
    <a href="/conversations.html" class="nav-item${a('/conversations.html')}">${SVG_CONV}<span>Conversations</span><span class="notif-badge-inline nav-badge alert" id="notif-badge" style="display:none;"></span></a>
    <a href="/campaigns.html" class="nav-item${a('/campaigns.html')}">${SVG_CAMP}<span>Campaigns</span></a>
    <a href="/stats.html" class="nav-item${a('/stats.html')}">${SVG_STATS}<span>Stats</span></a>
    <a href="/calendar.html" class="nav-item${a('/calendar.html')}" id="nav-calendar">${SVG_CAL}<span>Calendar</span><span id="today-appt-badge" class="nav-badge alert" style="display:none;"></span></a>
    <a href="/settings.html" class="nav-item${a('/settings.html')}">${SVG_SETTINGS}<span>Settings</span></a>
    <a href="/admin.html" id="admin-nav-link" class="nav-item${a('/admin.html')}" style="display:none;">${SVG_ADMIN}<span>Admin</span></a>
  </nav>
  <div class="sidebar-footer">
    <div class="notif-wrap" id="notif-wrap" style="padding:0 8px 8px;">
      <button class="notif-btn nav-item" onclick="toggleNotifPanel(event)" title="Notifications" style="width:100%;justify-content:flex-start;position:relative;">
        ${SVG_BELL}<span>Notifications</span>
        <span class="nav-badge alert" id="notif-count-badge" style="display:none;"></span>
      </button>
      <div class="notif-panel" id="notif-panel" style="display:none;">
        <div class="notif-panel-header"><span>Notifications</span><a onclick="markAllNotifRead()">Mark all read</a></div>
        <div class="notif-list" id="notif-list"></div>
        <div class="notif-footer">Showing last 30 notifications</div>
      </div>
    </div>
    <div class="profile-menu" id="profile-menu">
      <div class="user-row" onclick="toggleProfileMenu(event)" id="profile-trigger">
        <div class="user-avatar" id="user-avatar-initials">?</div>
        <div style="min-width:0;">
          <div class="user-name" id="header-agent-name"></div>
          <div class="user-sub" id="header-agency-name"></div>
        </div>
      </div>
      <div class="profile-dropdown" id="profile-dropdown">
        <div class="profile-dropdown-header">
          <div class="profile-dropdown-name" id="profile-dropdown-name"></div>
          <div class="profile-dropdown-email" id="profile-dropdown-email"></div>
        </div>
        <button class="profile-dropdown-item" onclick="goToSettings('account'); closeProfileMenu()"><span class="profile-dropdown-icon">👤</span> Profile &amp; Settings</button>
        <a href="/admin.html" id="profile-admin-link" class="profile-dropdown-item" style="display:none;"><span class="profile-dropdown-icon">🛡️</span> Admin Panel</a>
        <div class="profile-dropdown-divider"></div>
        <button class="profile-dropdown-item danger" onclick="logout()"><span class="profile-dropdown-icon">→</span> Log out</button>
      </div>
    </div>
  </div>
</div>`
}

function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  setDarkMode(!isDark)
}

function setDarkMode(dark) {
  const html = document.documentElement
  const sw = document.getElementById('dark-mode-switch')
  const knob = document.getElementById('dark-mode-knob')
  if (dark) {
    html.setAttribute('data-theme', 'dark')
    if (sw) sw.style.background = '#6366f1'
    if (knob) knob.style.transform = 'translateX(16px)'
    localStorage.setItem('theme', 'dark')
  } else {
    html.removeAttribute('data-theme')
    if (sw) sw.style.background = 'var(--gray-300)'
    if (knob) knob.style.transform = 'translateX(0)'
    localStorage.setItem('theme', 'light')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar()
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') setDarkMode(true)
})

// ─── CONFETTI ────────────────────────────────────────────────────────────────

const fireConfetti = () => {
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899'] })
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 }, colors: ['#10b981', '#6366f1'] }), 600)
  }
}
