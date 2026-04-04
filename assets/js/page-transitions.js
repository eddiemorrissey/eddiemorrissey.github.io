(function () {
  // Define the ordered nav pages for directional swipe
  var navPages = ['/experience/', '/portfolio/', '/cv/'];

  function getNavIndex(path) {
    for (var i = 0; i < navPages.length; i++) {
      if (path.replace(/\/?$/, '/') === navPages[i]) return i;
    }
    return -1;
  }

  function getCurrentPath() {
    return window.location.pathname.replace(/\/?$/, '/');
  }

  function isNavPage(path) {
    return getNavIndex(path) !== -1;
  }

  function getDirection(fromPath, toPath) {
    var fromIdx = getNavIndex(fromPath);
    var toIdx = getNavIndex(toPath);
    if (fromIdx === -1 || toIdx === -1) return 'left';
    return toIdx > fromIdx ? 'left' : 'right';
  }

  function wrapContent() {
    var main = document.getElementById('main');
    if (!main || main.querySelector('.page-transition-wrapper')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'page-transition-wrapper';
    while (main.firstChild) {
      wrapper.appendChild(main.firstChild);
    }
    main.appendChild(wrapper);
  }

  document.addEventListener('DOMContentLoaded', function () {
    wrapContent();

    document.addEventListener('click', function (e) {
      var link = e.target.closest('.greedy-nav .visible-links a');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href) return;

      // Resolve to URL — handles both relative and absolute hrefs
      var url;
      try {
        url = new URL(href, window.location.origin);
      } catch (e) {
        return;
      }

      // Skip external links
      if (url.origin !== window.location.origin) return;

      var toPath = url.pathname.replace(/\/?$/, '/');

      if (!isNavPage(toPath)) return;

      var fromPath = getCurrentPath();
      if (fromPath === toPath) return;

      e.preventDefault();

      var direction = getDirection(fromPath, toPath);
      var main = document.getElementById('main');
      var wrapper = main && main.querySelector('.page-transition-wrapper');

      if (!wrapper) {
        window.location.href = href;
        return;
      }

      // Slide out current content
      wrapper.classList.add(direction === 'left' ? 'slide-out-left' : 'slide-out-right');

      setTimeout(function () {
        fetch(url.href)
          .then(function (res) { return res.text(); })
          .then(function (html) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, 'text/html');
            var newMain = doc.getElementById('main');

            if (!newMain) {
              window.location.href = href;
              return;
            }

            // Update page title
            var newTitle = doc.querySelector('title');
            if (newTitle) document.title = newTitle.textContent;

            // Replace main content with wrapper
            var newWrapper = document.createElement('div');
            newWrapper.className = 'page-transition-wrapper';
            while (newMain.firstChild) {
              newWrapper.appendChild(newMain.firstChild);
            }

            // Set initial position for slide-in
            newWrapper.classList.add(direction === 'left' ? 'slide-in-left' : 'slide-in-right');

            main.innerHTML = '';
            main.appendChild(newWrapper);

            // Update active nav link
            var navLinks = document.querySelectorAll('.greedy-nav .visible-links a');
            navLinks.forEach(function (a) {
              var li = a.closest('li');
              if (!li) return;
              var linkPath = new URL(a.href, window.location.origin).pathname.replace(/\/?$/, '/');
              if (linkPath === toPath) {
                li.classList.add('active');
              } else {
                li.classList.remove('active');
              }
            });

            // Trigger slide-in animation
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                newWrapper.classList.remove('slide-in-left', 'slide-in-right');
                newWrapper.classList.add('slide-in-active');
              });
            });

            // Update URL
            history.pushState(null, '', url.href);
          })
          .catch(function () {
            window.location.href = href;
          });
      }, 450); // Match CSS transition duration
    });

    // Handle browser back/forward
    window.addEventListener('popstate', function () {
      window.location.reload();
    });
  });
})();
