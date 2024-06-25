import { showAlert } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  const projectNameField = document.querySelector('#projectName');
  const prjId = document.querySelector('.projectId').dataset.prjid;
  const saveBtn = document.querySelector('.rules_save_btn');
  const projectOwner = document.querySelector('.project_owner').dataset.owner;
  const projectName = document.querySelector('.project_name').dataset.prjname;
  const userId = document.querySelector('.project_ownerId').dataset.id;

  saveBtn.addEventListener('click', async () => {
    try {
      const newProjectName = document.querySelector('#projectName').value;
      console.log(newProjectName);
      const response = await fetch('/api/v1/projects', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prjId,
          newProjectName,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        showAlert('success', 'New Name Set Successfully!');
        window.setTimeout(() => {
          location.assign(
            `/a/${projectOwner}/${newProjectName}/settings/general`,
          );
        }, 1000);
      }
    } catch (err) {
      console.log(err);
      showAlert('error', err.message);
    }
  });

  navLinks.forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
      link.parentElement.classList.add('active');
    }
  });

  projectNameField.value = projectName;
});
