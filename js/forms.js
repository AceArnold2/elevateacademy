(function () {
  // Paste your Google Apps Script web app URL here when it is ready
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHeoJk7It77_1_P4lFtxzM-Zl_G5qcTTNKQu-bpPCR-z69M9V_gfhdjkDc1UFyb9FByg/exec';
  var TIMEOUT_MS = 15000;

  function setStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = 'form-status' + (type ? ' ' + type : '');
  }

  function initForm(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var status = form.querySelector('.form-status');
      var button = form.querySelector('button[type="submit"]');

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (APPS_SCRIPT_URL.indexOf('PASTE_') === 0) {
        setStatus(status, 'This form is not connected yet. Please contact us directly.', 'error');
        return;
      }

      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });
      data.formType = form.getAttribute('data-form-type');
      data.submittedAt = new Date().toISOString();

      var originalText = button.textContent;
      button.disabled = true;
      button.textContent = 'Sending...';
      setStatus(status, '', '');

      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

      // text/plain avoids a CORS preflight, which Apps Script web apps don't handle
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
        signal: controller.signal
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Server error');
          return res.json();
        })
        .then(function (result) {
          if (!result || result.success !== true) throw new Error('Not saved');
          form.reset();
          setStatus(status, 'Thank you! We have received your details and will be in touch soon.', 'success');
        })
        .catch(function () {
          setStatus(status, 'Sorry, something went wrong and your details were not sent. Please try again or contact us directly.', 'error');
        })
        .finally(function () {
          clearTimeout(timer);
          button.disabled = false;
          button.textContent = originalText;
        });
    });
  }

  document.querySelectorAll('form[data-form-type]').forEach(initForm);
})();