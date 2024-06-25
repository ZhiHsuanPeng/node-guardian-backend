import { showAlert } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  const button = document.getElementById('toggleButton');
  const tokenValue = document.getElementById('tokenValue');

  button.addEventListener('click', () => {
    if (tokenValue.style.display === 'none') {
      tokenValue.style.display = 'inline';
      button.textContent = 'Hide Token';
    } else {
      tokenValue.style.display = 'none';
      button.textContent = 'Show Token';
    }
  });

  navLinks.forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
      link.parentElement.classList.add('active');
    }
  });
});
