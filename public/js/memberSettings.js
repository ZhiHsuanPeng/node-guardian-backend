document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  const addButton = document.querySelector('.add_users_btn');
  const addMembersWindow = document.querySelector('.add-users-window');
  const cancelButton = document.querySelector('.cancel_btn');

  addButton.addEventListener('click', (e) => {
    addMembersWindow.classList.toggle('hidden');
    addMembersWindow.classList.toggle('visible');
  });

  cancelButton.addEventListener('click', (e) => {
    addMembersWindow.classList.toggle('hidden');
    addMembersWindow.classList.toggle('visible');
  });

  navLinks.forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
      link.parentElement.classList.add('active');
    }
  });
});
