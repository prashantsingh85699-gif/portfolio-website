/**
 * Prashant Singh - Dynamic Editorial Portfolio
 * Custom Interactive JavaScript Engine (Light Theme)
 */

import Lenis from 'lenis';
import { initEmbeddingsNetwork } from './embeddings-network.js';

// Initialize Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom out-cubic-like easing
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Lock scrolling during preloader phase
lenis.stop();

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCustomCursor();
  initMobileNav();
  initScrollSpy();
  initCertificateFilter();
  initAnchorLinks();
  initProfileInteraction();
});

/**
 * Preloader Controller
 * Handles visual delays, line fill timings, and the slide-up exit transition.
 */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  // Let the CSS line animation complete first (approx 1.8 seconds)
  setTimeout(() => {
    preloader.classList.add('loaded');
    lenis.start(); // Unlock scrolling
    
    // Initialize Three.js interactive nodes after the loader has exited
    initEmbeddingsNetwork();
  }, 2000);
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
 * Implements mouse coordinate listeners and updates a lag-compensated ring follower 
 * using requestAnimationFrame to ensure high performance and fluid rendering.
 */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  
  if (!dot || !ring) return;

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  let isMoving = false;

  // Hide default cursor indicators on start, show on first movement
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
    
    // Dot moves-instantly
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  // Smooth lag follower loop
  function updateRingPosition() {
    // 0.15 is the lag coefficient (higher means faster, lower means more trailing lag)
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    requestAnimationFrame(updateRingPosition);
  }
  
  requestAnimationFrame(updateRingPosition);

  // Attach hover expanding listeners to all tagged elements
  const attachHoverListeners = () => {
    const hoverables = document.querySelectorAll('[data-hover="true"]');
    
    hoverables.forEach(el => {
      // Scale up outer ring on hover
      el.addEventListener('mouseenter', () => {
        ring.classList.add('active');
      });
      
      // Reset outer ring on leave
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('active');
      });
    });
  };

  attachHoverListeners();

  // Re-observe if elements are dynamically filtered/changed
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
    rootMargin: '-30% 0px -50% 0px',
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
 * Combined Certificate Filtration Engine
 * Integrates keyphrase search inputs with category badges.
 */
function initCertificateFilter() {
  const searchInput = document.getElementById('certificate-search');
  const filterBtns = document.querySelectorAll('.filter-btn-editorial');
  const certRows = document.querySelectorAll('.cert-row-editorial');

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
 * 3D Parallax Tilt and Click-Swap Profile Image Interaction
 * Rotates the circular profile frame on hover to track the cursor,
 * shifts the active portrait in the opposite direction for 3D depth,
 * and toggles active classes to swap between formal and casual portraits on click.
 */
function initProfileInteraction() {
  const frame = document.getElementById('hero-portrait-frame');
  const frontImg = document.getElementById('hero-portrait-front');
  const backImg = document.getElementById('hero-portrait-back');

  if (!frame || !frontImg || !backImg) return;

  // Track hover status for window-mousemove efficiency
  let isHovered = false;

  frame.addEventListener('mouseenter', () => {
    isHovered = true;

    // Automatically cross-fade to alternate portrait on hover
    frontImg.classList.remove('active');
    backImg.classList.add('active');
  });

  // Smooth 3D tilt coordinates
  window.addEventListener('mousemove', (e) => {
    if (!isHovered) return;

    const rect = frame.getBoundingClientRect();
    const frameCenterX = rect.left + rect.width / 2;
    const frameCenterY = rect.top + rect.height / 2;

    // Offset from center
    const dx = e.clientX - frameCenterX;
    const dy = e.clientY - frameCenterY;

    // Normalised values for rotation limits (max 12deg tilt)
    const maxTilt = 12;
    const tiltX = (dy / (window.innerHeight / 2)) * maxTilt;
    const tiltY = -(dx / (window.innerWidth / 2)) * maxTilt;

    // Bound values
    const clampedTiltX = Math.max(-maxTilt, Math.min(maxTilt, tiltX));
    const clampedTiltY = Math.max(-maxTilt, Math.min(maxTilt, tiltY));

    // Rotate frame in 3D space
    frame.style.transform = `rotateX(${clampedTiltX}deg) rotateY(${clampedTiltY}deg) scale(1.03)`;

    // Parallax depth offset: translate photo inside frame in the opposite direction
    const activeImg = frame.querySelector('.hero-portrait-img.active');
    if (activeImg) {
      const moveX = (dx / (window.innerWidth / 2)) * 8; // Max 8px shift
      const moveY = (dy / (window.innerHeight / 2)) * 8;
      activeImg.style.transform = `scale(1.08) translate(${-moveX}px, ${-moveY}px)`;
    }
  });

  frame.addEventListener('mouseleave', () => {
    isHovered = false;

    // Automatically cross-fade back to main portrait on leave
    backImg.classList.remove('active');
    frontImg.classList.add('active');
    
    // Smooth reset on cursor exit
    frame.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    const imgs = frame.querySelectorAll('.hero-portrait-img');
    imgs.forEach(img => {
      img.style.transform = '';
    });
  });
}
