import * as THREE from 'three';
import { BlendFunction, GodRaysEffect, DepthOfFieldEffect, BrightnessContrastEffect, BloomEffect, EffectComposer, EffectPass, RenderPass, SelectiveBloomEffect, VignetteEffect } from 'https://cdn.jsdelivr.net/npm/postprocessing@6.36.3/+esm';
import { OutlinePass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/OutlinePass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSM } from 'three/examples/jsm/csm/CSM.js';
import { random, circularLerp, round } from '../Utilities.js';

const dummy3D = new THREE.Object3D();

function removeObject3D( object3D, scene, graphicsOnly) {
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

		this.instances = {
		
			inactive: {},
			active: {}
		
		};

		this.resolution = 1;

		this.meshes = [];
		this.mixers = [];

		// Update handlers:
		this.updateHandlers = [];

		// Setup scene:
		this.scene = new THREE.Scene();

		//this.scene.fog = new THREE.FogExp2( 0xe3ccd5, 0.025 );
		this.scene.fog = new THREE.Fog( 0xe3ccd5, 15, 30 );

		// Setup camera:
		this.camera = new THREE.OrthographicCamera( (window.innerWidth / this.resolution) / - 2, (window.innerWidth / this.resolution) / 2, (window.innerHeight / this.resolution) / 2, (window.innerHeight / this.resolution) / - 2, -10, 1000 );
		this.camera.add( this.game.sound.listener );
		this.camera.zoom = 45;
		this.scene.add( this.camera );
		this.scene.background = new THREE.Color( 0xe3ccd5 );


		// Setup renderer:
		this.renderer = new THREE.WebGLRenderer({
			powerPreference: "high-performance",
			precision: "lowp",
			antialias: false	
		});

		this.renderer.debug.checkShaderErrors = false;
		this.renderer.compile( this.scene );

		this.renderer.setSize( window.innerWidth / this.resolution, window.innerHeight / this.resolution );
		this.renderer.toneMapping = THREE.ReinhardToneMapping;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.bloomEffect = new SelectiveBloomEffect(this.scene, this.camera, {
			luminanceThreshold: 0.6,
			luminanceSmoothing: 0.01,
			mipmapBlur: true,
			intensity: 1.95
		});

		this.bloomEffect.inverted = true;
		
		const brightnessContrastEffect = new BrightnessContrastEffect();

		this.brightnessContrastEffect = brightnessContrastEffect;

		const vignetteEffect = new VignetteEffect();
		vignetteEffect.blendMode.opacity.value = 0.35;

		
		this.depthOfFieldEffect = new DepthOfFieldEffect(this.camera, {
			focusDistance: 0.03,  // Smaller = focus closer to camera
			focalLength: 0.01,    // Lens focal length (in world units)
			bokehScale: 2.2,      // Intensity/size of the blur
			height: 4048           // Resolution of the blur pass (default: 480)
		});

		const dofPass = new EffectPass(this.camera, this.depthOfFieldEffect);
		

		const geometry = new THREE.SphereGeometry(3, 32, 32);
		const material = new THREE.MeshLambertMaterial({
			color: 0xffffff,
			emissive: 0xffffff,
			emissiveIntensity: 600.0, // same as StandardMaterial
			fog: false
		});

		this.sphere = new THREE.Mesh(geometry, material);
		this.sphere.position.y = 8;
		this.scene.add( this.sphere );

		const godRaysEffect = new GodRaysEffect(this.camera, this.sphere, {
			resolutionScale: 0.5,
			density: 0.9,
			decay: 0.9,
			weight: 0.2,
			samples: 20
		});

		this.godRaysPass = new EffectPass(this.camera, godRaysEffect);

		this.vignettePass = new EffectPass( this.camera, vignetteEffect );
		this.bloomPass = new EffectPass( this.camera, this.bloomEffect );

		this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( new RenderPass( this.scene, this.camera ) );
		//this.composer.addPass( dofPass );
		this.composer.addPass( this.bloomPass );
		this.composer.addPass( this.godRaysPass );
		this.composer.addPass( this.vignettePass );
		this.composer.addPass( new EffectPass( this.camera, brightnessContrastEffect ) );
		
		// Setup controls:
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );

		// Setup materials:
		this.materials = {};


		// Setup lights:
		this.lights = {};

		// Ambient lighting:
		this.lights.ambient = new THREE.AmbientLight( 0x404040, 1 );
		this.scene.add( this.lights.ambient );
		
		/*this.csm = new CSM({
		    maxFar: 1000,
		    cascades: 4, // how many splits
		    mode: 'practical', // best mode for dynamic scenes
		    parent: this.scene,
		    shadowMapSize: 2048,
		    lightDirection: new THREE.Vector3(1, 0, 1).normalize(),
		    camera: this.camera // <-- your main scene camera
		});
		*/
		// The sun:
		this.lights.sun = new THREE.DirectionalLight( 0xFFFFFF, 1 );
		this.lights.sun.castShadow = true;
		//this.lights.sun.target = new THREE.Object3D();
		this.lights.sun.shadow.blurSamples = 0;
		/*this.lights.sun.shadow.camera.near = 0; // default
		this.lights.sun.shadow.camera.far = 10000; // default
		this.lights.sun.position.set( 0, 100, 0 );
		this.lights.sun.shadow.camera.right = 100;
		this.lights.sun.shadow.camera.top = 100;
		this.lights.sun.shadow.camera.bottom = -100;
		this.lights.sun.shadow.camera.left = -100;
		this.lights.sun.shadow.bias = -0.001;*/
		
		this.lights.sun.shadow.bias = -0.001;
		this.lights.sun.shadow.mapSize.width = 1024;
		this.lights.sun.shadow.mapSize.height = 1024;
		this.lights.sun.shadow.camera.near = 0.1;
		this.lights.sun.shadow.camera.far = 10000;

		this.lights.sun.shadow.camera.right = 100;
		this.lights.sun.shadow.camera.top = 100;
		this.lights.sun.shadow.camera.bottom = -100;
		this.lights.sun.shadow.camera.left = -100;


		this.scene.add( this.lights.sun );

		const cloudLight = new THREE.PointLight( 0xFFFFFF, 10 );
		//cloudLight.layers.set( 2 );
		//this.scene.add( cloudLight );

		//this.camera.layers.enable(0);
		//this.camera.layers.enable(2);

		this.game.events.addEventListener('loaded', () => {

			/*
			// Create clouds:
			this.clouds = new THREE.Object3D();
			this.scene.add( this.clouds );
			//this.clouds.layers.set(1);

			for ( const mesh of this.assets['Cloud 1'].children ) {

				mesh.material.fog = false;
  				mesh.material.roughness = 0.0;             // smoother = stronger specular
				mesh.material.emissive = new THREE.Color(0xffffff);         // subtle glow
				mesh.material.emissiveIntensity = 0.25;     // boost brightness
				
			}

			for ( let i = 0; i < 400; i ++ ) {

				const s = 120;

				const r = Math.random();
				const d = s*Math.random();
				const y = 10*Math.random() + 5;
				const x = (this.game.radius.max + 20*d + 10)*Math.cos(2*Math.PI*r);
				const z = (this.game.radius.max + 20*d + 10)*Math.sin(2*Math.PI*r);

				const cloud = this.assets['Cloud 1'].clone();
				cloud.receiveShadow = false;
				cloud.castShadow = false;
				//cloud.layers.set(1);
				cloud.rotation.y = -2*Math.PI*r;
				cloud.position.set( x, 10 + d/s, z );
				cloud.scale.set( (d/s)**2 + 0.1, d/(2*s) + 0.1, (d/s)**2 + 0.1 );
				this.clouds.add( cloud );

			}
			*/

		});

		window.addEventListener( 'resize', () => this.resizeHandler() );
		this.resizeHandler();
		this.initParticles();
		//this.createFire();

	};

	async load() {

		const modelLoader = new GLTFLoader();
		const textureLoader = new THREE.TextureLoader();

		const models = [
			'Oculusostium',
			'Character', 'Character_',
			'TREE1', 'TREE2', 'TREE3', 'TREE4', 'TREE5', 'FUNGI1', 'ROCK', 'Enemy',
			'Root 1', 'Root 2', 'Root 3', 'Root 4', 
			'Side Rocks 1', 'Side Rocks 2', 'Side Rocks 3', 'Side Rocks 4',
			'Cloud 1',
			'Purple Mushroom Patch 1', 'Mushroom 1', 'Mushroom 2'
		];

		const textures = [
			'Dirt 1', 'Dirt 2', 'Dirt 3'
		];

		const promises = [];

		this.assets = {};
		this.animations = {};
		this.textures = {};

		for ( const name of models ) {

			promises.push( new Promise( ( resolve ) => {

				modelLoader.load( `Models/${name}.glb`, ( model ) => {
					
					this.instances.inactive[ name ] = [];
					this.instances.active[ name ] = [];

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

		for ( const name of textures ) {

			promises.push( new Promise( ( resolve ) => {

				textureLoader.load( `Textures/${name}.png`, ( texture ) => {

					this.textures[ name ] = texture;

					texture.wrapS = THREE.RepeatWrapping;
					texture.wrapT = THREE.RepeatWrapping;
					texture.minFilter = THREE.NearestFilter;
					texture.magFilter = THREE.NearestFilter;
					texture.colorSpace = THREE.SRGBColorSpace;
					
					resolve();

				});

			}));

		}

		await Promise.all( promises );

	};

	resizeHandler() {

		const frustumSize = 950;
		const aspect = window.innerWidth / window.innerHeight;
		  
		this.camera.left = frustumSize * aspect / - 2;
		this.camera.right = frustumSize * aspect / 2;
		this.camera.top = frustumSize / 2;
		this.camera.bottom = - frustumSize / 2;

		this.camera.updateProjectionMatrix();
		this.composer.setSize( window.innerWidth/this.resolution, window.innerHeight/this.resolution );

		console.log( this.resolution )

		if ( this.game.paused ) this.composer.render();

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

		camera.position.x = (radius)*cos(2*PI*targetR);
		camera.position.z = (radius)*sin(2*PI*targetR);
		camera.position.y = targetY + 2;

		camera.lookAt( targetX, targetY + 2, targetZ );

		/*		
		if (!this._fadedObjects) this._fadedObjects = new Map();

		// Reset previously faded materials
		for (const [object, originalMaterial] of this._fadedObjects) {
			object.material = originalMaterial;
		}

		this._fadedObjects.clear();

		// Setup ray
		const origin = camera.position.clone();
		const target = new THREE.Vector3(targetX, targetY, targetZ);
		const direction = new THREE.Vector3().subVectors(target, origin).normalize();
		const raycaster = new THREE.Raycaster(origin, direction);

		// Gather all relevant objects
		function isDescendant(parent, child) {
			while (child) {
				if (child === parent) return true;
				child = child.parent;
			}
			return false;
		}

		const playerMesh = this.game.player.mesh;
		const objectsToCheck = [];

		this.scene.traverse(obj => {
			if (
				obj !== this.camera &&
				obj.material &&
				!isDescendant(playerMesh, obj)
			) {
				objectsToCheck.push(obj);
			}
		});

		// Perform raycast
		const intersections = raycaster.intersectObjects(objectsToCheck, true);

		// Fade intersected objects
		for (const intersection of intersections) {
			const object = intersection.object;

			// Skip if we've already faded this one
			if (this._fadedObjects.has(object)) continue;

			// Save original material
			this._fadedObjects.set(object, object.material);

			// Clone and assign new material
			const newMat = object.material.clone();
			newMat.transparent = true;
			newMat.opacity = 0.3;
			newMat.needsUpdate = true;
			object.material = newMat;
		}
		*/

	};

	updateSun() {

		const PI = Math.PI;
		const cos = Math.cos;
		const sin = Math.sin;
		const max = Math.max;
		const sphere = this.sphere;
		const index = this.game.player.dynamic;

		const targetR = this.game.dynamic.getR( index );
		const targetX = this.game.dynamic.getX( index );
		const targetY = this.game.dynamic.getY( index );
		const targetZ = this.game.dynamic.getZ( index );

		const radius = this.game.radius.max + 3;

		/*
		sphere.material.color.setHSL( 0.025 - 0.025*(Math.sin( 2*PI*targetR ) + 1)/2, 1, 0.8 + 0.2*(Math.sin( 2*PI*targetR ) + 1)/2 );
		this.scene.fog.color.setHSL( 0.025, 0.5, (Math.sin( 2*PI*targetR ) + 1)/2 );
		this.scene.background.setHSL( 0.025, 0.5, 0.7 + 0.1*(Math.sin( 2*PI*targetR ) + 1)/2 );
		*/

		this.lights.sun.position.x = 1.05*radius*cos( 2*PI*targetR - 0.1 );
		this.lights.sun.position.z = 1.05*radius*sin( 2*PI*targetR - 0.1 );
		this.lights.sun.position.y = targetY;
		this.lights.sun.target.position.set( targetX, targetY, targetZ );

		const width = window.innerWidth / this.resolution;
		const s = max( 1, width/1200 );

		sphere.scale.set( s, s, s );

		if ( this.game.started ) {

			sphere.position.x = -10*radius*cos( 2*PI*targetR + 0.000015*width /*+ .008 */ );
			sphere.position.z = -10*radius*sin( 2*PI*targetR + 0.000015*width /*+ .008 */ );
			sphere.position.y = targetY + 3.5; //+ 10*Math.sin( 2*PI*targetR );

		} else {

			sphere.position.x = 0;
			sphere.position.z = 0;
			sphere.position.y = 8

		}

	};

	updateClouds() {

		const index = this.game.player.dynamic;
		const targetR = this.game.dynamic.getR( index );
		const targetY = this.game.dynamic.getY( index );

		// Initialize this somewhere
		this.prevTargetR ??= targetR;
		this.accumulatedR ??= 0;

		// Calculate how much R changed since last frame
		let deltaR = targetR - this.prevTargetR;

		// Handle wraparound
		if (deltaR < -0.5) deltaR += 1;
		if (deltaR > 0.5) deltaR -= 1;

		// Accumulate with speed factor
		this.accumulatedR += deltaR * 1.05;

		// Apply rotation
		this.clouds.rotation.y = -2 * Math.PI * this.accumulatedR;
		this.clouds.position.y = targetY*0.95 - 2;

		// Store for next frame
		this.prevTargetR = targetR;

		//this.clouds.rotation.y += 0.001;		

	};

	initParticles() {

		// Dust Particle Setup
		const vertexShader = `
		 	attribute float instanceOpacity;
			attribute vec3 instanceColor;

			varying float vOpacity;
			varying vec3 vColor;

			void main() {
			  vColor = instanceColor;
			  vOpacity = instanceOpacity;

			  vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
			  vec4 mvPosition = modelViewMatrix * worldPosition;

			  float dist = abs(mvPosition.z);

			  // Fade out with distance
			  float fade = smoothstep(10.0, 1.0, dist);
			  vOpacity *= fade;

			  gl_Position = projectionMatrix * mvPosition;
			}
		`;

		const fragmentShader = `
			varying float vOpacity;
			varying vec3 vColor;

			void main() {
				gl_FragColor = vec4(vColor, vOpacity);
				if (gl_FragColor.a < 0.01) discard; // optional: discard nearly invisible
			}
		`;

		const dustMaterial = new THREE.ShaderMaterial({
		
			vertexShader,
			fragmentShader,
			transparent: true,
			depthTest: true,
			depthWrite: false,
			side: THREE.DoubleSide,
		
		});

		this.dustCount = 10000;
		const dustGeometry = new THREE.PlaneGeometry(0.25, 0.25);
		this.dustMesh = new THREE.InstancedMesh(dustGeometry, dustMaterial, this.dustCount);
		this.scene.add(this.dustMesh);

		const opacities = new Float32Array(this.dustCount);
		const colors = new Float32Array(this.dustCount * 3);
		this.dustData = [];

		const px = this.game.radius.center*Math.cos( 0 );
		const py = 1;
		const pz = this.game.radius.center*Math.sin( 0 );

		for ( let i = 0; i < this.dustCount; i ++ ) {
			
			const x = px + (Math.random() - 0.5) * 100;
			const y = py + (Math.random() - 0.5) * 100;
			const z = pz + (Math.random() - 0.5) * 100;

			const dx = (Math.random() - 0.5) * 0.01;
			const dy = (Math.random() - 0.5) * 0.005;
			const dz = (Math.random() - 0.5) * 0.01;

			const pos = new THREE.Vector3( x, y, z );
			const drift = new THREE.Vector3( dx, dy, dz );

			const opacity = 0.1 + Math.random() * 0.9;
			const color = new THREE.Color().setHSL(Math.random(), 0.6, 0.8);

			opacities[ i ] = opacity;
			colors[i * 3 + 0] = color.r;
			colors[i * 3 + 1] = color.g;
			colors[i * 3 + 2] = color.b;

			dummy3D.position.copy( pos );
			dummy3D.updateMatrix();
			this.dustMesh.setMatrixAt( i, dummy3D.matrix );
			this.dustData.push({ pos, drift });

		}

		// Add custom attributes
		dustGeometry.setAttribute('instanceOpacity', new THREE.InstancedBufferAttribute(opacities, 1));
		dustGeometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3));
		this.dustMesh.instanceMatrix.needsUpdate = true;

	};

	updateParticles() {

		// Don't clone so much

		const cameraQuat = this.camera.quaternion;
		const player = this.game.player.dynamic;
		const dynamic = this.game.dynamic;

		const px = dynamic.getX(player);
		const py = dynamic.getY(player);
		const pz = dynamic.getZ(player);

		// Parameters
		const radiusXZ = 50;
		const heightY = 60;
		const MAX_ALLOWED_DELTA = 5; // Threshold to detect respawn or teleport

		// Track player position
		const currentPlayerPos = new THREE.Vector3(px, py, pz);

		if (!this.lastPlayerPos) {

			this.lastPlayerPos = currentPlayerPos.clone();
		
		}

		// Calculate how much the player moved since last frame
		const delta = currentPlayerPos.clone().sub(this.lastPlayerPos);

		// Handle normal movement or respawn/teleport
		if (delta.length() < MAX_ALLOWED_DELTA) {
			// Normal movement: shift particles in world space
			for (let i = 0; i < this.dustCount; i++) {
				const { pos } = this.dustData[i];
				pos.sub(delta); // cancel out player's movement
			}
		} else {
			// Player teleported: re-randomize particle positions around new player position
			for (let i = 0; i < this.dustCount; i++) {
				const { pos } = this.dustData[i];
				pos.set(
					px + (Math.random() - 0.5) * radiusXZ * 2,
					py + (Math.random() - 0.5) * heightY * 2,
					pz + (Math.random() - 0.5) * radiusXZ * 2
				);
			}
		}

		// Update particles
		for (let i = 0; i < this.dustCount; i++) {
			const { pos, drift } = this.dustData[i];

			// Drift
			pos.add(drift);

			// Wrap relative to player position
			if (pos.x > px + radiusXZ) pos.x = px - radiusXZ;
			if (pos.x < px - radiusXZ) pos.x = px + radiusXZ;
			if (pos.y > py + heightY)  pos.y = py - heightY;
			if (pos.y < py - heightY)  pos.y = py + heightY;
			if (pos.z > pz + radiusXZ) pos.z = pz - radiusXZ;
			if (pos.z < pz - radiusXZ) pos.z = pz + radiusXZ;

			// Instance transform setup
			const scale = 0.4 + Math.random() * 0.1;
			dummy3D.position.copy(pos);
			dummy3D.scale.set(scale, scale, scale);
			dummy3D.quaternion.copy(cameraQuat); // make particle face the camera
			dummy3D.updateMatrix();

			this.dustMesh.setMatrixAt(i, dummy3D.matrix);
		}

		this.dustMesh.instanceMatrix.needsUpdate = true;

		// Save current position for next frame
		this.lastPlayerPos.copy(currentPlayerPos);
			
	};

	reset() {

		for ( const mesh of this.meshes ) mesh.removeFromParent();
		this.meshes.length = 0;


	};

	createFire() {

		if (this.fire) return;

		const fireCount = 100;
		this.fires = [];


		const geometry = new THREE.BoxGeometry(0.13, 0.13, 0.13);

		const material = new THREE.MeshPhongMaterial({
			
			color: 0xffaa00, // base color (yellow)
			emissive: 0xff9900, // emissive color (also yellow)
			emissiveIntensity: 0.5,

		});

		this.fire = new THREE.InstancedMesh(geometry, material, fireCount);
		const light = new THREE.PointLight( 0xFFFFFF, 2 );
		light.position.x = 0.4;
		light.position.z = 0.1
		this.fire.add( light );

		const radius = this.game.radius.center;

		this.fire.position.set(radius * Math.cos(0.0001), 3, radius * Math.sin(0.0001));

		const dummy = new THREE.Object3D();

		for (let i = 0; i < fireCount; i++) {
			const pos = new THREE.Vector3(
				round((Math.random() - 0.5) * 0.2, 0.066),
				0,
				round((Math.random() - 0.5) * 0.2, 0.066)
			);

			const speed = new THREE.Vector3(
				(Math.random() - 0.5) * 0.01,
				0.01 + Math.random() * 0.01,
				(Math.random() - 0.5) * 0.01
			);

			const lifetime = 0.5 + Math.random() * 1;
			const age = 0;

			this.fires.push({ pos, speed, age, lifetime });

			dummy.position.copy(pos);
			dummy.scale.setScalar(0.5 + Math.random() * 0.1);
			dummy.updateMatrix();
			this.fire.setMatrixAt(i, dummy.matrix);

		}

		this.fire.instanceMatrix.needsUpdate = true;

		this.scene.add(this.fire);

	};


	updateFire(deltaTime = 1 / 60) {
		if (!this.fire) return;

		const dummy = new THREE.Object3D();

		for (let i = 0; i < this.fires.length; i++) {
			const f = this.fires[i];

			f.pos.add(f.speed);

			f.age += deltaTime;

			const t = f.age / f.lifetime;

			if (f.age > f.lifetime) {
				
				// Center particles should last longer
				const r = Math.random();
				f.pos.set(
					(r - 0.5) * 0.6, 
					0, 
					(r - 0.5) * 0.6
				);
				
				f.speed.set(
					(Math.random() - 0.5) * 0.001, 
					0.01 + Math.random() * 0.01, 
					(Math.random() - 0.5) * 0.001
				);
				
				f.age = 0;
				f.lifetime = 0.1 + (1-Math.abs(r - 0.5)) * 1.5;
			
			}

			//dummy.position.copy(f.pos);
			dummy.position.x = round( f.pos.x, 0.066 );
			dummy.position.y = round( f.pos.y, 0.066 );
			dummy.position.z = round( f.pos.z, 0.066 );
			//dummy.scale.setScalar(0.5 + Math.random() * 0.1);
			dummy.updateMatrix();
			this.fire.setMatrixAt(i, dummy.matrix);
		}

		const r = this.game.player.r;

		this.fire.rotation.y = -2*Math.PI*r;

		this.fire.instanceMatrix.needsUpdate = true;

	};



	update( dt ) {

		const handlers = this.updateHandlers;

		this.updateCamera();
		this.updateParticles();
		this.updateSun();
		//this.updateClouds();
		//this.updateFire();
		//this.csm.update()

		for ( const handler of this.updateHandlers ) handler( dt );

		for ( const mixer of this.mixers ) mixer.update( dt * 0.001 );


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
			instance.mesh.visible = true;


		} else {

			// change name to assets to models
			const mesh = this.assets[ name ].clone();
			const animations = this.animations[ name ];
			const mixer = animations.length > 0 ? new THREE.AnimationMixer( mesh ) : undefined;

			instance = { name, mesh, animations };

		}

		this.scene.add( instance.mesh );

		this.instances.active[ name ].push( instance );

		return instance;

	};

	dispose( instance ) {

		const name = instance.name;
		const mesh = instance.mesh;
		const index = this.instances.active[ name ].indexOf( instance );

		this.instances.active[ name ].splice( index, 1 );
		this.instances.inactive[ name ].push( instance );

		mesh.visible = false;
		mesh.matrixAutoUpdate = false;
		mesh.removeFromParent();

	};

	// Animation control
	play( instance, animation ) {};

	pause( instance, animation ) {};

	stop( instance, animation ) {};

};
