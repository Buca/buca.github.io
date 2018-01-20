var grassContainer = document.getElementById('grass'),
    smokeContainer = document.getElementById('smoke'),
    skyInside = document.getElementById('sky-inside'),
    skyOutside = document.getElementById('sky-outside'),
    mainCamera = document.getElementById('main-camera'),
    logoShadow = document.getElementById('logo-shadow'),
    logoPageWidth = document.getElementById('logo-page').offsetWidth,
    cameraRot = 0;

function generateGrass(patches, grassPerPatch) {

  var grass = '';

  for(var i = 0; i < patches * grassPerPatch; i++) {

    var h = Math.round(Math.random() * 10),
        x = -75 + Math.round(Math.random() * 206),
        z = -100 + Math.round(Math.random() * 200);

    grass += grassParticle(h, x, z);

  }

  grassContainer.innerHTML = grass;

};

function grassParticle(h, x, z) {

  var particle = ['<div class="object-container grass-particle" ',
                   'style="transform: translateX(' + x + 'px) translateZ(' + z + 'px)">',
                    '<div class="rot-north">',
                      '<div class="face green-bg" ',
                      'style="transition: background-color 1s; height: ' + h + 'px; transform: translateY(' + (-h + 2) + 'px) translateZ(1px) translateX(-1px)"></div>',
                      '<div class="face green-bright-bg" style="transition: background-color 1s; transform: translateY(' + -h + 'px) translateZ(1px) translateX(-1px)"></div>',
                    '</div>',
                    '<div class="rot-east">',
                      '<div class="face green-bg" ',
                      'style="transition: background-color 1s; height: ' + h + 'px; transform: translateY(' + (-h + 2) + 'px) translateZ(1px) translateX(-1px)"></div>',
                      '<div class="face green-bright-bg" style="transition: background-color 1s; transform: translateY(' + -h + 'px) translateZ(1px) translateX(-1px)"></div>',
                    '</div>',
                    '<div class="rot-south">',
                      '<div class="face green-bg" ',
                      'style="transition: background-color 1s; height: ' + h + 'px; transform: translateY(' + (-h + 2) + 'px) translateZ(1px) translateX(-1px)"></div>',
                      '<div class="face green-bright-bg" style="transition: background-color 1s; transform: translateY(' + -h + 'px) translateZ(1px) translateX(-1px)"></div>',
                    '</div>',
                    '<div class="rot-west">',
                      '<div class="face green-bg" ',
                      'style="transition: background-color 1s; height: ' + h + 'px; transform: translateY(' + (-h + 2) + 'px) translateZ(1px) translateX(-1px)"></div>',
                      '<div class="face green-bright-bg" style="transition: background-color 1s; transform: translateY(' + -h + 'px) translateZ(1px) translateX(-1px)"></div>',
                    '</div>',
                  '</div>'];

    return particle.join('');

};

generateGrass(1, 50);

function generateCloud() {

  var htmlArr = [],
      htmlArr1 = [],
      elemW = logoPageWidth,
      cloudId = "cloud-" + Date.now();

  var multiplier = Math.pow(Math.random(), 2);

  var maxHeight = Math.ceil(16 * multiplier/2),
      maxWidth = Math.ceil(180 * multiplier);

      //lvl2w 5/8

  //Lvl-1
  var lvl1h = Math.ceil(maxHeight / 6),
      lvl1w = maxWidth;

  //Lvl-2
  var lvl2h = Math.ceil(3 * maxHeight / 6),
      lvl2w = Math.ceil(5 * maxWidth / 8),
      lvl2x = Math.ceil(maxWidth/10);

  //Lvl-3
  var lvl3h = Math.ceil(2 * maxHeight / 6),
      lvl3w = Math.ceil(maxWidth / 2),
      lvl3x = Math.ceil(maxWidth/5);

  var top = parseFloat((-10) + Math.ceil(230 - (230 * multiplier)));

  //Html construction
  htmlArr.push('<div id="inside-' + cloudId + '' + '" class="cloud" style="top: ' + top + 'px; transform: translateX(' + (elemW/2 + 128) + 'px);">',
                '<div class="cloud-lvl-1" style="opacity: ' + multiplier + '; top: ' + (lvl3h + lvl2h) + 'px; height: ' + lvl1h + 'px; width: ' + lvl1w + 'px"></div>', //Bottom
                '<div class="cloud-lvl-2" style="opacity: ' + multiplier + '; top: ' + (lvl3h) + 'px; left: ' + (lvl2x) + 'px; height: ' + lvl2h + 'px; width: ' + lvl2w + 'px"></div>',          //Middle
                '<div class="cloud-lvl-3" style="opacity: ' + multiplier + '; left: ' + (lvl3x) + 'px; height: ' + lvl3h + 'px; width: ' + lvl3w + 'px"></div>',          //Top
               '</div>');
  htmlArr1.push('<div id="outside-' + cloudId + '' + '" class="cloud" style="top: ' + top + 'px; transform: translateX(' + (elemW/2 + 128) + 'px); opacity: ' + multiplier + '">',
                '<div class="cloud-lvl-1 purple-bg" style="opacity: ' + multiplier + '; top: ' + (lvl3h + lvl2h) + 'px; height: ' + lvl1h + 'px; width: ' + lvl1w + 'px"></div>', //Bottom
                '<div class="cloud-lvl-2 purple-bg" style="opacity: ' + multiplier + '; top: ' + (lvl3h) + 'px; left: ' + (lvl2x) + 'px; height: ' + lvl2h + 'px; width: ' + lvl2w + 'px"></div>',          //Middle
                '<div class="cloud-lvl-3 purple-bg" style="opacity: ' + multiplier + '; left: ' + (lvl3x) + 'px; height: ' + lvl3h + 'px; width: ' + lvl3w + 'px"></div>',          //Top
               '</div>');

  skyInside.insertAdjacentHTML('afterbegin', htmlArr.join(''));
  skyOutside.insertAdjacentHTML('afterbegin', htmlArr1.join(''));

  var insideCloud = document.getElementById('inside-' + cloudId);
  var outsideCloud = document.getElementById('outside-' + cloudId);

  var calc = (1 + 3/multiplier) * 2;
  var calcNew = (1/multiplier + 1) * 5;

  insideCloud.style.transition = 'transform ' + calcNew + 's';
  outsideCloud.style.transition = 'transform ' + calcNew + 's, opacity ' + calcNew/5 + 's';
  insideCloud.style.transitionTimingFunction = 'linear';
  outsideCloud.style.transitionTimingFunction = 'linear';
  outsideCloud.style.opacity = '0';

  setTimeout(function() {
    outsideCloud.style.transform = 'translateX(' + (-elemW/2 - 128) + 'px)';
    insideCloud.style.transform = 'translateX(' + (-elemW/2 - 128) + 'px)';
    outsideCloud.style.opacity = '1';
  }, (calcNew/6) * 1000 + 6);

  setTimeout(function() {
    outsideCloud.style.opacity = '0';
  }, (calcNew - calcNew/6) * 1000 );

  setTimeout(function() {
    insideCloud.parentNode.removeChild(insideCloud);
    outsideCloud.parentNode.removeChild(outsideCloud);
  }, calcNew * 1000 + 1000);

};

generateCloud();
generateCloud();

function cloudGenerator() {
  setTimeout(function() {
    generateCloud();

    cloudGenerator();
  }, 1000);
}

cloudGenerator();

function turn(degrees) {

  cameraRot += degrees;

  var a = cameraRot % 360;

  if((315 <= a) || (-45 <= a && a < 45) || (a <= -315)) {
    //console.log('north');
    mainCamera.classList.add('north-visible');
    mainCamera.classList.remove('south-visible', 'east-visible', 'west-visible');
  }
  else if((-315 <= a && a < -225) || (45 <= a && a < 135)) {
    mainCamera.classList.add('east-visible');
    mainCamera.classList.remove('north-visible', 'south-visible', 'west-visible');
    //console.log('north');
  }
  else if((-135 <= a && a < -45) || (225 <= a && a < 315)) {
    mainCamera.classList.add('west-visible');
    mainCamera.classList.remove('north-visible', 'south-visible', 'east-visible');
  }
  else if((135 <= a && a < 225) || (-255 <= a && a < -135)) {
    mainCamera.classList.add('south-visible');
    mainCamera.classList.remove('north-visible', 'east-visible', 'west-visible');
  }

  mainCamera.style.transform = 'rotateY(' +  cameraRot + 'deg) translateY(250px)';
  logoShadow.style.transform = 'rotateY(' +  cameraRot + 'deg) rotateX(90deg) translateZ(-170px)';

};

document.body.addEventListener('keydown', function(e) {

  if(e.keyCode === 37) { //Left
    turn(-10);
  }
  else if(e.keyCode === 39) { //Right
    turn(10);
  }

});

window.addEventListener('resize', function() {
  logoPageWidth = document.getElementById('logo-page').offsetWidth;
});

mainCamera.addEventListener("animationend", turn(-50));
