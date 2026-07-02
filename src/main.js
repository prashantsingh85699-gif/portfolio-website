/**
 * Prashant Singh — Portfolio JS Engine
 * Handles: preloader, theme, scroll progress, GSAP reveals,
 *          copy protection, terminal simulation, cert filter, nav spy
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { inject } from '@vercel/analytics';

gsap.registerPlugin(ScrollTrigger);

// ─── Vercel Web Analytics ────────────────────────────────────────────────────
inject();

// ─── Smooth Scroll ──────────────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.1,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
lenis.stop(); // Hold until preloader done

function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);

// ─── Init on DOM Ready ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initPreloader();
  initCopyProtection();
  initMobileNav();
  initScrollProgress();
  initScrollTop();
  initNavSpy();
  initAnchorLinks();
  initPortraitSwap();
  initTerminal();
  initCertFilter();
  initGSAP();
});

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

// ─── Preloader ────────────────────────────────────────────────────────────────
function initPreloader() {
  const el = document.getElementById('preloader');
  if (!el) { lenis.start(); return; }

  // Give animations time to play (wipe + bar ≈ 1.5s)
  setTimeout(() => {
    el.classList.add('loaded');
    lenis.start();
  }, 1600);
}

// ─── Copy Protection ─────────────────────────────────────────────────────────
function initCopyProtection() {
  const params = new URLSearchParams(window.location.search);
  const isOwner = params.get('admin') === 'true' || localStorage.getItem('admin') === 'true';
  if (isOwner) {
    document.body.classList.add('allow-copy');
    localStorage.setItem('admin', 'true');
    return;
  }
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
    if (e.ctrlKey) {
      const k = e.key.toLowerCase();
      if ('cxaus'.includes(k)) { e.preventDefault(); return false; }
      if (e.shiftKey && 'ijc'.includes(k)) { e.preventDefault(); return false; }
    }
  });
  document.addEventListener('selectstart', e => e.preventDefault());
  document.querySelectorAll('img').forEach(img =>
    img.addEventListener('dragstart', e => e.preventDefault())
  );
}

// ─── Mobile Nav ───────────────────────────────────────────────────────────────
function initMobileNav() {
  const burger = document.getElementById('nav-toggle-btn');
  const menu   = document.getElementById('nav-menu-bar');
  if (!burger || !menu) return;
  burger.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('open'); });
  document.addEventListener('click', e => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== burger)
      menu.classList.remove('open');
  });
  menu.querySelectorAll('.nav-link').forEach(l =>
    l.addEventListener('click', () => menu.classList.remove('open'))
  );
}

// ─── Scroll Progress Bar ─────────────────────────────────────────────────────
function initScrollProgress() {
  const fill = document.getElementById('scroll-progress-fill');
  if (!fill) return;
  lenis.on('scroll', ({ progress }) => {
    fill.style.height = (progress * 100) + '%';
  });
}

// ─── Scroll-to-Top Button ─────────────────────────────────────────────────────
function initScrollTop() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;
  lenis.on('scroll', ({ scroll }) => {
    btn.classList.toggle('visible', scroll > 500);
  });
  btn.addEventListener('click', () => lenis.scrollTo(0, { duration: 1.2 }));
}

// ─── Nav Scroll Spy ───────────────────────────────────────────────────────────
function initNavSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-35% 0px -45% 0px', threshold: 0 });

  sections.forEach(s => obs.observe(s));
}

// ─── Smooth Anchor Links ─────────────────────────────────────────────────────
function initAnchorLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) lenis.scrollTo(target);
    });
  });
}

// ─── Portrait Swap ────────────────────────────────────────────────────────────
function initPortraitSwap() {
  const frame = document.getElementById('hero-portrait-frame');
  const front = document.getElementById('hero-portrait-front');
  const back  = document.getElementById('hero-portrait-back');
  if (!frame || !front || !back) return;
  frame.addEventListener('mouseenter', () => { front.classList.remove('active'); back.classList.add('active'); });
  frame.addEventListener('mouseleave', () => { back.classList.remove('active'); front.classList.add('active'); });
}

// ─── C++ Terminal Simulation ──────────────────────────────���──────────────────
function initTerminal() {
  const btn  = document.getElementById('run-code-btn');
  const logs = document.getElementById('console-logs');
  if (!btn || !logs) return;

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = '⟳ Compiling...';
    logs.style.color = '#71717a';
    logs.textContent = '$ g++ portfolio.cpp -o portfolio\nCompiling...';

    setTimeout(() => {
      logs.style.color = '#10b981';
      logs.textContent = `$ g++ portfolio.cpp -o portfolio && ./portfolio\n\nHello, I build things.\nCurrently @ VGU x NIAT\n\n[exit code: 0]`;
      btn.disabled = false;
      btn.textContent = '▶ Run';
    }, 800);
  });
}

// ─── Certificate Filter ───────────────────────────────────────────────────────
function initCertFilter() {
  const search  = document.getElementById('certificate-search');
  const buttons = document.querySelectorAll('.cfbtn');
  const rows    = document.querySelectorAll('.cert-row');
  if (!search || !buttons.length || !rows.length) return;

  let cat = 'all';
  let q   = '';

  function apply() {
    rows.forEach(row => {
      const orgs  = (row.getAttribute('data-orgs') || '').split(' ');
      const catOk = cat === 'all' || orgs.includes(cat);
      const text  = row.textContent.toLowerCase();
      const qOk   = !q || text.includes(q);
      row.classList.toggle('hidden', !(catOk && qOk));
    });
  }

  search.addEventListener('input', e => { q = e.target.value.toLowerCase().trim(); apply(); });
  buttons.forEach(b => {
    b.addEventListener('click', () => {
      buttons.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      cat = b.getAttribute('data-org');
      apply();
    });
  });
}

// ─── GSAP Scroll Animations ───────────────────────────────────────────────────
function initGSAP() {
  // Reveal all .reveal-left and .reveal-right elements
  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Stagger bento cards
  gsap.fromTo('.bento-card',
    { opacity: 0, y: 24 },
    {
      opacity: 1, y: 0,
      duration: 0.65,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.bento', start: 'top 82%', toggleActions: 'play none none none' },
    }
  );

  // Hero elements special stagger (on load, not on scroll)
  gsap.timeline({ delay: 1.7 })
    .fromTo('.hero-eyebrow',   { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    .fromTo('.hero-name',      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.25')
    .fromTo('.hero-role',      { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3')
    .fromTo('.hero-desc',      { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
    .fromTo('.hero-stats',     { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.15')
    .fromTo('.hero-cta-row',   { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1')
    .fromTo('.photo-card',     { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
    .fromTo('.code-terminal',  { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');

  // Make hero elements visible (they start as reveal-right/left but won't be triggered by scroll since hero is above fold)
  document.querySelectorAll('.hero-left.reveal-left, .hero-right .reveal-right').forEach(el => {
    el.style.opacity = '0';
  });
}
