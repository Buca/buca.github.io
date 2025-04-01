import * as THREE from 'three';
import { BlendFunction, BrightnessContrastEffect, BloomEffect, EffectComposer, EffectPass, RenderPass, SelectiveBloomEffect, VignetteEffect } from 'https://cdn.jsdelivr.net/npm/postprocessing@6.36.3/+esm';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function removeObject3D(object3D, scene) {
    if (!object3D) return false;

    // Dispose geometry
    if (object3D.geometry) {
        object3D.geometry.dispose();
    }

    // Dispose materials
    if (object3D.material) {
        if (Array.isArray(object3D.material)) {
            object3D.material.forEach(material => material.dispose());
        } else {
            object3D.material.dispose();
        }
    }

    // Remove object from its parent
    if (object3D.parent) {
        object3D.parent.remove(object3D);
    }

    // Ensure it's removed from the scene
    if (scene && scene.children.includes(object3D)) {
        scene.remove(object3D);
    }

    return true;
}

export class Graphics {

	constructor( game ) {

		this.game = game;

		this.meshes = [];
		this.mixers = [];

		// Update handlers:
		this.updateHandlers = [];

		// Setup scene:
		this.scene = new THREE.Scene();

		this.scene.fog = new THREE.FogExp2( 0xe3ccd5, 0.055 );
		//this.scene.fog = new THREE.Fog( 0x000000, 0, 20 );

		// Setup camera:
		this.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10, 1000 );
		this.camera.add( this.game.sound.listener );
		this.camera.zoom = 45;
		this.scene.add( this.camera );
		this.scene.background = new THREE.Color( 0xe3ccd5 );


		// Setup renderer:
		this.renderer = new THREE.WebGLRenderer({
			/*powerPreference: "high-performance",*/
			precision: "lowp",
			antialias: false	
		});
		this.renderer.debug.checkShaderErrors = false;
		this.renderer.compile( this.scene );

		this.renderer.setSize( window.innerWidth, window.innerHeight );
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

		const vignetteEffect = new VignetteEffect();
		vignetteEffect.blendMode.opacity.value = 0.05;

		this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( new RenderPass( this.scene, this.camera ) );
		this.composer.addPass( new EffectPass( this.camera, bloomEffect ) );
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
		this.lights.sun.shadow.blurSamples = 8;
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

	};

	async load() {

		const loader = new GLTFLoader();
		const models = [
			'Pine', 'Polypody', 'Bush', 'Well',
			'Red Clover', 'Crooked Mushroom',
			'Birch', 'Dead Tree', 'Wheat', 'Red Mushroom', 'Bush Tree', 'Red Flower', 'Mushroom Brown', 'Moon Flower',
			'Character', 'TREE1', 'TREE2', 'TREE3', 'FUNGI1', 'ROCK', 'Goal', 'Enemy'
		]; 
		const promises = [];

		this.assets = {};
		this.animations = {};
		this.instances = {};

		for ( const name of models ) {

			promises.push( new Promise( ( resolve ) => {

				loader.load( `Models/${name}.glb`, ( model ) => {
					
					this.assets[ name ] = model.scene;
					this.animations[ name ] = model.animations;

					model.scene.traverse( function ( child ) {

						if ( child.isMesh ) {
						
							child.castShadow = true;
							child.receiveShadow = true;
							child.material.shadowSide = THREE.FrontSide;
						
						}

					});
					
					resolve();

				});

			}));

		}

		await Promise.all( promises );

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

		for ( const mesh of this.meshes ) removeObject3D( mesh, this.scene );
		this.meshes.length = 0;


	};

	update( dt ) {

		const handlers = this.updateHandlers;

		for ( const handler of this.updateHandlers ) handler( dt );

		for ( const mixer of this.mixers ) mixer.update( dt * 0.001 );

		this.updateCamera();

		//this.renderer.render( this.scene, this.camera );
		this.composer.render();

	};

	create( name ) {

		const instances = this.instances.inactive[ name ];
		let instance;

		if ( instances.length > 0 ) {

			instance = instances.pop();
			
			instance.mesh.position.set( 0, 0, 0 );
			instance.mesh.rotation.set( 0, 0, 0 );
			instance.mesh.visibility = true;
			
			// Reset logic
			// Position, rotation, stop all animations, visibility


		} else {

			// change name to assets to models
			const mesh = this.assets[ name ].clone();
			const animations = this.animations[ name ];
			const mixer = animations.length > 0 ? new THREE.AnimationMixer( mesh ) : undefined;

			instance = { mesh, animations, mixer };

		}

		this.mixers.push( mixer );
		this.instances.active.push( instance );

		return instance;

	};

	dispose( instance ) {};

	// Animation control
	play( instance, animation ) {};

	pause( instance, animation ) {};

	stop( instance, animation ) {};

};
