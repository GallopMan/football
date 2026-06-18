(function () {
  var bgs = ['배경1.png', '배경2.png', '배경3.png'];
  var key = 'gm_session_bg';
  var pick = sessionStorage.getItem(key);
  if (!pick || bgs.indexOf(pick) === -1) {
    pick = bgs[Math.floor(Math.random() * bgs.length)];
    sessionStorage.setItem(key, pick);
  }
  // Override CSS variable on root so all gm-theme pages pick it up
  document.documentElement.style.setProperty('--gm-bg', "url('" + pick + "')");
  // For index.html hero bg and any page with .hero-bg
  document.addEventListener('DOMContentLoaded', function () {
    var heroBg = document.querySelector('.hero-bg');
    if (heroBg) heroBg.style.backgroundImage = "url('" + pick + "')";
  });
})();
