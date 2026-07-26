/* =========================================================================
   LUIS URBIOLA — Shared site runtime
   Header + mega menu, mobile drawer, theme, reveal, counters, hero, FABs
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- Theme (runs immediately to avoid flash) ------------------- */
  var saved = null;
  try { saved = localStorage.getItem('lu-theme'); } catch (e) {}
  var initial = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);

  window.LU = window.LU || {};

  /* ---------- Icons ------------------------------------------------------ */
  var I = {
    caret: '<svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
    sun: '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.2A8.4 8.4 0 019.8 4 8.6 8.6 0 1020 14.2z"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M3 7l9 6 9-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 10.5c0 6-8 12.5-8 12.5S4 16.5 4 10.5a8 8 0 1116 0z"/><circle cx="12" cy="10.3" r="2.8"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.8-.9-2-1s-.5-.2-.7.1-.8 1-1 1.2-.4.2-.7 0a8 8 0 01-2.4-1.5 9 9 0 01-1.6-2c-.2-.4 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6s0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 00-.9.4A3.6 3.6 0 005.7 9c0 2.1 1.5 4.1 1.7 4.4a16 16 0 006.1 5.4 20 20 0 002 .7 4.9 4.9 0 002.2.2 3.6 3.6 0 002.4-1.7 3 3 0 00.2-1.7c-.1-.2-.4-.3-.8-.5zM12 21.8a9.7 9.7 0 01-5-1.3l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1112 21.8zM12 0a12 12 0 00-10.3 18L0 24l6.2-1.6A12 12 0 1012 0z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 01-9 8.4 9.6 9.6 0 01-3.2-.5L3 21l1.6-4.6A8.3 8.3 0 013 11.5a8.4 8.4 0 019-8.4 8.4 8.4 0 019 8.4z"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 19V6M6 12l6-6 6 6"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.6 9.9v-7h-2.5V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
    li: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 102.5 6 2.5 2.5 0 004.98 3.5zM3 8.98h4V21H3zM14.5 8.7c-2 0-3 1.1-3.5 1.9V9H7c.1 1.2 0 12 0 12h4v-6.7c0-.4 0-.7.1-1a2.2 2.2 0 012-1.5c1.5 0 2.1 1.1 2.1 2.7V21h4v-7c0-3.7-2-5.3-4.7-5.3z"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.4-.4-5a2.6 2.6 0 00-1.8-1.9C19.2 4.7 12 4.7 12 4.7s-7.2 0-8.8.4A2.6 2.6 0 001.4 7C1 8.6 1 12 1 12s0 3.4.4 5a2.6 2.6 0 001.8 1.9c1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4a2.6 2.6 0 001.8-1.9c.4-1.6.4-5 .4-5zM9.8 15.3V8.7L15.5 12z"/></svg>',
    tk: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8a5 5 0 01-1.2-3.3h-3.3v13.2a2.9 2.9 0 11-2-2.8V9.5a6.1 6.1 0 105 6V9.9a8.2 8.2 0 004.8 1.5V8.1a4.9 4.9 0 01-3.3-2.3z"/></svg>'
  };
  window.LU.icons = I;

  /* ---------- Navigation model ------------------------------------------ */
  var MEGAS = {
    programs: {
      cols: [
        { h: 'English Language', items: [
          ['General English A1–C2', 'english.html#levels'],
          ['Conversation Club', 'english.html#catalog'],
          ['Business English', 'english.html#catalog'],
          ['TOEFL · IELTS · Cambridge', 'english.html#exams'],
          ['English for Kids', 'english.html#kids'],
          ['Corporate Training', 'english.html#corporate']
        ]},
        { h: 'Computer Science', items: [
          ['Office & Data Analytics', 'computer-science.html#office'],
          ['Programming & Web', 'computer-science.html#programming'],
          ['AI, ML & Data Science', 'computer-science.html#ai'],
          ['Cybersecurity & Networks', 'computer-science.html#security'],
          ['Cloud & DevOps', 'computer-science.html#cloud'],
          ['Design & Creative Suite', 'computer-science.html#design']
        ]},
        { h: 'University', items: [
          ['Bachelor Degrees', 'university.html#bachelor'],
          ['Master Degrees', 'university.html#master'],
          ['Doctorates', 'university.html#doctorate'],
          ['Executive Programs', 'university.html#executive'],
          ['Weekend & Online Degrees', 'university.html#flexible'],
          ['Scholarships', 'admissions.html#scholarships']
        ]}
      ],
      feature: {
        img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=70',
        title: 'Program Finder',
        sub: 'Answer 5 questions. Get a personalised academic pathway in 60 seconds.',
        href: 'programs.html'
      }
    },
    campus: {
      cols: [
        { h: 'Learn', items: [
          ['Virtual Campus', 'virtual-campus.html'],
          ['Live Classes', 'virtual-campus.html#live'],
          ['AI Learning Suite', 'virtual-campus.html#ai'],
          ['Certifications', 'certifications.html']
        ]},
        { h: 'Resources', items: [
          ['Digital Library', 'library.html'],
          ['Research Journals', 'library.html#journals'],
          ['Audiobooks', 'library.html#audio'],
          ['Downloads Centre', 'library.html#downloads']
        ]},
        { h: 'Community', items: [
          ['Events & Webinars', 'events.html'],
          ['Career Centre', 'careers.html'],
          ['Student Forum', 'virtual-campus.html#forum'],
          ['Alumni Network', 'about.html#alumni']
        ]}
      ],
      feature: {
        img: 'https://images.unsplash.com/photo-1584697964358-3e14ca57658b?auto=format&fit=crop&w=800&q=70',
        title: 'Campus Tour',
        sub: 'Walk through our Miraflores headquarters and 6 satellite centres.',
        href: 'about.html#campus'
      }
    },
    insights: {
      cols: [
        { h: 'Editorial', items: [
          ['All Articles', 'blog.html'],
          ['Education', 'blog.html#education'],
          ['Technology & AI', 'blog.html#technology'],
          ['English Learning', 'blog.html#english'],
          ['Career Advice', 'blog.html#career']
        ]},
        { h: 'Institution', items: [
          ['About Luis Urbiola', 'about.html'],
          ['Accreditations', 'certifications.html#accreditation'],
          ['Faculty', 'about.html#faculty'],
          ['Work With Us', 'careers.html#jobs']
        ]},
        { h: 'Support', items: [
          ['Admissions Office', 'admissions.html'],
          ['Contact & Locations', 'contact.html'],
          ['Frequently Asked', 'contact.html#faq'],
          ['Student Services', 'university.html#services']
        ]}
      ],
      feature: {
        img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=70',
        title: 'The AI Classroom',
        sub: 'Our 2026 report on artificial intelligence in Latin American education.',
        href: 'blog.html'
      }
    }
  };

  function megaHTML(key) {
    var m = MEGAS[key];
    var cols = m.cols.map(function (c) {
      return '<div><h5>' + c.h + '</h5><ul>' + c.items.map(function (it) {
        return '<li><a href="' + it[1] + '">' + it[0] + '</a></li>';
      }).join('') + '</ul></div>';
    }).join('');
    var f = m.feature;
    return '<div class="mega"><div class="container-wide"><div class="mega-inner">' + cols +
      '<a class="mega-feature" href="' + f.href + '">' +
      '<img src="' + f.img + '" alt="" loading="lazy" decoding="async">' +
      '<span class="mf-body"><strong>' + f.title + '</strong><span>' + f.sub + '</span></span></a>' +
      '</div></div></div>';
  }

  /* ---------- Header ----------------------------------------------------- */
  function buildHeader() {
    var page = (document.body.getAttribute('data-page') || '').toLowerCase();
    var cur = function (p) { return page === p ? ' aria-current="page"' : ''; };

    return '' +
    '<div class="topbar"><div class="container-wide">' +
      '<div class="tb-left">' +
        '<span>' + I.pin + ' Av. Larco 1301, Miraflores · Lima, Perú</span>' +
        '<span>' + I.phone + ' +51 (1) 705 4820</span>' +
      '</div>' +
      '<ul>' +
        '<li><a href="admissions.html">Admissions 2026</a></li>' +
        '<li><a href="library.html">Library</a></li>' +
        '<li><a href="student-portal.html">Student Portal</a></li>' +
        '<li><a href="teacher-portal.html">Teacher Portal</a></li>' +
      '</ul>' +
    '</div></div>' +

    '<header class="site-header" id="siteHeader"><div class="container-wide">' +
      '<nav class="nav" aria-label="Primary">' +
        '<a class="brand" href="index.html">' +
          '<span class="brand-mark" aria-hidden="true">LU</span>' +
          '<span class="brand-txt"><strong>Luis Urbiola</strong><small>Institute &amp; University</small></span>' +
        '</a>' +
        '<ul class="nav-list">' +
          '<li><a href="index.html"' + cur('home') + '>Home</a></li>' +
          '<li><a href="about.html"' + cur('about') + '>About</a></li>' +
          '<li data-mega="programs"><button type="button" aria-expanded="false">Programs ' + I.caret + '</button>' + megaHTML('programs') + '</li>' +
          '<li><a href="admissions.html"' + cur('admissions') + '>Admissions</a></li>' +
          '<li data-mega="campus"><button type="button" aria-expanded="false">Campus ' + I.caret + '</button>' + megaHTML('campus') + '</li>' +
          '<li data-mega="insights"><button type="button" aria-expanded="false">Insights ' + I.caret + '</button>' + megaHTML('insights') + '</li>' +
          '<li><a href="contact.html"' + cur('contact') + '>Contact</a></li>' +
        '</ul>' +
        '<div class="nav-actions">' +
          '<button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch colour theme">' + I.sun + I.moon + '</button>' +
          '<a class="btn btn-ghost btn-sm" href="student-portal.html">Sign in</a>' +
          '<a class="btn btn-primary btn-sm" href="admissions.html#apply">Apply Now</a>' +
          '<button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false">' + I.burger + '</button>' +
        '</div>' +
      '</nav>' +
    '</div></header>' +

    '<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu">' +
      '<div class="drawer-scrim" data-close></div>' +
      '<div class="drawer-panel">' +
        '<div class="between" style="margin-bottom:10px">' +
          '<span class="brand-txt"><strong>Menu</strong></span>' +
          '<button class="theme-toggle" data-close aria-label="Close menu">' + I.close + '</button>' +
        '</div>' +
        '<a href="index.html">Home</a>' +
        '<a href="about.html">About Us</a>' +
        '<div class="dh">Programs</div>' +
        '<a href="english.html">English Language</a>' +
        '<a href="computer-science.html">Computer Science &amp; Technology</a>' +
        '<a href="university.html">University Degrees</a>' +
        '<a href="programs.html">All Programs</a>' +
        '<a href="certifications.html">Certifications</a>' +
        '<div class="dh">Campus</div>' +
        '<a href="virtual-campus.html">Virtual Campus</a>' +
        '<a href="library.html">Digital Library</a>' +
        '<a href="events.html">Events</a>' +
        '<a href="careers.html">Career Centre</a>' +
        '<div class="dh">Institution</div>' +
        '<a href="admissions.html">Admissions</a>' +
        '<a href="blog.html">Blog</a>' +
        '<a href="contact.html">Contact</a>' +
        '<div class="dh">Portals</div>' +
        '<a href="student-portal.html">Student Portal</a>' +
        '<a href="teacher-portal.html">Teacher Portal</a>' +
        '<a href="admin.html">Administration</a>' +
        '<a class="btn btn-primary btn-block" style="margin-top:18px" href="admissions.html#apply">Apply Now</a>' +
      '</div>' +
    '</div>';
  }

  /* ---------- Footer ----------------------------------------------------- */
  function buildFooter() {
    return '' +
    '<footer class="site-footer"><div class="container">' +
      '<div class="footer-grid">' +
        '<div>' +
          '<a class="brand" href="index.html" style="margin-bottom:18px">' +
            '<span class="brand-mark" aria-hidden="true">LU</span>' +
            '<span class="brand-txt"><strong>Luis Urbiola</strong><small>Institute &amp; University</small></span>' +
          '</a>' +
          '<p style="font-size:.89rem;color:rgba(255,255,255,.62);max-width:34ch">Thirty-two years transforming lives through language, technology and higher education. Licensed by MINEDU · Accredited by SINEACE.</p>' +
          '<div class="socials">' +
            '<a href="#" aria-label="Facebook">' + I.fb + '</a>' +
            '<a href="#" aria-label="Instagram">' + I.ig + '</a>' +
            '<a href="#" aria-label="LinkedIn">' + I.li + '</a>' +
            '<a href="#" aria-label="YouTube">' + I.yt + '</a>' +
            '<a href="#" aria-label="TikTok">' + I.tk + '</a>' +
          '</div>' +
        '</div>' +
        '<div><h5>Programs</h5><ul>' +
          '<li><a href="english.html">English Language</a></li>' +
          '<li><a href="computer-science.html">Computer Science</a></li>' +
          '<li><a href="university.html">University Degrees</a></li>' +
          '<li><a href="programs.html">Program Finder</a></li>' +
          '<li><a href="certifications.html">Certifications</a></li>' +
          '<li><a href="university.html#executive">Executive Education</a></li>' +
        '</ul></div>' +
        '<div><h5>Campus</h5><ul>' +
          '<li><a href="virtual-campus.html">Virtual Campus</a></li>' +
          '<li><a href="library.html">Digital Library</a></li>' +
          '<li><a href="events.html">Events</a></li>' +
          '<li><a href="careers.html">Career Centre</a></li>' +
          '<li><a href="student-portal.html">Student Portal</a></li>' +
          '<li><a href="teacher-portal.html">Teacher Portal</a></li>' +
        '</ul></div>' +
        '<div><h5>Institution</h5><ul>' +
          '<li><a href="about.html">About Us</a></li>' +
          '<li><a href="admissions.html">Admissions</a></li>' +
          '<li><a href="admissions.html#scholarships">Scholarships</a></li>' +
          '<li><a href="blog.html">Blog</a></li>' +
          '<li><a href="careers.html#jobs">Work With Us</a></li>' +
          '<li><a href="contact.html">Contact</a></li>' +
        '</ul></div>' +
        '<div>' +
          '<h5>Get in touch</h5>' +
          '<ul class="f-contact">' +
            '<li>' + I.pin + '<span>Av. José Larco 1301, Miraflores<br>Lima 15074, Perú</span></li>' +
            '<li>' + I.phone + '<span>+51 (1) 705 4820<br>+51 987 442 019 (WhatsApp)</span></li>' +
            '<li>' + I.mail + '<span>admisiones@luisurbiola.edu.pe</span></li>' +
            '<li>' + I.clock + '<span>Mon–Fri 07:00–22:00 · Sat 08:00–14:00</span></li>' +
          '</ul>' +
          '<h5 style="margin-top:24px">Newsletter</h5>' +
          '<form class="newsletter" onsubmit="return LU.fakeSubmit(this,\'Thank you — you are subscribed.\')">' +
            '<input type="email" required placeholder="your@email.com" aria-label="Email address">' +
            '<button class="btn btn-primary btn-sm" type="submit">Join</button>' +
          '</form>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<span>© 2026 Instituto y Universidad Luis Urbiola. All rights reserved. RUC 20548812234.</span>' +
        '<ul>' +
          '<li><a href="#">Privacy Policy</a></li>' +
          '<li><a href="#">Terms of Service</a></li>' +
          '<li><a href="contact.html#faq">FAQ</a></li>' +
          '<li><a href="#">Accessibility</a></li>' +
          '<li><a href="sitemap.xml">Sitemap</a></li>' +
        '</ul>' +
      '</div>' +
    '</div></footer>' +

    '<div class="fab-stack">' +
      '<button class="fab fab-top" id="toTop" type="button" aria-label="Back to top">' + I.up + '</button>' +
      '<a class="fab fab-chat" href="contact.html#chat" aria-label="Live chat">' + I.chat + '</a>' +
      '<a class="fab fab-wa" href="https://wa.me/51987442019" aria-label="WhatsApp" target="_blank" rel="noopener">' + I.wa + '</a>' +
    '</div>';
  }

  /* ---------- Boot ------------------------------------------------------- */
  function mount() {
    var h = document.getElementById('site-header-mount');
    var f = document.getElementById('site-footer-mount');
    if (h) h.innerHTML = buildHeader();
    if (f) f.innerHTML = buildFooter();

    /* Theme toggle */
    var tt = document.getElementById('themeToggle');
    if (tt) tt.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('lu-theme', next); } catch (e) {}
    });

    /* Mega menus */
    var items = document.querySelectorAll('.nav-list li[data-mega]');
    Array.prototype.forEach.call(items, function (li) {
      var btn = li.querySelector('button');
      var t;
      function open(v) {
        Array.prototype.forEach.call(items, function (o) {
          if (o !== li) { o.classList.remove('open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); }
        });
        li.classList.toggle('open', v);
        btn.setAttribute('aria-expanded', String(v));
      }
      li.addEventListener('mouseenter', function () { clearTimeout(t); open(true); });
      li.addEventListener('mouseleave', function () { t = setTimeout(function () { open(false); }, 160); });
      btn.addEventListener('click', function (e) { e.preventDefault(); open(!li.classList.contains('open')); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        Array.prototype.forEach.call(items, function (o) { o.classList.remove('open'); });
        var d = document.getElementById('drawer'); if (d) d.classList.remove('open');
      }
    });

    /* Drawer */
    var burger = document.getElementById('burger');
    var drawer = document.getElementById('drawer');
    if (burger && drawer) {
      burger.addEventListener('click', function () {
        drawer.classList.add('open');
        burger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      });
      drawer.addEventListener('click', function (e) {
        if (e.target.closest('[data-close]') || e.target.tagName === 'A') {
          drawer.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }

    /* Header shadow + back-to-top */
    var header = document.getElementById('siteHeader');
    var top = document.getElementById('toTop');
    function onScroll() {
      var y = window.pageYOffset;
      if (header) header.classList.toggle('scrolled', y > 8);
      if (top) top.classList.toggle('show', y > 700);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- Reveal on scroll ------------------------------------------ */
  function reveals() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  /* ---------- Animated counters ----------------------------------------- */
  function counters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      var dur = 1700, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var v = target * eased;
        el.textContent = prefix + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { Array.prototype.forEach.call(els, run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  /* ---------- Hero slideshow -------------------------------------------- */
  function hero() {
    var media = document.querySelector('.hero-media');
    if (!media) return;
    var imgs = media.querySelectorAll('img');
    var dots = document.querySelectorAll('.hero-dots button');
    if (!imgs.length) return;
    var i = 0, timer;
    function show(n) {
      i = n % imgs.length;
      Array.prototype.forEach.call(imgs, function (im, k) { im.classList.toggle('active', k === i); });
      Array.prototype.forEach.call(dots, function (d, k) { d.classList.toggle('active', k === i); });
    }
    show(0);
    function play() { timer = setInterval(function () { show(i + 1); }, 6000); }
    play();
    Array.prototype.forEach.call(dots, function (d, k) {
      d.addEventListener('click', function () { clearInterval(timer); show(k); play(); });
    });
  }

  /* ---------- Filters (courses, blog, library …) ------------------------- */
  function filters() {
    var groups = document.querySelectorAll('[data-filter-group]');
    Array.prototype.forEach.call(groups, function (g) {
      var targetSel = g.getAttribute('data-filter-group');
      var chips = g.querySelectorAll('[data-filter]');
      var countEl = document.querySelector('[data-filter-count="' + targetSel + '"]');
      Array.prototype.forEach.call(chips, function (c) {
        c.addEventListener('click', function () {
          Array.prototype.forEach.call(chips, function (o) { o.classList.remove('active'); o.setAttribute('aria-pressed', 'false'); });
          c.classList.add('active'); c.setAttribute('aria-pressed', 'true');
          var val = c.getAttribute('data-filter');
          var cards = document.querySelectorAll(targetSel + ' [data-tags]');
          var n = 0;
          Array.prototype.forEach.call(cards, function (card) {
            var ok = val === 'all' || (' ' + card.getAttribute('data-tags') + ' ').indexOf(' ' + val + ' ') > -1;
            card.style.display = ok ? '' : 'none';
            if (ok) n++;
          });
          if (countEl) countEl.textContent = n;
        });
      });
    });
  }

  /* ---------- Search box ------------------------------------------------- */
  function search() {
    var inputs = document.querySelectorAll('[data-search]');
    Array.prototype.forEach.call(inputs, function (inp) {
      inp.addEventListener('input', function () {
        var q = inp.value.trim().toLowerCase();
        var cards = document.querySelectorAll(inp.getAttribute('data-search') + ' [data-tags]');
        var n = 0;
        Array.prototype.forEach.call(cards, function (c) {
          var ok = !q || c.textContent.toLowerCase().indexOf(q) > -1;
          c.style.display = ok ? '' : 'none'; if (ok) n++;
        });
        var countEl = document.querySelector('[data-filter-count="' + inp.getAttribute('data-search') + '"]');
        if (countEl) countEl.textContent = n;
      });
    });
  }

  /* ---------- Tabs -------------------------------------------------------- */
  function tabs() {
    var sets = document.querySelectorAll('[data-tabs]');
    Array.prototype.forEach.call(sets, function (set) {
      var btns = set.querySelectorAll('[data-tab]');
      Array.prototype.forEach.call(btns, function (b) {
        b.addEventListener('click', function () {
          Array.prototype.forEach.call(btns, function (o) { o.classList.remove('active'); o.setAttribute('aria-selected', 'false'); });
          b.classList.add('active'); b.setAttribute('aria-selected', 'true');
          var id = b.getAttribute('data-tab');
          var panels = document.querySelectorAll('[data-panel]');
          Array.prototype.forEach.call(panels, function (p) {
            p.hidden = p.getAttribute('data-panel') !== id;
          });
        });
      });
    });
  }

  /* ---------- Image fallback -------------------------------------------- */
  function imageFallback() {
    document.addEventListener('error', function (e) {
      var t = e.target;
      if (t && t.tagName === 'IMG' && !t.dataset.failed) {
        t.dataset.failed = '1';
        t.removeAttribute('srcset');
        t.style.background = 'linear-gradient(135deg,#0057D9,#4F8EF7 55%,#C9A227)';
        t.style.minHeight = t.style.minHeight || '160px';
        t.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0057D9"/><stop offset=".55" stop-color="#4F8EF7"/><stop offset="1" stop-color="#C9A227"/></linearGradient></defs><rect width="16" height="10" fill="url(#g)"/></svg>'
        );
      }
    }, true);
  }

  /* ---------- Helpers ---------------------------------------------------- */
  window.LU.fakeSubmit = function (form, msg) {
    var note = form.querySelector('.form-note');
    if (!note) {
      note = document.createElement('p');
      note.className = 'form-note';
      note.style.cssText = 'margin-top:12px;font-size:.87rem;font-weight:650;color:#12A150';
      form.appendChild(note);
    }
    note.textContent = '✓ ' + msg;
    form.reset();
    return false;
  };

  window.LU.year = function () { return new Date().getFullYear(); };

  /* ---------- Init -------------------------------------------------------- */
  function init() {
    imageFallback();
    mount();
    reveals();
    counters();
    hero();
    filters();
    search();
    tabs();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
