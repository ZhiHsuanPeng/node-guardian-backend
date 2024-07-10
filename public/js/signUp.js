import { showAlert } from './alerts.js';

export const signup = async (name, email, password) => {
  try {
    if (!name) {
      throw Error('Name Field Can Not Be Blank!');
    }
    if (!email) {
      throw Error('Email Field Can Not Be Blank!');
    }
    if (!password) {
      throw Error('Password Field Can Not Be Blank!');
    }
    const response = await fetch('/api/v1/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
    console.log(response);
    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      showAlert(
        'success',
        `Hello! ${responseData.data.user.name}! <br> Please confirm this is your email: ${responseData.data.user.email}`,
      );
      window.setTimeout(() => {
        location.assign(`/a/${name}`);
      }, 1000);
    } else {
      const errorData = await response.json();
      showAlert('error', errorData.message);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};
