var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25538804-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


var buttons = document.querySelectorAll('span');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', trackButtonClick);
  }
 
var buttons = document.querySelectorAll('img');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', trackButtonClick);
  }

function trackButton(e) {
    _gaq.push(['_trackEvent', e.target.id, 'clicked']);
  };