/**
 * Prashant Singh - Personal Portfolio Logic
 * Handles interactive behaviors including:
 * 1. Mobile navigation menu toggle
 * 2. Active section highlighting on scroll (Scroll Spy)
 * 3. Search and Category filter combination engine for Certificates
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollSpy();
  initCertificateFilter();
});

/**
 * Mobile Navigation Menu
 * Toggles visibility of links on mobile devices and updates hamburger states.
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle-btn');
  const navMenu = document.getElementById('nav-menu-bar');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  // Toggle active state on button click
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('open');
    toggleBtn.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && e.target !== toggleBtn) {
      navMenu.classList.remove('open');
      toggleBtn.classList.remove('active');
    }
  });

  // Close menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggleBtn.classList.remove('active');
    });
  });
}

/**
 * Scroll Spy
 * Uses IntersectionObserver to watch page sections and highlight the corresponding navbar link.
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('main > section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (sections.length === 0 || navLinks.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the sweet spot of viewport
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
 * Certificate Filter & Search Engine
 * Integrates search input filtering with button category filters.
 * Returns the intersection of both filters for a seamless search experience.
 */
function initCertificateFilter() {
  const searchInput = document.getElementById('certificate-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const certItems = document.querySelectorAll('.cert-item');

  if (!searchInput || filterBtns.length === 0 || certItems.length === 0) return;

  let currentCategory = 'all';
  let currentSearchQuery = '';

  // Listen for search inputs
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.toLowerCase().trim();
    applyCombinedFilters();
  });

  // Listen for category selection clicks
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Manage active visual state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentCategory = btn.getAttribute('data-org');
      applyCombinedFilters();
    });
  });

  /**
   * Evaluates each certificate item against both text query and category parameters.
   */
  function applyCombinedFilters() {
    certItems.forEach(item => {
      // 1. Evaluate Category Match
      const itemOrgs = item.getAttribute('data-orgs') || '';
      const matchesCategory = (currentCategory === 'all') || itemOrgs.split(' ').includes(currentCategory);

      // 2. Evaluate Text Match
      const title = item.querySelector('.cert-title')?.textContent.toLowerCase() || '';
      const issuer = item.querySelector('.cert-issuer')?.textContent.toLowerCase() || '';
      const highlight = item.querySelector('.cert-highlight-desc')?.textContent.toLowerCase() || '';
      
      const matchesText = title.includes(currentSearchQuery) || 
                          issuer.includes(currentSearchQuery) || 
                          highlight.includes(currentSearchQuery);

      // 3. Show/Hide based on both conditions
      if (matchesCategory && matchesText) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  }
}
