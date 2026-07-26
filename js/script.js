(function () {
  'use strict';

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = localStorage.getItem('theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var mainNav = document.getElementById('mainNav');

  menuToggle.addEventListener('click', function () {
    menuToggle.classList.toggle('open');
    mainNav.classList.toggle('open');
  });

  Array.prototype.forEach.call(document.querySelectorAll('.nav-link'), function (link) {
    link.addEventListener('click', function () {
      menuToggle.classList.remove('open');
      mainNav.classList.remove('open');
    });
  });

  /* ---------- Header scroll state + progress bar ---------- */
  var header = document.getElementById('siteHeader');
  var progressBar = document.getElementById('progressBar');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Marquee gallery (continuous horizontal loop) ---------- */
  var track = document.getElementById('marqueeTrack');
  var slides = Array.prototype.slice.call(track.children);

  // Duplicate the set once so the strip can loop seamlessly (translateX(-50%)).
  slides.forEach(function (slide) { track.appendChild(slide.cloneNode(true)); });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxIndex = 0;

  function openLightbox(index) {
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function updateLightbox() {
    var slide = slides[lightboxIndex];
    var img = slide.querySelector('img');
    var caption = slide.querySelector('figcaption');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : '';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Attach to every image in the strip (originals + clones) so clicking any
  // copy opens the right slide in the lightbox.
  Array.prototype.forEach.call(track.querySelectorAll('img'), function (img, i) {
    img.addEventListener('click', function () { openLightbox(i % slides.length); });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  lightboxPrev.addEventListener('click', function () {
    lightboxIndex = (lightboxIndex - 1 + slides.length) % slides.length;
    updateLightbox();
  });
  lightboxNext.addEventListener('click', function () {
    lightboxIndex = (lightboxIndex + 1) % slides.length;
    updateLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % slides.length; updateLightbox(); }
    if (e.key === 'ArrowLeft') { lightboxIndex = (lightboxIndex - 1 + slides.length) % slides.length; updateLightbox(); }
  });

  /* ---------- Quiz ---------- */
  var quizForm = document.getElementById('quizForm');
  if (quizForm) {
    var quizQuestions = Array.prototype.slice.call(quizForm.querySelectorAll('.quiz-question'));
    var quizWarning = document.getElementById('quizWarning');
    var quizResult = document.getElementById('quizResult');
    var quizScore = document.getElementById('quizScore');
    var quizMessage = document.getElementById('quizMessage');
    var quizRetry = document.getElementById('quizRetry');

    quizQuestions.forEach(function (question) {
      var options = Array.prototype.slice.call(question.querySelectorAll('.quiz-option'));
      options.forEach(function (option) {
        option.addEventListener('click', function () {
          options.forEach(function (o) { o.classList.remove('selected'); });
          option.classList.add('selected');
          quizWarning.hidden = true;
        });
      });
    });

    quizForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var allAnswered = quizQuestions.every(function (q) { return q.querySelector('.quiz-option.selected'); });
      if (!allAnswered) {
        quizWarning.hidden = false;
        return;
      }

      var score = 0;
      quizQuestions.forEach(function (question) {
        var options = Array.prototype.slice.call(question.querySelectorAll('.quiz-option'));
        var correctIndex = parseInt(question.getAttribute('data-correct'), 10);
        var selected = question.querySelector('.quiz-option.selected');
        var selectedIndex = options.indexOf(selected);

        options[correctIndex].classList.add('is-correct');
        if (selectedIndex !== correctIndex) {
          selected.classList.add('is-wrong');
        } else {
          score++;
        }
        question.classList.add('locked');
      });

      var total = quizQuestions.length;
      var pct = Math.round((score / total) * 100);
      quizScore.textContent = 'Du hast ' + score + ' von ' + total + ' Fragen richtig (' + pct + '%)';

      var message;
      if (score === total) {
        message = 'Perfekt! Du kennst mich richtig gut. 🏆';
      } else if (score >= total - 2) {
        message = 'Stark! Du kennst mich schon ziemlich gut.';
      } else if (score >= 2) {
        message = 'Nicht schlecht — aber es gibt noch einiges über mich zu entdecken.';
      } else {
        message = 'Zeit, mich besser kennenzulernen! Schreib mir doch eine Nachricht.';
      }
      quizMessage.textContent = message;

      quizResult.hidden = false;
      quizResult.classList.add('in-view');
      quizResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    quizRetry.addEventListener('click', function () {
      quizQuestions.forEach(function (question) {
        question.classList.remove('locked');
        Array.prototype.forEach.call(question.querySelectorAll('.quiz-option'), function (option) {
          option.classList.remove('selected', 'is-correct', 'is-wrong');
        });
      });
      quizResult.hidden = true;
      quizWarning.hidden = true;
      quizForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
