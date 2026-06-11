// =====================================================
// API CLIENT — отправляет запросы к Apps Script
// =====================================================

async function apiCall(action, params = {}) {
  const url = CONFIG.API_URL;
  try {
    const res = await fetch(url, {
      method: 'POST',
      // Apps Script требует text/plain для POST чтобы избежать preflight
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...params }),
      redirect: 'follow',
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// =====================================================
// AUTH — сессия через sessionStorage
// =====================================================

const Auth = {
  key: 'diskurs_user',

  save(user) {
    sessionStorage.setItem(this.key, JSON.stringify(user));
  },

  get() {
    try {
      return JSON.parse(sessionStorage.getItem(this.key));
    } catch (_) { return null; }
  },

  clear() {
    sessionStorage.removeItem(this.key);
  },

  // Редирект на логин если нет сессии
  require() {
    const u = this.get();
    if (!u) {
      window.location.href = '/diskurs-app/index.html';
      return null;
    }
    return u;
  }
};

// =====================================================
// УТИЛИТЫ
// =====================================================

function fmtDateRu(dateStr) {
  // dateStr: "DD.MM.YYYY"
  if (!dateStr) return '';
  const [d, m, y] = dateStr.split('.');
  const date = new Date(+y, +m - 1, +d);
  const days   = ['вс','пн','вт','ср','чт','пт','сб'];
  const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${y}`;
}

function isExpired(dateStr) {
  if (!dateStr) return false;
  const [d, m, y] = dateStr.split('.');
  const rDate = new Date(+y, +m - 1, +d);
  const next = new Date(rDate);
  next.setMonth(next.getMonth() + 1);
  return new Date() >= next;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function showToast(msg, type = '') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast visible ' + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('visible'), 2500);
}

function setBtnLoading(btn, text) {
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>${text}`;
}

function resetBtn(btn, text) {
  btn.disabled = false;
  btn.textContent = text;
}
