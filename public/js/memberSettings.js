import { showAlert } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  const addButton = document.querySelector('.add_users_btn');
  const submitBtn = document.querySelector('#submit_add_members');
  const addMembersWindow = document.querySelector('.add-users-window');
  const cancelButton = document.querySelector('.cancel_btn');
  const projectOwner = document.querySelector('.project_owner').dataset.owner;
  const projectName = document.querySelector('.project_name').dataset.prjname;
  const userId = document.querySelector('.project_ownerId').dataset.id;

  addButton.addEventListener('click', (e) => {
    addMembersWindow.classList.toggle('hidden');
    addMembersWindow.classList.toggle('visible');
  });

  cancelButton.addEventListener('click', (e) => {
    addMembersWindow.classList.toggle('hidden');
    addMembersWindow.classList.toggle('visible');
  });

  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const userEmail = document.querySelector('#userEmail').value;

    try {
      const response = await fetch('/api/v1/projects/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          projectOwner,
          projectName,
          ownerId: userId,
        }),
      });

      const result = await response.json();
      console.log(result);
      if (response.ok) {
        showAlert('success', 'Invitation sent!');
      }
      window.setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (error) {
      showAlert('error', error.message);
    }
  });

  navLinks.forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
      link.parentElement.classList.add('active');
    }
  });
});
