/**
 * Prashant Singh - Warm Minimalist Craftsman Editorial Portfolio
 * Custom Interactive JavaScript Engine
 */

import Lenis from 'lenis';
import { initEmbeddingsNetwork } from './embeddings-network.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Link Lenis to update GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Lock scrolling during preloader
lenis.stop();

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCustomCursor();
  initMobileNav();
  initScrollSpy();
  initCertificateFilter();
  initAnchorLinks();
  initProfileInteraction();
  initGSAPAnimations();
});

/**
 * Typographic Curtain Preloader
 * Sequentially transitions through concept stages (01 to 04)
 * before splitting the curtains and starting interactions.
 */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const stages = [
    document.getElementById('stage-1'),
    document.getElementById('stage-2'),
    document.getElementById('stage-3'),
    document.getElementById('stage-4')
  ];

  let currentStageIdx = 0;

  function nextStage() {
    if (currentStageIdx < stages.length) {
      if (currentStageIdx > 0) {
        stages[currentStageIdx - 1].classList.remove('active');
        stages[currentStageIdx - 1].classList.add('prev');
      }
      
      stages[currentStageIdx].classList.add('active');
      currentStageIdx++;
      
      setTimeout(nextStage, 450); // Speed of each concept stage transition
    } else {
      // Remove active on final stage
      stages[stages.length - 1].classList.remove('active');
      stages[stages.length - 1].classList.add('prev');
      
      // Trigger curtains slide open
      setTimeout(() => {
        preloader.classList.add('loaded');
        lenis.start(); // Unlock scrolling
        
        // Load WebGL organic silk waves after curtains draw
        initEmbeddingsNetwork();
      }, 350);
    }
  }

  // Start sequence
  setTimeout(nextStage, 250);
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
 * Custom Cursor Follower Engine
 * Implements mouse coordinate trailing and displays dynamic help badges
 */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const cursorText = ring ? ring.querySelector('.cursor-text') : null;
  
  if (!dot || !ring || !cursorText) return;

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  let isMoving = false;

  dot.style.opacity = '0';
  ring.style.opacity = '0';

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!isMoving) {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      isMoving = true;
    }
    
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function updateRingPosition() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    requestAnimationFrame(updateRingPosition);
  }
  
  requestAnimationFrame(updateRingPosition);

  // Attach hover helpers (displays [view] / [link] in cursor)
  const attachHoverListeners = () => {
    const hoverables = document.querySelectorAll('[data-hover="true"]');
    
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('active');
        
        // Custom text based on link type
        if (el.classList.contains('link-card') || el.classList.contains('footer-social-link') || el.classList.contains('contact-card-blueprint-item')) {
          cursorText.textContent = '[link]';
        } else if (el.classList.contains('project-card-blueprint') || el.classList.contains('achievement-cell-blueprint')) {
          cursorText.textContent = '[info]';
        } else {
          cursorText.textContent = '[select]';
        }
      });
      
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('active');
        cursorText.textContent = '';
      });
    });
  };

  attachHoverListeners();

  const observer = new MutationObserver(() => {
    attachHoverListeners();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Mobile Navigation Toggle Menu
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
 * Scroll Spy Navigation Underliner
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
 * Certificate Filtration Engine
 */
function initCertificateFilter() {
  const searchInput = document.getElementById('certificate-search');
  const filterBtns = document.querySelectorAll('.filter-btn-blueprint');
  const certRows = document.querySelectorAll('.cert-row-blueprint');

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

      const title = row.querySelector('.cert-row-title')?.textContent.toLowerCase() || '';
      const issuer = row.querySelector('.cert-row-issuer')?.textContent.toLowerCase() || '';
      const desc = row.querySelector('.cert-row-description')?.textContent.toLowerCase() || '';
      
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
 * 3D Parallax Tilt Profile Image Interaction
 */
function initProfileInteraction() {
  const frame = document.getElementById('hero-portrait-frame');
  const slides = document.getElementById('hero-portrait-slides');
  const frontImg = document.getElementById('hero-portrait-front');
  const backImg = document.getElementById('hero-portrait-back');

  if (!frame || !slides || !frontImg || !backImg) return;

  let isHovered = false;

  frame.addEventListener('mouseenter', () => {
    isHovered = true;
    frontImg.classList.remove('active');
    backImg.classList.add('active');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isHovered) return;

    const rect = frame.getBoundingClientRect();
    const frameCenterX = rect.left + rect.width / 2;
    const frameCenterY = rect.top + rect.height / 2;

    const dx = e.clientX - frameCenterX;
    const dy = e.clientY - frameCenterY;

    const maxTilt = 8;
    const tiltX = (dy / (window.innerHeight / 2)) * maxTilt;
    const tiltY = -(dx / (window.innerWidth / 2)) * maxTilt;

    const clampedTiltX = Math.max(-maxTilt, Math.min(maxTilt, tiltX));
    const clampedTiltY = Math.max(-maxTilt, Math.min(maxTilt, tiltY));

    frame.style.transform = `rotateX(${clampedTiltX}deg) rotateY(${clampedTiltY}deg) scale(1.03)`;

    const moveX = (dx / (window.innerWidth / 2)) * 10;
    const moveY = (dy / (window.innerHeight / 2)) * 10;
    slides.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
  });

  frame.addEventListener('mouseleave', () => {
    isHovered = false;
    backImg.classList.remove('active');
    frontImg.classList.add('active');
    
    frame.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    slides.style.transform = 'translate(0px, 0px)';
  });
}

/**
 * Premium GSAP Scroll-Trigger Reveals
 */
function initGSAPAnimations() {
  // 1. Growing horizontal dividers
  gsap.utils.toArray('.editorial-divider').forEach(divider => {
    gsap.fromTo(divider, 
      { scaleX: 0, transformOrigin: 'left center' }, 
      { 
        scaleX: 1, 
        duration: 1.2, 
        ease: 'power2.out', 
        scrollTrigger: {
          trigger: divider,
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // 2. Fade & rise reveals for titles and tags
  gsap.utils.toArray('.section-title-blueprint, .blueprint-tag, .about-headings, .contact-pitch').forEach(elem => {
    gsap.fromTo(elem,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: elem,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // 3. Staggered reveal for selected project cards
  gsap.fromTo('.project-card-blueprint',
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.projects-blueprint-grid',
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    }
  );

  // 4. Staggered reveal for hackathon cells
  gsap.fromTo('.achievement-cell-blueprint',
    { opacity: 0, y: 35 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.achievements-blueprint-grid',
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    }
  );

  // 5. Staggered reveal for competence cards
  gsap.fromTo('.skills-blueprint-grid > .blueprint-card',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.skills-blueprint-grid',
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    }
  );

  // 6. Staggered reveal for contact items
  gsap.fromTo('.contact-card-blueprint-item',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.contact-grid-blueprint',
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    }
  );
}
