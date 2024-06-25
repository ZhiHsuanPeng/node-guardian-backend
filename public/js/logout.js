import { showAlert } from './alerts.js';
const logOutBtn = document.querySelector('.logout_btn');

logOutBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const response = await fetch('/api/v1/users/logout', { method: 'POST' });
  if (response.ok) {
    showAlert('success', 'Logging out!');
    window.setTimeout(() => {
      location.assign('/signin');
    }, 1000);
  }
});
