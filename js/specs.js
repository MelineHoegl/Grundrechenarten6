/* Rechen-Gipfel 6 – Aufbau und Prüfung der Übungen (ohne Bildschirm-Code, damit es testbar bleibt) */
(function (RG) {
  var F = RG.fmt, len = RG.len, S = RG.dStr, P = RG.PLACE;

  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  /* Ziffernfolge rechtsbündig auf Spalten legen -> {spalte: ziffer} */
  function alignRight(value, cols) {
    var s = String(value), out = {};
    for (var i = 0; i < s.length && i < cols.length; i++) out[cols[cols.length - 1 - i]] = s[s.length - 1 - i];
    return out;
  }
  RG.alignRight = alignRight;

  RG.title = function (t) {
    if (t.kind === 'add') return t.terms.map(S).join(' + ');
    if (t.kind === 'sub') return S(t.a) + ' − ' + S(t.b);
    if (t.kind === 'mul') return S(t.n) + ' · ' + S(t.f);
    if (t.kind === 'div') return S(t.Dv) + ' : ' + S(t.dv);
    return '';
  };

  /* ---------- Hilfen ---------- */
  function mulSteps(n, f) {
    var ds = String(n).split('').reverse().map(Number), c = 0, out = [];
    ds.forEach(function (x, i) {
      var pr = f * x, tot = pr + c, last = i === ds.length - 1;
      var s = f + ' mal ' + x + ' ist ' + pr + (c ? ', plus ' + c + ' gemerkt ist ' + tot : '');
      if (last) s += ', ' + tot + ' an';
      else s += ', ' + (tot % 10) + ' an' + (tot >= 10 ? ', ' + Math.floor(tot / 10) + ' gemerkt' : '');
      out.push(s);
      c = Math.floor(tot / 10);
    });
    return out;
  }
  function mulCarries(n, f) {
    var ds = String(n).split('').reverse().map(Number), c = 0, res = {};
    ds.forEach(function (x, i) { var tot = f * x + c; c = Math.floor(tot / 10); if (c && i < ds.length - 1) res[i + 1] = c; });
    return res;
  }
  function addCarries(nums) {
    var L = Math.max.apply(null, nums.map(len)), c = 0, res = {};
    for (var i = 0; i < L; i++) {
      var s = c;
      nums.forEach(function (n) { s += Math.floor(n / Math.pow(10, i)) % 10; });
      c = Math.floor(s / 10);
      if (c && i < L - 1) res[i + 1] = c;
    }
    return res;
  }
  function roundLead(n) { var p = Math.pow(10, String(n).length - 1); return Math.round(n / p) * p; }

  /* Bayerisches Verfahren: Abziehen mit Entbündeln. names = Stellennamen von rechts */
  RG.subBavaria = function (a, b, names) {
    names = names || P;
    var A = String(a).split('').reverse().map(Number), B = String(b).split('').reverse().map(Number);
    var avail = A.slice(), taken = {}, chain = {}, steps = [];
    for (var i = 0; i < A.length; i++) {
      var y = B[i] || 0, N = names[i];
      if (i >= B.length) {
        if (avail[i] > 0) steps.push(taken[i] && !chain[i] ? A[i] + ' ' + N + ' − | = ' + avail[i] + ' ' + N + ', übernehmen' : avail[i] + ' ' + N + ' übernehmen');
        continue;
      }
      var label = chain[i] ? '9 ' + N + ' (nach dem Entbündeln)' : (taken[i] ? A[i] + ' ' + N + ' − |' : avail[i] + ' ' + N);
      if (avail[i] < y) {
        var j = i + 1;
        while (avail[j] === 0) j++;
        avail[j] -= 1; taken[j] = true;
        for (var k = j - 1; k > i; k--) { avail[k] = 9; chain[k] = true; taken[k] = true; }
        avail[i] += 10;
        var txt = label + ' − ' + y + ' ' + N + ' geht nicht. Ich entbündele 1 ' + names[j] + ' (|)';
        if (j > i + 1) txt += ' und tausche weiter, bis ich 10 ' + N + ' mehr habe';
        txt += '. ' + avail[i] + ' ' + N + ' − ' + y + ' ' + N + ' = ' + (avail[i] - y) + ' ' + N;
        steps.push(txt);
      } else {
        steps.push(label + ' − ' + y + ' ' + N + ' = ' + (avail[i] - y) + ' ' + N);
      }
    }
    return { steps: steps, marks: Object.keys(taken).map(Number) };
  };

  /* Spalten für Dezimalzahlen: Spalte 0 = Rechenzeichen, dann Ganze, Komma, Nachkommastellen */
  function layout(intW, K) {
    var intCols = range(1, intW), comma = K ? intW + 1 : null, decCols = K ? range(intW + 2, intW + 1 + K) : [];
    return { intCols: intCols, comma: comma, decCols: decCols, digitCols: intCols.concat(decCols), C: intW + (K ? 1 + K : 0) };
  }
  function placeNumber(x, L, fill) {
    var ds = RG.dDigits(x), ip = ds.slice(0, ds.length - x.k), fp = ds.slice(ds.length - x.k);
    var cells = alignRight(ip, L.intCols), cls = {};
    if (L.comma && (x.k || fill)) cells[L.comma] = ',';
    for (var i = 0; i < L.decCols.length; i++) {
      if (i < fp.length) cells[L.decCols[i]] = fp[i];
      else if (fill) { cells[L.decCols[i]] = '0'; cls[L.decCols[i]] = 'fill'; }
    }
    return { cells: cells, cls: cls };
  }
  /* skalierte ganze Zahl mit K Stellen als Ziffernfolge inkl. führender 0 */
  function scaledDigits(v, K) { var s = String(v); while (s.length < K + 1) s = '0' + s; return s; }

  /* =================== Schriftlich =================== */
  RG.buildWork = function (t, stufe) {
    if (t.kind === 'add') return gridAdd(t);
    if (t.kind === 'sub') return gridSub(t);
    if (t.kind === 'mul') return mulCombo(t);
    return null;
  };

  function gridAdd(t) {
    var K = Math.max.apply(null, t.terms.map(function (x) { return x.k; }));
    var scaled = t.terms.map(function (x) { return RG.dScale(x, K); });
    var total = scaled.reduce(function (a, b) { return a + b; }, 0);
    var intW = Math.max(RG.dIntLen({ i: total, k: K }), Math.max.apply(null, t.terms.map(RG.dIntLen)));
    var L = layout(intW, K), rows = [];
    t.terms.forEach(function (x, j) {
      var pl = placeNumber(x, L, false);
      rows.push({ type: 'static', cells: pl.cells, cls: pl.cls, sign: j === t.terms.length - 1 ? '+' : '' });
    });
    rows.push({ type: 'helper', key: 'c', cols: L.digitCols, mode: 'digit', small: true, label: 'Merkzahl' });
    var fixed = {}; if (L.comma) fixed[L.comma] = ',';
    rows.push({ type: 'input', key: 'res', cols: L.digitCols, fixed: fixed, ruleTop: true, label: 'Summe' });
    var dc = L.digitCols, solC = {}, carry = addCarries(scaled);
    Object.keys(carry).forEach(function (p) { solC[dc[dc.length - 1 - Number(p)]] = String(carry[p]); });
    var names = RG.placeNames(K, dc.length), steps = [], c = 0, tl = scaledDigits(total, K).length;
    for (var i = 0; i < tl; i++) {
      /* nur Ziffern, die bei der Zahl wirklich dastehen */
      var ds = t.terms.filter(function (x) { return i >= K - x.k && i < K - x.k + RG.dDigits(x).length; })
        .map(function (x) { return Math.floor(RG.dScale(x, K) / Math.pow(10, i)) % 10; });
      var s = ds.reduce(function (a, b) { return a + b; }, 0) + c, last = i === tl - 1;
      var txt = names[i] + ': ' + (ds.length ? ds.join(' + ') : '0') + (c ? ' + ' + c + ' gemerkt' : '') + ' = ' + s;
      txt += last || s < 10 ? ', ' + (last ? s : s % 10) + ' an' : ', ' + (s % 10) + ' an, ' + Math.floor(s / 10) + ' gemerkt';
      steps.push(txt);
      c = Math.floor(s / 10);
    }
    if (K) steps.push('Komma unter Komma: Im Ergebnis steht das Komma an derselben Stelle.');
    return {
      type: 'grid', C: L.C, rows: rows,
      check: function (read) {
        var r = read('res'), ok = r === total;
        return { ok: ok, rows: { res: ok }, msg: ok ? '' : 'Die Summe stimmt noch nicht. Fang ganz rechts an. Leere Stellen nach dem Komma kannst du dir als 0 denken.' };
      },
      solution: { res: alignRight(scaledDigits(total, K), dc), c: solC },
      hint: 'Komma unter Komma! Beginne ganz rechts: ' + steps[0] + '.',
      steps: steps
    };
  }

  function gridSub(t) {
    var K = Math.max(t.a.k, t.b.k), A = RG.dScale(t.a, K), B = RG.dScale(t.b, K);
    var intW = RG.dIntLen(t.a), L = layout(intW, K), dc = L.digitCols;
    var pa = placeNumber(t.a, L, true), pb = placeNumber(t.b, L, true);
    var names = RG.placeNames(K, dc.length), bav = RG.subBavaria(A, B, names), marks = {};
    bav.marks.forEach(function (p) { marks[dc[dc.length - 1 - p]] = '|'; });
    var fixed = {}; if (L.comma) fixed[L.comma] = ',';
    var rows = [
      { type: 'static', cells: pa.cells, cls: pa.cls },
      { type: 'helper', key: 'm', cols: dc, mode: 'mark', small: true, label: 'Entbündel-Strich' },
      { type: 'static', cells: pb.cells, cls: pb.cls, sign: '−' },
      { type: 'input', key: 'res', cols: dc, fixed: fixed, ruleTop: true, label: 'Differenz' }
    ];
    var filled = t.a.k < K || t.b.k < K;
    return {
      type: 'grid', C: L.C, rows: rows,
      check: function (read) {
        var r = read('res'), ok = r === A - B;
        return { ok: ok, rows: { res: ok }, msg: ok ? '' : 'Die Differenz stimmt noch nicht. Wenn oben zu wenig ist: entbündeln und einen Strich machen.' };
      },
      solution: { res: alignRight(scaledDigits(A - B, K), dc), m: marks },
      hint: (filled ? 'Die farbigen Nullen sind ergänzt, damit beide Zahlen gleich viele Stellen nach dem Komma haben. ' : '') + 'Beginne ganz rechts: ' + bav.steps[0] + '.',
      steps: (filled ? ['Nullen ergänzen, bis beide Zahlen gleich viele Stellen nach dem Komma haben.'] : []).concat(bav.steps)
    };
  }

  /* Multiplikation: erst ohne Komma rechnen, dann Stellen abstreichen */
  function gridMulInt(n, f) {
    var Ln = len(n), answer = n * f;
    if (f < 10) {
      var W = Ln + 2, cells = alignRight(n, range(1, Ln)); cells[Ln + 1] = '·'; cells[Ln + 2] = String(f);
      var resCols = range(W - Ln, W), carry = mulCarries(n, f), solC = {};
      Object.keys(carry).forEach(function (p) { solC[W - Number(p)] = String(carry[p]); });
      return {
        type: 'grid', C: W,
        rows: [{ type: 'static', cells: cells }, { type: 'helper', key: 'c', cols: range(1, W), mode: 'digit', small: true, ruleTop: true, label: 'Merkzahl' }, { type: 'input', key: 'res', cols: resCols, label: 'Ergebnis ohne Komma' }],
        check: function (read) { var r = read('res'), ok = r === answer; return { ok: ok, rows: { res: ok }, msg: ok ? '' : 'Das Ergebnis ohne Komma stimmt noch nicht.' }; },
        solution: { res: alignRight(answer, resCols), c: solC },
        steps: ['Ohne Komma: ' + F(n) + ' · ' + f].concat(mulSteps(n, f))
      };
    }
    var W2 = Ln + 3, T = Math.floor(f / 10), E = f % 10, cells2 = alignRight(n, range(1, Ln));
    cells2[Ln + 1] = '·'; cells2[Ln + 2] = String(T); cells2[Ln + 3] = String(E);
    var wide = range(W2 - Ln - 1, W2), narrow = range(W2 - Ln, W2), A = n * T * 10, B = n * E;
    var carry2 = addCarries([A, B]), solC2 = {};
    Object.keys(carry2).forEach(function (p) { solC2[W2 - Number(p)] = String(carry2[p]); });
    return {
      type: 'grid', C: W2,
      rows: [
        { type: 'static', cells: cells2 },
        { type: 'input', key: 'r1', cols: wide, ruleTop: true, label: '1. Zwischenergebnis' },
        { type: 'input', key: 'r2', cols: narrow, label: '2. Zwischenergebnis' },
        { type: 'helper', key: 'c', cols: range(1, W2), mode: 'digit', small: true, sign: '+', label: 'Merkzahl' },
        { type: 'input', key: 'res', cols: wide, ruleTop: true, label: 'Ergebnis ohne Komma' }
      ],
      check: function (read) {
        var v1 = read('r1'), v2 = read('r2'), r = read('res');
        var a = v1 === null ? -1 : v1, b = v2 === null ? 0 : v2;
        var ok1 = a === A || a === B, ok2 = a === A ? b === B : (a === B ? b === A : (b === A || b === B));
        if (v1 === null && v2 === null) { ok1 = ok2 = false; }
        var ok3 = r === answer;
        var msg = !(ok1 && ok2) && ok3 ? 'Das Ergebnis stimmt. Schreib auch die Zwischenergebnisse richtig hin.' : (ok1 && ok2 && !ok3 ? 'Die Zwischenergebnisse stimmen. Rechne die Addition nochmal nach.' : 'Die rot markierten Zeilen stimmen noch nicht. Erst mit der ' + T + '0, dann mit der ' + E + '.');
        return { ok: ok1 && ok2 && ok3, rows: { r1: ok1, r2: ok2, res: ok3 }, msg: msg };
      },
      solution: { r1: alignRight(A, wide), r2: alignRight(B, narrow), res: alignRight(answer, wide), c: solC2 },
      steps: ['Ohne Komma: ' + F(n) + ' · ' + f, 'Erst mit der ' + T + '0: 0 nach unten, dann ' + T + ' mal …'].concat(mulSteps(n, T).map(function (s) { return '   ' + s; }))
        .concat(['Dann mit der ' + E + ':']).concat(E ? mulSteps(n, E).map(function (s) { return '   ' + s; }) : ['   0 mal ' + F(n) + ' ist 0'])
        .concat(['Zwischenergebnisse addieren: ' + F(A) + ' + ' + F(B) + ' = ' + F(answer)])
    };
  }

  function mulCombo(t) {
    var nI = Math.abs(t.n.i), fI = Math.abs(t.f.i), grid = gridMulInt(nI, fI), kk = t.n.k + t.f.k;
    var komma = {
      type: 'steps',
      rows: [[{ t: 'x', v: 'Stellen nach dem Komma: ' + t.n.k + ' + ' + t.f.k + ' =' }, { t: 's', id: 'k' }],
        [{ t: 'x', v: S(t.n) + ' · ' + S(t.f) + ' =' }, { t: 's', id: 'res' }]],
      slots: [{ id: 'k', w: 1 }, { id: 'res', w: S(t.ans).length, dec: true, final: true }],
      solution: { k: kk, res: S(RG.D(t.n.i * t.f.i, kk)) },
      check: function (read) {
        var bad = [];
        if (read('k') !== kk) bad.push('k');
        if (!RG.same(read('res'), RG.dVal(t.ans))) bad.push('res');
        return { ok: !bad.length, bad: bad, msg: bad.length ? (bad.indexOf('k') >= 0 ? 'Zähle die Stellen nach dem Komma bei beiden Zahlen zusammen.' : 'Streiche im Ergebnis ' + kk + ' Stellen von rechts ab und setze dort das Komma.') : '' };
      }
    };
    return {
      type: 'combo',
      parts: [{ label: '1. Rechne ohne Komma: ' + F(nI) + ' · ' + F(fI), spec: grid }, { label: '2. Setze das Komma', spec: komma }],
      hint: 'Rechne erst ' + F(nI) + ' · ' + F(fI) + ' wie bei natürlichen Zahlen. Dann zählst du die Stellen nach dem Komma: ' + t.n.k + ' + ' + t.f.k + ' = ' + kk + '. Überschlag: ' + S(RG.D(Math.round(RG.dVal(t.n)), 0)) + ' · ' + S(t.f.k ? RG.D(Math.round(RG.dVal(t.f) * 10), 1) : t.f) + '.',
      steps: grid.steps.concat([S(t.n) + ' hat ' + t.n.k + ', ' + S(t.f) + ' hat ' + t.f.k + ' Stellen nach dem Komma: zusammen ' + kk + '.', 'Im Ergebnis ' + kk + ' Stellen von rechts abstreichen: ' + S(RG.D(t.n.i * t.f.i, kk)) + (kk && RG.D(t.n.i * t.f.i, kk).i % 10 === 0 ? ' = ' + S(t.ans) : '')])
    };
  }

  /* =================== Division: Schritte über einer Ziffernfolge =================== */
  RG.divSteps = function (digits, d) {
    var ds = String(digits).split('').map(Number), i = 0, cur = ds[0], out = [];
    while (cur < d && i < ds.length - 1) { i++; cur = cur * 10 + ds[i]; }
    for (;;) {
      var q = Math.floor(cur / d), prod = q * d, rem = cur - prod;
      var step = { cur: cur, end: i, q: q, prod: prod, rem: rem };
      out.push(step);
      if (i < ds.length - 1) { i++; step.down = ds[i]; cur = rem * 10 + ds[i]; step.next = cur; }
      else break;
    }
    return out;
  };

  /* =================== Kopfrechnen und rationale Zahlen: Päckchen =================== */
  var TIPS = {
    add: 'Denk dir gleich viele Stellen nach dem Komma, zum Beispiel 0,35 + 0,4 = 0,35 + 0,40. Dann rechnest du wie mit ganzen Zahlen.',
    sub: 'Denk dir gleich viele Stellen nach dem Komma, zum Beispiel 1 − 0,35 = 1,00 − 0,35.',
    mul: 'Mal 10, 100, 1000: Das Komma rutscht 1, 2 oder 3 Stellen nach rechts. Sonst erst ohne Komma rechnen und dann so viele Stellen abstreichen, wie beide Zahlen zusammen nach dem Komma haben.',
    div: 'Durch 10, 100, 1000: Das Komma rutscht nach links. Durch eine Dezimalzahl: Verschiebe bei beiden Zahlen das Komma gleich weit nach rechts.',
    ratadd: 'Stell dir den Zahlenstrahl vor: Bei + gehst du nach rechts. Von −8 aus 5 Schritte nach rechts ergibt −3.',
    ratsub: 'Stell dir den Zahlenstrahl vor: Bei − gehst du nach links. Von 3 aus 7 Schritte nach links ergibt −4.'
  };
  RG.buildPack = function (t) {
    var rows = [], slots = [], sol = {};
    t.rows.forEach(function (r, i) {
      var id = 'a' + i, w = Math.max(3, S(r.ans).length);
      if (r.pre) rows.push([{ t: 's', id: id }, { t: 'x', v: r.after }]);
      else if (r.gap) rows.push([{ t: 'x', v: r.text }, { t: 's', id: id }, { t: 'x', v: r.after }]);
      else rows.push([{ t: 'x', v: r.text }, { t: 's', id: id }]);
      slots.push({ id: id, w: w, dec: true });
      sol[id] = S(r.ans);
    });
    var steps = t.rows.map(function (r) {
      if (r.pre) return S(r.ans) + ' ' + r.after;
      if (r.gap) return r.text + ' ' + S(r.ans) + ' ' + r.after;
      return r.text + ' ' + S(r.ans);
    });
    return {
      type: 'steps', rows: rows, slots: slots, solution: sol, steps: steps,
      hint: t.kind === 'rat' ? TIPS['rat' + t.op] : TIPS[t.op],
      check: function (read) {
        var bad = [];
        t.rows.forEach(function (r, i) { if (!RG.same(read('a' + i), RG.dVal(r.ans))) bad.push('a' + i); });
        var msg = '';
        if (bad.length) {
          var signErr = t.kind === 'rat' && t.rows.some(function (r, i) { var v = read('a' + i); return v !== null && RG.same(-v, RG.dVal(r.ans)) && r.ans.i !== 0; });
          msg = signErr ? 'Achte auf das Vorzeichen: Ist das Ergebnis links oder rechts von der 0?' : 'Die rot markierten Aufgaben stimmen noch nicht.';
        }
        return { ok: !bad.length, bad: bad, msg: msg };
      }
    };
  };
})(window.RG);
