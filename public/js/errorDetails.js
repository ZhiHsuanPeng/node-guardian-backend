function toggleFrames() {
  var frames = document.getElementsByClassName('non-project-frame');
  for (var i = 0; i < frames.length; i++) {
    if (frames[i].style.display === 'none') {
      frames[i].style.display = 'block';
    } else {
      frames[i].style.display = 'none';
    }
  }
}

console.log('123');
