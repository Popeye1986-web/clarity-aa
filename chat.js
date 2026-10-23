/* Clarity A&A – Live-Chat mit Crisp
   Website ID aus Crisp eintragen (Einstellungen > Website-Einstellungen > Einrichtungsanleitung,
   z. B. "1a2b3c4d-...."). Leer lassen = kein Chat-Button.
   Crisp wird erst geladen, wenn ein Besucher auf "Chat" klickt (keine Cookies vorher). */
var CLARITY_CRISP_ID = '';


(function () {
  var id = (CLARITY_CRISP_ID || '').trim();
  if (!id) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'chat-btn';
  btn.setAttribute('aria-label', 'Chat öffnen');
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18.5V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-5 3.5z"/><path d="M8.5 9.5h7M8.5 12.5h4.5"/></svg>' +
    '<span>Chat</span>';
  document.body.appendChild(btn);

  var loading = false;
  function loadCrisp(openNow) {
    if (window.$crisp && window.$crisp.is) { window.$crisp.push(['do', 'chat:open']); return; }
    if (loading) return;
    loading = true;
    btn.classList.add('loading');
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = id;
    window.CRISP_RUNTIME_CONFIG = { locale: 'de' };
    window.$crisp.push(['safe', true]);
    window.$crisp.push(['on', 'session:loaded', function () {
      btn.classList.add('gone');                    // eigener Button weicht dem Crisp-Fenster
      if (openNow) window.$crisp.push(['do', 'chat:open']);
    }]);
    var s = document.createElement('script');
    s.src = 'https://client.crisp.chat/l.js';
    s.async = true;
    s.onerror = function () {
      loading = false; btn.classList.remove('loading');
      alert('Der Chat konnte nicht geladen werden. Schreiben Sie uns gerne an info@clarity-aa.ch.');
    };
    document.head.appendChild(s);
  }
  btn.addEventListener('click', function () { loadCrisp(true); });
  document.querySelectorAll('[data-open-chat]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); loadCrisp(true); });
  });

  // Wer im selben Besuch schon gechattet hat, bekommt den Chat beim Seitenwechsel direkt wieder
  try { if (sessionStorage.getItem('clarity-chat') === '1') loadCrisp(false); } catch (e) {}
  btn.addEventListener('click', function () { try { sessionStorage.setItem('clarity-chat', '1'); } catch (e) {} });
})();
