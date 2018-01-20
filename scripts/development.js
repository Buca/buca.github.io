var camera = {
  rotX: 0,
  rotY: 0
};

var cameraElement = document.getElementsByClassName('camera')[1];
var cameraElement1 = document.getElementById('logo-shadow');

/*document.body.addEventListener('keydown', function(e) {

  if(e.keyCode === 38) { //Up
    camera.rotX -= 5;
    cameraElement.style.transform = 'rotateX(' + camera.rotX + 'deg) rotateY(' +  camera.rotY + 'deg) translateY(250px)';
    cameraElement1.style.transform = 'rotateY(' +  camera.rotY + 'deg) rotateX(90deg) translateZ(-170px)';
  }
  if(e.keyCode === 40) { //Down
    camera.rotX += 5;
    cameraElement.style.transform = 'rotateX(' + camera.rotX + 'deg) rotateY(' +  camera.rotY + 'deg) translateY(250px)';
    cameraElement1.style.transform = 'rotateY(' +  camera.rotY + 'deg) rotateX(90deg) translateZ(-170px)';
  }
  if(e.keyCode === 37) { //Left
    camera.rotY -= 5;
    cameraElement.style.transform = 'rotateX(' + camera.rotX + 'deg) rotateY(' +  camera.rotY + 'deg) translateY(250px)';
    cameraElement1.style.transform = 'rotateY(' +  camera.rotY + 'deg) rotateX(90deg) translateZ(-170px)';
  }
  if(e.keyCode === 39) { //Right
    camera.rotY += 5;
    cameraElement.style.transform = 'rotateX(' + camera.rotX + 'deg) rotateY(' +  camera.rotY + 'deg) translateY(250px)';
    cameraElement1.style.transform = 'rotateY(' +  camera.rotY + 'deg) rotateX(90deg) translateZ(-170px)';
  }

});*/
