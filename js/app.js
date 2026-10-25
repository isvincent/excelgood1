/* Excel 函數動畫教室 — hub logic */
(() => {
"use strict";
const F = window.FUNCS || [];
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const K = "xlfx-"; // localStorage namespace
const store = {
  get(k, d) { try { const v = localStorage.getItem(K + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- categories & i18n ---------- */
const CATS = {
  lookup:  {e:"🔎", c:["#2563eb","#06b6d4"], zh:"查找與參照", en:"Lookup & Reference"},
  dynamic: {e:"🌊", c:["#7c3aed","#ec4899"], zh:"動態陣列",   en:"Dynamic Arrays"},
  shape:   {e:"🧱", c:["#ea580c","#f59e0b"], zh:"陣列重組",   en:"Array Shaping"},
  text:    {e:"🔤", c:["#059669","#84cc16"], zh:"文字處理",   en:"Text"},
  math:    {e:"🧮", c:["#dc2626","#f97316"], zh:"數學統計",   en:"Math & Stats"},
  logic:   {e:"🧠", c:["#0284c7","#8b5cf6"], zh:"邏輯與名稱", en:"Logic & Names"},
  date:    {e:"📅", c:["#db2777","#f43f5e"], zh:"日期與時間", en:"Date & Time"}
};
const T = {
  zh: {}, // zh strings live in the HTML
  en: {
    skip:"Skip to functions", title:"Excel Function Video Studio", subtitle:"39 narrated 9:16 lessons", searchPh:"Search functions, uses, keywords… (press /)",
    heroA:"Watch & learn: ", heroB:"Excel functions made easy", heroP:"Every video has voice narration by Teacher Wei, line-by-line captions, animated spreadsheet demos and a mini quiz. Pick a function and press play!",
    random:"Random video", continue:"Next unwatched", playGame:"Mini games", stFn:"functions", stCat:"categories", stMin:"minutes", stDone:"watched",
    cats:"Categories", lvAll:"All levels", lv1:"Basic", lv2:"Intermediate", lv3:"Advanced", onlyFav:"Favorites only",
    sortDef:"Default order", sortAz:"Name A→Z", sortLv:"Easy → hard", sortNew:"Unwatched first", empty:"No match — try another keyword!",
    game:"Mini games", gWho:"Guess the function", gQuiz:"Video quiz", gSyn:"Match the syntax", next:"Next ➜",
    foot:"Videos use your browser's built-in voice (Edge / Chrome recommended; a Chinese female voice is chosen automatically). Install as an app to watch offline.",
    settings:"Display & controls", sFull:"Fullscreen", sSound:"Sound effects", sDevice:"Device", sLayout:"Layout", sLang:"Language", sFont:"Font size", sTheme:"Theme",
    on:"On", off:"Off", auto:"Auto", phone:"Phone", tablet:"Tablet", desktop:"Desktop", portrait:"Portrait", landscape:"Landscape",
    fs:"Small", fm:"Standard", fl:"Large", system:"System", light:"Light", dark:"Dark", reset:"↺ Reset", install:"📲 Install app"
  }
};
const U = { // dynamic strings
  zh:{all:"全部", count:n=>`共 ${n} 個函數`, play:"播放", open:"新分頁", watched:"✔ 看過", mins:m=>`約 ${m} 分`, slides:n=>`${n} 張投影片`,
    lv:["","入門","進階","高手"], who:d=>`這個函數的用途是：「${d}」<br>請問它是哪一個函數？`, syn:s=>`下面這個語法屬於哪一個函數？<br><code>${s}</code>`,
    right:"答對了！🎉", wrong:a=>`可惜！正確答案是 ${a}`, watch:"看影片複習 ▶", done:(s,n)=>`本回合結束：${s} / ${n} 分！再玩一次？`, again:"再玩一次 🔁",
    outline:"影片大綱", ver:"適用版本", fav1:"已加入收藏 ❤️", fav0:"已取消收藏", allDone:"全部看完了，太厲害了！🏆", copy:"已複製語法 📋", installed:"可以安裝成 App 囉！"},
  en:{all:"All", count:n=>`${n} functions`, play:"Play", open:"New tab", watched:"✔ Watched", mins:m=>`~${m} min`, slides:n=>`${n} slides`,
    lv:["","Basic","Intermediate","Advanced"], who:d=>`This function: “${d}”<br>Which function is it?`, syn:s=>`Which function has this syntax?<br><code>${s}</code>`,
    right:"Correct! 🎉", wrong:a=>`Not quite — the answer is ${a}`, watch:"Review the video ▶", done:(s,n)=>`Round over: ${s} / ${n}! Play again?`, again:"Play again 🔁",
    outline:"Outline", ver:"Version", fav1:"Added to favorites ❤️", fav0:"Removed from favorites", allDone:"You watched them all! 🏆", copy:"Syntax copied 📋", installed:"Ready to install!"}
};
const zhCache = new Map();
$$("[data-i18n]").forEach(e => zhCache.set(e, e.innerHTML));
const zhPh = $("#q").placeholder;

/* ---------- settings ---------- */
const DEF = {sound:"on", device:"auto", layout:"auto", lang:"zh", font:"m", theme:"system"};
let S = Object.assign({}, DEF, store.get("settings", {}));
const u = () => U[S.lang];
function applySettings() {
  const h = document.documentElement;
  h.dataset.theme = S.theme; h.dataset.device = S.device; h.dataset.layout = S.layout; h.dataset.font = S.font;
  h.lang = S.lang === "en" ? "en" : "zh-Hant";
  try { localStorage.setItem("xlfx-sound", S.sound); } catch (e) {}
  $$("[data-i18n]").forEach(e => { const k = e.dataset.i18n; e.innerHTML = S.lang === "en" && T.en[k] ? T.en[k] : zhCache.get(e); });
  $("#q").placeholder = S.lang === "en" ? T.en.searchPh : zhPh;
  document.title = S.lang === "en" ? "Excel Function Video Studio" : "Excel 函數動畫教室";
  $$(".seg[data-set]").forEach(g => {
    const k = g.dataset.set, v = k === "full" ? (document.fullscreenElement ? "on" : "off") : S[k];
    g.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.v === v));
  });
  store.set("settings", S);
}
$$(".seg[data-set]").forEach(g => g.addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const k = g.dataset.set, v = b.dataset.v;
  if (k === "full") {
    if (v === "on" && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => toast("⚠️ Fullscreen blocked"));
    if (v === "off" && document.fullscreenElement) document.exitFullscreen?.();
  } else S[k] = v;
  applySettings(); sfx.click();
  if (k === "lang") { renderCats(); render(); newRound(); }
}));
document.addEventListener("fullscreenchange", applySettings);
$("#bSet").onclick = () => { openModal("#sp"); sfx.open(); };
$("#spClose").onclick = () => closeModal("#sp");
$("#spReset").onclick = () => { S = Object.assign({}, DEF); applySettings(); renderCats(); render(); sfx.ok(); };

/* ---------- sound (WebAudio synth, no files) ---------- */
let AC = null;
function tone(f, d = .12, type = "sine", v = .07, f2) {
  if (S.sound !== "on") return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02);
  } catch (e) {}
}
const sfx = {
  click: () => tone(880, .06, "triangle", .05),
  hover: () => tone(1320, .03, "sine", .02),
  open: () => { tone(440, .1, "sine", .06, 880); },
  close: () => tone(700, .1, "sine", .05, 350),
  ok: () => { tone(523, .1); setTimeout(() => tone(659, .1), 90); setTimeout(() => tone(784, .2), 180); },
  no: () => tone(200, .3, "sawtooth", .05, 120),
  dice: () => { for (let i = 0; i < 6; i++) setTimeout(() => tone(500 + Math.random() * 700, .05, "square", .03), i * 60); },
  fav: () => tone(660, .15, "sine", .06, 1320)
};

/* ---------- state ---------- */
let favs = store.get("favs", []);
const watched = () => { try { return JSON.parse(localStorage.getItem("xlfx-watched") || "{}"); } catch (e) { return {}; } };
let curCat = "all", curLv = 0, query = "";

/* ---------- categories ---------- */
function renderCats() {
  const counts = {}; F.forEach(f => counts[f.cat] = (counts[f.cat] || 0) + 1);
  const all = `<button class="cat ${curCat === "all" ? "on" : ""}" data-cat="all" style="background:linear-gradient(135deg,#7c3aed,#ec4899,#f59e0b)"><span class="e">🌈</span><b>${u().all}</b><small>${F.length}</small></button>`;
  $("#cats").innerHTML = all + Object.entries(CATS).filter(([k]) => counts[k]).map(([k, c]) =>
    `<button class="cat ${curCat === k ? "on" : ""}" data-cat="${k}" style="background:linear-gradient(135deg,${c.c[0]},${c.c[1]})"><span class="e">${c.e}</span><b>${S.lang === "en" ? c.en : c.zh}</b><small>${counts[k]} ${S.lang === "en" ? "functions" : "個函數"}</small></button>`).join("");
}
$("#cats").addEventListener("click", e => {
  const b = e.target.closest(".cat"); if (!b) return;
  curCat = b.dataset.cat; renderCats(); render(); sfx.click();
  $("#grid").scrollIntoView({behavior: "smooth", block: "start"});
});
$("#lvSeg").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  curLv = +b.dataset.lv; $$("#lvSeg button").forEach(x => x.classList.toggle("on", x === b)); render(); sfx.click();
});
$("#onlyFav").onchange = () => { render(); sfx.click(); };
$("#sort").onchange = () => { render(); sfx.click(); };

/* ---------- search ---------- */
const norm = s => String(s).toLowerCase();
function score(f, q) {
  if (!q) return 1;
  const terms = q.split(/\s+/).filter(Boolean); let s = 0;
  for (const t of terms) {
    let hit = 0;
    if (norm(f.id) === t) hit = 100; else if (norm(f.id).startsWith(t)) hit = 60; else if (norm(f.id).includes(t)) hit = 40;
    else if (norm(f.zh + f.en).includes(t)) hit = 25;
    else if (f.keywords.some(k => norm(k).includes(t))) hit = 20;
    else if (norm(f.desc + f.descEn + CATS[f.cat].zh + CATS[f.cat].en).includes(t)) hit = 12;
    else if (norm(f.syntax + f.titles.join(" ")).includes(t)) hit = 6;
    if (!hit) return 0; s += hit;
  }
  return s;
}
function hl(text, q) {
  let s = esc(text); if (!q) return s;
  q.split(/\s+/).filter(Boolean).forEach(t => {
    const re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    s = s.replace(/(<[^>]*>)|([^<]+)/g, (m, tag, txt) => tag || txt.replace(re, "<mark>$1</mark>"));
  });
  return s;
}
let qT = null;
$("#q").addEventListener("input", e => {
  query = norm(e.target.value.trim()); $("#qClear").hidden = !query;
  clearTimeout(qT); qT = setTimeout(() => { render(); if (query) tone(1000, .03, "sine", .02); }, 120);
});
$("#qClear").onclick = () => { $("#q").value = ""; query = ""; $("#qClear").hidden = true; render(); $("#q").focus(); };
document.addEventListener("keydown", e => {
  if (e.key === "/" && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); $("#q").focus(); }
  if (e.key === "Escape") { if (!$("#pm").hidden) closePlayer(); else if (!$("#sp").hidden) closeModal("#sp"); }
});

/* ---------- cards ---------- */
const decoSVG = `<svg class="dec" viewBox="0 0 300 150" preserveAspectRatio="none"><g fill="#fff">${Array.from({length: 18}, (_, i) => `<rect x="${(i % 6) * 52 + 4}" y="${Math.floor(i / 6) * 50 + 4}" width="46" height="42" rx="6" opacity="${.3 + (i * 7 % 5) / 8}"/>`).join("")}</g></svg>`;
function list() {
  let a = F.map((f, i) => ({f, i, s: score(f, query)})).filter(x => x.s > 0);
  if (curCat !== "all") a = a.filter(x => x.f.cat === curCat);
  if (curLv) a = a.filter(x => x.f.level === curLv);
  if ($("#onlyFav").checked) a = a.filter(x => favs.includes(x.f.id));
  const w = watched(), so = $("#sort").value;
  if (query) a.sort((x, y) => y.s - x.s || x.i - y.i);
  else if (so === "az") a.sort((x, y) => x.f.id.localeCompare(y.f.id));
  else if (so === "lv") a.sort((x, y) => x.f.level - y.f.level || x.i - y.i);
  else if (so === "new") a.sort((x, y) => (!!w[x.f.id]) - (!!w[y.f.id]) || x.i - y.i);
  return a.map(x => x.f);
}
function render() {
  const a = list(), w = watched(), en = S.lang === "en";
  $("#count").textContent = u().count(a.length);
  $("#empty").hidden = a.length > 0;
  $("#grid").innerHTML = a.map((f, i) => {
    const c = CATS[f.cat];
    return `<article class="card" style="animation-delay:${Math.min(i, 12) * 40}ms">
      <div class="cv" data-play="${f.id}" style="background:linear-gradient(135deg,${c.c[0]},${c.c[1]})" role="button" tabindex="0" aria-label="${u().play} ${f.id}">
        ${decoSVG}<span class="big">${f.emoji}</span><span class="nm">${hl(f.id, query)}</span><span class="pl">▶</span>
        ${w[f.id] ? `<span class="dn">${u().watched}</span>` : ""}
      </div>
      <div class="cb">
        <h3>${hl(en ? f.en : f.zh, query)}</h3>
        <p>${hl(en ? f.descEn : f.desc, query)}</p>
        <div class="syn" data-copy="${esc(f.syntax)}" title="copy">${hl(f.syntax, query)}</div>
        <div class="tags"><span class="tg" style="color:${c.c[0]}">${c.e} ${en ? c.en : c.zh}</span><span class="tg">${"⭐".repeat(f.level)} ${u().lv[f.level]}</span><span class="tg">⏱️ ${u().mins(Math.max(1, Math.round(f.secs / 60)))}</span>
          ${en ? "" : f.keywords.slice(0, 3).map(k => `<span class="tg">#${hl(k, query)}</span>`).join("")}</div>
        <div class="acts">
          <button class="btn pri" data-play="${f.id}">▶ ${u().play}</button>
          <a class="btn" href="videos/${f.id}.html" target="_blank" rel="noopener" title="${u().open}" aria-label="${u().open}">↗</a>
          <button class="btn fav ${favs.includes(f.id) ? "on" : ""}" data-fav="${f.id}" aria-label="favorite">${favs.includes(f.id) ? "❤️" : "🤍"}</button>
        </div>
      </div></article>`;
  }).join("");
  updateStats();
}
$("#grid").addEventListener("click", e => {
  const p = e.target.closest("[data-play]"); if (p) { openPlayer(p.dataset.play); return; }
  const fv = e.target.closest("[data-fav]");
  if (fv) {
    const id = fv.dataset.fav; const on = !favs.includes(id);
    favs = on ? [...favs, id] : favs.filter(x => x !== id); store.set("favs", favs);
    fv.classList.toggle("on", on); fv.textContent = on ? "❤️" : "🤍"; sfx.fav(); toast(on ? u().fav1 : u().fav0);
    if (on) burst(e.clientX, e.clientY, 18); if ($("#onlyFav").checked) render(); return;
  }
  const cp = e.target.closest("[data-copy]");
  if (cp) { navigator.clipboard?.writeText(cp.dataset.copy).then(() => { toast(u().copy); sfx.click(); }).catch(() => {}); }
});
$("#grid").addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.dataset.play) { e.preventDefault(); openPlayer(e.target.dataset.play); } });
$("#grid").addEventListener("mouseover", e => { const c = e.target.closest(".card"); if (c && c !== render.lastHover) { render.lastHover = c; sfx.hover(); } });

function updateStats() {
  const w = watched(), done = F.filter(f => w[f.id]).length;
  $("#stFn").textContent = F.length;
  $("#stCat").textContent = new Set(F.map(f => f.cat)).size;
  $("#stMin").textContent = Math.round(F.reduce((a, f) => a + f.secs, 0) / 60);
  $("#stDone").textContent = done;
  $("#ringP").style.strokeDashoffset = 201 * (1 - done / Math.max(1, F.length));
}

/* ---------- modals & player ---------- */
let lastFocus = null;
function openModal(sel) { lastFocus = document.activeElement; $(sel).hidden = false; document.body.style.overflow = "hidden"; $(sel).querySelector("button")?.focus(); }
function closeModal(sel) { $(sel).hidden = true; document.body.style.overflow = ""; sfx.close(); lastFocus?.focus?.(); }
$$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m) m.id === "pm" ? closePlayer() : closeModal("#" + m.id); }));
let curIdx = -1;
function openPlayer(id) {
  const order = list().length ? list() : F; const f = F.find(x => x.id === id); if (!f) return;
  curIdx = order.findIndex(x => x.id === id); openPlayer.order = order;
  $("#pmT").textContent = `${f.emoji} ${f.id} · ${S.lang === "en" ? f.en : f.zh}`;
  $("#pmF").src = `videos/${f.id}.html`; $("#pmOpen").href = `videos/${f.id}.html`;
  $("#pmInfo").innerHTML = `<h4>${f.emoji} ${f.id}</h4><p>${esc(S.lang === "en" ? f.descEn : f.desc)}</p><div class="syn">${esc(f.syntax)}</div>
    <h4 style="margin-top:14px">📑 ${u().outline}</h4><ol>${f.titles.map(t => `<li>${esc(t)}</li>`).join("")}</ol><p class="small">🧩 ${u().ver}：${esc(f.version)}<br>🎞️ ${u().slides(f.slides)} · ⏱️ ${u().mins(Math.max(1, Math.round(f.secs / 60)))}</p>`;
  if ($("#pm").hidden) openModal("#pm"); sfx.open();
  store.set("last", f.id);
}
function closePlayer() { try { $("#pmF").contentWindow.postMessage({xlfx: "pause"}, "*"); } catch (e) {} $("#pmF").src = "about:blank"; closeModal("#pm"); render(); }
$("#pmClose").onclick = closePlayer;
$("#pmPrev").onclick = () => { const o = openPlayer.order; openPlayer(o[(curIdx - 1 + o.length) % o.length].id); };
$("#pmNext").onclick = () => { const o = openPlayer.order; openPlayer(o[(curIdx + 1) % o.length].id); };
addEventListener("message", e => {
  const d = e.data || {};
  if (d.xlfx === "close") closePlayer();
  if (d.xlfx === "done") { updateStats(); confettiRain(); sfx.ok(); if (F.every(f => watched()[f.id])) toast(u().allDone); }
});
$("#bRandom").onclick = () => { sfx.dice(); const a = list().length ? list() : F; openPlayer(a[Math.floor(Math.random() * a.length)].id); };
$("#bContinue").onclick = () => {
  const w = watched(); const last = store.get("last", null);
  let i = last ? F.findIndex(f => f.id === last) : -1;
  const next = F.slice(i + 1).concat(F.slice(0, i + 1)).find(f => !w[f.id]) || F[(i + 1) % F.length];
  sfx.click(); openPlayer(next.id);
};

/* ---------- games ---------- */
let gMode = "who", gN = 0, gScore = 0, gStreak = 0, gAns = null, gPool = [];
const ROUND = 10;
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
function newRound() { gN = 0; gScore = 0; gStreak = 0; gPool = shuffle(F.filter(f => gMode !== "quiz" || f.quiz)); nextQ(); }
function nextQ() {
  $("#gNext").hidden = true; $("#gFb").textContent = "";
  if (gN >= ROUND || !gPool.length) {
    $("#gQ").innerHTML = u().done(gScore, ROUND); $("#gOpts").innerHTML = `<button id="gAgain">${u().again}</button>`;
    $("#gAgain").onclick = () => { sfx.click(); newRound(); }; if (gScore >= 8) confettiRain(); return;
  }
  const f = gPool[gN % gPool.length]; gN++;
  $("#gNum").textContent = `${gN} / ${ROUND}`; $("#gScore").textContent = `⭐ ${gScore}`; $("#gStreak").textContent = `🔥 ${gStreak}`;
  let q, opts, ans;
  if (gMode === "quiz") {
    q = `<b>${f.emoji} ${f.id}</b>　${esc(f.quiz.q)}`; opts = f.quiz.options.map(String); ans = opts[f.quiz.answer];
    gAns = {ans, f, explain: f.quiz.explain};
  } else {
    const others = shuffle(F.filter(x => x.id !== f.id && (gMode === "syn" || x.cat === f.cat || Math.random() < .3))).slice(0, 3);
    opts = shuffle([f, ...others]).map(x => x.id); ans = f.id;
    q = gMode === "who" ? u().who(esc(S.lang === "en" ? f.descEn : f.desc)) : u().syn(esc(f.syntax.replace(new RegExp(f.id, "g"), "▢▢▢")));
    gAns = {ans, f};
  }
  $("#gQ").innerHTML = q;
  $("#gOpts").innerHTML = opts.map(o => `<button data-o="${esc(o)}">${esc(o)}</button>`).join("");
}
$("#gOpts").addEventListener("click", e => {
  const b = e.target.closest("button[data-o]"); if (!b || $("#gOpts").dataset.lock === "1" && !$("#gNext").hidden) return;
  if (!$("#gNext").hidden) return;
  const ok = b.dataset.o === gAns.ans;
  $$("#gOpts button").forEach(x => { if (x.dataset.o === gAns.ans) x.classList.add("right"); });
  if (ok) { gScore++; gStreak++; sfx.ok(); burst(e.clientX, e.clientY, 24); } else { gStreak = 0; b.classList.add("wrong"); sfx.no(); }
  $("#gScore").textContent = `⭐ ${gScore}`; $("#gStreak").textContent = `🔥 ${gStreak}`;
  $("#gFb").innerHTML = (ok ? u().right : u().wrong(esc(gAns.ans))) + (gAns.explain ? `　💡 ${esc(gAns.explain)}` : "") +
    `　<a href="#" data-review="${gAns.f.id}">${u().watch}</a>`;
  $("#gNext").hidden = false;
});
$("#gFb").addEventListener("click", e => { const a = e.target.closest("[data-review]"); if (a) { e.preventDefault(); openPlayer(a.dataset.review); } });
$("#gNext").onclick = () => { sfx.click(); nextQ(); };
$("#gmSeg").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  gMode = b.dataset.g; $$("#gmSeg button").forEach(x => x.classList.toggle("on", x === b)); sfx.click(); newRound();
});

/* ---------- effects ---------- */
const cv = $("#fx"), cx = cv.getContext("2d"); let parts = [], raf = null;
function sizeFx() { cv.width = innerWidth; cv.height = innerHeight; } addEventListener("resize", sizeFx); sizeFx();
const COLS = ["#7c3aed", "#ec4899", "#f59e0b", "#22c55e", "#06b6d4", "#ef4444"];
function burst(x, y, n) { for (let i = 0; i < n; i++) parts.push({x, y, vx: (Math.random() - .5) * 12, vy: -Math.random() * 12 - 2, c: COLS[i % 6], s: 6 + Math.random() * 8, r: Math.random() * 6, life: 70}); loop(); }
function confettiRain() { for (let i = 0; i < 120; i++) parts.push({x: Math.random() * innerWidth, y: -20 - Math.random() * 200, vx: (Math.random() - .5) * 3, vy: Math.random() * 3 + 2, c: COLS[i % 6], s: 8 + Math.random() * 8, r: Math.random() * 6, life: 220}); loop(); }
function loop() {
  if (raf) return;
  (function step() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => --p.life > 0 && p.y < cv.height + 40);
    parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .25; p.r += .15; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); });
    raf = parts.length ? requestAnimationFrame(step) : (cx.clearRect(0, 0, cv.width, cv.height), null);
  })();
}
let toastT = null;
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2200); }

/* hero formula ticker */
let hi = 0; setInterval(() => { const f = F[hi++ % F.length]; if (f) $("#heroFx").textContent = `=${f.id}(…)`; }, 1800);

/* ---------- PWA ---------- */
let deferred = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; $("#spInstall").hidden = false; });
$("#spInstall").onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $("#spInstall").hidden = true; };
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});

/* deep link: index.html#XLOOKUP opens that video */
function fromHash() { const id = decodeURIComponent(location.hash.slice(1)).toUpperCase(); if (F.some(f => f.id === id)) openPlayer(id); }
addEventListener("hashchange", fromHash);
addEventListener("storage", e => { if (e.key === "xlfx-watched") { render(); } });

applySettings(); renderCats(); render(); newRound(); fromHash();
})();
