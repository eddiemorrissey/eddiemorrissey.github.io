(function () {
  var navPages = ['/experience/', '/portfolio/', '/cv/'];

  function normPath(p) {
    return p.replace(/\/?$/, '/');
  }

  function navIndex(path) {
    var p = normPath(path);
    for (var i = 0; i < navPages.length; i++) {
      if (p === navPages[i]) return i;
    }
    return -1;
  }

  function getContentEl() {
    return document.querySelector('#main .archive') || document.querySelector('#main .page');
  }

  document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('click', function (e) {
      var link = e.target.closest('.greedy-nav .visible-links a');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href) return;

      var url;
      try { url = new URL(href, window.location.origin); } catch (err) { return; }
      if (url.origin !== window.location.origin) return;

      var toPath = normPath(url.pathname);
      var fromPath = normPath(window.location.pathname);

      if (navIndex(toPath) === -1 || fromPath === toPath) return;

      var fromIdx = navIndex(fromPath);
      var toIdx = navIndex(toPath);
      // Going right in nav = content swipes left, and vice versa
      var goingRight = (fromIdx === -1) || (toIdx > fromIdx);

      e.preventDefault();

      var content = getContentEl();
      if (!content) { window.location.href = url.href; return; }

      // Animate current content out
      content.classList.add(goingRight ? 'swipe-out-left' : 'swipe-out-right');

      // After out-animation, fetch and swap
      content.addEventListener('animationend', function handler() {
        content.removeEventListener('animationend', handler);

        fetch(url.href)
          .then(function (r) { return r.text(); })
          .then(function (html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var newContent = doc.querySelector('#main .archive') || doc.querySelector('#main .page');

            if (!newContent) { window.location.href = url.href; return; }

            // Update title
            var t = doc.querySelector('title');
            if (t) document.title = t.textContent;

            // Swap inner HTML of the content area
            content.innerHTML = newContent.innerHTML;

            // Clean classes and trigger swipe-in
            content.classList.remove('swipe-out-left', 'swipe-out-right');
            content.classList.add(goingRight ? 'swipe-in-left' : 'swipe-in-right');

            content.addEventListener('animationend', function done() {
              content.removeEventListener('animationend', done);
              content.classList.remove('swipe-in-left', 'swipe-in-right');
            });

            // Update URL and active nav state
            history.pushState(null, '', url.href);

            var navLinks = document.querySelectorAll('.greedy-nav .visible-links a');
            navLinks.forEach(function (a) {
              var li = a.closest('li');
              if (!li) return;
              var lp = normPath(new URL(a.href, window.location.origin).pathname);
              li.classList.toggle('active', lp === toPath);
            });
          })
          .catch(function () { window.location.href = url.href; });
      });
    });

    window.addEventListener('popstate', function () {
      window.location.reload();
    });
  });
})();
