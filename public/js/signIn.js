import { showAlert } from './alerts.js';

export const signin = async (email, password) => {
  try {
    const response = await fetch('/api/v1/users/signIn', {
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
        `Hello! ${responseData.data.user.name}! <br> Please confirm this is your email: ${responseData.data.user.email}`
      );
      window.setTimeout(() => {
        location.assign('/index');
      }, 1000);
      console.log(responseData);
    } else {
      // Handle non-successful response status (e.g., 4xx or 5xx errors)
      const errorData = await response.json();
      console.log(errorData);
      showAlert('error', errorData.message);
    }
  } catch (err) {
    // Handle network errors or other exceptions
    alert('An error occurred during signup.');
    console.error(err);
  }
};
