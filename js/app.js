/* Rechen-Gipfel 6 – Ablauf
   Dezimalzahlen: Rechenart → Verfahren (Schriftlich / Kopfrechnen) → Stufe → Runden mit 5 Aufgaben
   Rationale Zahlen: Rechenart (Addieren / Subtrahieren) → Stufe → Runden mit 5 Päckchen */
(function (RG) {
  var el = RG.el, F = RG.fmt, S = RG.dStr;
  var $ = function (id) { return document.getElementById(id); };

  var OPS = {
    dez: {
      add: { name: 'Plus-Alm', verb: 'Addieren', sym: '+' },
      sub: { name: 'Minus-Spitz', verb: 'Subtrahieren', sym: '−' },
      mul: { name: 'Mal-Horn', verb: 'Multiplizieren', sym: '·' },
      div: { name: 'Teil-Kogel', verb: 'Dividieren', sym: ':' }
    },
    rat: {
      add: { name: 'Frost-Alm: unter null', verb: 'Addieren', sym: '+' },
      sub: { name: 'Frost-Spitz: unter null', verb: 'Subtrahieren', sym: '−' }
    }
  };
  var MODES = {
    sch: { name: 'Schriftlich', desc: 'Untereinander in Rechenkästchen. Komma unter Komma, Stelle für Stelle.' },
    km: { name: 'Kopfrechnen', desc: 'Päckchen mit je drei Aufgaben. Rechne im Kopf und tippe nur das Ergebnis ein.' }
  };
  var EXAMPLES = {
    'add-sch': '   12,5\n+   3,47\n────────\n   15,97', 'add-km': '0,6 + 0,8 = 1,4\n0,37 + ? = 1',
    'sub-sch': '  12,50\n−  3,47\n────────\n   9,03', 'sub-km': '1 − 0,35 = 0,65\n3,4 − 1,7 = 1,7',
    'mul-sch': '3,45 · 2,6\n345 · 26 = 8970\n→ 8,970', 'mul-km': '0,3 · 4 = 1,2\n2,45 · 100 = 245',
    'div-sch': '8,75 : 5 = 1,75\n2,56 : 0,4 = 25,6 : 4', 'div-km': '2,4 : 2 = 1,2\n3,6 : 0,4 = 9'
  };
  var STUFE = {
    'dez-add-sch-1': 'Zahlen mit gleich vielen Stellen nach dem Komma.',
    'dez-add-sch-2': 'Verschieden viele Stellen nach dem Komma, drei und vier Zahlen.',
    'dez-sub-sch-1': 'Bayerisches Verfahren: abziehen und entbündeln, gleich viele Stellen.',
    'dez-sub-sch-2': 'Verschieden viele Stellen: Nullen ergänzen, auch ganze Zahlen minus Dezimalzahl.',
    'dez-mul-sch-1': 'Dezimalzahl mal einstellige Zahl.',
    'dez-mul-sch-2': 'Dezimalzahl mal Dezimalzahl, auch mit zweistelligem Faktor.',
    'dez-div-sch-1': 'Dezimalzahl durch einstellige Zahl. Komma überschritten, Komma setzen.',
    'dez-div-sch-2': 'Durch eine Dezimalzahl: erst das Komma verschieben, dann teilen.',
    'dez-add-km-1': 'Zehntel und Hundertstel addieren, auch über die 1.',
    'dez-add-km-2': 'Ergänzen bis 1 und zur nächsten ganzen Zahl, drei Summanden.',
    'dez-sub-km-1': 'Zehntel und Hundertstel subtrahieren, auch 1 − 0,35.',
    'dez-sub-km-2': 'Ganze Zahl minus Dezimalzahl, fehlende Zahl finden.',
    'dez-mul-km-1': 'Mal 10, 100, 1000 und mal einstellige Zahlen.',
    'dez-mul-km-2': 'Dezimalzahl mal Dezimalzahl, mal 0,1 und 0,01.',
    'dez-div-km-1': 'Durch 10, 100, 1000 und durch einstellige Zahlen.',
    'dez-div-km-2': 'Durch Dezimalzahlen wie 0,1, 0,4 oder 1,2.',
    'rat-add-km-1': 'Ganze Zahlen wie −8 + 5. Zahlen bis 100.',
    'rat-add-km-2': 'Dezimalzahlen wie −2,5 + 4, drei Zahlen, große Zahlen.',
    'rat-sub-km-1': 'Ganze Zahlen wie 3 − 7 oder −13 − 3. Zahlen bis 100.',
    'rat-sub-km-2': 'Dezimalzahlen, drei Zahlen und große Zahlen.'
  };
  var SIGNAL = {
    add: 'Achte auf Wörter wie „insgesamt“ oder „zusammen“.',
    sub: 'Achte auf Wörter wie „übrig“, „bleibt“ oder „abgesägt“.',
    mul: 'Achte auf Wörter wie „je“, „jedes“ oder „Fläche“.',
    div: 'Achte auf Wörter wie „gerecht“, „teilen“ oder „zu je“.',
    ratadd: 'Wärmer oder Einzahlen heißt: plus.',
    ratsub: 'Kälter oder Abbuchen heißt: minus.'
  };
  var PRAISE = ['Klasse!', 'Super gerechnet!', 'Stark!', 'Richtig!', 'Bärig!', 'Spitze!', 'Genau so!'];

  /* ---------- Speicher ---------- */
  var save = RG.store.load() || { points: 0, paths: {} };
  if (!save.paths) save.paths = {};
  function path(id) {
    if (!save.paths[id]) save.paths[id] = { level: 1, stars: [0, 0, 0, 0, 0], done: false };
    return save.paths[id];
  }
  function persist() { RG.store.save(save); }

  /* ---------- Grafik ---------- */
  function mascot(mood) {
    var mouth = mood === 'happy' ? '<path d="M50 88 Q60 97 70 88" fill="none" stroke="#3a2a1e" stroke-width="3" stroke-linecap="round"/>'
      : mood === 'wow' ? '<ellipse cx="60" cy="90" rx="6" ry="7" fill="#3a2a1e"/>'
      : '<path d="M52 90 L68 89" stroke="#3a2a1e" stroke-width="3" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 120 120" role="img" aria-label="Gamsi, die Gämse">' +
      '<path d="M44 40 C38 20 42 8 52 7 C58 7 59 13 54 15 C49 17 49 27 52 40Z" fill="#2c211a"/>' +
      '<path d="M76 40 C82 20 78 8 68 7 C62 7 61 13 66 15 C71 17 71 27 68 40Z" fill="#2c211a"/>' +
      '<ellipse cx="30" cy="48" rx="13" ry="7" transform="rotate(-25 30 48)" fill="#b8804c"/>' +
      '<ellipse cx="90" cy="48" rx="13" ry="7" transform="rotate(25 90 48)" fill="#b8804c"/>' +
      '<path d="M60 34 C82 34 92 52 90 72 C88 92 76 106 60 106 C44 106 32 92 30 72 C28 52 38 34 60 34Z" fill="#f2e3c9"/>' +
      '<path d="M38 48 C42 60 46 74 54 84 L50 86 C40 76 34 62 33 52Z" fill="#4a3526"/>' +
      '<path d="M82 48 C78 60 74 74 66 84 L70 86 C80 76 86 62 87 52Z" fill="#4a3526"/>' +
      '<circle cx="47" cy="62" r="5" fill="#1d1510"/><circle cx="73" cy="62" r="5" fill="#1d1510"/>' +
      '<circle cx="48.5" cy="60.5" r="1.6" fill="#fff"/><circle cx="74.5" cy="60.5" r="1.6" fill="#fff"/>' +
      '<ellipse cx="60" cy="80" rx="7" ry="4.5" fill="#3a2a1e"/>' + mouth + '</svg>';
  }
  function setMascot(id, mood, hop) {
    var m = $(id); if (!m) return;
    m.innerHTML = mascot(mood);
    if (hop) { m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop'); }
  }
  function mountain(world, op) {
    var symbol = op === 'mul' ? '<circle cx="36" cy="34" r="7" fill="var(--accent)"/>'
      : op === 'div' ? '<circle cx="36" cy="24" r="6" fill="var(--accent)"/><circle cx="36" cy="44" r="6" fill="var(--accent)"/>'
      : '<text x="36" y="45" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="34" fill="var(--accent)">' + OPS[world][op].sym + '</text>';
    var frost = world === 'rat'
      ? '<line x1="0" y1="96" x2="240" y2="96" stroke="var(--fg)" stroke-width="2" stroke-dasharray="6 5"/><text x="232" y="91" text-anchor="end" font-family="Andika, sans-serif" font-size="13" font-weight="700" fill="var(--fg)">0</text>'
      : '';
    var comma = world === 'dez' ? '<text x="168" y="112" font-family="Baloo 2, sans-serif" font-weight="800" font-size="30" fill="var(--card)">0,5</text>' : '';
    return '<svg viewBox="0 0 240 120" aria-hidden="true">' +
      '<polygon points="0,120 70,46 104,74 150,18 240,120" fill="var(--accent)"/>' +
      '<polygon points="150,18 168,40 158,36 148,46 138,36 132,40" fill="var(--snow)"/>' +
      '<polygon points="70,46 82,59 74,56 66,62 60,56" fill="var(--snow)"/>' +
      '<line x1="150" y1="18" x2="150" y2="2" stroke="var(--fg)" stroke-width="2"/><polygon points="150,2 164,6 150,10" fill="var(--sun)"/>' +
      frost + comma +
      '<circle cx="36" cy="34" r="24" fill="var(--card)"/>' + symbol + '</svg>';
  }
  function star(on, size) {
    size = size || 16;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2l-5.9 3.3 1.4-6.6-5-4.5 6.6-.7z" fill="' + (on ? 'var(--sun)' : 'none') + '" stroke="' + (on ? 'var(--sun)' : 'var(--line)') + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }
  function trail(id) {
    var p = path(id), box = el('div', { class: 'trail' });
    for (var i = 0; i < 5; i++) {
      var reached = p.done || p.level > i + 1, current = !p.done && p.level === i + 1;
      var fill = reached ? 'var(--accent)' : current ? 'var(--sun)' : 'var(--card)';
      var hut = el('div', { class: 'hut' });
      hut.innerHTML = '<svg viewBox="0 0 40 34" aria-hidden="true"><path d="M4 16 L20 3 L36 16" fill="none" stroke="var(--fg)" stroke-width="2.5" stroke-linejoin="round"/><rect x="8" y="15" width="24" height="16" rx="2" fill="' + fill + '" stroke="var(--fg)" stroke-width="2"/><rect x="17" y="21" width="6" height="10" fill="var(--card)" stroke="var(--fg)" stroke-width="1.5"/></svg>' +
        '<span>' + star(p.stars[i] >= 1, 11) + star(p.stars[i] >= 2, 11) + star(p.stars[i] >= 3, 11) + '</span><span>Hütte ' + (i + 1) + '</span>';
      box.appendChild(hut);
    }
    return box;
  }

  /* Zahlenstrahl als Tipp bei rationalen Zahlen */
  function numberLine(r) {
    var pts = [RG.dVal(r.terms[0])], acc = pts[0];
    for (var j = 1; j < r.terms.length; j++) { acc = r.ops[j - 1] === '+' ? acc + RG.dVal(r.terms[j]) : acc - RG.dVal(r.terms[j]); pts.push(Math.round(acc * 1000) / 1000); }
    var lo = Math.min.apply(null, pts.concat([0])), hi = Math.max.apply(null, pts.concat([0]));
    var span = hi - lo || 1, steps = [1, 2, 5, 10, 20, 50, 100, 200, 500], step = 1;
    for (var k = 0; k < steps.length; k++) { step = steps[k]; if (span / step <= 14) break; }
    lo = Math.floor(lo / step) * step - step; hi = Math.ceil(hi / step) * step + step;
    var W = 600, x0 = 30, x1 = W - 30, y = 92;
    function X(v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); }
    var svg = '<svg viewBox="0 0 ' + W + ' 130" role="img" aria-label="Zahlenstrahl">';
    svg += '<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="var(--fg)" stroke-width="2"/>';
    svg += '<polygon points="' + (x1 + 10) + ',' + y + ' ' + x1 + ',' + (y - 6) + ' ' + x1 + ',' + (y + 6) + '" fill="var(--fg)"/>';
    for (var v = lo; v <= hi + 1e-9; v += step) {
      var xx = X(v), zero = Math.abs(v) < 1e-9;
      svg += '<line x1="' + xx + '" y1="' + (y - (zero ? 10 : 6)) + '" x2="' + xx + '" y2="' + (y + (zero ? 10 : 6)) + '" stroke="var(--fg)" stroke-width="' + (zero ? 3 : 1.5) + '"/>';
      svg += '<text x="' + xx + '" y="' + (y + 26) + '" text-anchor="middle" font-family="Andika, sans-serif" font-size="14" font-weight="' + (zero ? 800 : 400) + '" fill="var(--fg)">' + S(RG.dNorm({ i: Math.round(v * 1000), k: 3 })) + '</text>';
    }
    var colors = ['var(--ratadd)', 'var(--ratsub)', 'var(--sun)'];
    for (j = 1; j < pts.length; j++) {
      var a = X(pts[j - 1]), b = X(pts[j]), mid = (a + b) / 2, h = 22 + j * 10, c = colors[(j - 1) % 3];
      svg += '<path d="M' + a + ' ' + (y - 4) + ' Q' + mid + ' ' + (y - h * 2) + ' ' + b + ' ' + (y - 4) + '" fill="none" stroke="' + c + '" stroke-width="3"/>';
      svg += '<polygon points="' + b + ',' + (y - 3) + ' ' + (b + (b > a ? -9 : 9)) + ',' + (y - 13) + ' ' + (b + (b > a ? -2 : 2)) + ',' + (y - 15) + '" fill="' + c + '"/>';
      svg += '<text x="' + mid + '" y="' + (y - h - 6) + '" text-anchor="middle" font-family="Andika, sans-serif" font-size="15" font-weight="700" fill="var(--fg)">' + r.ops[j - 1] + ' ' + S(r.terms[j]) + '</text>';
    }
    svg += '<circle cx="' + X(pts[0]) + '" cy="' + y + '" r="6" fill="var(--accent)"/>';
    return svg + '</svg>';
  }

  /* ---------- Bildschirme ---------- */
  var G = { world: null, op: null, mode: null, stufe: null };
  function opKey() { return G.world === 'rat' ? 'rat' + G.op : (G.op || 'add'); }
  function show(name) {
    ['home', 'mode', 'stufe', 'play', 'done'].forEach(function (s) { $('screen-' + s).hidden = s !== name; });
    document.querySelector('.app').setAttribute('data-op', opKey());
    window.scrollTo(0, 0);
  }
  function pathId() { return G.world + '-' + G.op + '-' + G.mode + '-' + G.stufe; }

  function opCard(world, op) {
    var modes = world === 'rat' ? ['km'] : ['sch', 'km'], huts = 0;
    modes.forEach(function (m) { [1, 2].forEach(function (s) { var p = path(world + '-' + op + '-' + m + '-' + s); huts += p.done ? 5 : p.level - 1; }); });
    return el('button', {
      type: 'button', class: 'op-card', 'data-op': world === 'rat' ? 'rat' + op : op,
      onclick: function () { G.world = world; G.op = op; if (world === 'rat') { G.mode = 'km'; renderStufe(); } else renderMode(); }
    }, [
      el('div', { html: mountain(world, op) }),
      el('span', { class: 'op-name', text: OPS[world][op].verb }),
      el('span', { class: 'op-sub', text: OPS[world][op].name }),
      el('span', { class: 'op-progress', text: huts + ' von ' + modes.length * 10 + ' Hütten geschafft' })
    ]);
  }

  function renderHome() {
    G.world = null; G.op = null;
    setMascot('home-mascot', 'happy');
    $('home-points').textContent = F(save.points) + ' Punkte';
    $('op-grid').replaceChildren.apply($('op-grid'), ['add', 'sub', 'mul', 'div'].map(function (op) { return opCard('dez', op); }));
    $('op-grid-rat').replaceChildren.apply($('op-grid-rat'), ['add', 'sub'].map(function (op) { return opCard('rat', op); }));
    show('home');
  }

  function renderMode() {
    $('mode-crumb').textContent = 'Dezimalzahlen · ' + OPS.dez[G.op].verb;
    var grid = $('mode-grid');
    grid.replaceChildren();
    ['sch', 'km'].forEach(function (m) {
      grid.appendChild(el('button', { type: 'button', class: 'choice', onclick: function () { G.mode = m; renderStufe(); } }, [
        el('h3', { text: MODES[m].name }),
        el('p', { text: MODES[m].desc }),
        el('div', { class: 'example' }, [el('pre', { text: EXAMPLES[G.op + '-' + m] })])
      ]));
    });
    show('mode');
  }

  function renderStufe() {
    $('stufe-crumb').textContent = G.world === 'rat' ? 'Rationale Zahlen · ' + OPS.rat[G.op].verb : 'Dezimalzahlen · ' + OPS.dez[G.op].verb + ' · ' + MODES[G.mode].name;
    document.querySelector('#screen-stufe .back-btn').setAttribute('data-go', G.world === 'rat' ? 'home' : 'mode');
    var grid = $('stufe-grid');
    grid.replaceChildren();
    [1, 2].forEach(function (s) {
      var id = G.world + '-' + G.op + '-' + G.mode + '-' + s, p = path(id);
      grid.appendChild(el('button', { type: 'button', class: 'choice', onclick: function () { G.stufe = s; startRound(); } }, [
        el('h3', { text: 'Stufe ' + s }),
        el('p', { text: STUFE[id] }),
        trail(id),
        el('span', { class: 'trail-note', text: p.done ? 'Gipfel erreicht! Du kannst weiter üben.' : 'Weiter bei Hütte ' + p.level })
      ]));
    });
    show('stufe');
  }

  /* ---------- Runde ---------- */
  function startRound() {
    var p = path(pathId());
    G.level = p.done ? 5 : p.level;
    G.tasks = []; G.results = []; G.idx = 0; G.streak = 0; G.roundPoints = 0;
    for (var i = 0; i < 5; i++) {
      var lvl = i === 4 ? Math.min(5, G.level + 1) : G.level;
      var t = RG.generate(G.world, G.op, G.mode, G.stufe, lvl);
      t.bonus = i === 4;
      var wantSach = (i === 3 && (G.level >= 2 || G.stufe === 2)) || (i === 1 && G.level >= 4);
      if (wantSach && (G.mode === 'sch' || G.world === 'rat')) {
        if (G.world === 'rat') {
          var one = { world: 'rat', kind: 'rat', op: G.op, rows: [t.rows[0]] };
          var sr = RG.makeSach(one);
          if (sr) { t = one; t.bonus = i === 4; t.sach = sr; }
        } else t.sach = RG.makeSach(t);
        if (!t.sach) delete t.sach;
      }
      G.tasks.push(t);
    }
    $('play-path').textContent = G.world === 'rat' ? 'Rationale Zahlen · ' + OPS.rat[G.op].verb + ' · Stufe ' + G.stufe
      : OPS.dez[G.op].verb + ' · ' + MODES[G.mode].name + ' · Stufe ' + G.stufe;
    $('play-level').textContent = 'Hütte ' + G.level + ' von 5';
    show('play');
    showTask();
  }

  function dots() {
    var box = $('play-dots');
    box.replaceChildren();
    G.tasks.forEach(function (t, i) {
      var cls = 'dot' + (G.results[i] === 'ok' ? ' ok' : G.results[i] === 'meh' ? ' meh' : i === G.idx ? ' now' : '') + (t.bonus ? ' bonus' : '');
      box.appendChild(el('span', { class: cls, title: t.bonus ? 'Gipfelaufgabe' : 'Aufgabe ' + (i + 1) }));
    });
    $('play-points').textContent = F(save.points) + ' Punkte';
  }

  function bubble(kind, text, list) {
    var b = $('bubble');
    b.className = 'bubble' + (kind ? ' ' + kind : '');
    b.replaceChildren(el('span', { text: text }));
    if (list && list.length) b.appendChild(el('ol', null, list.map(function (s) { return el('li', { text: s }); })));
  }

  function isPack(t) { return t.kind === 'km' || t.kind === 'rat'; }

  function showTask() {
    var t = G.tasks[G.idx];
    G.task = t; G.tries = 0; G.hintUsed = false; G.phase = t.sach ? 'sach' : 'work'; G.widget = null;
    var label = t.bonus ? 'Gipfelaufgabe · doppelte Punkte' : 'Aufgabe ' + (G.idx + 1) + ' von 5';
    if (t.sach) label += ' · Sachaufgabe';
    else if (isPack(t)) label += ' · Päckchen';
    $('play-kicker').textContent = label;
    $('answer-box').hidden = true;
    $('hint-visual').hidden = true;
    $('work').replaceChildren();
    $('check-btn').textContent = 'Prüfen';
    $('hint-btn').disabled = false;
    setMascot('play-mascot', 'think');
    dots();
    var sb = $('sach-box');
    if (t.sach) {
      $('play-title').textContent = 'Lies genau.';
      sb.hidden = false;
      var opts = el('div', { class: 'opt-row' });
      t.sach.options.forEach(function (o) {
        var b = el('button', { type: 'button', class: 'opt', text: o.label, onclick: function () { chooseCalc(o, b, opts); } });
        opts.appendChild(b);
      });
      sb.replaceChildren(el('p', { text: t.sach.text }), el('p', { class: 'q', text: 'Welche Rechnung passt?' }), opts);
      bubble('', 'Lies die Sachaufgabe und tippe auf die passende Rechnung.');
    } else {
      sb.hidden = true;
      buildWork();
    }
    renderPad();
  }

  function chooseCalc(o, b, opts) {
    if (G.phase !== 'sach') return;
    if (!o.correct) {
      b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
      G.hintUsed = true;
      bubble('oops', 'Das passt nicht. ' + SIGNAL[G.world === 'rat' ? 'rat' + G.op : G.op]);
      return;
    }
    b.classList.add('right');
    Array.prototype.forEach.call(opts.children, function (x) { x.disabled = true; });
    G.phase = 'work';
    buildWork();
  }

  function buildWork() {
    var t = G.task;
    if (isPack(t)) {
      $('play-title').textContent = t.sach ? t.rows[0].text.replace(' =', '') + ' = ?' : (t.kind === 'rat' ? 'Rechne mit negativen Zahlen.' : 'Rechne im Kopf.');
      G.widget = new RG.StepsWidget(RG.buildPack(t));
    } else {
      $('play-title').textContent = RG.title(t) + ' = ?';
      if (t.kind === 'div') G.widget = new RG.DivWidget(t, G.stufe);
      else {
        var spec = RG.buildWork(t, G.stufe);
        G.widget = spec.type === 'combo' ? new RG.ComboWidget(spec) : new RG.GridWidget(spec);
      }
    }
    $('work').replaceChildren(G.widget.el);
    var extra = isPack(t) && G.world === 'dez' ? ' Für das Komma gibt es die Taste „,“.' : (G.world === 'rat' ? ' Für ein negatives Ergebnis tippst du die Taste „−“.' : '');
    bubble('', (t.sach ? 'Richtig gewählt! ' : '') + G.widget.intro + extra);
  }

  function renderPad() {
    var pad = $('pad');
    pad.replaceChildren();
    var special = G.world === 'rat' ? '-' : ',';
    var keys = ['7', '8', '9', 'back', '4', '5', '6', 'left', '1', '2', '3', 'right', '0', special, 'up', 'down'];
    var label = { back: '⌫', left: '◀', right: '▶', up: '▲', down: '▼', '-': '−', ',': ',' };
    var aria = { back: 'Löschen', left: 'Nach links', right: 'Nach rechts', up: 'Nach oben', down: 'Nach unten', '-': 'Minuszeichen', ',': 'Komma' };
    keys.forEach(function (k) {
      var isDigit = /\d/.test(k) || k === ',' || k === '-';
      pad.appendChild(el('button', {
        type: 'button', class: 'key' + (isDigit ? '' : ' fn'), text: label[k] || k,
        'aria-label': aria[k] || k, onclick: function () { press(k); }
      }));
    });
  }

  function press(k) {
    if (!G.widget || G.phase !== 'work') {
      if (G.phase === 'sach') bubble('tip', 'Wähle zuerst oben die passende Rechnung.');
      return;
    }
    if (/^\d$/.test(k) || k === ',' || k === '-') G.widget.type(k);
    else if (k === 'back') G.widget.back();
    else G.widget.move(k);
  }

  function onCheck() {
    if (G.phase === 'solved') { next(); return; }
    if (G.phase === 'sach') { bubble('tip', 'Wähle zuerst die passende Rechnung.'); return; }
    var w = G.widget;
    if (w.guided) {
      var r = w.submit();
      if (r.state === 'empty') { bubble('tip', r.msg); return; }
      if (r.state === 'retry') { bubble('oops', r.msg); setMascot('play-mascot', 'think'); return; }
      if (r.state === 'next') { bubble(r.wrong ? 'oops' : 'good', r.msg); setMascot('play-mascot', r.wrong ? 'think' : 'happy'); return; }
      solved(r.ok ? 'first' : 'second');
      return;
    }
    var res = w.check();
    if (res.ok) { solved(G.tries === 0 ? 'first' : 'second'); return; }
    G.tries++;
    if (G.tries >= 2) { w.reveal(); solved('shown'); return; }
    setMascot('play-mascot', 'think');
    bubble('oops', res.msg + ' Du hast noch einen Versuch. Brauchst du einen Tipp?');
  }

  function solved(how) {
    var t = G.task;
    G.phase = 'solved';
    if (G.widget.lock) G.widget.lock();
    var pts = how === 'first' ? (G.hintUsed ? 6 : 10) : how === 'second' ? 5 : 0;
    if (t.bonus) pts *= 2;
    G.streak = how === 'first' ? G.streak + 1 : 0;
    if (how === 'first' && G.streak >= 3) pts += 2;
    G.results[G.idx] = how === 'first' ? 'ok' : 'meh';
    save.points += pts; G.roundPoints += pts;
    persist();
    if (how === 'shown') {
      setMascot('play-mascot', 'think');
      bubble('tip', 'Schau dir die Lösung in Rot an. So geht es:', G.widget.steps ? G.widget.steps() : []);
    } else if (how === 'first') {
      setMascot('play-mascot', 'happy', true);
      bubble('good', RG.pick(PRAISE) + ' +' + pts + ' Punkte' + (G.streak >= 3 ? ' · Serie: ' + G.streak + ' richtig hintereinander' : '') + '.');
      confetti();
    } else {
      setMascot('play-mascot', 'happy', true);
      bubble('good', 'Geschafft! +' + pts + ' Punkte. Beim nächsten Mal klappt es auf Anhieb.');
    }
    if (t.sach) {
      var ab = $('answer-box');
      ab.hidden = false;
      ab.replaceChildren(el('b', { text: 'Antwort: ' }), document.createTextNode(t.sach.answer));
    }
    $('check-btn').textContent = G.idx < 4 ? 'Nächste Aufgabe' : 'Runde beenden';
    $('hint-btn').disabled = true;
    dots();
  }

  function next() { G.idx++; if (G.idx >= 5) endRound(); else showTask(); }

  function onHint() {
    if (G.phase === 'sach') { bubble('tip', SIGNAL[G.world === 'rat' ? 'rat' + G.op : G.op]); G.hintUsed = true; return; }
    if (G.phase !== 'work' || !G.widget) return;
    G.hintUsed = true;
    bubble('tip', 'Tipp: ' + G.widget.hint());
    if (G.task.kind === 'rat') {
      var idx = Math.max(0, G.widget.order.indexOf(G.widget.sel)), r = G.task.rows[idx] || G.task.rows[0];
      var hv = $('hint-visual');
      hv.hidden = false;
      hv.innerHTML = '<p>Zahlenstrahl für ' + r.text.replace(' =', '') + '</p>' + numberLine(r);
    }
  }

  function endRound() {
    var p = path(pathId());
    var good = G.results.filter(function (r) { return r === 'ok'; }).length;
    var stars = good >= 5 ? 3 : good >= 4 ? 2 : good >= 2 ? 1 : 0;
    var lvl = G.level, title, text;
    p.stars[lvl - 1] = Math.max(p.stars[lvl - 1] || 0, stars);
    if (good >= 4) {
      if (!p.done && p.level < 5) { p.level++; title = 'Neue Hütte erreicht!'; text = good + ' von 5 Aufgaben auf Anhieb richtig. Ab jetzt geht es auf Hütte ' + p.level + ' weiter, dort wird es schwerer.'; }
      else if (!p.done) { p.done = true; title = 'Gipfel erreicht!'; text = 'Du hast alle 5 Hütten geschafft. Du kannst hier weiter üben und Punkte sammeln.'; }
      else { title = 'Gipfelrunde geschafft!'; text = good + ' von 5 Aufgaben auf Anhieb richtig.'; }
      confetti();
    } else {
      title = good >= 2 ? 'Gut gekämpft!' : 'Weiter üben!';
      text = good + ' von 5 Aufgaben auf Anhieb richtig. Ab 4 richtigen geht es zur nächsten Hütte. Probier es gleich noch einmal!';
    }
    persist();
    $('done-title').textContent = title;
    $('done-text').textContent = text + ' In dieser Runde: +' + G.roundPoints + ' Punkte.';
    $('done-stars').innerHTML = star(stars >= 1, 56) + star(stars >= 2, 56) + star(stars >= 3, 56);
    $('done-trail').replaceChildren(trail(pathId()));
    setMascot('done-mascot', good >= 4 ? 'wow' : 'happy', true);
    show('done');
  }

  /* ---------- Konfetti ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function confetti() {
    if (reduce) return;
    var cv = $('confetti'), ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    var css = getComputedStyle(document.documentElement);
    var colors = ['--add', '--sub', '--mul', '--div', '--sun', '--ratadd', '--ratsub'].map(function (v) { return css.getPropertyValue(v).trim() || '#f2ad00'; });
    var parts = [];
    for (var i = 0; i < 90; i++) parts.push({ x: cv.width / 2 + (Math.random() - .5) * 200, y: cv.height * .35, vx: (Math.random() - .5) * 12, vy: -Math.random() * 12 - 4, s: 5 + Math.random() * 6, c: colors[i % colors.length], r: Math.random() * 6 });
    var start = performance.now();
    (function frame(now) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(function (p) { p.vy += .4; p.x += p.vx; p.y += p.vy; p.r += .2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (now - start < 1400) requestAnimationFrame(frame); else ctx.clearRect(0, 0, cv.width, cv.height);
    })(start);
  }

  /* ---------- Ereignisse ---------- */
  document.querySelectorAll('.back-btn[data-go]').forEach(function (b) {
    b.addEventListener('click', function () { if (b.getAttribute('data-go') === 'home') renderHome(); else renderMode(); });
  });
  $('play-back').addEventListener('click', renderStufe);
  $('check-btn').addEventListener('click', onCheck);
  $('hint-btn').addEventListener('click', onHint);
  $('again-btn').addEventListener('click', startRound);
  $('to-stufe-btn').addEventListener('click', renderStufe);
  $('to-home-btn').addEventListener('click', renderHome);
  $('reset-btn').addEventListener('click', function () { $('reset-confirm').hidden = false; });
  $('reset-no').addEventListener('click', function () { $('reset-confirm').hidden = true; });
  $('reset-yes').addEventListener('click', function () { save = { points: 0, paths: {} }; RG.store.clear(); $('reset-confirm').hidden = true; renderHome(); });

  document.addEventListener('keydown', function (e) {
    if ($('screen-play').hidden || e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key, map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Backspace: 'back', Delete: 'back', ',': ',', '.': ',', '-': '-' };
    if (k === 'Enter') {
      if (e.target && e.target.tagName === 'BUTTON' && e.target.id !== 'check-btn' && G.phase !== 'work') return;
      e.preventDefault();
      if (G.phase === 'work' && G.widget && G.widget.nextEmpty && G.widget.nextEmpty()) return;
      onCheck();
      return;
    }
    if (/^\d$/.test(k)) { e.preventDefault(); press(k); return; }
    if (map[k]) { e.preventDefault(); press(map[k]); }
  });

  renderHome();
})(window.RG);
