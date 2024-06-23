import { showAlert } from './alerts.js';

const signup = async (name, email, password, token) => {
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
    const response = await fetch(`/api/v1/users/signup/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
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
      ); // Assuming your backend returns a message
      window.setTimeout(() => {
        location.assign(`/a/${name}`);
      }, 1000);
    } else {
      // Handle non-successful response status (e.g., 4xx or 5xx errors)
      const errorData = await response.json();
      console.log(errorData);
      showAlert('error', errorData.errors);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};

const signupBtn = document.querySelector('.signup-form .btn');
const token = document.querySelector('.token').dataset.token;

if (signupBtn) {
  signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    signup(name, email, password, token);
  });
}
