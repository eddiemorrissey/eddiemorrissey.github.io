(function () {
  var navOrder = ['/experience/', '/portfolio/', '/cv/'];

  function norm(p) { return p.replace(/\/?$/, '/'); }

  function idx(p) {
    p = norm(p);
    for (var i = 0; i < navOrder.length; i++) {
      if (navOrder[i] === p) return i;
    }
    return -1;
  }

  // On page load: apply swipe-in animation if we came from a nav click
  var dir = sessionStorage.getItem('swipeDir');
  if (dir) {
    sessionStorage.removeItem('swipeDir');
    var el = document.querySelector('#main .archive') || document.querySelector('#main .page');
    if (el) {
      el.classList.add(dir === 'right' ? 'swipe-in-right' : 'swipe-in-left');
    }
  }

  // On nav click: store direction and navigate normally
  document.addEventListener('click', function (e) {
    var link = e.target.closest('.greedy-nav .visible-links a');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href) return;

    var url;
    try { url = new URL(href, window.location.origin); } catch (err) { return; }
    if (url.origin !== window.location.origin) return;

    var from = idx(window.location.pathname);
    var to = idx(url.pathname);
    if (to === -1 || from === to) return;

    // Store swipe direction for the incoming page
    sessionStorage.setItem('swipeDir', to > from ? 'right' : 'left');
    // Let normal navigation proceed
  });
})();
