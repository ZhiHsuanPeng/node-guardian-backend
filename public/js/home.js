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

window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  const logo = document.querySelector('.logo');
  const name = document.querySelector('.project_name');
  if (window.scrollY > 0) {
    header.classList.add('scrolled');
    logo.setAttribute('src', '/img/icon_blue_big.png');
    name.style.color = '#272f40';
    name.style.fontSize = '24px';
  } else {
    header.classList.remove('scrolled');
    logo.setAttribute('src', '/img/icon_big.png');
    name.style.color = 'white';
    name.style.fontSize = '28px';
  }
});
