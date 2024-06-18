import { showAlert } from './alerts.js';

export const signup = async (name, email, password) => {
  try {
    const response = await fetch('/api/v1/users/signUp', {
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
        `Hello! ${responseData.data.user.name}! <br> Please confirm this is your email: ${responseData.data.user.email}`
      ); // Assuming your backend returns a message
      window.setTimeout(() => {
        location.assign('/index');
      }, 1000);
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
