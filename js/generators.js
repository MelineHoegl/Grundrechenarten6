/* Rechen-Gipfel 6 – Aufgaben erzeugen
   Welt "dez": Dezimalzahlen, Rechenarten add/sub/mul/div, Verfahren sch (schriftlich) oder km (Kopfrechnen)
   Welt "rat": rationale Zahlen, Rechenarten add/sub, nur Kopfrechnen, ohne doppelte Vorzeichen
   Jede Stufe hat 5 Level (Hütten), die schwerer werden. */
(function (RG) {
  var rnd = RG.rnd, pick = RG.pick, D = RG.D, rd = RG.rndDec;

  function retry(make, ok) {
    var x;
    for (var i = 0; i < 500; i++) { x = make(); if (ok(x)) return x; }
    return x;
  }
  RG.retry = retry;
  function sum(list) { return RG.dSum(list); }
  function sub(a, b) { var K = Math.max(a.k, b.k); return { i: RG.dScale(a, K) - RG.dScale(b, K), k: K }; }
  function carriesD(list) { var K = Math.max.apply(null, list.map(function (x) { return x.k; })); return RG.carries(list.map(function (x) { return RG.dScale(x, K); })); }
  function borrowsD(a, b) { var K = Math.max(a.k, b.k); return RG.borrows(RG.dScale(a, K), RG.dScale(b, K)); }
  function lastNonZero(x) { return x.k === 0 || x.i % 10 !== 0; }

  /* ---------- Hilfen aus Klasse 5 (Überträge, Entbündeln) ---------- */
  RG.carries = function (nums) {
    var c = 0, cnt = 0, L = Math.max.apply(null, nums.map(RG.len));
    for (var i = 0; i < L; i++) {
      var s = c;
      nums.forEach(function (n) { s += Math.floor(n / Math.pow(10, i)) % 10; });
      c = Math.floor(s / 10);
      if (c) cnt++;
    }
    return cnt;
  };
  RG.borrows = function (a, b) {
    var A = String(a).split('').reverse().map(Number), B = String(b).split('').reverse().map(Number), c = 0, cnt = 0;
    for (var i = 0; i < A.length; i++) { var x = A[i] - c, y = B[i] || 0; if (x < y) { cnt++; c = 1; } else c = 0; }
    return cnt;
  };

  /* =================== Dezimalzahlen schriftlich =================== */
  function schAdd(s, L) {
    var t;
    if (s === 1) {
      t = [
        function () { return retry(function () { return [rd(1, 9, 1), rd(1, 9, 1)]; }, function (x) { return carriesD(x) === 0; }); },
        function () { return retry(function () { return [rd(1, 99, 1), rd(1, 99, 1)]; }, function (x) { return carriesD(x) >= 1; }); },
        function () { return retry(function () { return [rd(1, 99, 2), rd(1, 99, 2)]; }, function (x) { return carriesD(x) >= 1; }); },
        function () { return [rd(10, 999, 2), rd(10, 999, 2)]; },
        function () { return [rd(1, 99, 2), rd(10, 499, 2), rd(1, 99, 2)]; }
      ][L - 1]();
    } else {
      t = [
        function () { return [rd(1, 99, 1), rd(1, 99, 2)]; },
        function () { return RG.shuffle([rd(1, 99, 1), rd(1, 99, 3)]); },
        function () { return [rd(1, 99, 2), D(rnd(2, 99), 0), rd(1, 99, 1)]; },
        function () { return [rd(10, 999, 1), rd(1, 99, 3), rd(1, 99, 2)]; },
        function () { return [rd(100, 999, 2), rd(1, 9, 3), D(rnd(10, 99), 0), rd(10, 99, 1)]; }
      ][L - 1]();
    }
    return { world: 'dez', kind: 'add', terms: t, ans: RG.dNorm(sum(t)) };
  }
  function schSub(s, L) {
    var p;
    if (s === 1) {
      p = [
        function () { return retry(function () { return [rd(5, 9, 1), rd(1, 4, 1)]; }, function (x) { return borrowsD(x[0], x[1]) === 0; }); },
        function () { return retry(function () { return [rd(10, 99, 1), rd(1, 9, 1)]; }, function (x) { return borrowsD(x[0], x[1]) >= 1; }); },
        function () { return retry(function () { return [rd(20, 99, 2), rd(10, 19, 2)]; }, function (x) { return borrowsD(x[0], x[1]) >= 1; }); },
        function () { return retry(function () { return [rd(200, 999, 2), rd(100, 199, 2)]; }, function (x) { return borrowsD(x[0], x[1]) >= 2; }); },
        function () { return retry(function () { return [rd(10, 99, 3), rd(1, 9, 3)]; }, function (x) { return borrowsD(x[0], x[1]) >= 2; }); }
      ][L - 1];
    } else {
      p = [
        function () { return [rd(10, 99, 1), rd(1, 9, 2)]; },
        function () { return [D(rnd(5, 30), 0), rd(1, 4, 2)]; },
        function () { return [rd(10, 99, 2), rd(1, 9, 3)]; },
        function () { var a = D(rnd(2, 9) * 1000 + rnd(1, 9), 2); return [a, rd(10, 19, 2)]; },
        function () { return [D(pick([100, 200, 500, 1000]), 0), rd(10, 99, 2)]; }
      ][L - 1];
    }
    var t = retry(p, function (x) { return RG.dVal(x[0]) > RG.dVal(x[1]); });
    return { world: 'dez', kind: 'sub', a: t[0], b: t[1], ans: RG.dNorm(sub(t[0], t[1])) };
  }
  function schMul(s, L) {
    var n, f;
    if (s === 1) {
      n = [rd(1, 9, 1), rd(10, 99, 1), rd(1, 9, 2), rd(10, 99, 2), rd(1, 9, 3)][L - 1];
      f = D([rnd(2, 5), rnd(3, 9), rnd(2, 9), rnd(4, 9), rnd(6, 9)][L - 1], 0);
    } else {
      var pairs = [
        function () { return [rd(1, 9, 1), D(rnd(2, 9), 1)]; },
        function () { return [rd(1, 9, 1), retry(function () { return rd(1, 9, 1); }, function (x) { return x.i >= 11; })]; },
        function () { return [rd(1, 9, 2), retry(function () { return rd(1, 9, 1); }, function (x) { return x.i >= 11; })]; },
        function () { return [rd(1, 9, 2), retry(function () { return rd(0, 0, 2); }, function (x) { return x.i >= 11; })]; },
        function () { return [rd(1, 9, 3), retry(function () { return rd(1, 9, 1); }, function (x) { return x.i >= 11; })]; }
      ];
      var pr = pairs[L - 1]();
      n = pr[0]; f = pr[1];
    }
    return { world: 'dez', kind: 'mul', n: n, f: f, ans: RG.dNorm(RG.dMul(n, f)) };
  }
  /* Division: q = Ergebnis, d = Divisor (ganz). Dividend = q · d mit gleich vielen Nachkommastellen wie q */
  function schDiv(s, L) {
    var q, d, shift = 0;
    if (s === 1) {
      var cfg = [[1, 9, 1, 2, 5], [10, 99, 1, 3, 9], [1, 9, 2, 2, 9], [0, 0, 2, 3, 9], [10, 99, 2, 6, 9]][L - 1];
      var r = retry(function () { var qq = rd(cfg[0], cfg[1], cfg[2]), dd = rnd(cfg[3], cfg[4]); return [qq, dd]; },
        function (x) { return lastNonZero(D(x[0].i * x[1], x[0].k)) && x[0].i >= 2; });
      q = r[0]; d = r[1];
    } else {
      var c2 = [
        function () { return [D(rnd(2, 9), 0), rnd(2, 9), 1]; },
        function () { return [D(rnd(11, 99), 0), rnd(2, 9), 1]; },
        function () { return [rd(1, 9, 1), rnd(2, 9), 1]; },
        function () { return [D(rnd(11, 49), 0), rnd(2, 9), 2]; },
        function () { return [rd(1, 9, 1), rnd(11, 25), 1]; }
      ][L - 1];
      var r2 = retry(c2, function (x) { return lastNonZero(D(x[0].i * x[1], x[0].k + x[2])); });
      q = r2[0]; d = r2[1]; shift = r2[2];
    }
    var Dsh = { i: q.i * d, k: q.k };               /* Dividend nach dem Verschieben */
    var dividend = { i: Dsh.i, k: Dsh.k + shift };  /* Dividend in der Aufgabe */
    var divisor = { i: d, k: shift };
    return { world: 'dez', kind: 'div', Dv: dividend, dv: divisor, shift: shift, Dsh: Dsh, d: d, q: q, ans: q };
  }

  /* =================== Dezimalzahlen Kopfrechnen: Päckchen mit 3 Aufgaben =================== */
  function row(text, ans, opt) { return { text: text, ans: ans, gap: !!(opt && opt.gap), after: opt && opt.after, pre: !!(opt && opt.pre) }; }
  var S = RG.dStr;
  function kmRow(op, s, L) {
    var a, b, c;
    if (op === 'add') {
      if (s === 1) {
        if (L === 1) { a = D(rnd(1, 4), 1); b = D(rnd(1, 9 - a.i), 1); }
        else if (L === 2) { a = D(rnd(4, 9), 1); b = D(rnd(11 - a.i, 9), 1); }
        else if (L === 3) { a = rd(1, 9, 1); b = rd(1, 9, 1); }
        else if (L === 4) { a = rd(1, 9, 2); b = D(rnd(1, 9), 1); }
        else { a = retry(function () { return rd(0, 0, 2); }, function (x) { return x.i > 10; }); b = retry(function () { return rd(0, 0, 2); }, function (x) { return x.i > 10; }); }
        return row(S(a) + ' + ' + S(b) + ' =', RG.dSum([a, b]));
      }
      if (L === 1) { a = D(rnd(11, 99), 2); if (a.i % 10 === 0) a.i++; return row(S(a) + ' +', D(100 - a.i, 2), { gap: true, after: '= 1' }); }
      if (L === 2) { a = rd(1, 8, 1); var to = Math.ceil(RG.dVal(a)); return row(S(a) + ' +', sub(D(to, 0), a), { gap: true, after: '= ' + to }); }
      if (L === 3) { a = rd(1, 9, 2); b = rd(0, 1, 1); return row(S(a) + ' + ' + S(b) + ' =', RG.dSum([a, b])); }
      if (L === 4) { a = rd(1, 9, 1); b = rd(0, 0, 2); c = rd(1, 4, 2); return row(S(a) + ' + ' + S(b) + ' + ' + S(c) + ' =', RG.dSum([a, b, c])); }
      a = rd(0, 0, 3); b = rd(0, 0, 3); return row(S(a) + ' + ' + S(b) + ' =', RG.dSum([a, b]));
    }
    if (op === 'sub') {
      if (s === 1) {
        if (L === 1) { a = D(rnd(5, 9), 1); b = D(rnd(1, a.i - 1), 1); }
        else if (L === 2) { a = D(rnd(11, 18), 1); b = D(rnd(a.i % 10 + 1, 9), 1); }
        else if (L === 3) { a = rd(2, 9, 1); b = retry(function () { return rd(1, 4, 1); }, function (x) { return x.i < a.i; }); }
        else if (L === 4) { a = rd(1, 9, 2); b = D(rnd(1, 9), 1); if (RG.dVal(b) >= RG.dVal(a)) a = RG.dSum([a, D(1, 0)]); }
        else { a = D(1, 0); b = retry(function () { return rd(0, 0, 2); }, function (x) { return x.i > 10; }); }
        return row(S(a) + ' − ' + S(b) + ' =', RG.dNorm(sub(a, b)));
      }
      if (L === 1) { a = D(rnd(3, 9), 0); b = rd(1, a.i - 1, 1); }
      else if (L === 2) { a = rd(2, 9, 2); b = retry(function () { return rd(1, 3, 1); }, function (x) { return RG.dVal(x) < RG.dVal(a); }); }
      else if (L === 3) { a = D(pick([10, 20, 50]), 0); b = rd(1, 9, 2); }
      else if (L === 4) { b = rd(1, 4, 1); var r = rd(1, 5, 1); return row('', RG.dSum([r, b]), { gap: true, pre: true, after: '− ' + S(b) + ' = ' + S(r) }); }
      else { a = D(1, 0); b = rd(0, 0, 3); }
      return row(S(a) + ' − ' + S(b) + ' =', RG.dNorm(sub(a, b)));
    }
    if (op === 'mul') {
      if (s === 1) {
        if (L === 1) { a = rd(1, 99, rnd(1, 2)); b = D(pick([10, 100]), 0); }
        else if (L === 2) { a = pick([rd(0, 9, 2), rd(0, 9, 3)]); b = D(pick([10, 100, 1000]), 0); }
        else if (L === 3) { a = rd(0, 3, 1); b = D(rnd(2, 4), 0); }
        else if (L === 4) { a = pick([D(25, 2), D(15, 1), D(75, 2), rd(1, 2, 1)]); b = D(rnd(3, 8), 0); }
        else { a = pick([D(rnd(1, 9), 2), rd(1, 9, 1)]); b = D(rnd(5, 9), 0); }
      } else {
        if (L === 1) { a = D(rnd(1, 9), 1); b = D(rnd(1, 9), 1); }
        else if (L === 2) { a = rd(1, 3, 1); b = D(rnd(2, 5), 1); }
        else if (L === 3) { a = pick([D(rnd(11, 99), 0), rd(1, 99, 1)]); b = D(1, pick([1, 2])); }
        else if (L === 4) { a = pick([D(5, 1), D(25, 2), D(15, 1)]); b = D(rnd(2, 8), 1); }
        else { a = rd(1, 4, 1); b = D(rnd(2, 9), 2); }
      }
      return row(S(a) + ' · ' + S(b) + ' =', RG.dNorm(RG.dMul(a, b)));
    }
    /* Division: a = Ergebnis · b */
    var res, dvs;
    if (s === 1) {
      if (L === 1) { a = rd(1, 99, 1); dvs = D(pick([10, 100]), 0); res = { i: a.i, k: a.k + (dvs.i === 10 ? 1 : 2) }; }
      else if (L === 2) { a = pick([D(rnd(1, 99), 0), rd(1, 99, 1)]); dvs = D(pick([100, 1000]), 0); res = { i: a.i, k: a.k + (dvs.i === 100 ? 2 : 3) }; }
      else { res = L === 3 ? D(rnd(1, 4), 1) : (L === 4 ? D(rnd(1, 9), pick([1, 2])) : rd(0, 1, 1)); dvs = D(L === 3 ? rnd(2, 3) : rnd(3, 9), 0); a = RG.dMul(res, dvs); }
      return row(S(RG.dNorm(a)) + ' : ' + S(dvs) + ' =', RG.dNorm(res));
    }
    if (L === 1) { a = rd(1, 9, 1); dvs = D(1, 1); res = D(a.i, 0); }
    else if (L === 2) { res = D(rnd(2, 9), 0); dvs = D(rnd(2, 9), 1); a = RG.dMul(res, dvs); }
    else if (L === 3) { res = D(rnd(2, 9), 1); dvs = D(rnd(2, 9), 1); a = RG.dMul(res, dvs); }
    else if (L === 4) { res = D(rnd(2, 9), 0); dvs = D(rnd(11, 15), 1); a = RG.dMul(res, dvs); }
    else { res = D(rnd(2, 9), 0); dvs = D(rnd(2, 9), 2); a = RG.dMul(res, dvs); }
    return row(S(RG.dNorm(a)) + ' : ' + S(dvs) + ' =', RG.dNorm(res));
  }

  /* =================== Rationale Zahlen: nur −a + b, a − b, −a − b (keine doppelten Vorzeichen) =================== */
  function ratRow(op, s, L) {
    var lim = [10, 20, 50, 100, 100][L - 1], terms, ops;
    function pos(lo, hi, k) { return k ? rd(lo, hi, k) : D(rnd(Math.max(1, lo), hi), 0); }
    var k = 0, three = false;
    if (s === 2) {
      if (L === 1) { k = 1; lim = 10; }
      else if (L === 2) { three = true; lim = 20; }
      else if (L === 3) { lim = 1000; }
      else if (L === 4) { k = 2; lim = 10; }
      else { three = true; k = 1; lim = 20; }
    }
    if (op === 'add') {
      var a = pos(1, lim, k), b = pos(1, lim, k);
      if (s === 1 && L === 5 && Math.random() < 0.3) b = { i: a.i, k: a.k };
      terms = [{ i: -a.i, k: a.k }, b]; ops = ['+'];
      if (three) { terms.push(pos(1, lim, k)); ops.push('+'); }
    } else {
      var x = pos(1, lim, k), y = pos(1, lim, k);
      if (Math.random() < 0.5 || (s === 1 && L === 1)) {
        /* a − b mit b > a */
        if (RG.dVal(y) <= RG.dVal(x)) { var t = x; x = y; y = t; if (x.i === y.i) y = RG.dSum([y, D(1, 0)]); }
        terms = [x, y];
      } else {
        terms = [{ i: -x.i, k: x.k }, y];
      }
      if (s === 1 && L === 2) terms = [{ i: -Math.abs(x.i), k: x.k }, y];
      ops = ['−'];
      if (three) { terms.push(pos(1, lim, k)); ops.push('−'); }
    }
    var acc = terms[0];
    for (var j = 1; j < terms.length; j++) acc = ops[j - 1] === '+' ? RG.dSum([acc, terms[j]]) : sub(acc, terms[j]);
    var text = S(terms[0]);
    for (j = 1; j < terms.length; j++) text += ' ' + ops[j - 1] + ' ' + S(terms[j]);
    return { text: text + ' =', ans: RG.dNorm(acc), terms: terms, ops: ops };
  }

  RG.generate = function (world, op, mode, s, L) {
    L = Math.max(1, Math.min(5, L));
    if (world === 'rat') {
      var rr = [ratRow(op, s, L), ratRow(op, s, L), ratRow(op, s, L)];
      return { world: 'rat', kind: 'rat', op: op, rows: rr };
    }
    if (mode === 'km') {
      var rows = [], seen = {};
      while (rows.length < 3) {
        var r = kmRow(op, s, L), key = r.text + (r.after || '');
        if (seen[key] && rows.length < 3 && Object.keys(seen).length < 20) { seen[key] = 1; continue; }
        seen[key] = 1; rows.push(r);
      }
      return { world: 'dez', kind: 'km', op: op, rows: rows };
    }
    if (op === 'add') return schAdd(s, L);
    if (op === 'sub') return schSub(s, L);
    if (op === 'mul') return schMul(s, L);
    return schDiv(s, L);
  };

  /* =================== Sachaufgaben =================== */
  function maxK(list) { return Math.max.apply(null, list.map(function (x) { return x.k; })); }
  var SACH = {
    add: [
      { ok: function (t) { return t.terms.length === 2 && maxK(t.terms) <= 2 && RG.dVal(t.ans) < 200; }, text: function (t) { return 'Lea kauft im Schreibwarenladen ein Malset für ' + S(t.terms[0]) + ' € und einen Füller für ' + S(t.terms[1]) + ' €. Wie viel muss sie bezahlen?'; }, ans: function (t) { return 'Lea muss ' + S(t.ans) + ' € bezahlen.'; } },
      { ok: function (t) { return t.terms.length === 2 && RG.dVal(t.ans) < 100; }, text: function (t) { return 'Paul fährt mit dem Rad am Samstag ' + S(t.terms[0]) + ' km und am Sonntag ' + S(t.terms[1]) + ' km. Wie viele Kilometer sind das zusammen?'; }, ans: function (t) { return 'Paul fährt zusammen ' + S(t.ans) + ' km.'; } },
      { ok: function (t) { return t.terms.length > 2; }, text: function (t) { return 'Auf dem Wochenmarkt wiegt die Verkäuferin drei Sorten Obst ab: ' + t.terms.map(S).join(' kg, ') + ' kg. Wie viel Kilogramm sind das zusammen?'; }, ans: function (t) { return 'Zusammen sind es ' + S(t.ans) + ' kg.'; } },
      { ok: function () { return true; }, text: function (t) { return 'Ein Wanderweg hat mehrere Abschnitte: ' + t.terms.map(S).join(' km, ') + ' km. Wie lang ist der ganze Weg?'; }, ans: function (t) { return 'Der Weg ist ' + S(t.ans) + ' km lang.'; } }
    ],
    sub: [
      { ok: function (t) { return RG.dVal(t.a) <= 50; }, text: function (t) { return 'Ein Brett ist ' + S(t.a) + ' m lang. Der Hausmeister sägt ein Stück von ' + S(t.b) + ' m ab. Wie lang ist der Rest?'; }, ans: function (t) { return 'Der Rest ist ' + S(t.ans) + ' m lang.'; } },
      { ok: function (t) { return Math.max(t.a.k, t.b.k) <= 2; }, text: function (t) { return 'Frau Huber hat ' + S(t.a) + ' € im Geldbeutel. Beim Bäcker bezahlt sie ' + S(t.b) + ' €. Wie viel Geld bleibt ihr?'; }, ans: function (t) { return 'Ihr bleiben ' + S(t.ans) + ' €.'; } },
      { ok: function () { return true; }, text: function (t) { return 'In einem Fass sind ' + S(t.a) + ' l Apfelsaft. Beim Schulfest werden ' + S(t.b) + ' l ausgeschenkt. Wie viel Saft ist noch im Fass?'; }, ans: function (t) { return 'Im Fass sind noch ' + S(t.ans) + ' l Saft.'; } }
    ],
    mul: [
      { ok: function (t) { return t.f.k === 0 && t.n.k <= 2; }, text: function (t) { return 'Ein Liter Milch kostet ' + S(t.n) + ' €. Frau Huber kauft ' + S(t.f) + ' Liter. Wie viel muss sie bezahlen?'; }, ans: function (t) { return 'Sie muss ' + S(t.ans) + ' € bezahlen.'; } },
      { ok: function (t) { return t.f.k === 0; }, text: function (t) { return 'Für den Schulbasar braucht die Klasse ' + S(t.f) + ' Stoffbänder. Jedes Band ist ' + S(t.n) + ' m lang. Wie viele Meter Band sind das?'; }, ans: function (t) { return 'Das sind ' + S(t.ans) + ' m Band.'; } },
      { ok: function (t) { return t.f.k > 0 && t.n.k <= 2; }, text: function (t) { return 'Ein Kilogramm Äpfel kostet ' + S(t.n) + ' €. Lea kauft ' + S(t.f) + ' kg. Wie viel muss sie bezahlen?'; }, ans: function (t) { return 'Lea muss ' + S(t.ans) + ' € bezahlen.'; } },
      { ok: function (t) { return t.f.k > 0; }, text: function (t) { return 'Ein Beet ist ' + S(t.n) + ' m lang und ' + S(t.f) + ' m breit. Wie groß ist seine Fläche?'; }, ans: function (t) { return 'Das Beet ist ' + S(t.ans) + ' m² groß.'; } }
    ],
    div: [
      { ok: function (t) { return t.shift === 0 && t.Dv.k <= 2; }, text: function (t) { return t.d + ' Freunde teilen sich eine Rechnung von ' + S(t.Dv) + ' € gerecht. Wie viel zahlt jeder?'; }, ans: function (t) { return 'Jeder zahlt ' + S(t.ans) + ' €.'; } },
      { ok: function (t) { return t.shift === 0; }, text: function (t) { return 'Ein Seil ist ' + S(t.Dv) + ' m lang. Es wird in ' + t.d + ' gleich lange Stücke geschnitten. Wie lang ist ein Stück?'; }, ans: function (t) { return 'Ein Stück ist ' + S(t.ans) + ' m lang.'; } },
      { ok: function (t) { return t.shift > 0 && t.q.k === 0; }, text: function (t) { return 'Ein Geschenkband ist ' + S(t.Dv) + ' m lang. Es wird in Stücke zu je ' + S(t.dv) + ' m geschnitten. Wie viele Stücke entstehen?'; }, ans: function (t) { return 'Es entstehen ' + S(t.ans) + ' Stücke.'; } },
      { ok: function (t) { return t.shift > 0 && t.q.k === 0; }, text: function (t) { return 'Eine Flasche fasst ' + S(t.dv) + ' l. Wie viele Flaschen kann man mit ' + S(t.Dv) + ' l Saft füllen?'; }, ans: function (t) { return 'Man kann ' + S(t.ans) + ' Flaschen füllen.'; } }
    ],
    rat: {
      add: [
        { ok: function (r) { return r.terms.length === 2 && r.terms[0].k === 0 && Math.abs(r.terms[0].i) <= 30; }, text: function (r) { return 'Am Morgen zeigt das Thermometer ' + S(r.terms[0]) + ' °C. Bis zum Mittag wird es ' + S(r.terms[1]) + ' Grad wärmer. Wie warm ist es mittags?'; }, ans: function (r) { return 'Mittags sind es ' + S(r.ans) + ' °C.'; } },
        { ok: function (r) { return r.terms.length === 2; }, text: function (r) { return 'Tims Konto steht bei ' + S(r.terms[0]) + ' €. Er zahlt ' + S(r.terms[1]) + ' € ein. Wie steht sein Konto jetzt?'; }, ans: function (r) { return 'Sein Konto steht bei ' + S(r.ans) + ' €.'; } }
      ],
      sub: [
        { ok: function (r) { return r.terms.length === 2 && r.terms[0].k === 0 && Math.abs(r.terms[0].i) <= 30; }, text: function (r) { return 'Am Abend sind es ' + S(r.terms[0]) + ' °C. In der Nacht wird es ' + S(r.terms[1]) + ' Grad kälter. Wie kalt ist es in der Nacht?'; }, ans: function (r) { return 'In der Nacht sind es ' + S(r.ans) + ' °C.'; } },
        { ok: function (r) { return r.terms.length === 2; }, text: function (r) { return 'Ein Konto steht bei ' + S(r.terms[0]) + ' €. Es werden ' + S(r.terms[1]) + ' € abgebucht. Wie steht das Konto jetzt?'; }, ans: function (r) { return 'Das Konto steht bei ' + S(r.ans) + ' €.'; } }
      ]
    }
  };
  function calc(A, sym, B) { return S(A) + ' ' + sym + ' ' + S(B); }
  var SYM = { add: '+', sub: '−', mul: '·', div: ':' };

  RG.makeSach = function (task) {
    var tpl, fits, options;
    if (task.world === 'rat') {
      var r = task.rows[0];
      fits = SACH.rat[task.op].filter(function (x) { return x.ok(r); });
      if (!fits.length) return null;
      tpl = pick(fits);
      var a = r.terms[0], b = r.terms[1], absA = { i: Math.abs(a.i), k: a.k };
      var neg = { i: -absA.i, k: a.k };
      var cands = [S(a) + ' ' + r.ops[0] + ' ' + S(b), S(a) + ' ' + (r.ops[0] === '+' ? '−' : '+') + ' ' + S(b), S(a.i < 0 ? absA : neg) + ' ' + r.ops[0] + ' ' + S(b)];
      options = [{ label: cands[0], correct: true }, { label: cands[1], correct: false }, { label: cands[2], correct: false }];
      return { text: tpl.text(r), answer: tpl.ans(r), options: RG.shuffle(options) };
    }
    fits = SACH[task.kind].filter(function (x) { return x.ok(task); });
    if (!fits.length) return null;
    tpl = pick(fits);
    var A, B;
    if (task.kind === 'add') { A = task.terms[0]; B = task.terms[1]; }
    else if (task.kind === 'sub') { A = task.a; B = task.b; }
    else if (task.kind === 'mul') { A = task.n; B = task.f; }
    else { A = task.Dv; B = task.dv; }
    if (task.kind === 'add' && task.terms.length > 2) {
      options = [{ label: task.terms.map(S).join(' + '), correct: true }, { label: calc(task.terms[0], '+', task.terms[1]), correct: false }, { label: task.terms.map(S).join(' − '), correct: false }];
    } else {
      options = [{ label: calc(A, SYM[task.kind], B), correct: true }];
      RG.shuffle(['add', 'sub', 'mul', 'div'].filter(function (o) { return o !== task.kind; })).slice(0, 2)
        .forEach(function (o) { options.push({ label: calc(A, SYM[o], B), correct: false }); });
    }
    return { text: tpl.text(task), answer: tpl.ans(task), options: RG.shuffle(options) };
  };
})(window.RG);
