// Generated by CoffeeScript 1.6.2
define(function() {
  return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    return window.setTimeout(callback, 1000 / 60);
  };
  /*
  requestAnimationFrame=()=>
    console.log("rAnim")
    if  !window.requestAnimationFrame 
      window.requestAnimationFrame = ()=>
        return window.webkitRequestAnimationFrame or
        window.mozRequestAnimationFrame or
        window.oRequestAnimationFrame or
        window.msRequestAnimationFrame or
        (callback,element)=>
          return window.setTimeout( callback, 1000 / 60 )
    
    console.log(window.requestAnimationFrame)
    return window.requestAnimationFrame
          
  cancelRequestAnimationFrame=()=>
    if  !window.cancelRequestAnimationFrame 
      window.cancelRequestAnimationFrame = ()=>
        return window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        clearTimeout
    return window.cancelRequestAnimationFrame
  */

});
