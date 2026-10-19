/* Rechen-Gipfel – kleine Hilfsfunktionen */
window.RG = window.RG || {};
(function (RG) {
  RG.rnd = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  RG.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  RG.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  /* Tausendergruppen mit schmalem Leerzeichen: 12 345 */
  RG.fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  RG.len = function (n) { return String(n).length; };
  RG.digitsOf = function (n) { return String(n).split('').map(Number); };
  /* Stellenwert-Zerlegung: 285 -> [200, 80, 5] (Nullen fallen weg) */
  RG.placeParts = function (n) {
    var s = String(n), out = [];
    for (var i = 0; i < s.length; i++) {
      var d = Number(s[i]);
      if (d) out.push(d * Math.pow(10, s.length - 1 - i));
    }
    return out;
  };
  /* Stellenwert-Namen von rechts: E, Z, H, T, ZT, HT */
  RG.PLACE = ['E', 'Z', 'H', 'T', 'ZT', 'HT', 'M'];
  RG.PLACE_LONG = ['Einer', 'Zehner', 'Hunderter', 'Tausender', 'Zehntausender', 'Hunderttausender', 'Millionen'];

  /* Überschlag: auf die höchste Stelle runden */
  RG.roundLead = function (n) {
    var p = Math.pow(10, String(n).length - 1);
    return Math.round(n / p) * p;
  };

  /* Speicher (nur in diesem Browser) */
  var KEY = 'rechengipfel6-v1';
  RG.store = {
    load: function () { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } },
    save: function (d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* ohne Speicher weiter */ } },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) { /* egal */ } }
  };

  /* DOM-Helfer */
  RG.el = function (tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === undefined || v === null || v === false) return;
        if (k === 'text') e.textContent = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  };
})(window.RG);

/* ---------- Dezimalzahlen und negative Zahlen ---------- */
(function (RG) {
  /* Eine Dezimalzahl ist {i, k}: ganze Zahl i geteilt durch 10^k (k = Stellen nach dem Komma) */
  RG.D = function (i, k) { return { i: i, k: k || 0 }; };
  RG.dVal = function (x) { return x.i / Math.pow(10, x.k); };
  RG.dScale = function (x, k) { return x.i * Math.pow(10, k - x.k); };
  RG.dNorm = function (x) { var i = x.i, k = x.k; while (k > 0 && i % 10 === 0) { i /= 10; k--; } return { i: i, k: k }; };
  RG.dIntLen = function (x) { return String(Math.floor(Math.abs(x.i) / Math.pow(10, x.k))).length; };
  /* Ziffern ohne Komma, mit führender 0 bei 0,xx: 0,84 -> "084" */
  RG.dDigits = function (x) {
    var s = String(Math.abs(x.i));
    while (s.length < x.k + 1) s = '0' + s;
    return s;
  };
  /* Deutsche Schreibweise: 12,05  −3  1 250,5 */
  RG.dStr = function (x) {
    var s = RG.dDigits(x), ip = s.slice(0, s.length - x.k), fp = s.slice(s.length - x.k);
    return (x.i < 0 ? '−' : '') + RG.fmt(ip) + (x.k ? ',' + fp : '');
  };
  RG.dSum = function (list) {
    var K = Math.max.apply(null, list.map(function (x) { return x.k; }));
    return { i: list.reduce(function (s, x) { return s + RG.dScale(x, K); }, 0), k: K };
  };
  RG.dMul = function (a, b) { return { i: a.i * b.i, k: a.k + b.k }; };
  /* Zufällige Dezimalzahl zwischen lo und hi (ganzzahliger Anteil) mit k Stellen, letzte Stelle nicht 0 */
  RG.rndDec = function (lo, hi, k) {
    var p = Math.pow(10, k), i;
    do { i = RG.rnd(lo * p, hi * p + p - 1); } while (k > 0 && i % 10 === 0);
    if (i === 0) i = k ? 1 : 1;
    return { i: i, k: k };
  };
  /* Eingabe lesen: "12,5", "−3", "-0,25" -> Zahl oder null */
  RG.parseNum = function (s) {
    if (s === null || s === undefined) return null;
    s = String(s).replace('−', '-').replace(',', '.').replace(/\s| /g, '');
    if (s === '' || s === '-' || s === '.' || s === '-.') return null;
    var v = Number(s);
    return isNaN(v) ? null : v;
  };
  RG.same = function (a, b) { return a !== null && b !== null && a !== undefined && Math.abs(a - b) < 1e-9; };
  /* Stellennamen für Zahlen mit k Nachkommastellen, von rechts gezählt */
  RG.placeNames = function (k, total) {
    var dec = ['z', 'h', 't'], out = [];
    for (var p = 0; p < total; p++) out.push(p < k ? dec[k - 1 - p] : RG.PLACE[p - k]);
    return out;
  };
})(window.RG);
