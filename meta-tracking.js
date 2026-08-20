/**
 * meta-tracking.js — Freelas Now (site GitHub Pages)
 * ---------------------------------------------------------------------------
 * Dispara eventos pela Meta Conversions API (servidor) em paralelo ao Pixel do
 * navegador, com o MESMO eventId (Meta deduplica Pixel x CAPI).
 *
 * Diferença do template da agência: o site (GitHub Pages) e o backend (Railway)
 * são domínios diferentes, então META_API_BASE é a URL ABSOLUTA do backend
 * (não '/api/meta' relativo). CORS do backend já é '*'.
 *
 * Auto-liga o evento Lead nos cliques de conversão do site:
 *   - baixar o app (botões do popup .fn-dl-btn ou links das lojas)
 *   - WhatsApp (botão flutuante / links wa.me)
 * PageView é disparado pelo Pixel base (fbq('track','PageView')) em cada página.
 */
(function () {
  var META_API_BASE = 'https://backend-production-f89e.up.railway.app/api/v1/meta';

  function gerarEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
  }
  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? m[2] : null;
  }
  // fbc pode não existir no 1º clique vindo de anúncio; constrói do fbclid da URL.
  function getFbc() {
    var existing = getCookie('_fbc');
    if (existing) return existing;
    var fbclid = new URLSearchParams(window.location.search).get('fbclid');
    return fbclid ? 'fb.1.' + Date.now() + '.' + fbclid : null;
  }
  function getBrowserData() {
    return { fbp: getCookie('_fbp'), fbc: getFbc() };
  }

  async function trackMetaEvent(eventName, endpoint, userData, customData) {
    userData = userData || {};
    customData = customData || {};
    var eventId = gerarEventId();
    var bd = getBrowserData();

    // 1) Pixel do navegador
    if (typeof fbq === 'function') {
      fbq('track', eventName, customData, { eventID: eventId });
    }
    // 2) Conversions API (servidor). keepalive: entrega mesmo se a página navegar
    // (clique de baixar/WhatsApp sai do site).
    try {
      await fetch(META_API_BASE + '/' + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify(Object.assign({
          eventId: eventId,
          eventSourceUrl: window.location.href,
          fbp: bd.fbp,
          fbc: bd.fbc,
          customData: customData,
        }, userData)),
      });
    } catch (err) {
      console.error('Erro ao enviar evento para CAPI:', err);
    }
  }
  window.trackMetaEvent = trackMetaEvent;

  // Auto-wire do Lead nos cliques de conversão do site.
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('a, button');
    if (!t) return;
    var href = (t.getAttribute && t.getAttribute('href')) || '';
    var isDownload = (t.classList && t.classList.contains('fn-dl-btn')) ||
      /apps\.apple\.com|play\.google\.com/.test(href);
    var isWhats = /wa\.me|api\.whatsapp\.com/.test(href) || t.id === 'wa-float';
    if (isDownload) trackMetaEvent('Lead', 'track-lead', {}, { content_name: 'baixar_app' });
    else if (isWhats) trackMetaEvent('Lead', 'track-lead', {}, { content_name: 'whatsapp' });
  }, true);
})();
