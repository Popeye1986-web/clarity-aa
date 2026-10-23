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

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var body = document.body;

  // Leiste beim Scrollen hell machen (Unterseiten: ab Ende des dunklen Kopfbereichs)
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 60);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobiles Menü
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Abschluss-Karte: Punkte nacheinander abhaken, sobald der Nebel weg ist
  var ledger = document.querySelector('.ledger');
  if (ledger) {
    var rows = ledger.querySelectorAll('.ledger-list li');
    var bar = ledger.querySelector('.bar span');
    var badge = ledger.querySelector('.ledger-badge');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finish = function () { ledger.classList.add('done'); if (badge) badge.textContent = 'Erledigt'; };
    var startLedger = function () {
      if (reduce) {
        rows.forEach(function (r) { r.classList.add('on'); });
        bar.style.width = '100%'; finish(); return;
      }
      rows.forEach(function (r, i) {
        setTimeout(function () {
          r.classList.add('on');
          bar.style.width = ((i + 1) / rows.length * 100) + '%';
          if (i === rows.length - 1) setTimeout(finish, 450);
        }, 250 + i * 480);
      });
    };
    if (window.__clarityClear) startLedger();
    else window.addEventListener('clarity:clear', startLedger, { once: true });
  }

  // Leistungen: scharf ist, was in der Bildmitte steht (Fokus wie bei einer Kamera)
  var items = document.querySelectorAll('.focus-list li');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (items.length && !still) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var mid = window.innerHeight * 0.5, range = window.innerHeight * 0.42;
      items.forEach(function (li) {
        var r = li.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - mid) / range;
        var f = Math.max(0, Math.min(1, 1 - d));
        f = f * f * (3 - 2 * f); // weich auslaufen
        li.style.setProperty('--f', f.toFixed(3));
      });
    };
    var onScrollFocus = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScrollFocus, { passive: true });
    window.addEventListener('resize', onScrollFocus);
    update();
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
