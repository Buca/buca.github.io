import * as THREE from 'three';

const abs = Math.abs;

/*export class Player extends Entity {

	constructor( properties = { r = 0, y = 0 } ) {

		super( properties );

		this.name = "Player";

		// Components
		this.dynamic = this.game.dynamic.create();
		this.graphics = this.game.graphics.create();
		this.sound = this.game.sound.create();
		this.controls = this.game.controls.create();

		// Properties
		this.isWalking
		this.isJumping
		this.isOnPlatform

		this.physics.addEventListener('tick', () => {

			this.physicsUpdate();

		});

		this.game.graphics.addEventListener('tick', () => {

			this.graphicsUpdate();

		});

	}

}*/

export class Player {

	constructor({ game, r = 0, y = 0 }) {

		this.game = game;
		this.name = "Player";
		this.game.player = this;
		this.dynamic = game.dynamic.create( r, y, 0.5, 0.95, 0.5, 0, 0 );

		this.movingLeft = 0;
		this.movingRight = 0;
		this.jumping = false;
		this.goDown = false;

		this.jumpCount = 0;
		this.maxJumps = 2;

		this.isTouchingTheFloor = false;
		this.isJumping = false;
		this.isMoving = false;

		this.sound = {};

	};

	get r() { return this.game.dynamic.getR( this.dynamic ) };
	set r( value ) { return this.game.dynamic.setR( this.dynamic, value ) };
	get y() { return this.game.dynamic.getY( this.dynamic ) };
	set y( value ) { return this.game.dynamic.setY( this.dynamic, value ) };

	// Velocity
	get vr() { return this.game.dynamic.getVR( this.dynamic ) };
	set vr( value ) { return this.game.dynamic.setVR( this.dynamic, value ) };
	get vy() { return this.game.dynamic.getVY( this.dynamic ) };
	set vy( value ) { return this.game.dynamic.setVY( this.dynamic, value ) };

	// Dimensions
	get width() { return this.game.dynamic.getW( this.dynamic ) };
	set width( value ) { return this.game.dynamic.setW( this.dynamic, value ) };
	get height() { return this.game.dynamic.getH( this.dynamic ) };
	set height( value ) { return this.game.dynamic.setH( this.dynamic, value ) };
	get depth() { return this.game.dynamic.getD( this.dynamic ) };
	set depth( value ) { return this.game.dynamic.setD( this.dynamic, value ) };

	toJSON() {

		const dynamic = this.game.dynamic;
		const index = this.dynamic;

		return {

			"r": dynamic.getR( index ),
			"y": dynamic.getY( index )

		};

	};

	init() {

		this.initPhysics();
		this.initGraphics();

	};

	reset() {

		this.movingLeft = false;
		this.movingRight = false;
		this.jumping = false;

		const dynamic = this.game.dynamic;
		const spawn = this.game.spawn;
		const index = this.dynamic;

		dynamic.setR( index, spawn.r );
		dynamic.setY( index, spawn.y );
		dynamic.setVY( index, 0 );
		dynamic.setVR( index, 0 );

		this.game.graphics.brightnessContrastEffect.uniforms.get("brightness").value = 0;
		this.game.graphics.brightnessContrastEffect.uniforms.get("contrast").value = 0;

	};

	initGraphics() {

		const dynamic = this.game.dynamic;
		const index = this.dynamic;
		const player = new THREE.Object3D();
		player.name = "Player";

		this.mesh = new THREE.Object3D();

		//HITBOX for debugging
		/*const w = dynamic.getW(index);
		const h = dynamic.getH(index);
		const d = dynamic.getD(index);
		const geometry = new THREE.BoxGeometry( w - 0.01, h - 0.2, d - 0.01 ); 
		const material = new THREE.MeshBasicMaterial( {color: 0xff0000} ); 
		material.opacity = 0.1;
		const cube = new THREE.Mesh( geometry, material ); 
		this.game.graphics.scene.add( cube );*/

		const model = this.game.graphics.assets['Character'].clone();
		const animations = this.game.graphics.animations['Character'];
		const mixer = new THREE.AnimationMixer(model);
		this.game.graphics.mixers.push(mixer);
    	mixer.clipAction(animations[0]).play();

		player.add( model );

		const light = new THREE.PointLight( 0xFFD13C, 8, 150 );
		light.castShadow = true;
		light.position.set( -1, 1, 1 );
		light.shadow.bias = -0.01;

		player.traverse( function ( child ) {
		
			if (child.isMesh) {

				child.castShadow = true;
				child.receiveShadow = true;
		   
			}
		
		});

		player.castShadow = true; //default is false
		player.receiveShadow = true; //default

		this.mesh.light = light;
		player.position.y = -0.5;
		this.mesh.add( light, player );
		this.game.graphics.scene.add( this.mesh );
		const root = player.children[0]
		
		this.game.graphics.updateHandlers.push((dt) => {

			const index = this.dynamic;

			const r = dynamic.getR( index );
			const x = dynamic.getX( index );
			const y = dynamic.getY( index );
			const z = dynamic.getZ( index );
			const w = dynamic.getW( index );
			const h = dynamic.getH( index );
			const d = dynamic.getD( index );
			const vy = dynamic.getVY( index );

			//cube.position.set( x, y-0.001*dt, z );

			this.mesh.position.set( x, y, z );

			this.mesh.rotation.y = -2*Math.PI*r - Math.PI;

			if ( this.movingRight ) root.scale.z = -1;
			else if ( this.movingLeft ) root.scale.z = 1;
			
			if ( !this.touchingTheFloor ) {

				this.sound.walk.stop();
				mixer.clipAction(animations[1]).paused = true;
				mixer.clipAction(animations[1]).time = 0;

			} else if ( this.movingRight || this.movingLeft ) {

				mixer.clipAction(animations[1]).paused = false;
				mixer.clipAction(animations[1]).play();

				if ( !this.sound.walk.isPlaying ) {
					this.sound.walk.setLoop(true);
					this.sound.walk.detune = Math.random()*10 - 5;
					this.sound.walk.play();
				}

			} else {

				mixer.clipAction(animations[1]).paused = true;
				mixer.clipAction(animations[1]).time = 0;
				this.sound.walk.stop();

			}

		});

		const listener = this.game.sound.listener;

		this.sound.jump = this.game.sound.create('Jump 1', 'sfx', this.mesh);
		this.sound.land = this.game.sound.create('Land 1', 'sfx', this.mesh);
		this.sound.walk = this.game.sound.create('Walking', 'sfx', this.mesh);
		this.sound.reset = this.game.sound.create('Player Death', 'sfx', this.mesh);

		this.sound.jump.setVolume(0.5);

	};

	initPhysics() {

		const index = this.dynamic;

		if ( this.game.playerIndex === undefined ) this.game.playerIndex = index;

		const dynamic = this.game.dynamic;

		const h = dynamic.getH( index );
		const d = dynamic.getD( index );
		const w = dynamic.getW( index );

		this.touchingTheFloor = false;
		let actuallyJumping = false;

		// Check state ( moving, jumping )
		this.game.physics.beforeTick.push((dt) => {

			const r = dynamic.getR( index );
			const x = dynamic.getX( index );
			const y = dynamic.getY( index );
			const z = dynamic.getZ( index );
			const vr = dynamic.getVR( index );
			const vy = dynamic.getVY( index );

			const now = Date.now();

			// Checking if touching the floor
			const floorQuery = this.game.fixed.query( x, y - 0.05, z, w-0.05, h, d-0.05 );

			if ( floorQuery.length > 0 && !this.touchingTheFloor ) {

				this.jumpCount = 0;
				this.touchingTheFloor = true;
				this.sound.land.play();

			} else if ( abs(abs(vy) - abs(this.game.gravity) + 0.00005) > 0.002 ) {

				this.touchingTheFloor = false;

			}

			// Jumping logic
			if (this.jumping && this.jumpCount < this.maxJumps) {
				const query = this.game.fixed.query(x, y - 0.01, z, w, h, d);

				if (query.length > 0 || this.jumpCount < this.maxJumps) { // either grounded or in air but still has jumps

					dynamic.setVY(index, -1.3 * this.game.gravity);
					actuallyJumping = true;

					if (this.sound.jump.isPlaying) this.sound.jump.stop();
					this.sound.jump.play();

					this.jumpCount++; // increment jump count
					this.jumping = false; // prevent holding space for repeated jumps
				}
			}

			// Movement logic
			if ( this.movingRight > 0 ) dynamic.addVR( index, +0.000014 * this.movingRight );
			if ( this.movingLeft > 0 ) dynamic.addVR( index, -0.000014 * this.movingLeft );
			if ( this.goDown ) dynamic.addVY( index, -0.005 );

			if ( this.movingRight > 0 || this.movingLeft > 0 ) {
					
					const query = this.game.fixed.query( x, y, z, w + 0.002*dt, h, d + 0.002*dt );

					let delta = Infinity;

					for ( let i = 0; i < query.length; i ++ ) {

						const index = query[ i ];
						const sy = this.game.fixed.getY( index );
						const sh = this.game.fixed.getH( index );
						const smaxy = sy + sh/2;

						if ( smaxy < this.y ) {

							delta = abs( y - smaxy );
							dynamic.addVY( this.dynamic, 0.005*delta );

						}

					}

			} else {

				this.sound.walk.stop();
			
			}

			// Killing enemies logic
			
			if ( vy + this.game.gravity < 0 ) {

				const enemies = dynamic.query( 
					x, y - this.height/2 + 0.1, z, 
					w - 0.1, 0.1, d - 0.1 
				);

				enemies.splice( enemies.indexOf( index ), 1 );
				
				for ( const enemy of enemies ) {

					const enemyY = dynamic.getY( enemy );
					const enemyH = dynamic.getH( enemy );

					//if ( enemyY + enemyH/2 < y + this.height/2 ) {

						dynamic.setVY( index, -1.3*this.game.gravity );
						dynamic.deactivate( enemy );
						break;

					//}

				}
			
			}
			

			// Player death logic
			
			const deathQuery = dynamic.query( x, y, z, w + 0.02, h - 0.1, d + 0.02 );
			deathQuery.splice( deathQuery.indexOf( index ), 1 );

			if ( deathQuery.length > 0 || this.y < -10 ) {
			
				this.kill();

			}
			

		});

	};

	kill() {

		this.sound.reset.stop();
		this.sound.reset.play();
		this.reset();

	};

};
