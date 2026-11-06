(function () {
  var KEY = 'elevate-lang';
  var buttons = document.querySelectorAll('.lang-switch button');

  function setLang(lang) {
    document.documentElement.lang = lang;
    buttons.forEach(function (b) {
      var active = b.getAttribute('data-lang') === lang;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    // Translations will be applied here once the French text is written.
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      setLang(b.getAttribute('data-lang'));
    });
  });

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  setLang(saved === 'fr' ? 'fr' : 'en');
})();