import { showAlert } from './alerts.js';
import { signup } from './signUp.js';
import { signin } from './signIn.js';

const signupBtn = document.querySelector('.signup-form .btn');
const loginBtn = document.querySelector('.login-form .btn');

if (signupBtn) {
  signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    signup(name, email, password);
  });
}

if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    signin(email, password);
  });
}
