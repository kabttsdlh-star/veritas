// ===== DATABASE =====
let db = [], verDb = [];
try {
  db = JSON.parse(localStorage.getItem('veritas_db') || '[]');
  verDb = JSON.parse(localStorage.getItem('veritas_ver') || '[]');
} catch(e) {}

function save() {
  try {
    localStorage.setItem('veritas_db', JSON.stringify(db));
    localStorage.setItem('veritas_ver', JSON.stringify(verDb));
    const s = document.getElementById('sync-status');
    s.innerHTML = '<i class="ti ti-circle-check"></i> Data tersimpan';
    s.style.color = '#0F6E56';
  } catch(e) {}
}

// ===== NAVIGASI =====
const TITLES = {
  dashboard: 'Dashboard',
  'input-sppl': 'Input Data SPPL',
  verifikasi: 'Verifikasi Lapangan',
  database: 'Database',
  peta: 'Peta Sebaran',
  sop: 'SOP & Panduan'
};

function showTab(tab) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`page-${tab}`).classList.add('active');
  document.getElementById('topbar-title').textContent = TITLES[tab] || tab;
  if (tab === 'dashboard') updateDashboard();
  if (tab === 'database') { populateFilters(); renderS1(); renderS2(); }
  if (tab === 'verifikasi') { populateVerSelect(); document.getElementById('v-tgl').value = today(); }
  if (tab === 'peta') drawMap();
  // tutup sidebar di mobile
  document.querySelector('.sidebar').classList.remove('open');
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => showTab(btn.dataset.tab));
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open');
});

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ===== SHEET TABS =====
function showSheet(s) {
  document.querySelectorAll('.sheet-tab, .sheet-panel').forEach(el => el.classList.remove('active'));
  document.querySelector(`[onclick="showSheet('${s}')"]`).classList.add('active');
  document.getElementById(`sheet-${s}`).classList.add('active');
}

// ===== CHARTS =====
const charts = {};
function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function updateDashboard() {
  document.getElementById('d-inv').textContent = db.length;
  document.getElementById('d-ver').textContent = verDb.length;
  document.getElementById('d-total').textContent = Math.max(328, db.length);
  document.getElementById('d-kbli').textContent = db.filter(r => r.ketepatan === 'salah' || r.ketepatan === 'perlu-verifikasi').length;

  // Sebaran kecamatan
  const kecMap = {};
  db.forEach(r => { if (r.kecamatan) kecMap[r.kecamatan] = (kecMap[r.kecamatan] || 0) + 1; });
  const kl = Object.keys(kecMap), kv = kl.map(k => kecMap[k]);

  destroyChart('kec');
  charts.kec = new Chart(document.getElementById('cKec'), {
    type: 'bar',
    data: {
      labels: kl.length ? kl : ['Belum ada data'],
      datasets: [{ label: 'SPPL', data: kv.length ? kv : [0], backgroundColor: '#1D9E75', borderRadius: 4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { stepSize: 1, color: '#888780' }, grid: { color: 'rgba(0,0,0,.05)' } },
        x: { ticks: { color: '#888780', font: { size: 9 }, maxRotation: 45 }, grid: { display: false } }
      }
    }
  });

  // Status KBLI donut
  const tepat = db.filter(r => r.ketepatan === 'tepat').length;
  const pver = db.filter(r => r.ketepatan === 'perlu-verifikasi').length;
  const salah = db.filter(r => r.ketepatan === 'salah').length;
  const belum = db.filter(r => !r.ketepatan).length;
  destroyChart('status');
  if (db.length) {
    charts.status = new Chart(document.getElementById('cStatus'), {
      type: 'doughnut',
      data: {
        labels: ['KBLI Tepat', 'Perlu Verifikasi', 'Potensi Salah', 'Belum Dinilai'],
        datasets: [{ data: [tepat, pver, salah, belum], backgroundColor: ['#1D9E75', '#EF9F27', '#E24B4A', '#D3D1C7'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '62%' }
    });
    document.getElementById('leg-status').innerHTML = [
      ['#1D9E75', 'KBLI Tepat', tepat],
      ['#EF9F27', 'Perlu Verifikasi', pver],
      ['#E24B4A', 'Potensi Salah', salah],
      ['#D3D1C7', 'Belum Dinilai', belum]
    ].map(([c, l, v]) => `<span style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span class="legend-dot" style="background:${c}"></span>${l}: <strong>${v}</strong></span>`).join('');
  } else {
    document.getElementById('leg-status').innerHTML = 'Belum ada data inventarisasi.';
  }

  // Skala usaha donut
  const skalaMap = {};
  db.forEach(r => { if (r.skala) skalaMap[r.skala] = (skalaMap[r.skala] || 0) + 1; });
  const sl = Object.keys(skalaMap), sv = sl.map(k => skalaMap[k]);
  const cols = ['#1D9E75', '#9FE1CB', '#EF9F27', '#E24B4A'];
  destroyChart('skala');
  if (sl.length) {
    charts.skala = new Chart(document.getElementById('cSkala'), {
      type: 'doughnut',
      data: { labels: sl, datasets: [{ data: sv, backgroundColor: cols.slice(0, sl.length), borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '55%' }
    });
    document.getElementById('leg-skala').innerHTML = sl.map((l, i) =>
      `<span style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span class="legend-dot" style="background:${cols[i % 4]}"></span>${l}: <strong>${sv[i]}</strong></span>`
    ).join('');
  } else {
    document.getElementById('leg-skala').innerHTML = 'Belum ada data.';
  }

  // Pivot kecamatan
  const maxV = Math.max(...kv, 1);
  const pivotRows = Object.entries(kecMap)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => {
      const w = Math.round(n / maxV * 80);
      return `<tr><td>${k}</td><td style="font-weight:600">${n}</td><td><span class="bar-cell" style="width:${w}px"></span></td></tr>`;
    }).join('');
  document.getElementById('pivot-body').innerHTML = pivotRows || '<tr><td colspan="3" class="empty-cell">Belum ada data.</td></tr>';
}

// ===== INPUT SPPL =====
function simpanInv() {
  const nib = document.getElementById('f-nib').value.trim();
  const nama = document.getElementById('f-nama').value.trim();
  if (!nib || !nama) { alert('NIB dan Nama Usaha wajib diisi!'); return; }

  db.push({
    id: Date.now(), nib, nama,
    kbli: document.getElementById('f-kbli').value.trim(),
    namaKbli: document.getElementById('f-nama-kbli').value.trim(),
    skala: document.getElementById('f-skala').value,
    tanggal: document.getElementById('f-tgl').value,
    kecamatan: document.getElementById('f-kec').value,
    desa: document.getElementById('f-desa').value,
    alamat: document.getElementById('f-alamat').value,
    ketepatan: document.querySelector('input[name="r-kbli"]:checked')?.value || '',
    catatan: document.getElementById('f-catatan').value,
    statusVer: 'Belum diverifikasi'
  });
  save();
  showToast('alert-inv', '✓ Data SPPL berhasil disimpan ke database VERITAS.');
  resetInv();
}

function resetInv() {
  ['f-nib','f-nama','f-kbli','f-nama-kbli','f-desa','f-alamat','f-catatan'].forEach(id => document.getElementById(id).value = '');
  ['f-skala','f-kec'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-tgl').value = today();
  document.querySelectorAll('input[name="r-kbli"]').forEach(r => r.checked = false);
}

// ===== VERIFIKASI =====
function populateVerSelect() {
  const s = document.getElementById('v-nib');
  s.innerHTML = '<option value="">— Pilih NIB / Nama —</option>';
  db.forEach(r => {
    const o = document.createElement('option');
    o.value = r.id;
    o.textContent = `${r.nib || '?'} — ${r.nama}`;
    s.appendChild(o);
  });
}

function simpanVer() {
  const id = document.getElementById('v-nib').value;
  if (!id) { alert('Pilih usaha yang akan diverifikasi!'); return; }
  const risiko = document.getElementById('v-risiko').value;

  const rec = {
    id: Date.now(), spplId: id,
    tglVer: document.getElementById('v-tgl').value,
    petugas: document.getElementById('v-petugas').value,
    metode: document.getElementById('v-metode').value,
    aktif: document.querySelector('input[name="r-aktif"]:checked')?.value || '',
    jenisNyata: document.getElementById('v-jenis').value,
    kbliVer: document.querySelector('input[name="r-kbli-v"]:checked')?.value || '',
    kbliUsulan: document.getElementById('v-kbli-usu').value,
    risiko, rekomendasi: document.getElementById('v-rek').value,
    temuan: document.getElementById('v-temuan').value
  };

  const sppl = db.find(r => r.id == id);
  if (sppl) {
    sppl.statusVer = risiko && risiko.includes('Tinggi') ? 'Perlu tindaklanjut' : 'Sudah diverifikasi';
    sppl.risiko = risiko;
  }
  verDb.push(rec);
  save();
  showToast('alert-ver', '✓ Hasil verifikasi lapangan berhasil disimpan.');
  resetVer();
}

function resetVer() {
  ['v-nib','v-tgl','v-petugas','v-jenis','v-kbli-usu','v-risiko','v-rek','v-temuan'].forEach(id => document.getElementById(id).value = '');
  document.querySelectorAll('input[name="r-aktif"], input[name="r-kbli-v"]').forEach(r => r.checked = false);
}

// ===== DATABASE SHEET 1 =====
function populateFilters() {
  const s = document.getElementById('s1-kec');
  s.innerHTML = '<option value="">Semua kecamatan</option>';
  [...new Set(db.map(r => r.kecamatan).filter(Boolean))].sort().forEach(k => {
    const o = document.createElement('option'); o.value = k; o.textContent = k; s.appendChild(o);
  });
}

function renderS1() {
  const q = (document.getElementById('s1-q').value || '').toLowerCase();
  const fk = document.getElementById('s1-kec').value;
  const fkbli = document.getElementById('s1-kbli-f').value;
  const rows = db.filter(r =>
    (!q || (r.nib + r.nama + (r.kecamatan || '')).toLowerCase().includes(q)) &&
    (!fk || r.kecamatan === fk) &&
    (!fkbli || r.ketepatan === fkbli)
  );
  const kbliLabel = {
    'tepat': '<span class="badge b-ok">Tepat</span>',
    'perlu-verifikasi': '<span class="badge b-warn">Perlu Verifikasi</span>',
    'salah': '<span class="badge b-err">Potensi Salah</span>',
    '': '<span class="badge b-gray">Belum dinilai</span>'
  };
  const verLabel = {
    'Belum diverifikasi': '<span class="badge b-info">Belum</span>',
    'Sudah diverifikasi': '<span class="badge b-ok">Sudah</span>',
    'Perlu tindaklanjut': '<span class="badge b-err">Tindaklanjut</span>'
  };
  document.getElementById('tbody-oss').innerHTML = rows.length
    ? rows.map((r, i) => `<tr>
        <td style="color:#888780">${i + 1}</td>
        <td class="mono">${r.nib || '—'}</td>
        <td>${r.nama}</td>
        <td class="mono">${r.kbli || '—'}</td>
        <td>${r.skala || '—'}</td>
        <td>${r.kecamatan || '—'}</td>
        <td>${r.tanggal || '—'}</td>
        <td>${kbliLabel[r.ketepatan || '']}</td>
        <td>${verLabel[r.statusVer] || '<span class="badge b-info">Belum</span>'}</td>
      </tr>`).join('')
    : '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#888780">Belum ada data. Input melalui tab Input SPPL.</td></tr>';
}

// ===== DATABASE SHEET 2 =====
function renderS2() {
  const q = (document.getElementById('s2-q').value || '').toLowerCase();
  const fr = document.getElementById('s2-risiko').value;
  const rows = verDb.filter(r => {
    const sppl = db.find(d => d.id == r.spplId) || {};
    const text = (sppl.nama || '') + ' ' + (sppl.nib || '') + ' ' + (r.petugas || '');
    return (!q || text.toLowerCase().includes(q)) && (!fr || r.risiko.startsWith(fr));
  });
  const rc = { 'Rendah': 'b-ok', 'Sedang': 'b-warn', 'Tinggi': 'b-err', 'Sangat Tinggi': 'b-err' };
  const kc = { 'Sesuai': 'b-ok', 'Tidak sesuai': 'b-err', 'Perlu kajian': 'b-warn' };
  document.getElementById('tbody-lap').innerHTML = rows.length
    ? rows.map((r, i) => {
        const sppl = db.find(d => d.id == r.spplId) || {};
        const risk = r.risiko ? r.risiko.split(' —')[0] : '—';
        return `<tr>
          <td style="color:#888780">${i + 1}</td>
          <td class="mono">${sppl.nib || '—'}</td>
          <td>${sppl.nama || '—'}</td>
          <td>${sppl.kecamatan || '—'}</td>
          <td>${r.tglVer || '—'}</td>
          <td>${r.petugas || '—'}</td>
          <td><span class="badge ${kc[r.kbliVer] || 'b-gray'}">${r.kbliVer || '—'}</span></td>
          <td>${r.aktif || '—'}</td>
          <td><span class="badge ${rc[risk] || 'b-gray'}">${risk}</span></td>
          <td>${r.rekomendasi || '—'}</td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="10" style="text-align:center;padding:2rem;color:#888780">Belum ada data verifikasi lapangan.</td></tr>';
}

// ===== EXPORT CSV =====
function exportCSV(type) {
  let headers, rows;
  if (type === 'oss') {
    headers = ['NIB','Nama Usaha','KBLI','Uraian KBLI','Skala','Kecamatan','Desa','Alamat','Tanggal SPPL','Status KBLI','Status Verifikasi','Catatan'];
    rows = db.map(r => [r.nib,r.nama,r.kbli,r.namaKbli,r.skala,r.kecamatan,r.desa,r.alamat,r.tanggal,r.ketepatan,r.statusVer,r.catatan]);
  } else {
    headers = ['NIB','Nama Usaha','Kecamatan','Tgl Verifikasi','Petugas','Metode','Aktif','Jenis Nyata','KBLI Sesuai','KBLI Usulan','Risiko','Rekomendasi','Temuan'];
    rows = verDb.map(r => {
      const s = db.find(d => d.id == r.spplId) || {};
      return [s.nib,s.nama,s.kecamatan,r.tglVer,r.petugas,r.metode,r.aktif,r.jenisNyata,r.kbliVer,r.kbliUsulan,r.risiko,r.rekomendasi,r.temuan];
    });
  }
  if (!rows.length) { alert('Belum ada data untuk diekspor.'); return; }
  const csv = [headers, ...rows].map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
  a.download = `VERITAS_${type === 'oss' ? 'Data_SPPL' : 'Verifikasi_Lapangan'}_${today()}.csv`;
  a.click();
}

// ===== PETA =====
const KEC_COORDS = {
  'Kota SoE':       {x:310,y:175},'Amanuban Barat':  {x:230,y:225},'Amanuban Selatan':{x:270,y:275},
  'Amanuban Tengah':{x:310,y:235},'Amanuban Timur':  {x:360,y:205},'Amanatun Selatan':{x:430,y:285},
  'Amanatun Utara': {x:410,y:225},'Batu Putih':      {x:490,y:195},'Boking':          {x:460,y:255},
  'Fatumnasi':      {x:235,y:140},'Fautmolo':        {x:275,y:190},'Ki\'e':           {x:375,y:145},
  'Kolbano':        {x:350,y:305},'Kot\'olin':       {x:325,y:145},'Kuatnana':        {x:205,y:175},
  'Mollo Barat':    {x:165,y:185},'Mollo Selatan':   {x:185,y:225},'Mollo Tengah':    {x:145,y:155},
  'Mollo Utara':    {x:125,y:120},'Oenino':          {x:395,y:175},'Polen':           {x:255,y:158},
  'Santian':        {x:450,y:175},'Toianas':         {x:520,y:235}
};

function drawMap() {
  const kecMap = {};
  db.forEach(r => { if (r.kecamatan) kecMap[r.kecamatan] = (kecMap[r.kecamatan] || 0) + 1; });
  const svg = document.getElementById('map-svg');
  svg.innerHTML = '';

  // background
  const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('width','640'); bg.setAttribute('height','360');
  bg.setAttribute('fill','#E1F5EE'); bg.setAttribute('rx','10'); svg.appendChild(bg);

  const title = document.createElementNS('http://www.w3.org/2000/svg','text');
  title.setAttribute('x','16'); title.setAttribute('y','22');
  title.setAttribute('font-size','11'); title.setAttribute('fill','#0F6E56');
  title.setAttribute('font-weight','600'); title.setAttribute('font-family','Plus Jakarta Sans, sans-serif');
  title.textContent = 'Kab. Timor Tengah Selatan — Sebaran SPPL Terinventarisasi';
  svg.appendChild(title);

  function getColor(n) {
    if (!n) return '#c8edd8';
    if (n <= 3) return '#9FE1CB';
    if (n <= 7) return '#1D9E75';
    return '#085041';
  }
  function getTextColor(n) { return n > 3 ? '#fff' : '#085041'; }

  const detail = [];
  Object.entries(KEC_COORDS).forEach(([kec, {x, y}]) => {
    const n = kecMap[kec] || 0;
    const r = n > 0 ? Math.max(22, Math.min(36, 18 + n * 3)) : 18;
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('transform', `translate(${x},${y})`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('cx','0'); circle.setAttribute('cy','0'); circle.setAttribute('r', r);
    circle.setAttribute('fill', getColor(n));
    circle.setAttribute('stroke', 'rgba(0,100,60,.2)'); circle.setAttribute('stroke-width','0.5');
    g.appendChild(circle);

    const num = document.createElementNS('http://www.w3.org/2000/svg','text');
    num.setAttribute('text-anchor','middle'); num.setAttribute('dominant-baseline','central');
    num.setAttribute('font-size', n > 0 ? '11' : '9'); num.setAttribute('fill', getTextColor(n));
    num.setAttribute('font-weight', n > 0 ? '600' : '400');
    num.setAttribute('font-family', 'DM Mono, monospace');
    num.textContent = n > 0 ? n : '·';
    g.appendChild(num);

    const kecShort = kec.length > 10 ? kec.slice(0, 10) + '…' : kec;
    const label = document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('text-anchor','middle'); label.setAttribute('y', r + 11);
    label.setAttribute('font-size','8'); label.setAttribute('fill','#0F6E56');
    label.setAttribute('font-family','Plus Jakarta Sans, sans-serif');
    label.textContent = kecShort;
    g.appendChild(label);
    svg.appendChild(g);
    detail.push({ kec, n });
  });

  // kec cards
  const el = document.getElementById('kec-cards');
  el.innerHTML = detail.sort((a,b) => b.n - a.n).map(({kec, n}) => {
    const cls = n > 7 ? 'b-err' : n > 3 ? 'b-warn' : n > 0 ? 'b-ok' : 'b-gray';
    return `<div class="kec-card-item"><span>${kec}</span><span class="badge ${cls}">${n} SPPL</span></div>`;
  }).join('');
}

// ===== TOAST =====
function showToast(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3500);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('f-tgl').value = today();
  document.getElementById('v-tgl').value = today();
  updateDashboard();
});
