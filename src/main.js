/**
 * Prashant Singh - Professional Developer Minimalist Portfolio
 * Custom Interactive JavaScript Engine
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync ScrollTrigger with Lenis scroll updates
lenis.on('scroll', ScrollTrigger.update);

// Lock scrolling during preloader
lenis.stop();

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initPreloader();
  initMobileNav();
  initScrollSpy();
  initCertificateFilter();
  initAnchorLinks();
  initProfileInteraction();
  initGSAPAnimations();
});

/**
 * Interactive Light / Dark Theme Switching Logic
 * Saves preference in localStorage and applies data-theme attributes
 */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  // Retrieve saved theme or fallback to user system dark mode preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
  
  // Set initial theme state
  document.documentElement.setAttribute('data-theme', initialTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Temporarily add a transition helper class to body to prevent initial load flashes
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Clean up transition rules after switch complete
    setTimeout(() => {
      document.body.style.transition = '';
    }, 400);
  });
}

/**
 * Fast Typographic Fade Preloader
 */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  setTimeout(() => {
    preloader.classList.add('loaded');
    lenis.start(); // Enable scroll
  }, 600);
}

/**
 * Intercept anchor clicks and scroll smoothly using Lenis
 */
function initAnchorLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        lenis.scrollTo(targetElement);
      }
    });
  });
}

/**
 * Mobile Navigation Menu Toggle
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle-btn');
  const navMenu = document.getElementById('nav-menu-bar');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('open');
    toggleBtn.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && e.target !== toggleBtn) {
      navMenu.classList.remove('open');
      toggleBtn.classList.remove('active');
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggleBtn.classList.remove('active');
    });
  });
}

/**
 * Scroll Spy Navigation Underline Updates
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('main > section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (sections.length === 0 || navLinks.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '-35% 0px -45% 0px',
    threshold: 0
  };

  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  sections.forEach(section => observer.observe(section));
}

/**
 * Certificate Filter Engine
 */
function initCertificateFilter() {
  const searchInput = document.getElementById('certificate-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const certRows = document.querySelectorAll('.cert-row');

  if (!searchInput || filterBtns.length === 0 || certRows.length === 0) return;

  let currentCategory = 'all';
  let currentSearchQuery = '';

  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.toLowerCase().trim();
    applyCombinedFilters();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentCategory = btn.getAttribute('data-org');
      applyCombinedFilters();
    });
  });

  function applyCombinedFilters() {
    certRows.forEach(row => {
      const rowOrgs = row.getAttribute('data-orgs') || '';
      const matchesCategory = (currentCategory === 'all') || rowOrgs.split(' ').includes(currentCategory);

      const title = row.querySelector('.cert-title')?.textContent.toLowerCase() || '';
      const issuer = row.querySelector('.cert-issuer')?.textContent.toLowerCase() || '';
      const desc = row.querySelector('.cert-description')?.textContent.toLowerCase() || '';
      
      const matchesText = title.includes(currentSearchQuery) || 
                          issuer.includes(currentSearchQuery) || 
                          desc.includes(currentSearchQuery);

      if (matchesCategory && matchesText) {
        row.classList.remove('hidden');
      } else {
        row.classList.add('hidden');
      }
    });
  }
}

/**
 * Cross-fade swap for circular profile headshot on hover
 */
function initProfileInteraction() {
  const frame = document.getElementById('hero-portrait-frame');
  const frontImg = document.getElementById('hero-portrait-front');
  const backImg = document.getElementById('hero-portrait-back');

  if (!frame || !frontImg || !backImg) return;

  frame.addEventListener('mouseenter', () => {
    frontImg.classList.remove('active');
    backImg.classList.add('active');
  });

  frame.addEventListener('mouseleave', () => {
    backImg.classList.remove('active');
    frontImg.classList.add('active');
  });
}

/**
 * Crisp GSAP Scroll-Trigger Reveals
 */
function initGSAPAnimations() {
  // 1. Divider line animations
  gsap.utils.toArray('.section-divider').forEach(divider => {
    gsap.fromTo(divider, 
      { scaleX: 0, transformOrigin: 'left center' }, 
      { 
        scaleX: 1, 
        duration: 1, 
        ease: 'power2.out', 
        scrollTrigger: {
          trigger: divider,
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // 2. Text elements fade-in
  gsap.utils.toArray('.section-title, .section-tag, .stats-panel, .bio-text').forEach(elem => {
    gsap.fromTo(elem,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: elem,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // 3. Staggered project cards reveal
  gsap.fromTo('.project-card',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    }
  );

  // 4. Staggered hackathon cards reveal
  gsap.fromTo('.hackathon-card',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.hackathon-grid',
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    }
  );

  // 5. Staggered detail grids reveal
  gsap.fromTo('.skills-grid > .details-card',
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.skills-grid',
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    }
  );

  // 6. Staggered contact items reveal
  gsap.fromTo('.contact-card',
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.contact-grid',
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    }
  );
}
