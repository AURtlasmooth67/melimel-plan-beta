/**
 * MELiMEL FRUITY♡ - 1248×1248 Planner Image Generator (Standalone Engine)
 * Pure Vanilla JavaScript (Zero external dependencies)
 */

// 1. Data Storage & Core Helper Functions
const Storage = {
  get(key) {
    if (key === 'customTemplates') {
      try {
        return JSON.parse(localStorage.getItem('pie.custom') || '[]');
      } catch (e) { return []; }
    }
    if (key === 'songs') {
      try {
        const saved = localStorage.getItem('melimel_songs');
        if (saved) return JSON.parse(saved);
      } catch(e) {}
      return [
        { id: 'song-1', title: 'แวมไพร์ (Vampire) - Cover Solo', status: 'done', channel: 'rakku' },
        { id: 'song-2', title: 'Sugar Rush Ride - Dance Cover', status: 'done', channel: 'mamuang' },
        { id: 'song-3', title: 'ไอดอล (Idol) - Group Special', status: 'done', channel: 'makham' },
        { id: 'song-4', title: 'First Love - Acoustic Ver.', status: 'recording', channel: 'kala' }
      ];
    }
    if (key === 'tpl') {
      try {
        const saved = localStorage.getItem('melimel_tpl');
        if (saved) return JSON.parse(saved);
      } catch(e) {}
      return {
        rakku: defaultTemplate('rakku'),
        mamuang: defaultTemplate('mamuang'),
        makham: defaultTemplate('makham'),
        kala: defaultTemplate('kala')
      };
    }
    if (key === 'people') {
      try {
        const saved = localStorage.getItem('melimel_people');
        if (saved) return JSON.parse(saved);
      } catch(e) {}
      return [
        { id: 'rakku', name: 'ลักข์ (ปูเป้)', color: '#ff5c9a' },
        { id: 'mamuang', name: 'มะม่วง', color: '#8b5cf6' },
        { id: 'makham', name: 'มะขาม', color: '#f59e0b' },
        { id: 'kala', name: 'กะลา', color: '#0ea5e9' }
      ];
    }
    return null;
  },
  set(key, val) {
    if (key === 'customTemplates') {
      try {
        localStorage.setItem('pie.custom', JSON.stringify(val));
      } catch (e) {}
    } else {
      try {
        localStorage.setItem('melimel_' + key, JSON.stringify(val));
      } catch (e) {}
    }
  }
};

function getPeople() {
  return Storage.get('people') || [];
}

function getPersonColor(id) {
  const people = getPeople();
  const p = people.find(x => x.id === id || x.name === id);
  return p ? p.color : '#ff5c8a';
}

function isDoneStatus(st) {
  return st === 'done' || st === 'เสร็จแล้ว';
}

function defaultTemplate(ch) {
  return {
    Mon: { type: 'คลิปหลัก 18:00', idea: 'Cover / MV หรือวิดีโอใหญ่' },
    Tue: { type: 'Shorts/Meme 12:00', idea: 'คลิปสั้น, ไฮไลต์, มีม' },
    Wed: { type: 'คลิปเพลง 19:00', idea: 'Cover หรือเพลงคู่' },
    Thu: { type: 'Gaming / Stream 20:00', idea: 'เกมมิ่ง หรือชาเลนจ์' },
    Fri: { type: 'คลิปพิเศษ 18:30', idea: 'Collab / โปรเจกต์พิเศษ' },
    Sat: { type: 'โมเมนต์น่ารัก 11:00', idea: 'ไฮไลต์สตรีม หรือโมเมนต์' },
    Sun: { type: 'Community 17:00', idea: 'พูดคุย, Q&A, ขอบคุณแฟนคลับ' }
  };
}

function getMyName() {
  return 'แอดมิน';
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg, type = '') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px)';
    setTimeout(() => t.remove(), 300);
  }, 2600);
}

let currentPage = 'image-editor';

const PIE_S = 1248;
const PIE_FONTS = ['Noto Sans Thai', 'Sarabun', 'IBM Plex Sans Thai', 'Mali', 'Pridi'];
const PIE_MS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const PIE_MF = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const PIE_DF = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const PIE_DS = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
const PIE_DE = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const PIE_KL = { dayname: 'ชื่อวัน', date: 'วันที่', body: 'งาน', range: 'ช่วงสัปดาห์' };

const pieP2 = n => String(n).padStart(2, '0');
const pieIso = d => `${d.getFullYear()}-${pieP2(d.getMonth() + 1)}-${pieP2(d.getDate())}`;
const pieParse = v => { const [a, b, c] = v.split('-').map(Number); return new Date(a, b - 1, c); };
const pieAddD = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
function pieMonday(d) { const x = pieAddD(d, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }

let pieUid = 0;
const pieNid = () => 'f' + Date.now().toString(36) + (pieUid++);

// Theme Presets
const PIE_THEMES = [
  { 
    id: 'charcoal', 
    name: 'Charcoal Minimal', 
    bg: '#ffffff', 
    card: '#5c5f66', 
    photoBg: '#5c5f66', 
    note: '#4b4e56', 
    badge: '#3b3d44', 
    title: '#374151', 
    range: '#6b7280', 
    head: '#ffffff', 
    acc: '#cbd5e1', 
    ink: '#f3f4f6' 
  },
  { 
    id: 'dark', 
    name: 'Night Neon', 
    bg: '#0d1117', 
    card: '#161b22', 
    photoBg: '#161b22', 
    note: '#21262d', 
    badge: '#30363d', 
    title: '#58a6ff', 
    range: '#8b949e', 
    head: '#58a6ff', 
    acc: '#bc8cff', 
    ink: '#e6edf3' 
  },
  { 
    id: 'pink', 
    name: 'Peach & Rose', 
    bg: '#fff1f2', 
    card: '#ffe4e6', 
    photoBg: '#ffe4e6', 
    note: '#fecdd3', 
    badge: '#fda4af', 
    title: '#9f1239', 
    range: '#be123c', 
    head: '#881337', 
    acc: '#e11d48', 
    ink: '#4c0519' 
  },
  { 
    id: 'cyan', 
    name: 'Ocean Cyan', 
    bg: '#ecfeff', 
    card: '#cffafe', 
    photoBg: '#cffafe', 
    note: '#a5f3fc', 
    badge: '#67e8f9', 
    title: '#155e75', 
    range: '#0e7490', 
    head: '#164e63', 
    acc: '#0891b2', 
    ink: '#083344' 
  },
  { 
    id: 'purple', 
    name: 'Lavender Violet', 
    bg: '#faf5ff', 
    card: '#f3e8ff', 
    photoBg: '#f3e8ff', 
    note: '#e9d5ff', 
    badge: '#d8b4fe', 
    title: '#6b21a8', 
    range: '#7e22ce', 
    head: '#581c87', 
    acc: '#9333ea', 
    ink: '#3b0764' 
  },
  { 
    id: 'mint', 
    name: 'Matcha Mint', 
    bg: '#f0fdf4', 
    card: '#dcfce7', 
    photoBg: '#dcfce7', 
    note: '#bbf7d0', 
    badge: '#86efac', 
    title: '#166534', 
    range: '#15803d', 
    head: '#14532d', 
    acc: '#16a34a', 
    ink: '#052e16' 
  },
  { 
    id: 'warm', 
    name: 'Sunset Amber', 
    bg: '#fffbeb', 
    card: '#fef3c7', 
    photoBg: '#fef3c7', 
    note: '#fde68a', 
    badge: '#fcd34d', 
    title: '#92400e', 
    range: '#b45309', 
    head: '#78350f', 
    acc: '#d97706', 
    ink: '#451a03' 
  }
];

// Built-in Templates
const PIE_PAL = [
  { 
    id: 'split-duo', 
    name: 'Split Duo (ตารางงาน + รูปภาพ)', 
    layout: 'split',
    bg: '#ffffff', 
    card: '#5c5f66', 
    photoBg: '#5c5f66',
    note: '#4b4e56',
    badge: '#3b3d44',
    title: '#374151',
    range: '#6b7280',
    head: '#ffffff', 
    acc: '#cbd5e1', 
    ink: '#f3f4f6'
  },
  { 
    id: 'night', 
    name: 'Night List (รายการเต็มหน้า)', 
    layout: 'list',
    bg: '#1b1f2e', 
    card: '#2a3045', 
    photoBg: '#2a3045',
    note: '#3a4260',
    badge: '#2a3045',
    title: '#f3f4fa',
    range: '#8fa8ff',
    head: '#f3f4fa', 
    acc: '#8fa8ff', 
    ink: '#e8eaf5'
  }
];

function pieRrPath(x, a, b, w, h, r) {
  r = Math.max(0, Math.min(r || 0, w / 2, h / 2));
  x.beginPath();
  x.moveTo(a + r, b);
  x.arcTo(a + w, b, a + w, b + h, r);
  x.arcTo(a + w, b + h, a, b + h, r);
  x.arcTo(a, b + h, a, b, r);
  x.arcTo(a, b, a + w, b, r);
  x.closePath();
}

function pieRr(x, a, b, w, h, r, fill) {
  pieRrPath(x, a, b, w, h, r);
  x.fillStyle = fill;
  x.fill();
}

const pieFD = (kind, day, x, y, w, h, size, color, align, weight) => ({
  id: pieNid(), kind, day, x, y, w, h, size, color, align: align || 'left', weight: weight || '400', font: PIE_FONTS[0]
});

function pieMakeBuiltin(p) {
  const c = document.createElement('canvas'); c.width = c.height = PIE_S; const x = c.getContext('2d');
  const bg = p.bg || '#ffffff';
  const card = p.card || '#5c5f66';
  const photoBg = p.photoBg || p.card || '#5c5f66';
  const note = p.note || '#4b4e56';
  const badge = p.badge || p.card || '#5c5f66';
  const title = p.title || p.card || '#5c5f66';
  const range = p.range || p.acc || p.card || '#5c5f66';
  const head = p.head || '#ffffff';
  const acc = p.acc || '#cbd5e1';
  const ink = p.ink || '#f3f4f6';

  x.fillStyle = bg; x.fillRect(0, 0, PIE_S, PIE_S);

  if (p.layout === 'split') {
    // Left Schedule Box (ตารางงาน)
    pieRr(x, 48, 120, 560, 1070, 24, card);
    
    // Top Title
    x.fillStyle = title;
    x.font = `700 46px "${PIE_FONTS[0]}",sans-serif`;
    x.textBaseline = 'top';
    x.textAlign = 'left';
    x.fillText('ตารางงานประจำสัปดาห์', 48, 44);
    
    // Right Photo Box (รูปภาพ)
    pieRr(x, 640, 120, 560, 1070, 24, photoBg);
    
    const fields = [
      pieFD('range', null, 48, 92, 560, 28, 20, range, 'left', '600')
    ];
    
    const rowH = (1070 - 36 - 6 * 10) / 7; // ~138px
    for (let i = 0; i < 7; i++) {
      const cy = 138 + i * (rowH + 10);
      pieRr(x, 64, cy, 528, rowH, 16, note);
      pieRr(x, 76, cy + 12, 120, rowH - 24, 12, badge);
      
      fields.push(
        pieFD('dayname', i, 76, cy + 20, 120, 32, 26, head, 'center', '700'),
        pieFD('date', i, 76, cy + 68, 120, 28, 20, acc, 'center', '600'),
        pieFD('body', i, 208, cy + 14, 372, rowH - 28, 22, ink, 'left', '400')
      );
    }
    
    const photo = p.photo ? JSON.parse(JSON.stringify(p.photo)) : {
      x: 640, y: 120, w: 560, h: 1070, r: 24,
      rotate: 0, scale: 1.0, offsetX: 0, offsetY: 0, img: null
    };
    
    return {
      id: p.id,
      name: p.name,
      layout: 'split',
      builtin: p.builtin ?? false,
      theme: { bg, card, photoBg, note, badge, title, range, head, acc, ink },
      photo,
      bg: c.toDataURL('image/jpeg', .92),
      fields
    };
  } else {
    // Night List
    x.fillStyle = head; x.font = `700 76px "${PIE_FONTS[0]}",sans-serif`; x.textBaseline = 'top'; x.fillText('Weekly Planner', 48, 56);
    x.fillStyle = acc; x.fillRect(48, 160, 120, 8);
    const fields = [pieFD('range', null, 560, 76, 640, 60, 38, range, 'right', '600')];
    const h = (1000 - 72) / 7;
    for (let i = 0; i < 7; i++) {
      const cy = 200 + i * (h + 12);
      pieRr(x, 48, cy, PIE_S - 96, h, 20, card); pieRr(x, 48, cy, 200, h, 20, note);
      fields.push(
        pieFD('dayname', i, 64, cy + 22, 168, 50, 32, head, 'center', '700'),
        pieFD('date', i, 64, cy + 76, 168, 38, 24, acc, 'center', '600'),
        pieFD('body', i, 278, cy + 14, PIE_S - 96 - 250, h - 28, 26, ink, 'left', '400')
      );
    }
    return {
      id: p.id,
      name: p.name,
      layout: 'list',
      builtin: p.builtin ?? false,
      theme: { bg, card, photoBg, note, badge, title, range, head, acc, ink },
      photo: null,
      bg: c.toDataURL('image/jpeg', .92),
      fields
    };
  }
}

let pieBuiltins = [];
let pieCustom = [];
function pieAllTemplates() { return [...pieBuiltins, ...pieCustom]; }

function pieLoadStorage() {
  try {
    const cloudTpls = Storage.get('customTemplates') || [];
    let localTpls = [];
    try {
      localTpls = JSON.parse(localStorage.getItem('pie.custom') || '[]');
    } catch(e){}

    const map = new Map();
    cloudTpls.forEach(t => map.set(t.id, t));
    localTpls.forEach(t => {
      if (!map.has(t.id)) map.set(t.id, t);
    });
    pieCustom = Array.from(map.values());
  } catch(e) {
    console.warn('pieLoadStorage error:', e);
    pieCustom = [];
  }
}

function piePersist() {
  try {
    Storage.set('customTemplates', pieCustom);
    try {
      localStorage.setItem('pie.custom', JSON.stringify(pieCustom));
    } catch(err){}
    return true;
  } catch(e) {
    showToast('บันทึก Template ไม่สำเร็จ: ' + e.message, 'error');
    return false;
  }
}

// Rendering & Word Wrapping
const pieImgCache = {};
function pieLoadImg(src) {
  if (!src) return Promise.resolve(null);
  return pieImgCache[src] || (pieImgCache[src] = new Promise(r => {
    const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src;
  }));
}

const pieSeg = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter('th', { granularity: 'word' }) : null;
function pieWrap(x, text, w) {
  const out = [];
  for (const p of String(text).split('\n')) {
    const parts = pieSeg ? [...pieSeg.segment(p)].map(s => s.segment) : [...p];
    let line = '';
    for (const s of parts) {
      const t = line + s;
      if (line && x.measureText(t).width > w) {
        out.push(line.trimEnd()); line = s.trimStart();
      } else line = t;
    }
    out.push(line.trimEnd());
  }
  return out;
}

function pieDrawText(x, f, text) {
  if (!text) return;
  x.save(); x.beginPath(); x.rect(f.x - 4, f.y - 12, f.w + 8, f.h + 24); x.clip();
  let sz = f.size, lines;
  for (;;) {
    x.font = `${f.weight} ${sz}px "${f.font || PIE_FONTS[0]}",sans-serif`;
    lines = pieWrap(x, text, f.w);
    if (lines.length * sz * 1.35 <= f.h || sz <= 10) break;
    sz--;
  }
  x.fillStyle = f.color; x.textBaseline = 'top'; x.textAlign = f.align;
  const px = f.align === 'center' ? f.x + f.w / 2 : f.align === 'right' ? f.x + f.w : f.x;
  lines.forEach((l, i) => x.fillText(l, px, f.y + i * sz * 1.35));
  x.restore();
}

const pieFieldText = (f, d) => {
  if (!d) return '';
  if (f.kind === 'range') return d.range || '';
  const day = d.days && d.days[f.day];
  if (!day) return '';
  if (f.kind === 'dayname') return day.dayname || day.name || '';
  return day[f.kind] || '';
};

async function pieRender(cv, t, data, after) {
  if (!cv || !t) return;
  if (cv.width !== PIE_S) cv.width = cv.height = PIE_S;
  const x = cv.getContext('2d');
  x.fillStyle = (t.theme && t.theme.bg) || '#ffffff';
  x.fillRect(0, 0, PIE_S, PIE_S);
  
  const im = await pieLoadImg(t.bg);
  if (im) x.drawImage(im, 0, 0, PIE_S, PIE_S);

  // Draw Photo Frame & Artwork if present
  if (t.photo) {
    const ph = t.photo;
    x.save();
    pieRrPath(x, ph.x, ph.y, ph.w, ph.h, ph.r || 0);
    x.clip();
    
    // Background fill of photo box
    x.fillStyle = (t.theme && t.theme.photoBg) || (t.theme && t.theme.card) || '#5c5f66';
    x.fillRect(ph.x, ph.y, ph.w, ph.h);
    
    if (ph.img) {
      const pImg = await pieLoadImg(ph.img);
      if (pImg) {
        x.save();
        const cx = ph.x + ph.w / 2 + (ph.offsetX || 0);
        const cy = ph.y + ph.h / 2 + (ph.offsetY || 0);
        x.translate(cx, cy);
        x.rotate(((ph.rotate || 0) * Math.PI) / 180);
        const scale = ph.scale || 1.0;
        x.scale(scale, scale);
        
        // Calculate aspect ratio fill
        const aspect = pImg.width / pImg.height;
        const boxAspect = ph.w / ph.h;
        let dw, dh;
        if (aspect > boxAspect) {
          dh = ph.h;
          dw = ph.h * aspect;
        } else {
          dw = ph.w;
          dh = ph.w / aspect;
        }
        x.drawImage(pImg, -dw / 2, -dh / 2, dw, dh);
        x.restore();
      }
    } else {
      // Photo Placeholder with Camera Icon & Thai Guide
      x.fillStyle = 'rgba(255,255,255,0.08)';
      x.fillRect(ph.x, ph.y, ph.w, ph.h);
      x.fillStyle = (t.theme && t.theme.head) || '#ffffff';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.font = '64px sans-serif';
      x.fillText('📷', ph.x + ph.w / 2, ph.y + ph.h / 2 - 40);
      x.font = `700 28px "${PIE_FONTS[0]}",sans-serif`;
      x.fillText('พื้นที่ใส่รูปภาพ / อาร์ตเวิร์ก', ph.x + ph.w / 2, ph.y + ph.h / 2 + 30);
      x.font = `20px "${PIE_FONTS[0]}",sans-serif`;
      x.fillStyle = 'rgba(255,255,255,0.7)';
      x.fillText('(เลือกรูป, หมุน rotate, ซูม หรือเลื่อนตำแหน่งได้)', ph.x + ph.w / 2, ph.y + ph.h / 2 + 70);
    }
    x.restore();
    
    // Sleek border around photo box
    x.save();
    x.strokeStyle = 'rgba(255,255,255,0.12)';
    x.lineWidth = 2;
    pieRrPath(x, ph.x, ph.y, ph.w, ph.h, ph.r || 0);
    x.stroke();
    x.restore();
  }

  // Text fields
  for (const f of (t.fields || [])) {
    pieDrawText(x, f, pieFieldText(f, data));
  }
  
  if (after) after(x);
}

function pieFmtDate(d, f, be) {
  const y = d.getFullYear() + (be ? 543 : 0), n = d.getDate();
  return f === 'dm' ? `${n} ${PIE_MS[d.getMonth()]}` : f === 'dM' ? `${n} ${PIE_MF[d.getMonth()]}` : f === 'num' ? `${pieP2(n)}/${pieP2(d.getMonth() + 1)}/${y}` : `${n} ${PIE_MF[d.getMonth()]} ${y}`;
}

function pieWeekData(start, o, bodies) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = pieAddD(start, i);
    const dayStr = (o.nfmt === 'full' ? PIE_DF : o.nfmt === 'short' ? PIE_DS : PIE_DE)[d.getDay()];
    days.push({ name: dayStr, dayname: dayStr, date: pieFmtDate(d, o.dfmt, o.be), body: (bodies || [])[i] || '' });
  }
  const a = start, b = pieAddD(start, 6);
  const ya = a.getFullYear() + (o.be ? 543 : 0), yb = b.getFullYear() + (o.be ? 543 : 0);
  let range;
  if (ya !== yb) range = `${a.getDate()} ${PIE_MS[a.getMonth()]} ${ya} – ${b.getDate()} ${PIE_MS[b.getMonth()]} ${yb}`;
  else if (a.getMonth() === b.getMonth()) range = `${a.getDate()} – ${b.getDate()} ${PIE_MS[b.getMonth()]} ${yb}`;
  else range = `${a.getDate()} ${PIE_MS[a.getMonth()]} – ${b.getDate()} ${PIE_MS[b.getMonth()]} ${yb}`;
  return { days, range };
}

const pieDefOpt = { dfmt: 'dm', nfmt: 'full', be: true };

// Navigation inside Planner Image Editor
let pieNavHistory = [{ view: 'gallery', crumb: '', data: null }];
let pieNavIdx = 0;
let pieCur = null;
let pieEd = null;
let pieInitialEdState = null;

function pieUpdateNavButtons() {
  const bBack = document.getElementById('pieNavBackBtn'), bFwd = document.getElementById('pieNavFwdBtn');
  if (bBack) bBack.disabled = (pieNavIdx <= 0);
  if (bFwd) bFwd.disabled = (pieNavIdx >= pieNavHistory.length - 1);
}

function pieNavGo(v, crumb, push = true, data = null) {
  ['gallery', 'fill', 'editor'].forEach(n => {
    const el = document.getElementById('pie-v-' + n);
    if (el) {
      if (n === v) {
        el.classList.remove('hide');
        el.style.display = 'block';
      } else {
        el.classList.add('hide');
        el.style.display = 'none';
      }
    }
  });
  const cEl = document.getElementById('pieCrumb');
  if (cEl) {
    cEl.innerHTML = crumb ? `<span style="opacity:0.6"> / </span><span style="font-weight:700">${crumb}</span>` : '';
  }
  if (push) {
    pieNavHistory = pieNavHistory.slice(0, pieNavIdx + 1);
    pieNavHistory.push({ view: v, crumb: crumb || '', data: data || (v === 'fill' ? pieCur : v === 'editor' ? pieEd : null) });
    pieNavIdx++;
  }
  pieUpdateNavButtons();
}

function pieNavBack() {
  if (pieNavIdx > 0) {
    pieNavIdx--;
    const step = pieNavHistory[pieNavIdx];
    pieApplyNavStep(step);
  }
}

function pieNavForward() {
  if (pieNavIdx < pieNavHistory.length - 1) {
    pieNavIdx++;
    const step = pieNavHistory[pieNavIdx];
    pieApplyNavStep(step);
  }
}

function pieApplyNavStep(step) {
  if (!step) return;
  if (step.view === 'gallery') {
    pieBuildGallery();
    pieNavGo('gallery', '', false);
  } else if (step.view === 'fill') {
    if (step.data) pieOpenFill(step.data, false);
    else { pieBuildGallery(); pieNavGo('gallery', '', false); }
  } else if (step.view === 'editor') {
    if (step.data) pieOpenEditor(step.data, !step.data.builtin, false);
    else { pieBuildGallery(); pieNavGo('gallery', '', false); }
  }
  pieUpdateNavButtons();
}

const pieGo = (v, crumb, data = null) => pieNavGo(v, crumb, true, data);

// Gallery Builder
function pieBuildGallery() {
  const g = document.getElementById('pie-gal');
  if (!g) return;
  g.innerHTML = '';
  const sd = pieWeekData(pieMonday(new Date()), pieDefOpt, ['ตารางงาน 1\nประชุมทีม', 'ตารางงาน 2', 'ตารางงาน 3', '', 'ตารางงาน 5', 'ตารางงาน 6', 'พักผ่อน']);
  
  for (const t of pieAllTemplates()) {
    const c = document.createElement('div'); c.className = 'pie-card';
    const cv = document.createElement('canvas'); cv.width = cv.height = PIE_S;
    c.appendChild(cv);
    const inn = document.createElement('div'); inn.className = 'in';
    const nm = document.createElement('div'); nm.className = 'nm';
    
    let tagHtml = '';
    if (t.builtin) {
      tagHtml = `<span style="font-size:11px;font-weight:600;padding:2px 6px;border-radius:10px;background:var(--bg3);color:var(--text3);margin-left:6px;vertical-align:middle;">ระบบ</span>`;
    } else {
      const myName = (typeof getMyName === 'function' ? getMyName() : '') || 'ราคุ';
      const isMine = t.author && (t.author === myName);
      const authorLabel = t.author ? (isMine ? 'ของฉัน' : `โดย ${t.author}`) : 'แชร์ในทีม';
      const tagBg = isMine ? 'rgba(255,92,154,0.15)' : 'rgba(20,184,166,0.15)';
      const tagColor = isMine ? 'var(--accent)' : 'var(--main-ch)';
      tagHtml = `<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;background:${tagBg};color:${tagColor};margin-left:6px;vertical-align:middle;">✨ ${esc(authorLabel)}</span>`;
    }
    nm.innerHTML = `<span>${esc(t.name)}</span>${tagHtml}`;

    const r = document.createElement('div');
    r.style.display = 'flex'; r.style.gap = '6px'; r.style.flexWrap = 'wrap';
    inn.append(nm, r);
    
    const btnUse = document.createElement('button'); btnUse.className = 'btn btn-primary btn-sm'; btnUse.textContent = 'ใช้ Template นี้';
    btnUse.onclick = () => pieOpenFill(t);
    
    const btnDup = document.createElement('button'); btnDup.className = 'btn btn-secondary btn-sm'; btnDup.textContent = '📑 ทำสำเนา';
    btnDup.title = 'ทำสำเนา Template นี้เพื่อนำไปแต่งสี/ใส่รูปแยก';
    btnDup.onclick = () => pieDuplicateTemplate(t, true);

    const btnEdit = document.createElement('button'); btnEdit.className = 'btn btn-secondary btn-sm'; btnEdit.textContent = '✏️ แก้ไข';
    btnEdit.onclick = () => pieOpenEditor(t, !t.builtin);
    
    r.append(btnUse, btnDup, btnEdit);
    if (!t.builtin) {
      const btnDel = document.createElement('button'); btnDel.className = 'btn btn-secondary btn-sm'; btnDel.style.color = 'var(--danger)'; btnDel.textContent = 'ลบ';
      btnDel.onclick = () => {
        if (confirm('ต้องการลบ Template "' + t.name + '" ออกจากทีมใช่หรือไม่?')) {
          pieCustom = pieCustom.filter(z => z.id !== t.id);
          piePersist();
          pieBuildGallery();
        }
      };
      r.append(btnDel);
    }
    c.appendChild(inn); g.appendChild(c);
    pieRender(cv, t, sd);
  }

  // Create new template card
  const n = document.createElement('div'); n.className = 'pie-card new';
  n.innerHTML = '<b style="color:var(--text);font-size:var(--fs-md)">✨ สร้าง Template จากรูปของคุณ</b><span style="font-size:var(--fs-sm)">เลือกรูปหรือวางรูป (Ctrl+V) ระบบจะหาช่องตารางให้อัตโนมัติ</span>';
  const fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.style.display = 'none';
  fi.onchange = () => {
    if (fi.files[0]) {
      pieOpenEditor({ name: 'Template ใหม่', bg: '', fields: [] }, false);
      pieLoadBgFile(fi.files[0]);
    }
  };
  const bChoose = document.createElement('button'); bChoose.className = 'btn btn-primary btn-sm'; bChoose.textContent = '📁 เลือกรูป';
  bChoose.onclick = () => fi.click();
  const bBlank = document.createElement('button'); bBlank.className = 'btn btn-secondary btn-sm'; bBlank.textContent = 'เริ่มจากว่างเปล่า';
  bBlank.onclick = () => pieOpenEditor({ name: 'Template ใหม่', bg: '', fields: [] }, false);
  n.append(fi, bChoose, bBlank);
  g.appendChild(n);
}

// Fill View Logic & Sync with Weekly Outline
let _lastActivePieTextarea = null;

function pieRenderReadySongs() {
  const container = document.getElementById('pie-ready-chips');
  const countEl = document.getElementById('pie-ready-count');
  if (!container) return;
  const songs = (Storage.get('songs') || []).filter(s => isDoneStatus(s.status) || s.status === 'done');
  if (countEl) countEl.textContent = `${songs.length} คลิป`;
  if (!songs.length) {
    container.innerHTML = '<span style="font-size:11px;color:var(--text3);">ยังไม่มีคลิปสถานะพร้อมลง/เสร็จ (เปลี่ยนสถานะได้ในหน้าการบ้าน)</span>';
    return;
  }
  container.innerHTML = songs.map(s => {
    const col = getPersonColor(s.channel);
    const escapedTitle = esc(s.title).replace(/'/g, "\\'");
    return `<button type="button" class="chip" style="font-size:11px;padding:3px 8px;background:${col}22;color:${col};border:1px solid ${col}66;" onclick="pieInsertReadySong('${escapedTitle}')">
      ✨ ${esc(s.title)}
    </button>`;
  }).join('');
}

function pieInsertReadySong(title) {
  let target = _lastActivePieTextarea;
  if (!target || !document.contains(target)) {
    for (let i = 0; i < 7; i++) {
      const ta = document.getElementById('pie-b' + i);
      if (ta && !ta.value.trim()) { target = ta; break; }
    }
    if (!target) target = document.getElementById('pie-b0');
  }
  if (target) {
    target.value = target.value ? target.value + '\n' + title : title;
    target.focus();
    if (typeof pieDrawFill === 'function') pieDrawFill();
    showToast(`✨ เพิ่ม "${title}" ลงในตารางปล่อยคลิปแล้ว`);
  }
}

function pieOpenFill(t, push = true) {
  pieCur = JSON.parse(JSON.stringify(t));
  const fnameEl = document.getElementById('pie-fname');
  if (fnameEl) fnameEl.textContent = pieCur.name;
  const startEl = document.getElementById('pie-start');
  if (startEl && !startEl.value) startEl.value = pieIso(pieMonday(new Date()));

  pieRenderMemberChips();
  pieRenderReadySongs();
  pieRenderThemePalettes();
  pieUpdatePhotoControls();

  const box = document.getElementById('pie-days');
  if (box) {
    box.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const d = document.createElement('div'); d.className = 'pie-dayrow';
      d.innerHTML = `<label for="pie-b${i}"><span>วันที่ ${i+1}</span><span class="note" style="font-size:var(--fs-xs);color:var(--text3)"></span></label><textarea id="pie-b${i}" placeholder="กรอกงาน/คลิปของวันนี้..." style="width:100%;min-height:56px;padding:8px 10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3);color:var(--text)"></textarea>`;
      box.appendChild(d);
      const ta = d.querySelector('textarea');
      ta.oninput = pieDrawFill;
      ta.onfocus = (e) => { _lastActivePieTextarea = e.target; };
    }
  }

  if (push) pieGo('fill', pieCur.name, pieCur);
  else pieNavGo('fill', pieCur.name, false, pieCur);
  pieDrawFill();
}

function pieRenderThemePalettes() {
  const container = document.getElementById('pie-theme-palette');
  if (!container || !pieCur) return;
  const curTh = pieCur.theme || {};
  container.innerHTML = PIE_THEMES.map(th => {
    const isActive = (curTh.card === th.card && curTh.bg === th.bg);
    return `<button type="button" class="pie-theme-chip ${isActive ? 'active' : ''}" onclick="pieApplyThemePreset('${th.id}')">
      <span class="pie-theme-dot" style="background:${th.card}"></span>
      <span>${th.name}</span>
    </button>`;
  }).join('');

  // Sync all granular color inputs without disrupting currently focused input
  const syncInp = (id, val) => {
    const el = document.getElementById(id);
    if (el && val && document.activeElement !== el) {
      el.value = val;
    }
  };
  syncInp('pie-col-bg', curTh.bg);
  syncInp('pie-col-card', curTh.card);
  syncInp('pie-col-photoBg', curTh.photoBg || curTh.card);
  syncInp('pie-col-note', curTh.note);
  syncInp('pie-col-badge', curTh.badge || curTh.card);
  syncInp('pie-col-title', curTh.title || curTh.card);
  syncInp('pie-col-range', curTh.range || curTh.acc || curTh.card);
  syncInp('pie-col-head', curTh.head);
  syncInp('pie-col-acc', curTh.acc);
  syncInp('pie-col-ink', curTh.ink);
}

function pieApplyThemePreset(themeId) {
  const th = PIE_THEMES.find(z => z.id === themeId);
  if (!th || !pieCur) return;
  pieCur.theme = { ...th };
  pieRebuildTemplateTheme();
  showToast(`เปลี่ยนธีมเป็น "${th.name}" แล้ว 🎨`);
}

function pieRebuildTemplateTheme() {
  if (!pieCur) return;
  if (!pieCur.theme) {
    const defTh = PIE_THEMES.find(th => th.id === (pieCur.id === 'night' ? 'dark' : 'charcoal')) || PIE_THEMES[0];
    pieCur.theme = { ...defTh };
  }
  const th = pieCur.theme;
  if (pieCur.layout === 'split' || pieCur.layout === 'list') {
    const fresh = pieMakeBuiltin({
      id: pieCur.id,
      name: pieCur.name,
      layout: pieCur.layout,
      builtin: pieCur.builtin,
      bg: th.bg,
      card: th.card,
      photoBg: th.photoBg || th.card,
      note: th.note,
      badge: th.badge || th.card,
      title: th.title || th.card,
      range: th.range || '#6b7280',
      head: th.head || '#ffffff',
      acc: th.acc || '#cbd5e1',
      ink: th.ink || '#f3f4f6',
      photo: pieCur.photo
    });
    pieCur.bg = fresh.bg;
    if (fresh.photo && !pieCur.photo) {
      pieCur.photo = fresh.photo;
    }
  }

  // Directly update field colors by field kind (guarantees range, dayname, date, body update reliably)
  (pieCur.fields || []).forEach(f => {
    if (f.kind === 'range') f.color = th.range || '#6b7280';
    else if (f.kind === 'dayname') f.color = th.head || '#ffffff';
    else if (f.kind === 'date') f.color = th.acc || '#cbd5e1';
    else if (f.kind === 'body') f.color = th.ink || '#f3f4f6';
  });

  pieRenderThemePalettes();
  pieDrawFill();
}

function pieResetColors() {
  if (!pieCur) return;
  const defTpl = PIE_PAL.find(p => p.id === pieCur.id) || PIE_PAL[0];
  const defTh = PIE_THEMES.find(th => th.id === (defTpl.id === 'night' ? 'dark' : 'charcoal')) || PIE_THEMES[0];
  pieCur.theme = { ...defTh };
  pieRebuildTemplateTheme();
  showToast('คืนค่าสีธีมเริ่มต้นแล้ว 🎨');
}

function pieProcessImageFile(file, callback) {
  if (!file || !file.type || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1248;
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round(h * (maxDim / w));
          w = maxDim;
        } else {
          w = Math.round(w * (maxDim / h));
          h = maxDim;
        }
      }
      const cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const optimizedDataUrl = cv.toDataURL('image/jpeg', 0.88);
      callback(optimizedDataUrl);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function pieSaveCurrentTemplate(forceNew = false) {
  if (!pieCur) return;
  const myName = (typeof getMyName === 'function' ? getMyName() : '') || 'ราคุ';
  const isExistingCustom = !forceNew && pieCur.id && !pieCur.builtin && pieCustom.some(z => z.id === pieCur.id);

  let targetId = pieCur.id;
  let targetName = pieCur.name;

  if (!isExistingCustom || forceNew) {
    const defName = (pieCur.name || 'Template').replace(/\s*\(คัสตอม\)$/, '') + (forceNew ? ' (ใหม่)' : ' (คัสตอม)');
    const entered = prompt('ตั้งชื่อ Template นี้เพื่อบันทึกและแชร์ให้ทุกคนในทีม:', defName);
    if (!entered || !entered.trim()) return;
    targetName = entered.trim();
    targetId = 'c' + Date.now().toString(36);
  }

  const savedTpl = {
    id: targetId,
    name: targetName,
    layout: pieCur.layout || 'split',
    builtin: false,
    theme: pieCur.theme ? JSON.parse(JSON.stringify(pieCur.theme)) : null,
    photo: pieCur.photo ? JSON.parse(JSON.stringify(pieCur.photo)) : null,
    bg: pieCur.bg || '',
    fields: JSON.parse(JSON.stringify(pieCur.fields || [])),
    author: isExistingCustom ? (pieCur.author || myName) : myName,
    updatedAt: new Date().toISOString()
  };

  const idx = pieCustom.findIndex(z => z.id === targetId);
  if (idx >= 0) {
    pieCustom[idx] = savedTpl;
  } else {
    pieCustom.push(savedTpl);
  }

  if (piePersist()) {
    pieCur.id = savedTpl.id;
    pieCur.name = savedTpl.name;
    pieCur.builtin = false;
    pieCur.author = savedTpl.author;
    const fnameEl = document.getElementById('pie-fname');
    if (fnameEl) fnameEl.textContent = pieCur.name;
    showToast(`💾 บันทึก Template "${savedTpl.name}" เข้าทีมแล้ว ☁️✨`);
  }
}

function pieDuplicateTemplate(sourceTpl, openImmediately = true) {
  if (!sourceTpl) return null;
  const myName = (typeof getMyName === 'function' ? getMyName() : '') || 'ราคุ';
  const rawName = (sourceTpl.name || 'Template').replace(/\s*\(สำเนา\)$/, '');
  const newName = `${rawName} (สำเนา)`;
  
  const duplicated = {
    id: 'c' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    name: newName,
    layout: sourceTpl.layout || 'split',
    builtin: false,
    theme: sourceTpl.theme ? JSON.parse(JSON.stringify(sourceTpl.theme)) : JSON.parse(JSON.stringify(PIE_THEMES[0])),
    photo: sourceTpl.photo ? JSON.parse(JSON.stringify(sourceTpl.photo)) : null,
    bg: sourceTpl.bg || '',
    fields: JSON.parse(JSON.stringify(sourceTpl.fields || [])).map(f => ({ ...f, id: pieNid() })),
    author: myName,
    updatedAt: new Date().toISOString()
  };

  pieCustom.push(duplicated);
  if (piePersist()) {
    showToast(`📑 ทำสำเนา Template "${duplicated.name}" เรียบร้อยแล้ว ✨`);
    if (openImmediately) {
      pieOpenFill(duplicated);
    } else {
      pieBuildGallery();
    }
  }
  return duplicated;
}

function pieResetPhoto() {
  if (!pieCur) return;
  if (!pieCur.photo) {
    pieCur.photo = { x: 640, y: 120, w: 560, h: 1070, r: 24, rotate: 0, scale: 1.0, offsetX: 0, offsetY: 0, img: null };
  } else {
    pieCur.photo.rotate = 0;
    pieCur.photo.scale = 1.0;
    pieCur.photo.offsetX = 0;
    pieCur.photo.offsetY = 0;
    pieCur.photo.r = 24;
  }
  pieUpdatePhotoControls();
  pieDrawFill();
  showToast('คืนค่าตำแหน่งและการหมุนรูปภาพแล้ว ↺');
}

function pieUpdatePhotoControls() {
  if (!pieCur) return;
  const ph = pieCur.photo;
  const sec = document.getElementById('pie-photo-section');
  if (!sec) return;
  
  if (!ph) {
    sec.style.display = 'block';
  } else {
    sec.style.display = 'block';
    const rotInp = document.getElementById('pie-photo-rot');
    const rotVal = document.getElementById('pie-photo-rot-val');
    if (rotInp) rotInp.value = ph.rotate || 0;
    if (rotVal) rotVal.textContent = (ph.rotate || 0) + '°';

    const scaleInp = document.getElementById('pie-photo-scale');
    const scaleVal = document.getElementById('pie-photo-scale-val');
    if (scaleInp) scaleInp.value = Math.round((ph.scale || 1.0) * 100);
    if (scaleVal) scaleVal.textContent = Math.round((ph.scale || 1.0) * 100) + '%';

    const oxInp = document.getElementById('pie-photo-ox');
    const oxVal = document.getElementById('pie-photo-ox-val');
    if (oxInp) oxInp.value = ph.offsetX || 0;
    if (oxVal) oxVal.textContent = (ph.offsetX || 0) + 'px';

    const oyInp = document.getElementById('pie-photo-oy');
    const oyVal = document.getElementById('pie-photo-oy-val');
    if (oyInp) oyInp.value = ph.offsetY || 0;
    if (oyVal) oyVal.textContent = (ph.offsetY || 0) + 'px';

    const rInp = document.getElementById('pie-photo-r');
    const rVal = document.getElementById('pie-photo-r-val');
    if (rInp) rInp.value = ph.r ?? 24;
    if (rVal) rVal.textContent = (ph.r ?? 24) + 'px';
  }
}

function pieRenderMemberChips() {
  const container = document.getElementById('pie-member-chips');
  if (!container) return;
  const people = getPeople();
  container.innerHTML = people.map(p =>
    `<button class="chip" onclick="pieSyncFromMember('${p.id}')" style="color:${p.color};border-color:${p.color};font-size:var(--fs-xs)">
      ${esc(p.name)}
    </button>`
  ).join('');
}

function pieSyncFromMember(memberId) {
  const tpl = Storage.get('tpl') || {};
  const data = tpl[memberId] || defaultTemplate(memberId);
  const people = getPeople();
  const person = people.find(p => p.id === memberId);
  const dkKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const dayKey = dkKeys[i];
    const c = data[dayKey] || {};
    const textParts = [];
    if (c.type) textParts.push(c.type);
    if (c.idea) textParts.push(c.idea);
    const val = textParts.join('\n');
    const el = document.getElementById('pie-b' + i);
    if (el) el.value = val;
  }
  pieDrawFill();
  showToast(`ดึงข้อมูลโครงสัปดาห์ของ ${person ? person.name : memberId} แล้ว ⚡`);
}

function openPlannerFromTemplate(memberId) {
  navigate('image-editor');
  const allTpls = pieAllTemplates();
  const defTpl = allTpls[0] || pieBuiltins[0];
  pieOpenFill(defTpl);
  setTimeout(() => {
    pieSyncFromMember(memberId);
  }, 100);
}

function pieUpdateDateOptions(d, be) {
  const df = document.getElementById('pie-dfmt');
  if (!df || !d) return;
  const val = df.value || 'dm';
  df.innerHTML = `<option value="dm">${pieFmtDate(d, 'dm', be)}</option><option value="dM">${pieFmtDate(d, 'dM', be)}</option><option value="num">${pieFmtDate(d, 'num', be)}</option><option value="full">${pieFmtDate(d, 'full', be)}</option>`;
  df.value = val;
}

const pieGetOpts = () => ({
  dfmt: document.getElementById('pie-dfmt')?.value || 'dm',
  nfmt: document.getElementById('pie-nfmt')?.value || 'full',
  be: document.getElementById('pie-be')?.checked ?? true
});

function pieDrawFill() {
  if (!pieCur) return;
  const startEl = document.getElementById('pie-start');
  if (!startEl || !startEl.value) return;
  const dt = pieParse(startEl.value);
  pieUpdateDateOptions(dt, document.getElementById('pie-be')?.checked);
  const bodies = [...Array(7)].map((_, i) => document.getElementById('pie-b' + i)?.value || '');
  const data = pieWeekData(dt, pieGetOpts(), bodies);
  data.days.forEach((d, i) => {
    const l = document.querySelector(`label[for=pie-b${i}]`);
    if (l && l.children.length >= 2) {
      l.children[0].textContent = `วันที่ ${i + 1}`;
      l.children[1].textContent = `${d.name} ${d.date}`;
    }
  });
  pieRender(document.getElementById('pie-pcv'), pieCur, data);
}

async function pieExportImg(type, isShare = false) {
  const cv = document.getElementById('pie-pcv'), ext = type === 'image/png' ? 'png' : 'jpg';
  if (!cv) return;
  await new Promise(r => requestAnimationFrame(r));
  cv.toBlob(async b => {
    if (!b) { showToast('Export ไม่สำเร็จ'); return; }
    const name = `planner-${document.getElementById('pie-start')?.value || 'week'}.${ext}`;
    
    if (isShare && navigator.canShare && navigator.canShare({ files: [new File([b], name, { type: b.type })] })) {
      try {
        const file = new File([b], name, { type: b.type });
        await navigator.share({
          files: [file],
          title: 'Weekly Planner Image',
          text: 'ตารางแพลนเนอร์รายสัปดาห์ 1248x1248 px'
        });
        showToast('แชร์รูปภาพสำเร็จ');
        return;
      } catch(err) {
        if (err.name !== 'AbortError') console.warn(err);
      }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    showToast('ดาวน์โหลดรูปภาพแล้ว');
  }, type, .93);
}

// Interactive Photo Drag & Wheel Zoom on Preview Canvas (#pie-pcv)
let piePhotoDragging = false;
let piePhotoDragStart = { x: 0, y: 0, origOx: 0, origOy: 0 };

function piePcvPt(e) {
  const cv = document.getElementById('pie-pcv');
  if (!cv) return { x: 0, y: 0 };
  const r = cv.getBoundingClientRect();
  const k = PIE_S / r.width;
  const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
  return { x: (clientX - r.left) * k, y: (clientY - r.top) * k };
}

function pieIsPtInPhoto(pt) {
  if (!pieCur || !pieCur.photo) return false;
  const ph = pieCur.photo;
  return (pt.x >= ph.x && pt.x <= ph.x + ph.w && pt.y >= ph.y && pt.y <= ph.y + ph.h);
}

function pieInitPcvEvents() {
  const cv = document.getElementById('pie-pcv');
  if (!cv) return;

  cv.style.touchAction = 'none';

  cv.addEventListener('pointerdown', e => {
    if (!pieCur || !pieCur.photo) return;
    const pt = piePcvPt(e);
    if (pieIsPtInPhoto(pt)) {
      if (!pieCur.photo.img) {
        document.getElementById('pie-photo-file')?.click();
        return;
      }
      piePhotoDragging = true;
      piePhotoDragStart = {
        x: pt.x,
        y: pt.y,
        origOx: pieCur.photo.offsetX || 0,
        origOy: pieCur.photo.offsetY || 0
      };
      if (cv.setPointerCapture) {
        try { cv.setPointerCapture(e.pointerId); } catch(err){}
      }
      cv.style.cursor = 'grabbing';
      e.preventDefault();
    }
  });

  cv.addEventListener('pointermove', e => {
    const pt = piePcvPt(e);
    if (piePhotoDragging) {
      const dx = pt.x - piePhotoDragStart.x;
      const dy = pt.y - piePhotoDragStart.y;
      pieCur.photo.offsetX = Math.max(-1000, Math.min(1000, Math.round(piePhotoDragStart.origOx + dx)));
      pieCur.photo.offsetY = Math.max(-1000, Math.min(1000, Math.round(piePhotoDragStart.origOy + dy)));
      
      const oxInp = document.getElementById('pie-photo-ox');
      const oxVal = document.getElementById('pie-photo-ox-val');
      if (oxInp) oxInp.value = pieCur.photo.offsetX;
      if (oxVal) oxVal.textContent = pieCur.photo.offsetX + 'px';

      const oyInp = document.getElementById('pie-photo-oy');
      const oyVal = document.getElementById('pie-photo-oy-val');
      if (oyInp) oyInp.value = pieCur.photo.offsetY;
      if (oyVal) oyVal.textContent = pieCur.photo.offsetY + 'px';

      pieDrawFill();
    } else {
      if (pieIsPtInPhoto(pt)) {
        cv.style.cursor = (pieCur && pieCur.photo && pieCur.photo.img) ? 'grab' : 'pointer';
      } else {
        cv.style.cursor = 'default';
      }
    }
  });

  const stopDrag = (e) => {
    if (piePhotoDragging) {
      piePhotoDragging = false;
      if (e && e.pointerId && cv.releasePointerCapture) {
        try { cv.releasePointerCapture(e.pointerId); } catch(err){}
      }
      const pt = piePcvPt(e);
      cv.style.cursor = pieIsPtInPhoto(pt) ? (pieCur.photo && pieCur.photo.img ? 'grab' : 'pointer') : 'default';
    }
  };

  cv.addEventListener('pointerup', stopDrag);
  cv.addEventListener('pointercancel', stopDrag);
  cv.addEventListener('mouseleave', stopDrag);

  // Wheel zoom on photo box
  cv.addEventListener('wheel', e => {
    if (!pieCur || !pieCur.photo || !pieCur.photo.img) return;
    const pt = piePcvPt(e);
    if (pieIsPtInPhoto(pt)) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      const curScale = pieCur.photo.scale || 1.0;
      const nextScale = Math.max(0.2, Math.min(3.0, Math.round((curScale + delta) * 100) / 100));
      pieCur.photo.scale = nextScale;

      const scaleInp = document.getElementById('pie-photo-scale');
      const scaleVal = document.getElementById('pie-photo-scale-val');
      if (scaleInp) scaleInp.value = Math.round(nextScale * 100);
      if (scaleVal) scaleVal.textContent = Math.round(nextScale * 100) + '%';

      pieDrawFill();
    }
  }, { passive: false });
}

// Editor View Logic (with History, Zoom, Pan, Multi-select)
let pieDrag = null;
let pieHistory = [], pieHistIdx = -1;
const PIE_MAX_HIST = 50;

function pieSnapshotState() {
  if (!pieEd) return null;
  return { fields: JSON.parse(JSON.stringify(pieEd.fields)), sels: pieEd.sels ? pieEd.sels.slice() : [], name: pieEd.name, bg: pieEd.bg };
}

function pieResetHistory() {
  const s = pieSnapshotState();
  pieHistory = s ? [s] : []; pieHistIdx = s ? 0 : -1;
  pieUpdateHistoryBtns();
}

function piePushHistory() {
  const s = pieSnapshotState(); if (!s) return;
  if (pieHistIdx >= 0 && JSON.stringify(pieHistory[pieHistIdx].fields) === JSON.stringify(s.fields) && pieHistory[pieHistIdx].bg === s.bg) return;
  pieHistory = pieHistory.slice(0, pieHistIdx + 1);
  pieHistory.push(s);
  if (pieHistory.length > PIE_MAX_HIST) pieHistory.shift();
  else pieHistIdx++;
  pieUpdateHistoryBtns();
}

function pieUpdateHistoryBtns() {
  const us = document.getElementById('pieBtnUndoStage'), rs = document.getElementById('pieBtnRedoStage');
  const canUndo = pieHistIdx > 0, canRedo = pieHistIdx < pieHistory.length - 1;
  if (us) us.disabled = !canUndo;
  if (rs) rs.disabled = !canRedo;
}

function pieUndo() {
  if (pieHistIdx > 0) {
    pieHistIdx--;
    pieRestoreState(pieHistory[pieHistIdx]);
    pieUpdateHistoryBtns();
    showToast('ย้อนกลับ (Undo)');
  }
}

function pieRedo() {
  if (pieHistIdx < pieHistory.length - 1) {
    pieHistIdx++;
    pieRestoreState(pieHistory[pieHistIdx]);
    pieUpdateHistoryBtns();
    showToast('ทำซ้ำ (Redo)');
  }
}

function pieRestoreState(s) {
  if (!s || !pieEd) return;
  pieEd.fields = JSON.parse(JSON.stringify(s.fields));
  pieEd.sels = s.sels.filter(id => pieEd.fields.some(f => f.id === id));
  if (s.bg !== undefined) pieEd.bg = s.bg;
  if (s.name !== undefined) {
    pieEd.name = s.name;
    const tn = document.getElementById('pie-tname');
    if (tn) tn.value = s.name;
  }
  pieProps(); pieRedraw();
}

function pieOpenEditor(t, own, push = true) {
  const myName = (typeof getMyName === 'function' ? getMyName() : '') || 'ราคุ';
  pieEd = {
    id: own ? t.id : null,
    name: own ? t.name : (t.builtin ? t.name + ' (สำเนา)' : t.name),
    layout: t.layout || 'split',
    builtin: own ? (t.builtin || false) : false,
    theme: t.theme ? JSON.parse(JSON.stringify(t.theme)) : null,
    photo: t.photo ? JSON.parse(JSON.stringify(t.photo)) : null,
    bg: t.bg || '',
    fields: JSON.parse(JSON.stringify(t.fields || [])),
    author: own ? (t.author || myName) : myName,
    sels: []
  };
  if (!own) pieEd.fields.forEach(f => f.id = pieNid());
  pieInitialEdState = JSON.parse(JSON.stringify(pieEd));
  const tn = document.getElementById('pie-tname'); if (tn) tn.value = pieEd.name;
  const bf = document.getElementById('pie-bgfile'); if (bf) bf.value = '';
  const title = own ? 'แก้ไข ' + t.name : 'Template Editor';
  if (push) pieGo('editor', title, pieEd);
  else pieNavGo('editor', title, false, pieEd);
  pieResetHistory(); pieProps(); pieRedraw();
}

const pieSelFs = () => pieEd ? pieEd.fields.filter(f => pieEd.sels && pieEd.sels.includes(f.id)) : [];
const pieSelF = () => pieSelFs()[0] || null;
const pieIsSel = id => pieEd && pieEd.sels && pieEd.sels.includes(id);

const pieSampleBodies = ['ประชุมทีม 10:00\nส่งงานลูกค้า', 'ออกกำลังกาย', 'นัดหมอ 14:00', 'Deadline', 'ซื้อของ', 'ท่องเที่ยว', 'พักผ่อน'];

function pieRedraw() {
  const data = pieWeekData(pieMonday(new Date()), pieDefOpt, pieSampleBodies);
  pieRender(document.getElementById('pie-ecv'), pieEd, data, x => {
    for (const f of pieEd.fields) {
      const s = pieIsSel(f.id);
      x.save(); x.lineWidth = s ? 4 : 2; x.strokeStyle = s ? '#e0245e' : 'rgba(47,85,212,.75)';
      x.setLineDash(s ? [] : [10, 8]); x.strokeRect(f.x, f.y, f.w, f.h); x.setLineDash([]);
      const lb = PIE_KL[f.kind] + (f.day != null ? ' ' + (f.day + 1) : '');
      x.font = `600 16px "${PIE_FONTS[0]}",sans-serif`; const tw = x.measureText(lb).width + 12;
      x.fillStyle = s ? '#e0245e' : 'rgba(47,85,212,.85)'; x.fillRect(f.x, f.y - 20, tw, 20);
      x.fillStyle = '#fff'; x.textBaseline = 'top'; x.textAlign = 'left'; x.fillText(lb, f.x + 6, f.y - 18);
      if (s && pieEd.sels.length === 1) {
        x.fillStyle = '#e0245e'; x.fillRect(f.x + f.w - 18, f.y + f.h - 18, 26, 26);
      }
      x.restore();
    }
    if (pieDrag && pieDrag.mode === 'marquee') {
      const mx = Math.min(pieDrag.x0, pieDrag.x1), my = Math.min(pieDrag.y0, pieDrag.y1);
      const mw = Math.abs(pieDrag.x1 - pieDrag.x0), mh = Math.abs(pieDrag.y1 - pieDrag.y0);
      x.save(); x.fillStyle = 'rgba(99,102,241,0.18)'; x.fillRect(mx, my, mw, mh);
      x.strokeStyle = '#6366f1'; x.lineWidth = 2; x.setLineDash([8, 6]); x.strokeRect(mx, my, mw, mh);
      x.restore();
    }
  });
}

function pieProps() {
  const fs = pieSelFs(), p = document.getElementById('pie-props');
  if (!p) return;
  if (!fs.length) {
    p.innerHTML = '<p style="font-size:var(--fs-sm);color:var(--text3)">ยังไม่ได้เลือกช่อง คลิกกล่องบนภาพ หรือคลิกลากครอบเพื่อเลือกหลายช่องพร้อมกัน (Edit All)</p>';
    return;
  }
  if (fs.length === 1) {
    const f = fs[0];
    const days = f.kind === 'range' ? '' : `<div><label style="font-size:var(--fs-xs);font-weight:600;color:var(--text3);display:block;margin-bottom:4px">ตรงกับวันที่</label><select data-piek="day" style="width:100%;padding:6px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3);color:var(--text)">${[...Array(7)].map((_, i) => `<option value="${i}" ${f.day === i ? 'selected' : ''}>วันที่ ${i + 1}</option>`).join('')}</select></div>`;
    p.innerHTML = `<b style="font-size:var(--fs-md);display:block;margin-bottom:8px">ช่อง: ${PIE_KL[f.kind]}</b><div class="pie-g2">${days}
    <div><label style="font-size:var(--fs-xs);font-weight:600;color:var(--text3);display:block;margin-bottom:4px">ฟอนต์</label><select data-piek="font" style="width:100%;padding:6px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3);color:var(--text)">${PIE_FONTS.map(n => `<option ${n === f.font ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div><label style="font-size:var(--fs-xs);font-weight:600;color:var(--text3);display:block;margin-bottom:4px">ขนาด (px)</label><input type="number" min="10" max="200" data-piek="size" value="${f.size}" style="width:100%;padding:6px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3);color:var(--text)"></div>
    <div><label style="font-size:var(--fs-xs);font-weight:600;color:var(--text3);display:block;margin-bottom:4px">น้ำหนัก</label><select data-piek="weight" style="width:100%;padding:6px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3);color:var(--text)"><option value="400" ${f.weight === '400' ? 'selected' : ''}>ปกติ</option><option value="600" ${f.weight === '600' ? 'selected' : ''}>กึ่งหนา</option><option value="700" ${f.weight === '700' ? 'selected' : ''}>หนา</option></select></div>
    <div><label style="font-size:var(--fs-xs);font-weight:600;color:var(--text3);display:block;margin-bottom:4px">สี</label><input type="color" data-piek="color" value="${f.color}" style="width:100%;padding:2px;height:36px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3)"></div>
    <div><label style="font-size:var(--fs-xs);font-weight:600;color:var(--text3);display:block;margin-bottom:4px">การจัดวาง</label><select data-piek="align" style="width:100%;padding:6px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3);color:var(--text)"><option value="left" ${f.align === 'left' ? 'selected' : ''}>ซ้าย</option><option value="center" ${f.align === 'center' ? 'selected' : ''}>กลาง</option><option value="right" ${f.align === 'right' ? 'selected' : ''}>ขวา</option></select></div></div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-secondary btn-sm" id="pie-dupf">ทำสำเนาช่องนี้</button>
      <button class="btn btn-secondary btn-sm" id="pie-delf" style="color:var(--danger)">ลบช่องนี้</button>
    </div>`;
    p.querySelectorAll('[data-piek]').forEach(el => el.oninput = () => {
      const k = el.dataset.piek; f[k] = k === 'size' ? Math.max(10, +el.value || 10) : k === 'day' ? +el.value : el.value;
      pieRedraw(); piePushHistory();
    });
    const bDup = document.getElementById('pie-dupf'), bDel = document.getElementById('pie-delf');
    if (bDup) bDup.onclick = () => {
      const newDay = f.day != null ? (f.day + 1) % 7 : null;
      const clone = { ...f, id: pieNid(), day: newDay, x: Math.min(PIE_S - f.w, f.x + 20), y: Math.min(PIE_S - f.h, f.y + 20) };
      pieEd.fields.push(clone); pieEd.sels = [clone.id]; piePushHistory(); pieProps(); pieRedraw(); showToast('ทำสำเนาช่องแล้ว');
    };
    if (bDel) bDel.onclick = () => {
      pieEd.fields = pieEd.fields.filter(z => z.id !== f.id); pieEd.sels = []; piePushHistory(); pieProps(); pieRedraw(); showToast('ลบช่องแล้ว');
    };
  } else {
    p.innerHTML = `<b style="font-size:var(--fs-md);display:block;margin-bottom:4px">แก้ไขพร้อมกัน ${fs.length} ช่อง (Edit All)</b>
    <p style="font-size:var(--fs-xs);color:var(--text3);margin-bottom:10px">การปรับค่าจะมีผลกับทุกช่องที่เลือกพร้อมกัน</p>
    <div class="pie-g2">
    <div><label style="font-size:var(--fs-xs);font-weight:600;color:var(--text3);display:block;margin-bottom:4px">ฟอนต์</label><select data-piebk="font" style="width:100%;padding:6px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3);color:var(--text)"><option value="">(คงเดิม / หลายฟอนต์)</option>${PIE_FONTS.map(n => `<option>${n}</option>`).join('')}</select></div>
    <div><label style="font-size:var(--fs-xs);font-weight:600;color:var(--text3);display:block;margin-bottom:4px">ขนาด (px)</label><input type="number" min="10" max="200" data-piebk="size" placeholder="ขนาดฟอนต์" style="width:100%;padding:6px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3);color:var(--text)"></div>
    <div><label style="font-size:var(--fs-xs);font-weight:600;color:var(--text3);display:block;margin-bottom:4px">น้ำหนัก</label><select data-piebk="weight" style="width:100%;padding:6px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3);color:var(--text)"><option value="">(คงเดิม)</option><option value="400">ปกติ (400)</option><option value="600">กึ่งหนา (600)</option><option value="700">หนา (700)</option></select></div>
    <div><label style="font-size:var(--fs-xs);font-weight:600;color:var(--text3);display:block;margin-bottom:4px">สี</label><input type="color" data-piebk="color" value="#222222" style="width:100%;padding:2px;height:36px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3)"></div>
    <div><label style="font-size:var(--fs-xs);font-weight:600;color:var(--text3);display:block;margin-bottom:4px">การจัดวาง</label><select data-piebk="align" style="width:100%;padding:6px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3);color:var(--text)"><option value="">(คงเดิม)</option><option value="left">ซ้าย</option><option value="center">กลาง</option><option value="right">ขวา</option></select></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-secondary btn-sm" id="pie-dupf">ทำสำเนา ${fs.length} ช่อง</button>
      <button class="btn btn-secondary btn-sm" id="pie-delf" style="color:var(--danger)">ลบ ${fs.length} ช่อง</button>
      <button class="btn btn-secondary btn-sm" id="pie-unselAll">ยกเลิกการเลือก</button>
    </div>`;
    p.querySelectorAll('[data-piebk]').forEach(el => el.oninput = () => {
      const k = el.dataset.piebk, val = el.value; if (!val) return;
      fs.forEach(f => { f[k] = k === 'size' ? Math.max(10, +val || 10) : val; });
      pieRedraw(); piePushHistory();
    });
    const bDup = document.getElementById('pie-dupf'), bDel = document.getElementById('pie-delf'), bUnsel = document.getElementById('pie-unselAll');
    if (bDup) bDup.onclick = () => {
      const newIds = [];
      fs.forEach(f => {
        const clone = { ...f, id: pieNid(), x: Math.min(PIE_S - f.w, f.x + 20), y: Math.min(PIE_S - f.h, f.y + 20) };
        pieEd.fields.push(clone); newIds.push(clone.id);
      });
      pieEd.sels = newIds; piePushHistory(); pieProps(); pieRedraw(); showToast(`ทำสำเนา ${fs.length} ช่องแล้ว`);
    };
    if (bDel) bDel.onclick = () => {
      pieEd.fields = pieEd.fields.filter(z => !pieEd.sels.includes(z.id));
      const count = pieEd.sels.length; pieEd.sels = []; piePushHistory(); pieProps(); pieRedraw(); showToast(`ลบ ${count} ช่องแล้ว`);
    };
    if (bUnsel) bUnsel.onclick = () => { pieEd.sels = []; pieProps(); pieRedraw(); };
  }
}

function pieAddField(kind, day, y, h) {
  if (!pieEd) return;
  const n = pieEd.fields.filter(f => f.kind === kind).length;
  const base = kind === 'range' ? { w: 560, h: 60, size: 38 } : kind === 'body' ? { w: 300, h: 260, size: 26 } : { w: 260, h: 50, size: kind === 'date' ? 26 : 32 };
  const f = pieFD(kind, kind === 'range' ? null : (day != null ? day : n % 7), 60 + (n % 5) * 20, y || (120 + (n % 7) * 30), base.w, h || base.h, base.size, '#222222', 'left', kind === 'dayname' ? '700' : '400');
  pieEd.fields.push(f); pieEd.sels = [f.id]; piePushHistory(); pieProps(); pieRedraw();
}

function pieLoadBgFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const fr = new FileReader();
  fr.onload = () => {
    const i = new Image();
    i.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = PIE_S; const x = c.getContext('2d');
      const k = Math.max(PIE_S / i.width, PIE_S / i.height), w = i.width * k, h = i.height * k;
      x.fillStyle = '#fff'; x.fillRect(0, 0, PIE_S, PIE_S);
      x.drawImage(i, (PIE_S - w) / 2, (PIE_S - h) / 2, w, h);
      pieEd.bg = c.toDataURL('image/jpeg', .88);
      piePushHistory();
      if (!pieEd.fields.length) pieAutoDetect(true);
      else pieRedraw();
    };
    i.src = fr.result;
  };
  fr.readAsDataURL(file);
}

async function pieAutoDetect(quiet) {
  if (!pieEd) return;
  const im = await pieLoadImg(pieEd.bg);
  if (!im) { showToast('อัปโหลดรูปพื้นหลังก่อน'); return; }
  if (!quiet && pieEd.fields.length && !confirm('ช่องเดิมจะถูกแทนที่ ต้องการดำเนินการต่อหรือไม่?')) return;
  const W = 416, k = PIE_S / W, c = document.createElement('canvas'); c.width = c.height = W; const x = c.getContext('2d');
  x.drawImage(im, 0, 0, W, W);
  const d = x.getImageData(0, 0, W, W).data, m = new Uint8Array(W * W);
  for (let i = 0; i < W * W; i++) {
    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    m[i] = (mn >= 215 && mx - mn <= 22) ? 1 : 0;
  }
  const E = 3;
  for (let t = 0; t < E; t++) {
    const o = new Uint8Array(W * W);
    for (let y = 1; y < W - 1; y++) for (let x2 = 1; x2 < W - 1; x2++) {
      const p = y * W + x2;
      o[p] = m[p] & m[p - 1] & m[p + 1] & m[p - W] & m[p + W] & m[p - W - 1] & m[p - W + 1] & m[p + W - 1] & m[p + W + 1];
    }
    m.set(o);
  }
  const seen = new Uint8Array(W * W), st = new Int32Array(W * W), boxes = [];
  for (let s0 = 0; s0 < W * W; s0++) {
    if (!m[s0] || seen[s0]) continue;
    let sp = 0, n = 0, x0 = W, y0 = W, x1 = 0, y1 = 0; st[sp++] = s0; seen[s0] = 1;
    while (sp) {
      const p = st[--sp], px = p % W, py = (p / W) | 0; n++;
      if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py;
      for (const q of [px > 0 ? p - 1 : -1, px < W - 1 ? p + 1 : -1, py > 0 ? p - W : -1, py < W - 1 ? p + W : -1])
        if (q >= 0 && m[q] && !seen[q]) { seen[q] = 1; st[sp++] = q; }
    }
    const ew = x1 - x0 + 1, eh = y1 - y0 + 1, w = ew + 2 * E, h = eh + 2 * E;
    if (n > 60 && w >= W * .06 && h >= W * .025 && h <= W * .28 && w <= W * .95 && n / (ew * eh) >= .7 && w > h * .9) boxes.push({ x: x0 - E, y: y0 - E, w, h });
  }
  boxes.sort((a, b) => (a.y + a.h / 2) - (b.y + b.h / 2)); let rows = [];
  for (const b of boxes) {
    const cy = b.y + b.h / 2, r = rows.find(r => Math.abs(r.cy - cy) < Math.max(r.h, b.h) * .6);
    if (r) r.b.push(b); else rows.push({ cy, h: b.h, b: [b] });
  }
  const wide = r => Math.max(...r.b.map(b => b.w));
  rows = rows.filter(r => wide(r) >= W * .15);
  if (rows.length > 7) rows = rows.sort((a, b) => wide(b) - wide(a)).slice(0, 7).sort((a, b) => a.cy - b.cy);
  if (rows.length < 2) { showToast('ตรวจจับช่องไม่พบ ลองเพิ่มช่องเองหรือใช้ปุ่ม "เพิ่มครบ 7 วัน"'); return; }
  const fields = [], col = '#3d2f2a', clamp = (v, a, b) => Math.max(a, Math.min(b, Math.round(v)));
  const R = b => ({ x: Math.round((b.x + b.w * .04) * k), y: Math.round((b.y + b.h * .06) * k), w: Math.round(b.w * .92 * k), h: Math.round(b.h * .88 * k) });
  rows.forEach((r, i) => {
    const bs = r.b.sort((a, b) => a.x - b.x), body = bs.reduce((a, b) => b.w > a.w ? b : a), lead = bs.filter(b => b.x + b.w <= body.x + 2);
    const bb = R(body); fields.push(pieFD('body', i, bb.x, bb.y, bb.w, bb.h, clamp(bb.h * .3, 18, 40), col, 'left', '400'));
    if (lead.length >= 2) {
      const a = R(lead[0]), b = R(lead[1]);
      fields.push(pieFD('dayname', i, a.x, a.y, a.w, a.h, clamp(a.h * .4, 14, 34), col, 'center', '700'), pieFD('date', i, b.x, b.y, b.w, b.h, clamp(b.h * .38, 14, 30), col, 'center', '600'));
    } else if (lead.length === 1) {
      const a = R(lead[0]);
      if (a.h >= 70) fields.push(pieFD('dayname', i, a.x, a.y, a.w, Math.round(a.h * .46), clamp(a.h * .3, 14, 32), col, 'center', '700'), pieFD('date', i, a.x, a.y + Math.round(a.h * .5), a.w, Math.round(a.h * .46), clamp(a.h * .24, 12, 26), col, 'center', '600'));
      else fields.push(pieFD('date', i, a.x, a.y, a.w, a.h, clamp(a.h * .4, 12, 28), col, 'center', '600'));
    }
  });
  pieEd.fields = fields; pieEd.sels = []; piePushHistory(); pieProps(); pieRedraw();
  showToast(`พบ ${rows.length} แถว สามารถลากปรับตำแหน่งได้`);
}

// Canvas Zoom & Pan
let pieZoomScale = 1.0;
let pieIsZoomFit = true;
let pieActiveTool = 'select'; // 'select' or 'pan'
let pieIsSpacePressed = false;
let pieIsPanning = false;
let piePanStart = { x: 0, y: 0, scrollL: 0, scrollT: 0 };
const PIE_ZOOM_LEVELS = [0.5, 0.65, 0.8, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

function pieSetTool(tool) {
  pieActiveTool = tool;
  const tSel = document.getElementById('pieToolSelect'), tPan = document.getElementById('pieToolPan');
  if (tSel) {
    tSel.classList.toggle('btn-primary', tool === 'select');
    tSel.classList.toggle('btn-secondary', tool !== 'select');
  }
  if (tPan) {
    tPan.classList.toggle('btn-primary', tool === 'pan');
    tPan.classList.toggle('btn-secondary', tool !== 'pan');
  }
  pieUpdateCursor();
}

function pieUpdateCursor() {
  const cv = document.getElementById('pie-ecv');
  const wrap = document.getElementById('pieEcvWrap');
  if (!cv || !wrap) return;
  if (pieIsPanning) {
    cv.style.cursor = 'grabbing'; wrap.style.cursor = 'grabbing';
  } else if (pieActiveTool === 'pan' || pieIsSpacePressed) {
    cv.style.cursor = 'grab'; wrap.style.cursor = 'grab';
  } else {
    cv.style.cursor = 'crosshair'; wrap.style.cursor = 'default';
  }
}

function pieApplyZoom(scale, isFit = false) {
  pieIsZoomFit = isFit;
  pieZoomScale = Math.max(0.5, Math.min(3.0, scale));
  const cv = document.getElementById('pie-ecv');
  const wrap = document.getElementById('pieEcvWrap');
  const zVal = document.getElementById('pieBtnZoomVal');
  const zIn = document.getElementById('pieBtnZoomIn');
  const zOut = document.getElementById('pieBtnZoomOut');
  if (!cv || !wrap) return;

  const prevScrollL = wrap.scrollLeft, prevScrollT = wrap.scrollTop;
  const prevWidth = cv.offsetWidth || 400;

  if (isFit) {
    cv.style.width = '100%';
    cv.style.maxWidth = 'calc(100vh - 195px)';
    cv.style.height = 'auto';
    cv.style.maxHeight = 'calc(100vh - 195px)';
    if (zVal) zVal.textContent = 'Fit';
  } else {
    const baseSize = Math.max(280, Math.min(wrap.clientWidth - 32, window.innerHeight - 200));
    const targetPx = Math.round(baseSize * pieZoomScale);
    cv.style.width = targetPx + 'px';
    cv.style.maxWidth = 'none';
    cv.style.height = targetPx + 'px';
    cv.style.maxHeight = 'none';
    if (zVal) zVal.textContent = Math.round(pieZoomScale * 100) + '%';

    const ratio = targetPx / prevWidth;
    requestAnimationFrame(() => {
      wrap.scrollLeft = (prevScrollL + wrap.clientWidth / 2) * ratio - wrap.clientWidth / 2;
      wrap.scrollTop = (prevScrollT + wrap.clientHeight / 2) * ratio - wrap.clientHeight / 2;
    });
  }

  if (zIn) zIn.disabled = (pieZoomScale >= 3.0 && !isFit);
  if (zOut) zOut.disabled = (pieZoomScale <= 0.5 && !isFit);
}

function pieZoomIn() {
  const cur = pieIsZoomFit ? 1.0 : pieZoomScale;
  const next = PIE_ZOOM_LEVELS.find(lvl => lvl > cur + 0.05) || 3.0;
  pieApplyZoom(next, false);
  showToast(`ซูม ${Math.round(next * 100)}%`);
}

function pieZoomOut() {
  const cur = pieIsZoomFit ? 1.0 : pieZoomScale;
  const prev = [...PIE_ZOOM_LEVELS].reverse().find(lvl => lvl < cur - 0.05) || 0.5;
  pieApplyZoom(prev, false);
  showToast(`ซูม ${Math.round(prev * 100)}%`);
}

function pieZoomFit() {
  pieApplyZoom(1.0, true);
  showToast('ปรับขนาดพอดีหน้าจอ (Fit)');
}

// Initializing the Image Editor View & Events
let pieInitialized = false;
function renderImageEditorPage() {
  if (!pieInitialized) {
    pieInitEditorEvents();
    pieInitialized = true;
  }
  pieLoadStorage();
  if (pieBuiltins.length === 0) {
    pieBuiltins = PIE_PAL.map(pieMakeBuiltin);
  }
  pieBuildGallery();
  pieNavGo('gallery', '', false);
}

function piePt(e) {
  const ec = document.getElementById('pie-ecv');
  const r = ec.getBoundingClientRect(), k = PIE_S / r.width;
  return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
}

function pieInitEditorEvents() {
  document.getElementById('pieNavBackBtn')?.addEventListener('click', pieNavBack);
  document.getElementById('pieNavFwdBtn')?.addEventListener('click', pieNavForward);
  document.getElementById('pieHomeBtn')?.addEventListener('click', () => { pieBuildGallery(); pieGo('gallery'); });
  document.getElementById('pieBtnGallery')?.addEventListener('click', () => { pieBuildGallery(); pieGo('gallery'); });
  document.getElementById('pieBtnFill')?.addEventListener('click', () => {
    const t = pieCur || pieAllTemplates()[0] || pieBuiltins[0];
    if (t) pieOpenFill(t);
  });
  document.getElementById('pieBtnEditor')?.addEventListener('click', () => {
    const t = pieCur || pieAllTemplates()[0] || pieBuiltins[0];
    if (t) pieOpenEditor(t, !t.builtin);
  });

  // Fill view controls
  document.getElementById('pie-prevw')?.addEventListener('click', () => {
    const startEl = document.getElementById('pie-start');
    if (startEl) { startEl.value = pieIso(pieAddD(pieParse(startEl.value), -7)); pieDrawFill(); }
  });
  document.getElementById('pie-nextw')?.addEventListener('click', () => {
    const startEl = document.getElementById('pie-start');
    if (startEl) { startEl.value = pieIso(pieAddD(pieParse(startEl.value), 7)); pieDrawFill(); }
  });
  document.getElementById('pie-todayw')?.addEventListener('click', () => {
    const startEl = document.getElementById('pie-start');
    if (startEl) { startEl.value = pieIso(pieMonday(new Date())); pieDrawFill(); showToast('กลับมาสัปดาห์ปัจจุบันแล้ว'); }
  });
  document.getElementById('pie-clearDays')?.addEventListener('click', () => {
    for (let i = 0; i < 7; i++) {
      const el = document.getElementById('pie-b' + i); if (el) el.value = '';
    }
    pieDrawFill(); showToast('ล้างข้อความทั้งหมดแล้ว');
  });
  document.getElementById('pie-fback')?.addEventListener('click', () => { pieBuildGallery(); pieGo('gallery'); });
  document.getElementById('pie-fedit')?.addEventListener('click', () => { if (pieCur) pieOpenEditor(pieCur, !pieCur.builtin); });

  ['pie-start', 'pie-dfmt', 'pie-nfmt', 'pie-be'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', pieDrawFill);
  });

  // Toggle Custom Colors
  document.getElementById('pie-toggle-colors')?.addEventListener('click', () => {
    const box = document.getElementById('pie-custom-colors');
    if (box) box.style.display = (box.style.display === 'none' || !box.style.display) ? 'block' : 'none';
  });

  // Custom Color inputs (all parts)
  const colorMap = [
    { id: 'pie-col-bg', key: 'bg' },
    { id: 'pie-col-card', key: 'card' },
    { id: 'pie-col-photoBg', key: 'photoBg' },
    { id: 'pie-col-note', key: 'note' },
    { id: 'pie-col-badge', key: 'badge' },
    { id: 'pie-col-title', key: 'title' },
    { id: 'pie-col-range', key: 'range' },
    { id: 'pie-col-head', key: 'head' },
    { id: 'pie-col-acc', key: 'acc' },
    { id: 'pie-col-ink', key: 'ink' }
  ];
  const onColorChange = (key, val) => {
    if (!pieCur) return;
    if (!pieCur.theme) {
      const defTh = PIE_THEMES.find(th => th.id === (pieCur.id === 'night' ? 'dark' : 'charcoal')) || PIE_THEMES[0];
      pieCur.theme = { ...defTh };
    }
    pieCur.theme[key] = val;
    pieRebuildTemplateTheme();
  };

  colorMap.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', e => onColorChange(key, e.target.value));
      el.addEventListener('change', e => onColorChange(key, e.target.value));
    }
  });

  // Reset Theme Colors
  document.getElementById('pie-reset-colors')?.addEventListener('click', pieResetColors);

  // Save buttons on Fill view
  document.getElementById('pie-fsave')?.addEventListener('click', () => pieSaveCurrentTemplate(false));
  document.getElementById('pie-fdup')?.addEventListener('click', () => {
    if (pieCur) pieDuplicateTemplate(pieCur, true);
  });
  document.getElementById('pie-save-as-custom-tpl')?.addEventListener('click', () => pieSaveCurrentTemplate(false));
  document.getElementById('pie-save-as-new-tpl')?.addEventListener('click', () => pieSaveCurrentTemplate(true));

  // Photo Controls
  const photoFileInp = document.getElementById('pie-photo-file');
  document.getElementById('pie-photo-choose')?.addEventListener('click', () => photoFileInp?.click());
  document.getElementById('pie-photo-reset')?.addEventListener('click', pieResetPhoto);
  photoFileInp?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) {
      pieProcessImageFile(file, optimizedDataUrl => {
        if (!pieCur) return;
        if (!pieCur.photo) {
          pieCur.photo = { x: 640, y: 120, w: 560, h: 1070, r: 24, rotate: 0, scale: 1.0, offsetX: 0, offsetY: 0 };
        }
        pieCur.photo.img = optimizedDataUrl;
        pieUpdatePhotoControls();
        pieDrawFill();
        showToast('ใส่รูปภาพเรียบร้อย 🖼️');
      });
    }
  });

  document.getElementById('pie-photo-clear')?.addEventListener('click', () => {
    if (pieCur && pieCur.photo) {
      pieCur.photo.img = null;
      pieUpdatePhotoControls();
      pieDrawFill();
      showToast('ลบรูปภาพแล้ว');
    }
  });

  // Rotation Slider
  const rotInp = document.getElementById('pie-photo-rot');
  rotInp?.addEventListener('input', e => {
    if (!pieCur || !pieCur.photo) return;
    const deg = Number(e.target.value);
    pieCur.photo.rotate = deg;
    const valEl = document.getElementById('pie-photo-rot-val');
    if (valEl) valEl.textContent = deg + '°';
    pieDrawFill();
  });

  // Quick Rotate Buttons
  const applyRotateDelta = (delta) => {
    if (!pieCur || !pieCur.photo) return;
    let r = (pieCur.photo.rotate || 0) + delta;
    if (r > 180) r -= 360;
    if (r < -180) r += 360;
    pieCur.photo.rotate = r;
    pieUpdatePhotoControls();
    pieDrawFill();
  };

  document.getElementById('pie-rot-m90')?.addEventListener('click', () => applyRotateDelta(-90));
  document.getElementById('pie-rot-p90')?.addEventListener('click', () => applyRotateDelta(90));
  document.getElementById('pie-rot-m15')?.addEventListener('click', () => applyRotateDelta(-15));
  document.getElementById('pie-rot-p15')?.addEventListener('click', () => applyRotateDelta(15));
  document.getElementById('pie-rot-0')?.addEventListener('click', () => {
    if (!pieCur || !pieCur.photo) return;
    pieCur.photo.rotate = 0;
    pieUpdatePhotoControls();
    pieDrawFill();
  });

  // Scale Slider
  document.getElementById('pie-photo-scale')?.addEventListener('input', e => {
    if (!pieCur || !pieCur.photo) return;
    const s = Number(e.target.value) / 100;
    pieCur.photo.scale = s;
    const valEl = document.getElementById('pie-photo-scale-val');
    if (valEl) valEl.textContent = e.target.value + '%';
    pieDrawFill();
  });

  // Offset Sliders
  document.getElementById('pie-photo-ox')?.addEventListener('input', e => {
    if (!pieCur || !pieCur.photo) return;
    const v = Number(e.target.value);
    pieCur.photo.offsetX = v;
    const valEl = document.getElementById('pie-photo-ox-val');
    if (valEl) valEl.textContent = v + 'px';
    pieDrawFill();
  });

  document.getElementById('pie-photo-oy')?.addEventListener('input', e => {
    if (!pieCur || !pieCur.photo) return;
    const v = Number(e.target.value);
    pieCur.photo.offsetY = v;
    const valEl = document.getElementById('pie-photo-oy-val');
    if (valEl) valEl.textContent = v + 'px';
    pieDrawFill();
  });

  // Radius Slider
  document.getElementById('pie-photo-r')?.addEventListener('input', e => {
    if (!pieCur || !pieCur.photo) return;
    const v = Number(e.target.value);
    pieCur.photo.r = v;
    const valEl = document.getElementById('pie-photo-r-val');
    if (valEl) valEl.textContent = v + 'px';
    pieDrawFill();
  });

  // Clipboard Paste Support for Images
  window.addEventListener('paste', e => {
    if (currentPage !== 'image-editor') return;
    const items = e.clipboardData?.items || [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          pieProcessImageFile(file, optimizedDataUrl => {
            if (!pieCur) return;
            if (!pieCur.photo) {
              pieCur.photo = { x: 640, y: 120, w: 560, h: 1070, r: 24, rotate: 0, scale: 1.0, offsetX: 0, offsetY: 0 };
            }
            pieCur.photo.img = optimizedDataUrl;
            pieUpdatePhotoControls();
            pieDrawFill();
            showToast('วางรูปภาพสำเร็จ 🖼️');
          });
        }
      }
    }
  });

  document.getElementById('pie-expPng')?.addEventListener('click', () => pieExportImg('image/png'));
  document.getElementById('pie-expJpg')?.addEventListener('click', () => pieExportImg('image/jpeg'));

  const sBtn = document.getElementById('pie-expShare');
  if (sBtn && navigator.canShare) {
    sBtn.style.display = 'inline-flex';
    sBtn.onclick = () => pieExportImg('image/png', true);
  }

  // Initialize interactive dragging on preview canvas
  pieInitPcvEvents();

  // Zoom & Pan buttons
  document.getElementById('pieBtnZoomIn')?.addEventListener('click', pieZoomIn);
  document.getElementById('pieBtnZoomOut')?.addEventListener('click', pieZoomOut);
  document.getElementById('pieBtnZoomFit')?.addEventListener('click', pieZoomFit);
  document.getElementById('pieBtnZoomVal')?.addEventListener('click', () => {
    if (pieIsZoomFit) pieApplyZoom(1.5, false);
    else pieZoomFit();
  });
  document.getElementById('pieToolSelect')?.addEventListener('click', () => pieSetTool('select'));
  document.getElementById('pieToolPan')?.addEventListener('click', () => pieSetTool('pan'));

  document.getElementById('pieBtnUndoStage')?.addEventListener('click', pieUndo);
  document.getElementById('pieBtnRedoStage')?.addEventListener('click', pieRedo);
  document.getElementById('pieBtnResetEditor')?.addEventListener('click', () => {
    if (!pieInitialEdState) return;
    if (confirm('คืนค่าเริ่มต้นของ Template นี้ทั้งหมด?')) {
      pieRestoreState(pieInitialEdState); pieResetHistory(); showToast('คืนค่าเริ่มต้นแล้ว');
    }
  });

  document.getElementById('pieBtnGoFill')?.addEventListener('click', () => {
    if (!pieEd || !pieEd.fields.length) { showToast('เพิ่มช่องข้อความอย่างน้อย 1 ช่อง'); return; }
    const name = document.getElementById('pie-tname')?.value.trim() || 'Template ของฉัน';
    const myName = (typeof getMyName === 'function' ? getMyName() : '') || 'ราคุ';
    const t = {
      id: pieEd.id || 'c' + Date.now().toString(36),
      name,
      layout: pieEd.layout || 'split',
      builtin: false,
      theme: pieEd.theme ? JSON.parse(JSON.stringify(pieEd.theme)) : null,
      photo: pieEd.photo ? JSON.parse(JSON.stringify(pieEd.photo)) : null,
      bg: pieEd.bg || '',
      fields: JSON.parse(JSON.stringify(pieEd.fields)),
      author: pieEd.author || myName,
      updatedAt: new Date().toISOString()
    };
    const i = pieCustom.findIndex(z => z.id === t.id);
    if (i >= 0) pieCustom[i] = t; else pieCustom.push(t);
    piePersist(); pieOpenFill(t); showToast('สลับมาหน้ากรอกข้อมูลตารางงาน');
  });

  // Editor sidebar buttons
  document.querySelectorAll('[data-pieadd]').forEach(b => {
    b.addEventListener('click', () => pieAddField(b.dataset.pieadd));
  });

  document.getElementById('pie-addall7')?.addEventListener('click', () => {
    if (!pieEd) return;
    const k = document.getElementById('pie-addall')?.value || 'dayname', gap = 1090 / 7, newIds = [];
    for (let i = 0; i < 7; i++) {
      const f = pieFD(k, i, 80, 100 + i * gap, k === 'body' ? 700 : 260, k === 'body' ? gap - 10 : Math.min(50, gap - 10), k === 'body' ? 24 : 28, '#222222', 'left', k === 'dayname' ? '700' : '400');
      pieEd.fields.push(f); newIds.push(f.id);
    }
    pieEd.sels = newIds; piePushHistory(); pieProps(); pieRedraw();
  });

  document.getElementById('pieBtnSelAll')?.addEventListener('click', () => {
    if (!pieEd) return; pieEd.sels = pieEd.fields.map(f => f.id); pieProps(); pieRedraw(); showToast(`เลือกทุกช่อง (${pieEd.sels.length} ช่อง)`);
  });
  document.getElementById('pieBtnSelDay')?.addEventListener('click', () => {
    if (!pieEd) return; pieEd.sels = pieEd.fields.filter(f => f.kind === 'dayname').map(f => f.id); pieProps(); pieRedraw(); showToast(`เลือกชื่อวัน (${pieEd.sels.length} ช่อง)`);
  });
  document.getElementById('pieBtnSelDate')?.addEventListener('click', () => {
    if (!pieEd) return; pieEd.sels = pieEd.fields.filter(f => f.kind === 'date').map(f => f.id); pieProps(); pieRedraw(); showToast(`เลือกวันที่ (${pieEd.sels.length} ช่อง)`);
  });
  document.getElementById('pieBtnSelBody')?.addEventListener('click', () => {
    if (!pieEd) return; pieEd.sels = pieEd.fields.filter(f => f.kind === 'body').map(f => f.id); pieProps(); pieRedraw(); showToast(`เลือกรายละเอียดงาน (${pieEd.sels.length} ช่อง)`);
  });

  document.getElementById('pie-bgfile')?.addEventListener('change', e => pieLoadBgFile(e.target.files[0]));
  document.getElementById('pie-autodet')?.addEventListener('click', () => pieAutoDetect(false));

  document.getElementById('pie-esave')?.addEventListener('click', () => {
    if (!pieEd || !pieEd.fields.length) { showToast('เพิ่มช่องข้อความอย่างน้อย 1 ช่องก่อนบันทึก'); return; }
    const name = document.getElementById('pie-tname')?.value.trim() || 'Template ของฉัน';
    const myName = (typeof getMyName === 'function' ? getMyName() : '') || 'ราคุ';
    const t = {
      id: pieEd.id || 'c' + Date.now().toString(36),
      name,
      layout: pieEd.layout || 'split',
      builtin: false,
      theme: pieEd.theme ? JSON.parse(JSON.stringify(pieEd.theme)) : null,
      photo: pieEd.photo ? JSON.parse(JSON.stringify(pieEd.photo)) : null,
      bg: pieEd.bg || '',
      fields: JSON.parse(JSON.stringify(pieEd.fields)),
      author: pieEd.author || myName,
      updatedAt: new Date().toISOString()
    };
    const prev = pieCustom.slice(); const i = pieCustom.findIndex(z => z.id === t.id);
    if (i >= 0) pieCustom[i] = t; else pieCustom.push(t);
    if (!piePersist()) { pieCustom = prev; return; }
    showToast('บันทึก Template สู่ทีมแล้ว ☁️'); pieBuildGallery(); pieGo('gallery');
  });

  document.getElementById('pie-ecancel')?.addEventListener('click', () => { pieBuildGallery(); pieGo('gallery'); });

  // Canvas Viewport Pan Events
  const ecvWrapEl = document.getElementById('pieEcvWrap');
  if (ecvWrapEl) {
    ecvWrapEl.addEventListener('wheel', e => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) pieZoomIn(); else pieZoomOut();
      }
    }, { passive: false });

    ecvWrapEl.addEventListener('pointerdown', e => {
      const isMiddle = e.button === 1;
      const shouldPan = pieActiveTool === 'pan' || pieIsSpacePressed || isMiddle;
      if (shouldPan) {
        pieIsPanning = true;
        piePanStart = { x: e.clientX, y: e.clientY, scrollL: ecvWrapEl.scrollLeft, scrollT: ecvWrapEl.scrollTop };
        ecvWrapEl.setPointerCapture(e.pointerId);
        pieUpdateCursor();
        e.preventDefault(); e.stopPropagation();
      }
    });

    ecvWrapEl.addEventListener('pointermove', e => {
      if (pieIsPanning) {
        const dx = e.clientX - piePanStart.x;
        const dy = e.clientY - piePanStart.y;
        ecvWrapEl.scrollLeft = piePanStart.scrollL - dx;
        ecvWrapEl.scrollTop = piePanStart.scrollT - dy;
        e.preventDefault(); e.stopPropagation();
      }
    });

    const stopPan = () => {
      if (pieIsPanning) { pieIsPanning = false; pieUpdateCursor(); }
    };
    ecvWrapEl.addEventListener('pointerup', stopPan);
    ecvWrapEl.addEventListener('pointercancel', stopPan);
  }

  // Canvas Interaction Events (Pointer Drag, Resize, Marquee)
  const ec = document.getElementById('pie-ecv');
  if (ec) {
    ec.onpointerdown = e => {
      if (pieActiveTool === 'pan' || pieIsSpacePressed || e.button === 1) return;
      const p = piePt(e); let hit = null;
      if (pieEd.sels.length === 1) {
        const s = pieSelF();
        const tol = e.pointerType === 'touch' ? 70 : 28;
        if (s && p.x >= s.x + s.w - tol && p.x <= s.x + s.w + tol && p.y >= s.y + s.h - tol && p.y <= s.y + s.h + tol) {
          pieDrag = { mode: 'resize', f: s }; ec.setPointerCapture(e.pointerId); return;
        }
      }
      for (let i = pieEd.fields.length - 1; i >= 0; i--) {
        const f = pieEd.fields[i];
        if (p.x >= f.x && p.x <= f.x + f.w && p.y >= f.y && p.y <= f.y + f.h) { hit = f; break; }
      }
      if (hit) {
        if (e.shiftKey || e.ctrlKey) {
          if (pieIsSel(hit.id)) pieEd.sels = pieEd.sels.filter(id => id !== hit.id);
          else pieEd.sels.push(hit.id);
        } else if (!pieIsSel(hit.id)) {
          pieEd.sels = [hit.id];
        }
        const curSelFs = pieSelFs();
        pieDrag = { mode: 'move', startP: p, origPos: curSelFs.map(f => ({ id: f.id, x: f.x, y: f.y })) };
        ec.setPointerCapture(e.pointerId);
      } else {
        if (!e.shiftKey && !e.ctrlKey) pieEd.sels = [];
        pieDrag = { mode: 'marquee', x0: p.x, y0: p.y, x1: p.x, y1: p.y, startSels: pieEd.sels.slice() };
        ec.setPointerCapture(e.pointerId);
      }
      pieProps(); pieRedraw();
    };

    ec.onpointermove = e => {
      if (!pieDrag) return;
      const p = piePt(e);
      if (pieDrag.mode === 'move') {
        const dx = p.x - pieDrag.startP.x, dy = p.y - pieDrag.startP.y;
        pieDrag.origPos.forEach(item => {
          const f = pieEd.fields.find(z => z.id === item.id);
          if (f) {
            f.x = Math.round(Math.min(Math.max(0, item.x + dx), PIE_S - f.w));
            f.y = Math.round(Math.min(Math.max(0, item.y + dy), PIE_S - f.h));
          }
        });
        pieRedraw();
      } else if (pieDrag.mode === 'resize') {
        const f = pieDrag.f;
        f.w = Math.round(Math.max(40, Math.min(PIE_S - f.x, p.x - f.x)));
        f.h = Math.round(Math.max(24, Math.min(PIE_S - f.y, p.y - f.y)));
        pieRedraw();
      } else if (pieDrag.mode === 'marquee') {
        pieDrag.x1 = p.x; pieDrag.y1 = p.y;
        const mx = Math.min(pieDrag.x0, pieDrag.x1), my = Math.min(pieDrag.y0, pieDrag.y1);
        const mw = Math.abs(pieDrag.x1 - pieDrag.x0), mh = Math.abs(pieDrag.y1 - pieDrag.y0);
        const inBox = pieEd.fields.filter(f => f.x < mx + mw && f.x + f.w > mx && f.y < my + mh && f.y + f.h > my).map(f => f.id);
        pieEd.sels = Array.from(new Set([...pieDrag.startSels, ...inBox]));
        pieRedraw();
      }
    };

    ec.ondragover = e => e.preventDefault();
    ec.ondrop = e => { e.preventDefault(); pieLoadBgFile(e.dataTransfer.files[0]); };
    ec.onpointerup = ec.onpointercancel = e => {
      if (pieDrag) {
        if (pieDrag.mode === 'marquee') {
          const dist = Math.hypot(pieDrag.x1 - pieDrag.x0, pieDrag.y1 - pieDrag.y0);
          if (dist < 5 && !e.shiftKey && !e.ctrlKey) pieEd.sels = [];
        } else if (pieDrag.mode === 'move' || pieDrag.mode === 'resize') {
          piePushHistory();
        }
      }
      pieDrag = null; pieProps(); pieRedraw();
    };
  }

  // Keyboard Shortcuts for Planner Image Editor
  document.addEventListener('keydown', e => {
    const pageEl = document.getElementById('page-image-editor');
    if (!pageEl || !pageEl.classList.contains('active')) return;
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); pieNavBack(); return; }
    if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); pieNavForward(); return; }
    if (e.code === 'Space' && !pieIsSpacePressed) { pieIsSpacePressed = true; pieUpdateCursor(); }

    const isCmd = e.ctrlKey || e.metaKey;
    if (isCmd && (e.key === '=' || e.key === '+')) { e.preventDefault(); pieZoomIn(); return; }
    if (isCmd && (e.key === '-' || e.key === '_')) { e.preventDefault(); pieZoomOut(); return; }
    if (isCmd && e.key === '0') { e.preventDefault(); pieZoomFit(); return; }

    const editorSection = document.getElementById('pie-v-editor');
    if (!editorSection || editorSection.classList.contains('hide')) return;

    if (isCmd && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) pieRedo(); else pieUndo();
      return;
    }
    if (isCmd && e.key.toLowerCase() === 'y') { e.preventDefault(); pieRedo(); return; }
    if (isCmd && e.key.toLowerCase() === 'a') {
      e.preventDefault(); if (!pieEd) return;
      pieEd.sels = pieEd.fields.map(f => f.id); pieProps(); pieRedraw(); showToast(`เลือกทุกช่อง (${pieEd.sels.length} ช่อง)`); return;
    }
    if (e.key === 'Escape') { if (pieEd) { pieEd.sels = []; pieProps(); pieRedraw(); } return; }

    const fs = pieSelFs(); if (!fs.length) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      pieEd.fields = pieEd.fields.filter(z => !pieEd.sels.includes(z.id));
      const count = pieEd.sels.length; pieEd.sels = []; piePushHistory(); pieProps(); pieRedraw(); showToast(`ลบ ${count} ช่องแล้ว`);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      fs.forEach(f => {
        if (e.key === 'ArrowUp') f.y = Math.max(0, f.y - step);
        else if (e.key === 'ArrowDown') f.y = Math.min(PIE_S - f.h, f.y + step);
        else if (e.key === 'ArrowLeft') f.x = Math.max(0, f.x - step);
        else if (e.key === 'ArrowRight') f.x = Math.min(PIE_S - f.w, f.x + step);
      });
      pieRedraw();
      clearTimeout(window._pieNudgeTimer);
      window._pieNudgeTimer = setTimeout(() => piePushHistory(), 300);
    }
  });

  window.addEventListener('keyup', e => {
    if (e.code === 'Space') { pieIsSpacePressed = false; pieUpdateCursor(); }
  });

  document.addEventListener('paste', e => {
    const pageEl = document.getElementById('page-image-editor');
    if (!pageEl || !pageEl.classList.contains('active')) return;
    const it = [...(e.clipboardData && e.clipboardData.items || [])].find(i => i.type.startsWith('image/'));
    if (!it) return;
    const editorSec = document.getElementById('pie-v-editor');
    const galSec = document.getElementById('pie-v-gallery');
    if (galSec && !galSec.classList.contains('hide')) {
      pieOpenEditor({ name: 'Template ใหม่', bg: '', fields: [] }, false);
    } else if (editorSec && editorSec.classList.contains('hide')) return;
    e.preventDefault();
    pieLoadBgFile(it.getAsFile());
  });
}

// Expose globals for inline event handlers
window.pieSyncFromMember = pieSyncFromMember;
window.pieInsertReadySong = pieInsertReadySong;

// Theme Toggle
document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  const btn = document.getElementById('btn-theme-toggle');
  if (btn) btn.textContent = isDark ? '🌙 ธีม' : '☀️ ธีม';
  try { localStorage.setItem('melimel_theme', isDark ? 'light' : 'dark'); } catch(e) {}
});

// Auto-initialize when page loads
function initStandalone() {
  try {
    const savedTheme = localStorage.getItem('melimel_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      const btn = document.getElementById('btn-theme-toggle');
      if (btn) btn.textContent = savedTheme === 'dark' ? '☀️ ธีม' : '🌙 ธีม';
    }
  } catch(e) {}

  if (typeof renderImageEditorPage === 'function') {
    renderImageEditorPage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStandalone);
} else {
  initStandalone();
}
