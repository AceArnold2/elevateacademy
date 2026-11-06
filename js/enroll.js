(function () {
  var tabs = document.querySelectorAll('.tab');
  var panels = document.querySelectorAll('.tab-panel');
  if (!tabs.length) return;

  function show(name) {
    tabs.forEach(function (t) {
      var active = t.getAttribute('data-tab') === name;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(function (p) {
      p.hidden = p.id !== 'panel-' + name;
    });
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var name = t.getAttribute('data-tab');
      show(name);
      if (window.history && history.replaceState) {
        history.replaceState(null, '', '#' + name);
      }
    });
  });

  // Open the right tab from a link like /enroll.html#tutoring
  var hash = window.location.hash.replace('#', '');
  show(hash === 'tutoring' ? 'tutoring' : 'courses');
})();