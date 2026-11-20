// Leonida Platinum — GTA VI trophy guide & tracker.
// Loads app/data/trophies.json, renders the checklist, guide pane, roadmap and
// missables views, and keeps progress in localStorage with export / import.
const PROGRESS_KEY = 'gta6-leonida-progress-v1';
const COUNTS_KEY = 'gta6-leonida-counts-v1';
const SETTINGS_KEY = 'gta6-leonida-settings-v1';
const DEMO_EARNED = [
  'Just Like Paradise', 'Paradise Lost', 'Trust', 'Master of None',
  'Baited My Tackle', 'Stick Fiddler', 'Whip It Good', 'In The Beginning…',
  'Treat Yo Self', 'Ten Pin', 'One Last Thing', 'You WAiNKer!',
  'Cunning Stunts',
];

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourceList = doc.sourceList;
const byName = new Map(trophies.map((t) => [t.name, t]));
const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const detailEl = $('detailPane');

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

let earned = new Set(loadJson(PROGRESS_KEY, []).filter((n) => byName.has(n)));
let counts = loadJson(COUNTS_KEY, {});
let settings = Object.assign(
  { spoilers: false, hideEarned: false, grade: 'all', kind: 'all', search: '' },
  loadJson(SETTINGS_KEY, {}),
);
let view = params.get('view') || 'tracker';
let selected = params.get('select') || null;

// Demo seeding for screenshots: ?demo=1 earns a fixed 13 trophies.
if (params.get('demo') === '1' && earned.size === 0) {
  earned = new Set(DEMO_EARNED.filter((n) => byName.has(n)));
  saveProgress();
}
if (params.get('spoilers') === 'on') settings.spoilers = true;
if (params.get('kind')) settings.kind = params.get('kind');
if (!selected && params.get('demo') === '1') selected = 'Positive Mental Attitude';

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
  $('saveState').textContent = 'Saved in this browser — ' + new Date().toLocaleTimeString();
}
function saveCounts() {
  localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
}
function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function isSpoilerHidden(t) {
  return settings.spoilers && t.kind === 'story' && !earned.has(t.name);
}
function gradeLabel(g) {
  return g.charAt(0).toUpperCase() + g.slice(1);
}
function kindLabel(k) {
  return { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', side: 'Side quest', robbery: 'Robbery', exploration: 'Exploration', money: 'Money', completion: 'Completion', platinum: 'Platinum' }[k] || k;
}

function filteredTrophies() {
  const q = settings.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (settings.kind === 'story' && t.kind !== 'story') return false;
    if (settings.kind === 'missable' && !t.missable) return false;
    if (settings.kind === 'collectibles' && t.kind !== 'collectibles') return false;
    if (settings.kind === 'activities' && t.kind !== 'activities') return false;
    if (settings.kind === 'online') return false;
    if (settings.grade !== 'all' && t.grade !== settings.grade) return false;
    if (settings.hideEarned && earned.has(t.name)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const name of earned) {
    const t = byName.get(name);
    if (t) byGrade[t.grade] += 1;
  }
  $('earnedCount').textContent = n;
  $('progressFill').style.width = (n / total * 100).toFixed(1) + '%';
  $('progressBar').setAttribute('aria-valuenow', String(n));
  $('progressDetail').textContent =
    byGrade.platinum + ' platinum · ' + byGrade.gold + ' gold · ' + byGrade.silver + ' silver · ' + byGrade.bronze + ' bronze';
}

function kindCounts() {
  return {
    all: trophies.length,
    story: trophies.filter((t) => t.kind === 'story').length,
    missable: trophies.filter((t) => t.missable).length,
    collectibles: trophies.filter((t) => t.kind === 'collectibles').length,
    activities: trophies.filter((t) => t.kind === 'activities').length,
    online: 0,
  };
}

function renderKindFilters() {
  const counts = kindCounts();
  const wrap = $('kindFilters');
  wrap.replaceChildren();
  for (const [key, label] of [['all', 'All'], ['story', 'Story'], ['missable', 'Missable'], ['collectibles', 'Collectibles'], ['activities', 'Activities'], ['online', 'Online']]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'kind-btn' + (settings.kind === key ? ' active' : '');
    b.textContent = label + ' ';
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = '(' + counts[key] + ')';
    b.append(n);
    b.addEventListener('click', () => { settings.kind = key; saveSettings(); renderAll(); });
    wrap.append(b);
  }
}

function tagEl(text, cls) {
  const s = document.createElement('span');
  s.className = 'tag ' + cls;
  s.textContent = text;
  return s;
}

function trophyRow(t) {
  const li = document.createElement('li');
  li.className = 'trophy-row' + (earned.has(t.name) ? ' earned' : '') + (selected === t.name ? ' selected' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', 'Earned: ' + t.name);
  box.addEventListener('click', (e) => e.stopPropagation());
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name); else earned.delete(t.name);
    saveProgress();
    renderAll();
  });
  li.append(box);
  const mid = document.createElement('div');
  const hidden = isSpoilerHidden(t);
  const nameEl = document.createElement('div');
  nameEl.className = 'trophy-name' + (hidden ? ' spoiler-mask' : '');
  nameEl.textContent = hidden ? 'Hidden story trophy — earn it to reveal' : t.name;
  mid.append(nameEl);
  const descEl = document.createElement('div');
  descEl.className = 'trophy-desc';
  descEl.textContent = hidden ? 'Story trophy hidden by the spoiler setting.' : t.description;
  mid.append(descEl);
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  if (t.kind !== t.grade) tags.append(tagEl(kindLabel(t.kind), 'kind'));
  if (t.missable) tags.append(tagEl('⚠ Missable', 'missable'));
  if (t.hidden) tags.append(tagEl('Hidden on PSN', 'hidden-flag'));
  mid.append(tags);
  if (t.target) {
    const c = document.createElement('div');
    c.className = 'trophy-count';
    c.textContent = 'Progress: ';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(t.target);
    input.value = String(counts[t.name] ?? 0);
    input.setAttribute('aria-label', 'Progress count for ' + t.name);
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('change', () => {
      const v = Math.max(0, Math.min(t.target, Number(input.value) || 0));
      counts[t.name] = v;
      saveCounts();
      if (v >= t.target && !earned.has(t.name)) {
        earned.add(t.name);
        saveProgress();
      }
      renderAll();
    });
    c.append(input);
    const of = document.createElement('span');
    of.textContent = ' / ' + t.target.toLocaleString();
    c.append(of);
    mid.append(c);
  }
  li.append(mid);
  const gradeCol = document.createElement('div');
  gradeCol.className = 'grade-col';
  gradeCol.append(tagEl(t.grade === 'platinum' ? '◆ PLAT' : t.grade === 'gold' ? '● GOLD' : t.grade === 'silver' ? '● SILVER' : '● BRONZE', 'grade-' + t.grade));
  li.append(gradeCol);
  li.addEventListener('click', () => { selected = t.name; renderAll(); });
  return li;
}

function renderList() {
  const shown = filteredTrophies();
  listEl.replaceChildren();
  for (const t of shown) listEl.append(trophyRow(t));
  $('filterState').textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies';
  $('listHint').textContent = shown.length === 0
    ? 'No trophies match these filters. Try clearing the search or choosing another kind.'
    : 'Click a trophy to read its guide and sources. Tick the box when you earn it.';
}

function renderDetail() {
  detailEl.replaceChildren();
  const t = selected ? byName.get(selected) : null;
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Select a trophy on the left to read its guide and sources.';
    detailEl.append(p);
    return;
  }
  if (isSpoilerHidden(t)) {
    const h = document.createElement('h2');
    h.textContent = 'Hidden story trophy';
    detailEl.append(h);
    const p = document.createElement('p');
    p.textContent = 'Spoiler-safe mode is on, and you have not earned this story trophy yet, so its name, description and guide stay hidden. Earn it in the game (or tick its box) to reveal it, or switch the spoiler setting off.';
    detailEl.append(p);
    return;
  }
  const h = document.createElement('h2');
  h.textContent = t.name;
  detailEl.append(h);
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  tags.append(tagEl(gradeLabel(t.grade), 'grade-' + t.grade));
  tags.append(tagEl(kindLabel(t.kind), 'kind'));
  if (t.missable) tags.append(tagEl('⚠ Missable', 'missable'));
  if (t.hidden) tags.append(tagEl('Hidden on PSN', 'hidden-flag'));
  detailEl.append(tags);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = 'Official description: “' + t.description + '”';
  detailEl.append(official);
  if (t.missable) {
    const banner = document.createElement('p');
    banner.className = 'missable-banner';
    banner.textContent = '⚠ Possibly missable — see the guide below before you leave Chapter 1.';
    detailEl.append(banner);
  }
  const meta = document.createElement('p');
  meta.className = 'meta-line';
  meta.textContent = 'Roadmap stage ' + t.roadmap + ' of 5' + (t.target ? ' · Target: ' + t.target.toLocaleString() + (t.count ? ' (of ' + t.count.toLocaleString() + ' in the game)' : '') : '') + (t.count && !t.target ? ' · ' + t.count.toLocaleString() + ' in the game' : '');
  detailEl.append(meta);
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = t.guide;
  detailEl.append(guide);
  const earn = document.createElement('button');
  earn.type = 'button';
  earn.className = 'earn-btn' + (earned.has(t.name) ? ' earned' : '');
  earn.textContent = earned.has(t.name) ? '✓ Earned — click to unmark' : 'Mark as earned';
  earn.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name); else earned.add(t.name);
    saveProgress();
    renderAll();
  });
  detailEl.append(earn);
  const box = document.createElement('div');
  box.className = 'sources-box';
  const sh = document.createElement('h3');
  sh.textContent = 'Sources for this guide';
  box.append(sh);
  const ul = document.createElement('ul');
  for (const key of t.sources) {
    const s = sourceList[key];
    if (!s) continue;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    ul.append(li);
  }
  const note = document.createElement('li');
  note.textContent = 'Official name, description and grade: the PlayStation 5 list as Exophase and PSNProfiles published it.';
  ul.append(note);
  box.append(ul);
  detailEl.append(box);
}

function renderRoadmap() {
  const list = $('roadmapList');
  list.replaceChildren();
  for (const stage of doc.roadmap) {
    const li = document.createElement('li');
    const hours = document.createElement('span');
    hours.className = 'stage-hours';
    hours.textContent = '≈ ' + stage.hours + ' hours';
    li.append(hours);
    const title = document.createElement('strong');
    title.textContent = stage.title;
    li.append(title);
    const p = document.createElement('p');
    p.textContent = stage.text;
    li.append(p);
    const stageTrophies = trophies.filter((t) => t.roadmap === stage.stage);
    const done = stageTrophies.filter((t) => earned.has(t.name)).length;
    const prog = document.createElement('p');
    prog.className = 'meta-line';
    prog.textContent = done + ' of ' + stageTrophies.length + ' stage trophies earned';
    li.append(prog);
    list.append(li);
  }
  const rt = $('roadmapTrophies');
  rt.replaceChildren();
  const order = [...trophies].sort((a, b) => a.roadmap - b.roadmap || a.id - b.id);
  for (const t of order) {
    const li = document.createElement('li');
    const tag = document.createElement('span');
    tag.className = 'stage-tag';
    tag.textContent = 'Stage ' + t.roadmap + ' · ';
    li.append(tag);
    const mark = document.createElement('span');
    mark.textContent = (earned.has(t.name) ? '✓ ' : '○ ') + (isSpoilerHidden(t) ? 'Hidden story trophy' : t.name) + ' — ' + gradeLabel(t.grade) + (t.missable ? ' — ⚠ Missable' : '');
    li.append(mark);
    rt.append(li);
  }
}

function renderMissables() {
  const list = $('missableList');
  list.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) list.append(trophyRow(t));
  $('missableCount').textContent = String(trophies.filter((x) => x.missable).length);
}

function renderSources() {
  const ul = $('sourceList');
  ul.replaceChildren();
  for (const key of Object.keys(sourceList)) {
    const s = sourceList[key];
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    ul.append(li);
  }
}

function showView(next) {
  view = next;
  document.querySelector('.layout').classList.toggle('single-col', view !== 'tracker');
  for (const v of ['tracker', 'roadmap', 'missables', 'sources']) {
    $('view' + v.charAt(0).toUpperCase() + v.slice(1)).classList.toggle('hidden', v !== view);
    $('tab' + v.charAt(0).toUpperCase() + v.slice(1)).classList.toggle('active', v === view);
  }
  $('trackerControls').classList.toggle('hidden', view !== 'tracker');
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missables') renderMissables();
  if (view === 'sources') renderSources();
}

function renderAll() {
  renderProgress();
  renderKindFilters();
  renderList();
  renderDetail();
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missables') renderMissables();
}

function exportProgress() {
  const payload = {
    app: 'leonida-platinum-gta6-trophies',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned],
    counts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    earned = new Set(names.filter((n) => byName.has(n)));
    if (data && typeof data === 'object' && data.counts) counts = data.counts;
    saveProgress();
    saveCounts();
    renderAll();
    $('saveState').textContent = 'Imported ' + earned.size + ' earned trophies';
  } catch {
    $('saveState').textContent = 'Import failed: that file is not a progress export from this guide.';
  }
}

$('search').value = settings.search;
$('search').addEventListener('input', (e) => { settings.search = e.target.value; saveSettings(); renderList(); });
$('gradeFilter').value = settings.grade;
$('gradeFilter').addEventListener('change', (e) => { settings.grade = e.target.value; saveSettings(); renderAll(); });
$('hideEarned').checked = settings.hideEarned;
$('hideEarned').addEventListener('change', (e) => { settings.hideEarned = e.target.checked; saveSettings(); renderAll(); });
$('spoilerToggle').checked = settings.spoilers;
$('spoilerToggle').addEventListener('change', (e) => { settings.spoilers = e.target.checked; saveSettings(); renderAll(); });
$('exportBtn').addEventListener('click', exportProgress);
$('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) importProgress(file);
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!window.confirm('Reset all progress? Your earned trophies and counters will be cleared.')) return;
  earned = new Set();
  counts = {};
  saveProgress();
  saveCounts();
  renderAll();
});
for (const v of ['tracker', 'roadmap', 'missables', 'sources']) {
  $('tab' + v.charAt(0).toUpperCase() + v.slice(1)).addEventListener('click', () => showView(v));
}

renderAll();
showView(['tracker', 'roadmap', 'missables', 'sources'].includes(view) ? view : 'tracker');
