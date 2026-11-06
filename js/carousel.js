(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // CSS lets people scroll the row by hand instead

  var SPEED = 40; // pixels per second

  function Carousel(el) {
    var track = el.querySelector('.carousel-track');
    var originals = Array.prototype.slice.call(track.children);
    var direction = el.getAttribute('data-direction') === 'right' ? 1 : -1;

    var x = 0;
    var setWidth = 0;
    var paused = false;
    var dragging = false;
    var pointerDown = false;
    var moved = false;
    var visible = true;
    var startX = 0;
    var startOffset = 0;
    var pointerId = null;
    var last = null;

    originals.forEach(function (card) { card.setAttribute('draggable', 'false'); });

    function wrap(v) {
      return ((v % setWidth) + setWidth) % setWidth - setWidth; // range [-setWidth, 0)
    }

    function apply() {
      track.style.transform = 'translate3d(' + x + 'px, 0, 0)';
    }

    function build() {
      Array.prototype.slice.call(track.querySelectorAll('[data-clone]')).forEach(function (n) {
        track.removeChild(n);
      });

      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      setWidth = originals.reduce(function (sum, n) { return sum + n.offsetWidth + gap; }, 0);
      if (!setWidth) return;

      var copies = Math.ceil(el.offsetWidth / setWidth) + 1;
      for (var i = 0; i < copies; i++) {
        originals.forEach(function (n) {
          var c = n.cloneNode(true);
          c.setAttribute('data-clone', '');
          c.setAttribute('aria-hidden', 'true');
          c.setAttribute('tabindex', '-1');
          track.appendChild(c);
        });
      }
      x = wrap(x);
      apply();
    }

    function tick(t) {
      if (last === null) last = t;
      var dt = (t - last) / 1000;
      last = t;
      if (setWidth && visible && !paused && !dragging && dt < 0.25) {
        x = wrap(x + direction * SPEED * dt);
        apply();
      }
      requestAnimationFrame(tick);
    }

    // Pause on hover (mouse) and keyboard focus
    el.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') paused = true;
    });
    el.addEventListener('pointerleave', function () { paused = false; });
    el.addEventListener('focusin', function () { paused = true; });
    el.addEventListener('focusout', function () { paused = false; });

    // Drag / swipe
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointerDown = true;
      moved = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      startOffset = x;
    });

    el.addEventListener('pointermove', function (e) {
      if (!pointerDown || !setWidth) return;
      var dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) > 5) {
        dragging = true;
        moved = true;
        el.classList.add('dragging');
        try { el.setPointerCapture(pointerId); } catch (err) {}
      }
      if (dragging) {
        x = wrap(startOffset + dx);
        apply();
      }
    });

    function endDrag() {
      pointerDown = false;
      if (dragging) {
        dragging = false;
        el.classList.remove('dragging');
        try { el.releasePointerCapture(pointerId); } catch (err) {}
      }
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    // Don't follow a card link if the user was dragging
    el.addEventListener('click', function (e) {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);

    // Only animate while on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(el);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    });

    build();
    requestAnimationFrame(tick);
  }

  document.querySelectorAll('.carousel').forEach(Carousel);
})();