(function () {
  // Beim Aufrufen immer ganz oben starten (Browser merkt sich sonst die alte Scroll-Position)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function jumpTop() {
    // ohne weiches Scrollen, sonst wird der Sprung nach oben unterbrochen
    var html = document.documentElement, prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }
  window.__clarityTop = jumpTop;
  function toTop() {
    if (!location.hash) { jumpTop(); return; }
    // Kommt man über einen Link wie index.html#kontakt, springt die Seite dorthin;
    // danach wird der Anker entfernt, damit ein Neuladen wieder oben beginnt
    setTimeout(function () {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    }, 500);
  }
  toTop();
  window.addEventListener('load', toTop);
  window.addEventListener('pageshow', toTop);
  // Links innerhalb der Seite scrollen weich, ohne #Anker in der Adresse zu hinterlassen,
  // damit ein Neuladen wieder ganz oben beginnt
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href').slice(1);
      var target = id === 'top' ? document.body : document.getElementById(id);
      if (!target) return;
      ev.preventDefault();
      if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  var toggle = document.querySelector('.nav-toggle');
  var body = document.body;

  // Mobiles Menü
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    });
    document.querySelectorAll('.rail-nav a, .nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Menü öffnen');
      });
    });
  }

  // Seitenleiste: aktuellen Abschnitt markieren
  var navLinks = document.querySelectorAll('.rail-nav a[data-sec]');
  var sections = document.querySelectorAll('[data-section]');
  if (navLinks.length && sections.length) {
    var mark = function () {
      var line = window.innerHeight * 0.35, current = sections[0].getAttribute('data-section');
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) current = s.getAttribute('data-section'); });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1].getAttribute('data-section');
      navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-sec') === current); });
    };
    var ticking = false;
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; mark(); }); } }, { passive: true });
    window.addEventListener('resize', mark);
    mark();
  }

  // Leistungen: Register (links wählen, rechts Details)
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.register-index [role="tab"]'));
  if (tabs.length) {
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if (!p) return;
        if (on) { p.hidden = false; p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); }
        else p.hidden = true;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('keydown', function (ev) {
        var k = ev.key, n = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (k === 'ArrowUp' || k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === 'Home') n = tabs[0];
        else if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { ev.preventDefault(); select(n, true); }
      });
    });
    select(tabs[0], false);
  }

  // Jahr im Footer
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Kontaktformular ohne Seitenwechsel senden
  var form = document.querySelector('.contact-form');
  if (form && window.fetch) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      status.className = 'form-status';
      status.textContent = 'Wird gesendet …';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.error || 'Fehler');
          status.className = 'form-status ok';
          status.textContent = 'Nachricht gesendet. Wir melden uns innert eines Arbeitstages.';
          form.reset();
        })
        .catch(function () {
          status.className = 'form-status err';
          status.innerHTML = 'Die Nachricht konnte nicht gesendet werden. Schreiben Sie uns direkt an <a href="mailto:info@clarity-aa.ch">info@clarity-aa.ch</a>.';
        })
        .finally(function () { btn.disabled = false; });
    });
  }
})();
