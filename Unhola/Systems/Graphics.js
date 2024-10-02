import * as THREE from 'three';
import { BlendFunction, BrightnessContrastEffect, BloomEffect, EffectComposer, EffectPass, RenderPass, SelectiveBloomEffect, VignetteEffect } from 'https://cdn.jsdelivr.net/npm/postprocessing@6.36.3/+esm';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
function removeObject3D(object3D) {

    // for better memory management and performance
    if (object3D.geometry) object3D.geometry.dispose();

    if (object3D.material) {
        if (object3D.material instanceof Array) {
            // for better memory management and performance
            object3D.material.forEach(material => material.dispose());
        } else {
            // for better memory management and performance
            object3D.material.dispose();
        }
    }
    object3D.removeFromParent(); // the parent might be the scene or another Object3D, but it is sure to be removed this way
    return true;
};

export class Graphics {

	constructor( game ) {

		this.game = game;

		this.meshes = [];

		// Update handlers:
		this.updateHandlers = [];

		// Setup scene:
		this.scene = new THREE.Scene();

		this.scene.fog = new THREE.FogExp2( 0xe3ccd5, 0.055 );
		//this.scene.fog = new THREE.Fog( 0x000000, 0, 20 );

		// Setup camera:
		this.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10, 1000 );
		this.camera.zoom = 45;
		this.scene.add( this.camera );
		this.scene.background = new THREE.Color( 0xe3ccd5 );


		// Setup renderer:
		this.renderer = new THREE.WebGLRenderer({
			powerPreference: "high-performance",
			antialias: false	
		});
		this.renderer.debug.checkShaderErrors = false;
		this.renderer.compile( this.scene );

		this.renderer.setSize( window.innerWidth/4, window.innerHeight/4, false );
		this.renderer.toneMapping = THREE.ReinhardToneMapping;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		const bloomEffect = new SelectiveBloomEffect(this.scene, this.camera, {
			luminanceThreshold: 0,
			luminanceSmoothing: 0.05,
			mipmapBlur: true,
			intensity: 1.75
		});

		bloomEffect.inverted = true;

		const brightnessContrastEffect = new BrightnessContrastEffect();

		this.brightnessContrastEffect = brightnessContrastEffect;

		/*brightnessContrastEffect.uniforms.get("brightness").value = 0.02;
		brightnessContrastEffect.uniforms.get("contrast").value = 0.09;*/

		const vignetteEffect = new VignetteEffect();
		vignetteEffect.blendMode.opacity.value = 0.05;

		this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( new RenderPass( this.scene, this.camera ) );
		this.composer.addPass( new EffectPass( this.camera, bloomEffect ) );
		//this.composer.addPass( new EffectPass( this.camera, noiseEffect ) );
		this.composer.addPass( new EffectPass( this.camera, vignetteEffect ) );

		this.composer.addPass( new EffectPass( this.camera, brightnessContrastEffect ) );
		

		// Setup controls:
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );


		// Setup materials:
		this.materials = {}
		this.materials.wood = new THREE.MeshLambertMaterial( { color: 0xc2af95 } );
		this.materials.stone = new THREE.MeshStandardMaterial( { color: 0xCCCCCC } );
		this.materials.plant = new THREE.MeshStandardMaterial( { color: 0xbaed72 } );
		this.materials.flower = new THREE.MeshStandardMaterial( { color: 0xffc936 } );
		this.materials.skin = new THREE.MeshStandardMaterial({ color: 0xbf56bf });


		// Setup lights:
		this.lights = {};

		// Ambient lighting:
		this.lights.ambient = new THREE.AmbientLight( 0x404040, 6 );
		this.scene.add( this.lights.ambient );
		
		// The sun:
		this.lights.sun = new THREE.DirectionalLight( 0x2D007C, 1 );
		//this.lights.sun.castShadow = true;
		this.lights.sun.shadow.blurSamples = 8;
		//this.lights.sun.shadow.mapSize.width = 8192; // default
		//this.lights.sun.shadow.mapSize.height = 8192; // default
		this.lights.sun.shadow.camera.near = 0; // default
		this.lights.sun.shadow.camera.far = 10000; // default
		this.lights.sun.position.set( 30, 10, 30 );
		this.lights.sun.shadow.camera.right = 100;
		this.lights.sun.shadow.camera.top = 100;
		this.lights.sun.shadow.camera.bottom = -100;
		this.lights.sun.shadow.camera.left = -100;
		this.lights.sun.shadow.bias = -0.001;
		this.scene.add( this.lights.sun );

		this.resizeHandler = () => {

			const frustumSize = 950;
			var aspect = window.innerWidth / window.innerHeight;
			  
			this.camera.left = frustumSize * aspect / - 2;
			this.camera.right = frustumSize * aspect / 2;
			this.camera.top = frustumSize / 2;
			this.camera.bottom = - frustumSize / 2;

			this.camera.updateProjectionMatrix();
			this.composer.setSize( window.innerWidth, window.innerHeight );

			if ( this.game.paused ) this.composer.render();

		};

		window.addEventListener( 'resize', this.resizeHandler );

		this.resizeHandler();

		// create an AudioListener and add it to the camera
		this.listener = new THREE.AudioListener();
		this.camera.add( this.listener );

		// create a global audio source
		const windSound = new THREE.Audio( this.listener );

		this.game.sound.loader.load( 'sounds/Wind.ogg', ( buffer ) => {
			windSound.setBuffer( buffer );
			windSound.setLoop( true );
			windSound.setVolume( 0.5 );
			windSound.play();
		});


		const birdSound = new THREE.Audio( this.listener );

		this.game.sound.loader.load( 'sounds/Distant Birds.ogg', ( buffer ) => {
			birdSound.setBuffer( buffer );
			birdSound.setLoop( true );
			birdSound.setVolume( 0.25 );
			birdSound.play();
		});

		//this.scene.add( windSound, birdSound );


	};

	updateCamera() {

		const PI = Math.PI;
		const cos = Math.cos;
		const sin = Math.sin;
		const camera = this.camera;
		const index = this.game.player.dynamic;

		const targetR = this.game.dynamic.getR( index );
		const targetX = this.game.dynamic.getX( index );
		const targetY = this.game.dynamic.getY( index );
		const targetZ = this.game.dynamic.getZ( index );

		const radius = this.game.radius.max + 3;

		camera.position.x = radius*cos( 2*PI*targetR );
		camera.position.z = radius*sin( 2*PI*targetR );
		camera.position.y = targetY;

		camera.lookAt( targetX, targetY, targetZ );

	};

	reset() {

		for ( const mesh of this.meshes ) removeObject3D( mesh );

	};

	update( dt ) {

		const handlers = this.updateHandlers;

		for ( const handler of handlers ) handler( dt );

		this.updateCamera();

		//this.renderer.render( this.scene, this.camera );
		this.composer.render();


	};

};
