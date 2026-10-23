/* Clarity A&A – WhatsApp-Chat auf der Website
   Nummer im internationalen Format ohne +, Leerzeichen oder führende 0 eintragen,
   z. B. "41791234567" für 079 123 45 67. */
var CLARITY_WHATSAPP = '41767111221';

(function () {
  var number = (CLARITY_WHATSAPP || '').replace(/\D/g, '');
  var topics = ['Steuern', 'Buchhaltung', 'Liegenschaften', 'Treuhand', 'Gründung', 'Liquidation', 'Beratung'];

  function waUrl(text) {
    return 'https://wa.me/' + number + '?text=' + encodeURIComponent(text);
  }

  // Eintrag im Kontaktbereich
  var list = document.querySelector('.contact-list');
  if (list) {
    var row = document.createElement('div');
    row.innerHTML = '<dt>WhatsApp</dt><dd><button type="button" class="wa-open-link">Im Chat schreiben</button></dd>';
    list.insertBefore(row, list.children[1] || null);
  }

  var wrap = document.createElement('div');
  wrap.className = 'wa';
  wrap.innerHTML =
    '<section class="wa-chat" id="wa-chat" role="dialog" aria-labelledby="wa-name" hidden>' +
      '<header class="wa-head">' +
        '<img src="assets/favicon.png" alt="" width="40" height="40">' +
        '<div><p class="wa-name" id="wa-name">Clarity A&amp;A</p><p class="wa-status">Antwort meist innert eines Arbeitstages</p></div>' +
        '<button type="button" class="wa-close" aria-label="Chat schliessen">×</button>' +
      '</header>' +
      '<div class="wa-log" aria-live="polite">' +
        '<div class="wa-msg in">Grüezi! Wie können wir Ihnen helfen? Schreiben Sie uns Ihre Frage, wir antworten Ihnen auf WhatsApp.</div>' +
        '<div class="wa-chips">' + topics.map(function (t) { return '<button type="button">' + t + '</button>'; }).join('') + '</div>' +
      '</div>' +
      '<form class="wa-form">' +
        '<label class="wa-sr" for="wa-input">Ihre Nachricht</label>' +
        '<textarea id="wa-input" rows="1" placeholder="Ihre Nachricht …" required></textarea>' +
        '<button type="submit" class="wa-send" aria-label="Senden"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg></button>' +
      '</form>' +
      '<p class="wa-note">Ihre Nachricht wird über WhatsApp an uns gesendet. Es gelten die Datenschutzbestimmungen von WhatsApp.</p>' +
    '</section>' +
    '<button class="wa-btn" type="button" aria-expanded="false" aria-controls="wa-chat">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18.5V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-5 3.5z"/><path d="M8.5 9.5h7M8.5 12.5h4.5"/></svg>' +
      '<span>Chat</span>' +
    '</button>';
  document.body.appendChild(wrap);

  var btn = wrap.querySelector('.wa-btn');
  var chat = wrap.querySelector('.wa-chat');
  var log = wrap.querySelector('.wa-log');
  var form = wrap.querySelector('.wa-form');
  var input = wrap.querySelector('#wa-input');
  var topic = '';

  function open(state) {
    chat.hidden = !state;
    btn.setAttribute('aria-expanded', state ? 'true' : 'false');
    wrap.classList.toggle('open', state);
    if (state) setTimeout(function () { input.focus(); }, 50);
  }
  btn.addEventListener('click', function () { open(chat.hidden); });
  wrap.querySelector('.wa-close').addEventListener('click', function () { open(false); btn.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !chat.hidden) { open(false); btn.focus(); } });
  document.querySelectorAll('.wa-open-link').forEach(function (b) { b.addEventListener('click', function () { open(true); }); });

  // Themen-Auswahl
  wrap.querySelectorAll('.wa-chips button').forEach(function (c) {
    c.addEventListener('click', function () {
      topic = c.textContent;
      wrap.querySelectorAll('.wa-chips button').forEach(function (x) { x.classList.toggle('on', x === c); });
      if (!input.value) input.value = 'Ich habe eine Frage zum Thema ' + topic + ': ';
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      grow();
    });
  });

  // Eingabefeld wächst mit
  function grow() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; }
  input.addEventListener('input', grow);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit')); }
  });

  function bubble(text, cls) {
    var b = document.createElement('div');
    b.className = 'wa-msg ' + cls;
    b.textContent = text;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    bubble(text, 'out');
    input.value = ''; grow();
    var msg = 'Grüezi Clarity A&A' + (topic ? ' (' + topic + ')' : '') + '\n\n' + text;
    if (!number) {
      bubble('Der WhatsApp-Chat ist gerade nicht verfügbar. Schreiben Sie uns bitte an info@clarity-aa.ch.', 'in');
      return;
    }
    window.open(waUrl(msg), '_blank', 'noopener');
    var info = bubble('Danke! WhatsApp öffnet sich mit Ihrer Nachricht, bitte dort noch auf Senden tippen.', 'in');
    var a = document.createElement('a');
    a.href = waUrl(msg); a.target = '_blank'; a.rel = 'noopener'; a.className = 'wa-fallback';
    a.textContent = 'Falls nicht: WhatsApp hier öffnen';
    info.appendChild(document.createElement('br')); info.appendChild(a);
  });
})();
