import { showAlert } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  const openCreateProjectBtn = document.getElementById('open-create-project');
  const closeButton = document.querySelector('.close_btn');
  const createProjectWindow = document.querySelector('.create-project-window');
  const generateTokenBtn = document.getElementById('generate-token');
  const tokenInput = document.getElementById('token');
  const submitCreateProjectBtn = document.getElementById('submit-create-project');

  openCreateProjectBtn.addEventListener('click', () => {
    createProjectWindow.classList.toggle('hidden');
    createProjectWindow.classList.toggle('visible');
  });

  closeButton.addEventListener('click', function () {
    createProjectWindow.classList.toggle('hidden');
    createProjectWindow.classList.toggle('visible');
  });

  generateTokenBtn.addEventListener('click', () => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    tokenInput.value = token;
  });

  submitCreateProjectBtn.addEventListener('click', async () => {
    const projectName = document.getElementById('projectName').value;
    const accessToken = tokenInput.value;

    if (!projectName || !token) {
      alert('Please fill out both fields.');
      return;
    }

    try {
      const response = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName,
          accessToken,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('success', 'Create project success!');
      }
    } catch (error) {
      const errorData = await response.json();
      console.log(error);
      console.log(errorData);
      showAlert('error', errorData.message);
    }
  });
});
