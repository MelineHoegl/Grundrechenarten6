/* Rechen-Gipfel 6 – Übungsformen auf dem Bildschirm
   GridWidget  : schriftlich in Rechenkästchen, mit Komma-Spalte
   StepsWidget : Felder in Rechenzeilen (Kopfrechnen, rationale Zahlen, Komma setzen)
   ComboWidget : mehrere Teile hintereinander (Multiplikation: Kästchen + Komma setzen)
   DivWidget   : schriftliche Division Schritt für Schritt, mit Komma */
(function (RG) {
  var el = RG.el, F = RG.fmt, S = RG.dStr;

  /* =================== Rechenkästchen =================== */
  function GridWidget(spec) {
    var self = this;
    this.spec = spec; this.vals = {}; this.state = {}; this.shown = {}; this.locked = false;
    spec.rows.forEach(function (r) { if (r.key) self.vals[r.key] = {}; });
    var first = spec.rows.filter(function (r) { return r.type === 'input'; })[0];
    this.sel = { key: first.key, col: first.cols[first.cols.length - 1] };
    this.supportsMark = spec.rows.some(function (r) { return r.mode === 'mark'; });
    this.el = el('div', { class: 'grid-wrap' });
    this.active = true;
    this.render();
  }
  GridWidget.prototype.row = function (key) { return this.spec.rows.filter(function (r) { return r.key === key; })[0]; };
  GridWidget.prototype.editableRows = function () { return this.spec.rows.filter(function (r) { return r.key; }); };
  GridWidget.prototype.render = function () {
    var self = this, C = this.spec.C;
    var g = el('div', { class: 'grid', style: '--cols:' + (C + 1), role: 'group', 'aria-label': 'Rechenkästchen' });
    this.spec.rows.forEach(function (r, ri) {
      for (var c = 0; c <= C; c++) {
        var cls = ['cell'], node;
        if (c === 0) cls.push('first');
        if (ri === 0) cls.push('top');
        if (r.ruleTop) cls.push('rule');
        if (r.small) cls.push('small');
        if (c === 0 && r.sign) {
          cls.push('sign');
          node = el('div', { class: cls.join(' '), text: r.sign });
        } else if (r.type === 'static') {
          if (r.cls && r.cls[c]) cls.push(r.cls[c]);
          node = el('div', { class: cls.join(' '), text: r.cells[c] || '' });
        } else if (r.fixed && r.fixed[c]) {
          cls.push('comma');
          node = el('div', { class: cls.join(' '), text: r.fixed[c] });
        } else if (r.cols.indexOf(c) >= 0) {
          cls.push('in');
          if (r.mode === 'mark') cls.push('mark');
          if (!self.locked && self.active && self.sel && self.sel.key === r.key && self.sel.col === c) cls.push('sel');
          if (self.state[r.key]) cls.push(self.state[r.key]);
          if (self.shown[r.key] && self.shown[r.key][c]) cls.push('shown');
          var v = self.vals[r.key][c] || '';
          node = el('button', {
            type: 'button', class: cls.join(' '), text: v,
            'aria-label': r.label + ', Kästchen ' + c + (v ? ': ' + v : ', leer'),
            onclick: (function (k, cc) { return function () { self.select(k, cc); }; })(r.key, c)
          });
        } else {
          node = el('div', { class: cls.join(' ') });
        }
        g.appendChild(node);
      }
    });
    var notes = [];
    if (this.spec.rows.some(function (r) { return r.key === 'c'; })) notes.push('Kleine Kästchen: Platz für Merkzahlen (freiwillig).');
    if (this.supportsMark) notes.push('Strich-Zeile: Tippe unter die Stelle, die du entbündelst.');
    if (this.spec.rows.some(function (r) { return r.cls && Object.keys(r.cls).length; })) notes.push('Farbige Nullen sind ergänzt.');
    this.el.replaceChildren(g, notes.length ? el('p', { class: 'grid-legend', text: notes.join(' ') }) : '');
  };
  GridWidget.prototype.select = function (key, col) {
    if (this.locked) return;
    this.sel = { key: key, col: col };
    if (this.onFocus) this.onFocus();
    if (this.row(key).mode === 'mark') this.toggle();
    else this.render();
  };
  GridWidget.prototype.toggle = function () {
    var v = this.vals[this.sel.key];
    v[this.sel.col] = v[this.sel.col] ? '' : '|';
    this.render();
  };
  GridWidget.prototype.type = function (d) {
    if (this.locked || !this.sel || !/^\d$/.test(d)) return;
    var r = this.row(this.sel.key);
    if (r.mode === 'mark') { this.toggle(); return; }
    this.vals[r.key][this.sel.col] = String(d);
    this.state[r.key] = null;
    var i = r.cols.indexOf(this.sel.col);
    if (i > 0) this.sel = { key: r.key, col: r.cols[i - 1] };
    this.render();
  };
  GridWidget.prototype.back = function () {
    if (this.locked || !this.sel) return;
    var r = this.row(this.sel.key), v = this.vals[r.key];
    if (v[this.sel.col]) v[this.sel.col] = '';
    else {
      var i = r.cols.indexOf(this.sel.col);
      if (i < r.cols.length - 1) { this.sel = { key: r.key, col: r.cols[i + 1] }; v[this.sel.col] = ''; }
    }
    this.state[r.key] = null;
    this.render();
  };
  /* gibt false zurück, wenn es in diese Richtung nicht weitergeht */
  GridWidget.prototype.move = function (dir) {
    if (this.locked || !this.sel) return false;
    var r = this.row(this.sel.key), i = r.cols.indexOf(this.sel.col), moved = false;
    if (dir === 'left' && i > 0) { this.sel.col = r.cols[i - 1]; moved = true; }
    else if (dir === 'right' && i < r.cols.length - 1) { this.sel.col = r.cols[i + 1]; moved = true; }
    else if (dir === 'up' || dir === 'down') {
      var rows = this.editableRows(), k = rows.indexOf(r) + (dir === 'up' ? -1 : 1);
      if (k >= 0 && k < rows.length) {
        var nr = rows[k], col = this.sel.col;
        if (nr.cols.indexOf(col) < 0) col = col < nr.cols[0] ? nr.cols[0] : nr.cols[nr.cols.length - 1];
        this.sel = { key: nr.key, col: col }; moved = true;
      }
    }
    this.render();
    return moved;
  };
  GridWidget.prototype.read = function (key) {
    var r = this.row(key), v = this.vals[key];
    var chars = r.cols.map(function (c) { return v[c] || ''; });
    if (chars.every(function (c) { return c === ''; })) return null;
    return Number(chars.map(function (c) { return c === '' ? '0' : c; }).join(''));
  };
  GridWidget.prototype.check = function () {
    var self = this, res = this.spec.check(function (k) { return self.read(k); });
    Object.keys(res.rows).forEach(function (k) { self.state[k] = res.rows[k] ? 'ok' : 'bad'; });
    this.render();
    return res;
  };
  GridWidget.prototype.reveal = function () {
    var self = this, sol = this.spec.solution;
    Object.keys(sol).forEach(function (k) {
      if (!self.vals[k]) return;
      self.shown[k] = {};
      var row = self.row(k);
      row.cols.forEach(function (c) {
        var want = sol[k][c] || '';
        if ((self.vals[k][c] || '') !== want) { self.vals[k][c] = want; if (want) self.shown[k][c] = true; }
      });
      if (row.type === 'input') self.state[k] = null;
    });
    this.locked = true;
    this.render();
  };
  GridWidget.prototype.lock = function () { this.locked = true; this.render(); };
  GridWidget.prototype.setActive = function (a) { this.active = a; this.render(); };
  GridWidget.prototype.hint = function () { return this.spec.hint; };
  GridWidget.prototype.steps = function () { return this.spec.steps; };
  GridWidget.prototype.intro = 'Tippe ein Kästchen an und gib die Ziffern ein. Du rechnest von rechts nach links, darum springt der Rahmen nach links. Das Komma steht schon da.';

  /* =================== Felder in Rechenzeilen =================== */
  function StepsWidget(spec) {
    var self = this;
    this.spec = spec; this.vals = {}; this.state = {}; this.shown = {}; this.locked = false; this.active = true;
    this.slots = {}; spec.slots.forEach(function (s) { self.slots[s.id] = s; });
    this.order = spec.slots.filter(function (s) { return s.given === null || s.given === undefined; }).map(function (s) { return s.id; });
    this.sel = this.order[0];
    this.el = el('div', { class: 'steps' });
    this.render();
  }
  StepsWidget.prototype.show = function (id) {
    var v = this.vals[id], s = this.slots[id];
    if (!v) return '';
    return s.dec ? v : F(Number(v));
  };
  StepsWidget.prototype.render = function () {
    var self = this;
    var rows = this.spec.rows.map(function (row) {
      var isFinal = row.some(function (t) { return t.t === 's' && self.slots[t.id].final; });
      return el('div', { class: 'hs-row' + (isFinal ? ' final' : '') }, row.map(function (t) {
        if (t.t === 'x') return el('span', { text: t.v });
        if (t.t === 'r') return el('span', { class: 'ref', text: self.vals[t.id] ? self.show(t.id) : '…' });
        var sl = self.slots[t.id];
        if (sl.given !== null && sl.given !== undefined) return el('span', { class: 'slot given', style: '--w:' + sl.w, text: F(sl.given) });
        var cls = ['slot'];
        if (!self.locked && self.active && self.sel === t.id) cls.push('sel');
        if (self.state[t.id]) cls.push(self.state[t.id]);
        if (self.shown[t.id]) cls.push('shown');
        var v = self.show(t.id);
        return el('button', {
          type: 'button', class: cls.join(' '), style: '--w:' + sl.w, text: v,
          'aria-label': 'Eingabefeld' + (v ? ': ' + v : ', leer'),
          onclick: function () { if (!self.locked) { self.sel = t.id; if (self.onFocus) self.onFocus(); self.render(); } }
        });
      }));
    });
    this.el.replaceChildren.apply(this.el, rows);
  };
  StepsWidget.prototype.type = function (d) {
    if (this.locked || !this.sel) return;
    var s = this.slots[this.sel], cur = this.vals[this.sel] || '';
    if (d === ',') { if (!s.dec || cur.indexOf(',') >= 0) return; cur = (cur === '' || cur === '−' ? cur + '0' : cur) + ','; }
    else if (d === '-') { if (!s.dec) return; cur = cur[0] === '−' ? cur.slice(1) : '−' + cur; }
    else {
      if (cur.replace(/[−,]/g, '').length >= 9) return;
      cur = (cur === '0' ? '' : cur === '−0' ? '−' : cur) + d;
    }
    this.vals[this.sel] = cur;
    this.state[this.sel] = null;
    this.render();
  };
  StepsWidget.prototype.back = function () {
    if (this.locked || !this.sel) return;
    var cur = this.vals[this.sel] || '';
    if (cur) this.vals[this.sel] = cur.slice(0, -1);
    else this.move('left');
    this.state[this.sel] = null;
    this.render();
  };
  StepsWidget.prototype.move = function (dir) {
    if (this.locked) return false;
    var i = this.order.indexOf(this.sel), moved = false;
    if ((dir === 'left' || dir === 'up') && i > 0) { this.sel = this.order[i - 1]; moved = true; }
    if ((dir === 'right' || dir === 'down') && i < this.order.length - 1) { this.sel = this.order[i + 1]; moved = true; }
    this.render();
    return moved;
  };
  StepsWidget.prototype.nextEmpty = function () {
    var self = this, i = this.order.indexOf(this.sel);
    var rest = this.order.slice(i + 1).concat(this.order.slice(0, i + 1));
    var nxt = rest.filter(function (id) { return !self.vals[id]; })[0];
    if (nxt && this.vals[this.sel]) { this.sel = nxt; this.render(); return true; }
    return false;
  };
  StepsWidget.prototype.read = function (id) {
    var s = this.slots[id];
    if (s && s.given !== null && s.given !== undefined) return s.given;
    var v = this.vals[id];
    if (!v) return null;
    return s.dec ? RG.parseNum(v) : Number(v);
  };
  StepsWidget.prototype.check = function () {
    var self = this, res = this.spec.check(function (id) { return self.read(id); });
    this.order.forEach(function (id) {
      if (res.bad.indexOf(id) >= 0) self.state[id] = 'bad';
      else if (self.vals[id]) self.state[id] = 'ok';
      else self.state[id] = null;
    });
    this.render();
    return res;
  };
  StepsWidget.prototype.reveal = function () {
    var self = this, sol = this.spec.solution;
    this.order.forEach(function (id) {
      if (sol[id] === undefined) { self.vals[id] = ''; self.state[id] = null; return; }
      var want = String(sol[id]), have = self.read(id);
      var wantNum = self.slots[id].dec ? RG.parseNum(want) : Number(want);
      if (!RG.same(have, wantNum)) { self.vals[id] = want; self.shown[id] = true; }
      self.state[id] = null;
    });
    this.locked = true;
    this.render();
  };
  StepsWidget.prototype.lock = function () { this.locked = true; this.render(); };
  StepsWidget.prototype.setActive = function (a) { this.active = a; this.render(); };
  StepsWidget.prototype.hint = function () { return this.spec.hint; };
  StepsWidget.prototype.steps = function () { return this.spec.steps; };
  StepsWidget.prototype.intro = 'Tippe ein Feld an und gib das Ergebnis ein. Mit ▶ oder der Eingabetaste kommst du ins nächste Feld.';

  /* =================== Mehrere Teile =================== */
  function ComboWidget(spec) {
    var self = this;
    this.spec = spec;
    this.parts = spec.parts.map(function (p) { return p.spec.type === 'grid' ? new GridWidget(p.spec) : new StepsWidget(p.spec); });
    this.cur = 0;
    this.el = el('div', { class: 'combo' });
    spec.parts.forEach(function (p, i) {
      var w = self.parts[i];
      w.onFocus = function () { self.focus(i); };
      self.el.appendChild(el('div', { class: 'combo-part' }, [el('p', { class: 'combo-label', text: p.label }), w.el]));
    });
    this.focus(0);
  }
  ComboWidget.prototype.focus = function (i) {
    this.cur = i;
    this.parts.forEach(function (p, k) { p.active = k === i; p.render(); });
  };
  ComboWidget.prototype.type = function (d) { this.parts[this.cur].type(d); };
  ComboWidget.prototype.back = function () { this.parts[this.cur].back(); };
  ComboWidget.prototype.move = function (dir) {
    if (this.parts[this.cur].move(dir)) return true;
    if ((dir === 'down' || dir === 'right') && this.cur < this.parts.length - 1) { this.focus(this.cur + 1); return true; }
    if ((dir === 'up' || dir === 'left') && this.cur > 0) { this.focus(this.cur - 1); return true; }
    return false;
  };
  ComboWidget.prototype.nextEmpty = function () {
    var p = this.parts[this.cur];
    if (p.nextEmpty && p.nextEmpty()) return true;
    if (this.cur < this.parts.length - 1) { this.focus(this.cur + 1); return true; }
    return false;
  };
  ComboWidget.prototype.check = function () {
    var res = this.parts.map(function (p) { return p.check(); });
    var ok = res.every(function (r) { return r.ok; });
    var firstBad = res.filter(function (r) { return !r.ok; })[0];
    return { ok: ok, msg: ok ? '' : firstBad.msg };
  };
  ComboWidget.prototype.reveal = function () { this.parts.forEach(function (p) { p.reveal(); }); };
  ComboWidget.prototype.lock = function () { this.parts.forEach(function (p) { p.lock(); }); };
  ComboWidget.prototype.hint = function () { return this.spec.hint; };
  ComboWidget.prototype.steps = function () { return this.spec.steps; };
  ComboWidget.prototype.intro = 'Rechne zuerst in den Kästchen ohne Komma. Danach zählst du die Stellen und setzt das Komma. Mit ▼ kommst du zum nächsten Teil.';

  /* =================== Division Schritt für Schritt, mit Komma =================== */
  function DivWidget(t, stufe) {
    var self = this;
    this.t = t; this.stufe = stufe; this.guided = true;
    this.digits = RG.dDigits(t.Dsh);
    this.intLen = this.digits.length - t.Dsh.k;
    this.steps = RG.divSteps(this.digits, t.d);
    this.qText = S(t.q);
    this.prompts = [];
    if (t.shift) {
      this.prompts.push({ type: 'shift' });
      this.prompts.push({ type: 'newD' });
    }
    this.steps.forEach(function (s, k) {
      self.prompts.push({ k: k, type: 'q' });
      if (s.q > 0) {
        if (stufe === 1) self.prompts.push({ k: k, type: 'prod' });
        self.prompts.push({ k: k, type: 'rem' });
      }
    });
    this.shown = this.steps.map(function () { return {}; });
    this.red = this.steps.map(function () { return {}; });
    this.shiftDone = !t.shift;
    this.pi = 0; this.typed = ''; this.mistakes = 0; this.miss = 0; this.done = false;
    this.el = el('div', { class: 'div-wrap' });
    this.render();
  }
  DivWidget.prototype.cur = function () { return this.prompts[this.pi]; };
  DivWidget.prototype.expected = function (p) {
    if (p.type === 'shift') return this.t.shift;
    if (p.type === 'newD') return RG.dVal(this.t.Dsh);
    var s = this.steps[p.k];
    return p.type === 'q' ? s.q : (p.type === 'prod' ? s.prod : s.rem);
  };
  DivWidget.prototype.question = function (p) {
    var t = this.t;
    if (p.type === 'shift') return 'Der Divisor ' + S(t.dv) + ' soll eine ganze Zahl werden. Um wie viele Stellen verschiebst du das Komma bei beiden Zahlen nach rechts?';
    if (p.type === 'newD') return 'Neue Aufgabe: ? : ' + t.d + '. Wie heißt die neue erste Zahl?';
    var s = this.steps[p.k];
    if (p.type === 'q') return 'Wie oft passt ' + t.d + ' in ' + s.cur + '?';
    if (p.type === 'prod') return s.q + ' · ' + t.d + ' =';
    return this.stufe === 1 ? s.cur + ' − ' + s.prod + ' =' : 'Wie viel bleibt übrig?';
  };
  /* Spalte der Ziffer i im Dividenden (Spalte 0 für das Minuszeichen, Komma hat eine eigene Spalte) */
  DivWidget.prototype.colOf = function (i) { return 1 + i + (this.t.Dsh.k && i >= this.intLen ? 1 : 0); };
  DivWidget.prototype.render = function () {
    var self = this, t = this.t, nd = this.digits.length, ds = String(t.d);
    var commaCol = t.Dsh.k ? 1 + this.intLen : null;
    var C = this.colOf(nd - 1) + 1 + ds.length + 1 + this.qText.length;
    var rows = [];
    function blank() { var a = []; for (var i = 0; i <= C; i++) a.push({ v: '', c: [] }); return a; }
    if (!this.shiftDone) {
      var g0 = el('div', { class: 'div-original' }, [el('span', { text: S(t.Dv) + ' : ' + S(t.dv) })]);
      this.el.replaceChildren(g0, this.promptEl());
      return;
    }
    var top = blank();
    for (var i = 0; i < nd; i++) top[this.colOf(i)].v = this.digits[i];
    if (commaCol) top[commaCol].v = ',';
    var c = this.colOf(nd - 1) + 1;
    top[c++].v = ':';
    for (i = 0; i < ds.length; i++) top[c++].v = ds[i];
    top[c++].v = '=';
    /* Ergebnis schrittweise zeigen: führende Nullen und Komma erscheinen mit der ersten Ziffer */
    var answered = this.shown.filter(function (x) { return x.q; }).length;
    var qDigits = this.qText.replace(',', ''), lead = qDigits.length - this.steps.length;
    var reveal = answered ? lead + answered : 0, seen = 0, intQ = this.qText.indexOf(',') < 0 ? qDigits.length : this.qText.indexOf(',');
    for (i = 0; i < this.qText.length; i++) {
      var ch = this.qText[i];
      if (ch === ',') { if (reveal > intQ) top[c + i].v = ','; continue; }
      if (seen < reveal) {
        top[c + i].v = ch;
        var stepIdx = seen - lead;
        if (stepIdx >= 0 && this.red[stepIdx] && this.red[stepIdx].q) top[c + i].c.push('shown');
      }
      seen++;
    }
    rows.push(top);
    var curRow = { 0: top };
    function put(row, txt, endDigit, red, down) {
      for (var m = 0; m < txt.length; m++) {
        var col = self.colOf(endDigit - (txt.length - 1 - m));
        if (col < 1) continue;
        row[col].v = txt[m];
        if (red) row[col].c.push('shown');
        if (down && m === txt.length - 1) row[col].c.push('down');
      }
    }
    this.steps.forEach(function (s, k) {
      if (self.shown[k].prod && s.q > 0) {
        var r = blank(), ps = String(s.prod);
        put(r, ps, s.end, self.red[k].prod, false);
        for (var j = 0; j < ps.length; j++) { var cc = self.colOf(s.end - j); if (cc >= 1) r[cc].c.push('ul'); }
        var mc = self.colOf(s.end - ps.length + 1) - 1;
        if (mc === commaCol) mc--;
        r[Math.max(0, mc)].v = '−';
        rows.push(r);
      }
      if (!self.shown[k].rem) return;
      if (s.q === 0) {
        var same = curRow[k];
        if (s.down !== undefined && same && same !== top) { put(same, String(s.down), s.end + 1, false, true); curRow[k + 1] = same; }
        else if (s.down !== undefined) { var r0 = blank(); put(r0, String(s.next), s.end + 1, false, true); rows.push(r0); curRow[k + 1] = r0; }
        return;
      }
      var r2 = blank();
      if (s.down !== undefined) put(r2, String(s.next), s.end + 1, self.red[k].rem, true);
      else put(r2, String(s.rem), s.end, self.red[k].rem, false);
      rows.push(r2);
      curRow[k + 1] = r2;
    });
    var p = this.cur();
    if (p && p.k !== undefined) {
      var hs = this.steps[p.k], row = curRow[p.k];
      if (row) {
        var from = p.k === 0 ? 0 : hs.end - String(hs.cur).length + 1;
        for (i = Math.max(0, from); i <= hs.end; i++) row[this.colOf(i)].c.push('hl');
      }
    }
    var g = el('div', { class: 'grid', style: '--cols:' + (C + 1), role: 'group', 'aria-label': 'Schriftliche Division' });
    rows.forEach(function (r, ri) {
      r.forEach(function (cell, ci) {
        var cls = ['cell'].concat(cell.c);
        if (ci === 0) cls.push('first');
        if (ri === 0) cls.push('top');
        g.appendChild(el('div', { class: cls.join(' '), text: cell.v }));
      });
    });
    var head = t.shift ? el('p', { class: 'combo-label', text: S(t.Dv) + ' : ' + S(t.dv) + ' wird zu ' + S(t.Dsh) + ' : ' + t.d }) : '';
    this.el.replaceChildren(head, g, this.promptEl());
  };
  DivWidget.prototype.promptEl = function () {
    if (this.done) return el('div', { class: 'div-prompt div-done' }, [el('span', { text: 'Fertig: ' + S(this.t.Dv) + ' : ' + S(this.t.dv) + ' = ' + this.qText })]);
    return el('div', { class: 'div-prompt' }, [
      el('span', { text: this.question(this.cur()) }),
      el('span', { class: 'slot sel', style: '--w:3', text: this.typed, 'aria-label': 'Deine Antwort' + (this.typed ? ': ' + this.typed : ', leer') })
    ]);
  };
  DivWidget.prototype.type = function (d) {
    if (this.done) return;
    var p = this.cur();
    if (d === ',') { if (p.type !== 'newD' || this.typed.indexOf(',') >= 0) return; this.typed = (this.typed || '0') + ','; }
    else if (/^\d$/.test(d)) { if (this.typed.length >= 8) return; this.typed = this.typed === '0' ? d : this.typed + d; }
    else return;
    this.render();
  };
  DivWidget.prototype.back = function () { if (!this.done) { this.typed = this.typed.slice(0, -1); this.render(); } };
  DivWidget.prototype.move = function () { return false; };
  DivWidget.prototype.markDone = function (p, red) {
    if (p.type === 'shift') return;
    if (p.type === 'newD') { this.shiftDone = true; return; }
    var s = this.steps[p.k];
    this.shown[p.k][p.type] = true;
    if (red) this.red[p.k][p.type] = true;
    if (p.type === 'q') {
      if (s.q === 0) this.shown[p.k].rem = true;
      else if (this.stufe === 2) this.shown[p.k].prod = true;
    }
  };
  DivWidget.prototype.afterMsg = function (p) {
    var t = this.t;
    if (p.type === 'shift') return 'Aus ' + S(t.dv) + ' wird ' + t.d + '.';
    if (p.type === 'newD') return 'Jetzt rechnest du ' + S(t.Dsh) + ' : ' + t.d + '.';
    var s = this.steps[p.k], msg = '';
    if (p.type === 'q') {
      var prevEnd = p.k === 0 ? -1 : this.steps[p.k - 1].end;
      if (t.Dsh.k && s.end >= this.intLen && prevEnd < this.intLen) {
        msg += p.k === 0 || this.intLen === 0 ? 'Vor dem Komma passt die ' + t.d + ' nicht hinein: Im Ergebnis steht 0 und dann das Komma. ' : 'Du hast das Komma überschritten: Setze im Ergebnis das Komma. ';
      }
      if (s.q === 0) msg += t.d + ' passt nicht in ' + s.cur + ', also 0 an. ';
    }
    if ((p.type === 'rem' || (p.type === 'q' && s.q === 0)) && s.down !== undefined) msg += 'Die ' + s.down + ' kommt nach unten. Jetzt rechnest du mit ' + s.next + '.';
    return msg;
  };
  DivWidget.prototype.submit = function () {
    if (this.done) return { state: 'done', ok: this.mistakes === 0 };
    if (this.typed === '') return { state: 'empty', msg: 'Tippe zuerst eine Zahl ein.' };
    var p = this.cur(), exp = this.expected(p), val = RG.parseNum(this.typed), t = this.t;
    this.typed = '';
    var msg, wrong = false;
    if (RG.same(val, exp)) {
      this.miss = 0;
      this.markDone(p, false);
      msg = RG.pick(['Richtig!', 'Stimmt!', 'Genau!', 'Super!']) + ' ' + this.afterMsg(p);
    } else {
      this.mistakes++; this.miss++;
      if (this.miss < 2) {
        var h, s = this.steps[p.k];
        if (p.type === 'shift') h = 'Zähle die Stellen nach dem Komma beim Divisor ' + S(t.dv) + '.';
        else if (p.type === 'newD') h = 'Verschiebe das Komma bei ' + S(t.Dv) + ' um ' + t.shift + (t.shift === 1 ? ' Stelle' : ' Stellen') + ' nach rechts.';
        else if (p.type === 'q') h = t.d + ' · ' + val + ' = ' + (t.d * val) + '. ' + (t.d * val > s.cur ? 'Das ist mehr als ' + s.cur + '. Nimm weniger.' : 'Da passt noch mehr hinein.');
        else if (p.type === 'prod') h = 'Rechne mit dem Einmaleins: ' + s.q + ' mal ' + t.d + '.';
        else h = 'Ziehe ab: ' + s.cur + ' − ' + s.prod + '.';
        this.render();
        return { state: 'retry', msg: 'Noch nicht. ' + h };
      }
      this.miss = 0; wrong = true;
      this.markDone(p, true);
      msg = 'Richtig ist ' + (p.type === 'newD' ? S(t.Dsh) : exp) + '. ' + this.afterMsg(p);
    }
    this.pi++;
    if (this.pi >= this.prompts.length) { this.done = true; this.render(); return { state: 'done', ok: this.mistakes === 0, wrong: wrong, msg: msg }; }
    this.render();
    return { state: 'next', wrong: wrong, msg: msg };
  };
  DivWidget.prototype.hint = function () {
    var p = this.cur(), t = this.t; if (!p) return '';
    if (p.type === 'shift') return S(t.dv) + ' hat ' + t.shift + (t.shift === 1 ? ' Stelle' : ' Stellen') + ' nach dem Komma.';
    if (p.type === 'newD') return 'Das Komma wandert bei ' + S(t.Dv) + ' genauso weit nach rechts wie beim Divisor.';
    var s = this.steps[p.k];
    if (p.type === 'q') return 'Sag die ' + t.d + 'er-Reihe auf: ' + [1, 2, 3, 4].map(function (k) { return k * t.d; }).join(', ') + ', … Welche Zahl ist am nächsten an ' + s.cur + ', aber nicht größer?';
    if (p.type === 'prod') return 'Einmaleins: ' + s.q + ' mal ' + t.d + '.';
    return 'Ziehe ab: ' + s.cur + ' − ' + s.prod + '.';
  };
  DivWidget.prototype.lock = function () { this.done = true; this.render(); };
  DivWidget.prototype.intro = 'Beantworte die Fragen Schritt für Schritt. Wenn du das Komma überschreitest, kommt im Ergebnis das Komma.';

  RG.GridWidget = GridWidget;
  RG.StepsWidget = StepsWidget;
  RG.ComboWidget = ComboWidget;
  RG.DivWidget = DivWidget;
})(window.RG);
