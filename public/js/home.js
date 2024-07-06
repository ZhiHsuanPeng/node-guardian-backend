const tryFree = document.querySelector('.tryFreeBtn');
const tryForFree = document.querySelector('.tryForFreeBtn');
const signIn = document.querySelector('.signInButton');

tryFree.addEventListener('click', () => {
  window.location.href = '/signup';
});

tryForFree.addEventListener('click', () => {
  window.location.href = '/signup';
});

signIn.addEventListener('click', () => {
  window.location.href = '/signin';
});
