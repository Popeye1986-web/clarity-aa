(function () {
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

  // Abschluss-Karte: Punkte nacheinander abhaken (einmal beim Laden)
  var ledger = document.querySelector('.ledger');
  if (ledger) {
    var rows = ledger.querySelectorAll('.ledger-list li');
    var bar = ledger.querySelector('.bar span');
    var badge = ledger.querySelector('.ledger-badge');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function finish() {
      ledger.classList.add('done');
      if (badge) badge.textContent = 'Erledigt';
    }
    if (reduce) {
      rows.forEach(function (r) { r.classList.add('on'); });
      bar.style.width = '100%';
      finish();
    } else {
      rows.forEach(function (r, i) {
        setTimeout(function () {
          r.classList.add('on');
          bar.style.width = ((i + 1) / rows.length * 100) + '%';
          if (i === rows.length - 1) setTimeout(finish, 450);
        }, 700 + i * 520);
      });
    }
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
