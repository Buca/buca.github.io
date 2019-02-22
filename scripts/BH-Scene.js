const Scene = function() {
  const self = this,
        doc = document;
  this.config = {
    throttleInput: 0,
    maxClouds: 50
  };
  this.counters = {
    clouds: 0
  };
  this.renderQue = [];
  this.loopQue = [];
  this.ui = {
    acceptKeyboard:  true,
    keyboardEnabled: true,
    acceptMouse:     true,
    mouseEnabled:    true,
    mouseDown:       false,
    acceptTouch:     true,
    touchEnabled:    true,
    touching:        false,
    acceptResize:    true,
    resizeThrottle:  30
  };
  this.e = {
    grass:      document.getElementById('grass'),
    smoke:      document.getElementById('smoke'),
    skyInside:  document.getElementById('sky-inside'),
    skyOutside: document.getElementById('sky-outside'),
    camera:     document.getElementById('main-camera'),
    shadow:     document.getElementById('logo-shadow'),
    logoPage:   document.getElementById('logo-page'),
    width:      document.getElementById('logo-page').offsetWidth,//this.e.logoPage.offsetWidth,
    height:     document.getElementById('logo-page').offsetHeight//this.e.logoPage.offsetHeight
  };
  this.camera = {
    rotate: 0,
    rotateVelocity: 0,
    x: 0,
    y: 0
  };
  this.rotate = function(deg) {
    self.camera.rotate += deg;
    var degMod = self.camera.rotate % 360;
    if((315 <= degMod) || (-45 <= degMod && degMod < 45) || (degMod <= -315)) {
      self.renderQue.push(function() {
        //console.log(1);
        self.e.camera.classList.add('north-visible');
        self.e.camera.classList.remove('east-visible', 'west-visible');
      });
    }
    else if((-315 <= degMod && degMod < -225) || (45 <= degMod && degMod < 135)) {
      self.renderQue.push(function() {
        //console.log(2);
        self.e.camera.classList.add('east-visible');
        self.e.camera.classList.remove('north-visible', 'south-visible');
      });
    }
    else if((-135 <= degMod && degMod < -45) || (225 <= degMod && degMod < 315)) {
      self.renderQue.push(function() {
        //console.log(3);
        self.e.camera.classList.add('west-visible');
        self.e.camera.classList.remove('north-visible', 'south-visible');
      });
    }
    else if((135 <= degMod && degMod < 225) || (-255 <= degMod && degMod < -135)) {
      self.renderQue.push(function() {
        //console.log(4);
        self.e.camera.classList.add('south-visible');
        self.e.camera.classList.remove('east-visible', 'west-visible');
      });
    }
    self.renderQue.push(function() {
      self.e.camera.style.transform = 'rotateY(' +  self.camera.rotate + 'deg) translateY(250px)';
      self.e.shadow.style.transform = 'rotateY(' +  self.camera.rotate + 'deg) rotateX(90deg) translateZ(-170px)';
    });
  };
  this.translate = function(_x, _y) {};
  this.objects = {
    clouds: [],
    smokeParticles: []
  };
  this.compute = {
    camera: function() {
      if(Math.abs(self.camera.rotateVelocity) <= 0.2) {
         self.camera.rotateVelocity = 0;
      }
      else if(Math.abs(self.camera.rotateVelocity) > 0.2) {
        //console.log(self.camera.rotateVelocity);
         self.camera.rotateVelocity *= .8;
         self.rotate(self.camera.rotateVelocity * 4);
      }
    },
    clouds: function() {
      for(var i = 0; i < self.objects.clouds.length; i++) {
          var cloud = self.objects.clouds[i];
          if(cloud.xCord <= cloud.endX) {
            cloud.xCord = cloud.startX;
          }
          cloud.xCord -= self.objects.clouds[i].speed;
          cloud.outside.style.transform = 'translate3d(' + cloud.xCord + 'px, ' + cloud.yCord + 'px, 0px)';
          cloud.inside.style.transform = 'translate3d(' + cloud.xCord + 'px, ' + cloud.yCord + 'px, 0px)';
      }
    },
    smoke: function() {
      for(var i = 0; i < self.objects.smokeParticles.length; i++) {
          var particle = self.objects.smokeParticles[i];
          if(particle.y <= particle.endY) {
            particle.y = particle.startY;
            particle.x = -3;
            particle.z = -3;
            particle.width = Math.random() * 2;
            particle.height = Math.random() * 2;
            particle.depth = Math.random() * 2;
            particle.speed = .5 + .5*Math.random();
          }
          var cachedCalc   = -particle.y/800;
          particle.x      += 2*particle.speed*(.5-Math.random());
          particle.y      -= particle.speed;
          particle.z      += 2*particle.speed*(-.5 + Math.random());
          particle.width  += -particle.y/800;
          particle.height += -particle.y/800;
          particle.depth  += -particle.y/800;
          particle.speed  *= 0.999;
          var transparency = 1 - (Math.pow(particle.y/particle.endY, 2) + Math.pow((particle.endY - particle.y)/particle.endY, 2));
          particle.children[0].style.opacity = transparency;
          particle.children[1].style.opacity = transparency;
          particle.children[2].style.opacity = transparency;
          particle.children[3].style.opacity = transparency;
          particle.elem.style.transform = 'translate3d(' + particle.x + 'px, ' + particle.y + 'px, ' + particle.z + 'px) scale3d(' + particle.width + ', ' + particle.height + ', ' + particle.depth + ')';//'translateX(' + particle.x + 'px) translateY(' + particle.y + 'px) translateZ(' + particle.z + 'px)';// scale3d(' + particle.width + ', ' + particle.height + ', ' + particle.depth + ')';
        //});
        //console.log(particle.elem.style.transform);
      }
    }
  };
  this.generate = {
    dust: function() {},
    mushroom: function(amount) {},
    grass: function(amount) {

      //Grass Particle
      var blades = document.createDocumentFragment();
      for(var i = 0; i < amount; i++) {
        var h = Math.round(Math.random() * 10),
            x = -75 + Math.round(Math.random() * 206),
            z = -100 + Math.round(Math.random() * 200);
        var container = document.createElement('div');
            container.id = 'grass-' + i;
            container.classList.add(
            'object-container',
            'grass-particle',
            'grass-particle-' + (i%3 + 1));
            container.style.transform = 'translateX(' + x + 'px) translateZ('+ z +'px';
        blades.appendChild(container);
        //North
        var north = document.createElement('div');
        north.classList.add('rot-north', 'object-container', 'face');
        container.appendChild(north);
        //East
        var east = document.createElement('div');
        east.classList.add('rot-east', 'object-container', 'face');
        container.appendChild(east);
        //South
        var south = document.createElement('div');
        south.classList.add('rot-south', 'object-container', 'face');
        container.appendChild(south);
        //West
        var west = document.createElement('div');
        west.classList.add('rot-west', 'object-container','face');
        container.appendChild(west);
        //Blade
        var bladeBottom = document.createElement('div');
            bladeBottom.classList.add('face', 'green-bg');
            bladeBottom.style.transform = 'translateX(-1px) translateY(' + (-h + 2) + 'px) translateZ(1px)';
            bladeBottom.style.height = h + 'px';
            bladeBottom.style.transition = 'background-color 1s';
        var bladeTop = document.createElement('div');
            bladeTop.classList.add('face', 'green-bright-bg');
            bladeTop.style.transform = 'translateX(-1px) translateY(' + -h + 'px) translateZ(1px)';
            bladeTop.style.height = '1px';
            bladeBottom.style.transition = 'background-color 1s';

        north.appendChild(bladeBottom);
        north.appendChild(bladeTop);
        east.appendChild(bladeBottom.cloneNode());
        east.appendChild(bladeTop.cloneNode());
        south.appendChild(bladeBottom.cloneNode());
        south.appendChild(bladeTop.cloneNode());
        west.appendChild(bladeBottom.cloneNode());
        west.appendChild(bladeTop.cloneNode());
      }
      //console.log(this);
      self.e.grass.appendChild(blades);
    },
    cloud: function(amount) {
      for(var i = 0; i < amount; i++) {
        var multiplier = Math.pow(Math.random(), 4),
            maxHeight  = Math.ceil(16 * multiplier / 2) + 2,
            maxWidth   = Math.ceil(180 * multiplier) + 4,
            lvl1h      = Math.ceil(maxHeight / 6),
            lvl1w      = maxWidth,
            lvl2h      = Math.ceil(3 * maxHeight / 6),
            lvl2w      = Math.ceil(5 * maxWidth / 8),
            lvl2x      = Math.ceil(maxWidth / 10),
            lvl3h      = Math.ceil(2 * maxHeight / 6),
            lvl3w      = Math.ceil(maxWidth / 2),
            lvl3x      = Math.ceil(maxWidth / 5),
            top        = Math.ceil(230 - 430*multiplier) - 10,
            id         = performance.now();
        var cloudOut = document.createDocumentFragment();
        var cloudIn = document.createDocumentFragment();
        var outside = document.createElement('div');
        outside.classList.add('cloud');
        outside.id = id;
        outside.style.opacity = multiplier;
        outside.style.transform = 'translateX(' + Math.ceil(self.e.width/2 + 128)  + 'px) translateY(' + top + 'px)';
        //outside.border = "1px solid blue";
        var inside = outside.cloneNode(true);
        inside.id = 'inside-' + id;
        var lvl1 = document.createElement('div');
        lvl1.classList.add('cloud-lvl-1', 'purple-bg');
        lvl1.style.height = lvl1h + 'px';
        lvl1.style.width = lvl1w + 'px';
        lvl1.style.transform = 'translateY(' + (lvl3h + lvl2h) + 'px)';
        var lvl1In = lvl1.cloneNode(true);
        lvl1In.classList.remove('purple-bg');
        var lvl2 = document.createElement('div');
        lvl2.classList.add('cloud-lvl-2', 'purple-bg');
        lvl2.style.height = lvl2h + 'px';
        lvl2.style.width = lvl2w + 'px';
        lvl2.style.transform = 'translateX(' + lvl3x  + 'px) translateY(' + lvl3h + 'px)';
        var lvl2In = lvl2.cloneNode(true);
        lvl2In.classList.remove('purple-bg');
        var lvl3 = document.createElement('div');
        lvl3.classList.add('cloud-lvl-3', 'purple-bg');
        lvl3.style.height = lvl3h + 'px';
        lvl3.style.width = lvl3w + 'px';
        lvl3.style.transform = 'translateX(' + lvl3x + 'px)';
        var lvl3In = lvl3.cloneNode(true);
        lvl3In.classList.remove('purple-bg');
        outside.appendChild(lvl1);
        outside.appendChild(lvl2);
        outside.appendChild(lvl3);
        cloudOut.appendChild(outside);
        inside.appendChild(lvl1In);
        inside.appendChild(lvl2In);
        inside.appendChild(lvl3In);
        cloudIn.appendChild(inside);
        self.e.skyOutside.appendChild(cloudOut);
        self.e.skyInside.appendChild(cloudIn)
        var cloudObject = {
          inside: document.getElementById('inside-' + id),
          outside: document.getElementById(id),
          startX: self.e.width/2 + 128 + 256*Math.random(),
          endX: -self.e.width/2 - 128,
          xCord: 2*self.e.width*(Math.random() - Math.random()) + 128,
          yCord: 180 - 180*multiplier,
          opacity: 1,
          speed: 2*multiplier
        };
        self.objects.clouds.push(cloudObject);
      }
    },
    smoke: function(amount) {
      for(var i = 0; i < amount; i++) {
        var rand = Math.random(),
            //height = rand * 200,
            width = rand * 3 + 1,
            height = width*rand,
            depth = width*Math.random(),
            y = -Math.random()*95 - 5,
            x = -Math.pow(Math.random(), 4),
            z =  -Math.pow(Math.random(), 4),
            id = 'smoke-' + i;
        var fragment = document.createDocumentFragment();
        var smokeParticle = document.createElement('div'),
            north = document.createElement('div');
            smokeParticle.id = id;
            smokeParticle.classList.add('smoke-particle-1', 'object-container');
            smokeParticle.style.transform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(' + z + 'px) scale3d(' + width + ', ' + height + ', ' + depth + ')';
            north.classList.add('rot-north', 'face', 'white-bg');
        var east = north.cloneNode(),
            south = north.cloneNode(),
            west = north.cloneNode();
            east.classList.replace('rot-north','rot-east');
            west.classList.replace('rot-north','rot-west');
            south.classList.replace('rot-north','rot-south');
            smokeParticle.appendChild(north);
            smokeParticle.appendChild(east);
            smokeParticle.appendChild(west);
            smokeParticle.appendChild(south);
            fragment.appendChild(smokeParticle);
            self.e.smoke.appendChild(fragment);
        var particleObj = {
          x: x, y: y, z: z,
          width: width,
          height: height,
          depth: depth,
          elem: document.getElementById(id),
          children: undefined,
          speed: .7 + .5*rand,
          startY: -5,
          endY: -100
        };
        particleObj.children = particleObj.elem.children;
        self.objects.smokeParticles.push(particleObj);
      }
    }
  };
  this.events = function() {
    //Keyboard
    document.body.addEventListener('keydown', function(ev) {
      if(self.ui.acceptKeyboard && self.ui.keyboardEnabled) {
        self.ui.acceptKeyboard = false;
        setTimeout(function() {
          self.ui.acceptKeyboard = true;
        }, self.config.throttleInput);
        if(ev.keyCode === 37) { //Left
          //self.rotate(-10);
          self.camera.rotateVelocity = -1;
        }
        else if(ev.keyCode === 39) { //Right
          self.camera.rotateVelocity = 1;
        }
      }
    });
    //Mouse
    var pointerStart;
    self.e.logoPage.addEventListener('mousedown', function(ev) {
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
      pointerStart = ev.screenX;
      self.ui.mouseDown = true;
    });
    self.e.logoPage.addEventListener('mousemove', function(ev) {
      if(self.ui.acceptMouse && self.ui.mouseEnabled && self.ui.mouseDown) {
        self.ui.acceptMouse = false;
        setTimeout(function() {
          self.ui.acceptMouse = true;
        }, self.config.throttleInput);
        self.camera.rotateVelocity = Math.round((ev.screenX - pointerStart)/50);
      }
    });
    self.e.logoPage.addEventListener('mouseup', function() {
      self.ui.mouseDown = false;
    });
    self.e.logoPage.addEventListener('mouseleave', function() {
      self.ui.mouseDown = false;
    });
    //Touch
    self.e.logoPage.addEventListener('touchstart' , function(ev) {
      self.ui.touching = true;
      pointerStart = ev.changedTouches[0].screenX;
    });
    self.e.logoPage.addEventListener('touchmove', function(ev) {
      if(self.ui.acceptTouch && self.ui.touchEnabled && self.ui.touching) {
        self.ui.acceptTouch = false;
        setTimeout(function() {
          self.ui.acceptTouch = true;
        }, self.config.throttleInput);
        self.camera.rotateVelocity = Math.round((ev.changedTouches[0].screenX - pointerStart)/50);
      }
    });
    //Resize
    window.addEventListener('resize', function() {
      if(self.ui.acceptResize) {
        self.ui.acceptResize = false;
        setTimeout(function() {
          self.ui.acceptResize = true;
        }, self.ui.resizeThrottle);
        self.renderQue.push(function() {
          self.e.width = self.e.logoPage.offsetWidth;
          self.e.height = self.e.logoPage.offsetHeight;
          var cachedCalc = self.e.width/2 + 128;
          for(var i = 0; i < self.objects.clouds.length; i++) {
            self.objects.clouds[i].startX = cachedCalc;
            self.objects.clouds[i].endX = -cachedCalc;
          }
        });
      }
    });
  };

  var lastTime = Date.now();
  (function loop() {
    window.requestAnimationFrame(function() {
      var t = Date.now();
      if(t - lastTime > 16) {
        lastTime = t;
        for(var i = 0; i < self.renderQue.length; i++) {
          //console.log(self.renderQue[i])
          self.renderQue[i]();
        }
        self.compute.camera();
        self.compute.clouds();
        self.compute.smoke();
      }
      loop();
    });
  })();

 this.events();

};
var skene = new Scene();
skene.camera.rotateVelocity = -4
skene.generate.cloud(24);
skene.generate.smoke(24);
