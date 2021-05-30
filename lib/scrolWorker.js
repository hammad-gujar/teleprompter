onmessage = function(el) {

  lastElementTop = $(el).position().top ;
  scrollAmount = lastElementTop ;

  $('html,body').animate({scrollTop: scrollAmount},1000);
  //postMessage(workerResult);
}