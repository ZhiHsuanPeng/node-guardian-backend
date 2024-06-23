import { showAlert } from './alerts.js';

export const signin = async (email, password) => {
  try {
    if (!email) {
      throw Error('Email Field Can Not Be Blank!');
    }
    if (!password) {
      throw Error('Password Field Can Not Be Blank!');
    }
    const response = await fetch('/api/v1/users/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      showAlert(
        'success',
        `Hello! ${responseData.data.user.name}! <br> Please confirm this is your email: ${responseData.data.user.email}`,
      );
      window.setTimeout(() => {
        location.assign(`/a/${responseData.data.user.name}`);
      }, 1000);
      console.log(responseData);
    } else {
      const errorData = await response.json();
      console.log(errorData.message);
      showAlert('error', errorData.message);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};
