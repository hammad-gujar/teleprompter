function toggleMenu() {
	document.body.classList.toggle('menu-open');
}

document.addEventListener('click', function(click) { // one listener

	if ( click.target.matches('[rel="menu-toggle"]') ) { // many scenarios
  	toggleMenu();
  }
  
  if ( click.target.matches('a') ) {
    toggleMenu(); // or you could add the rel to each... 
  }
  
})