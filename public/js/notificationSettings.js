import { showAlert } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  //   const projectOwner = document.querySelector('.project_owner').dataset.owner;
  //   const projectName = document.querySelector('.project_name').dataset.prjname;
  //   const userId = document.querySelector('.project_ownerId').dataset.id;

  navLinks.forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
      link.parentElement.classList.add('active');
    }
  });
});
