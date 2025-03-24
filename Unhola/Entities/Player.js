import * as THREE from 'three';

export class Player {

	constructor({ game, r = 0, y = 0 }) {

		this.game = game;
		this.name = "Player";
		this.game.player = this;
		this.dynamic = game.dynamic.create( r, y, 0.5, 0.95, 0.5, 0, 0 );

		this.movingLeft = false;
		this.movingRight = false;
		this.jumping = false;

		this.sound = {};

	};

	get r() {

		return this.game.dynamic.getR( this.dynamic );

	};

	set r( value ) {

		return this.game.dynamic.setR( this.dynamic, value );

	};

	get y() {

		return this.game.dynamic.getY( this.dynamic );

	};

	set y( value ) {

		return this.game.dynamic.setY( this.dynamic, value );

	};

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

		// HITBOX for debugging
		/*const w = dynamic.getW(index);
		const h = dynamic.getH(index);
		const d = dynamic.getD(index);
		const geometry = new THREE.BoxGeometry( w, h, d ); 
		const material = new THREE.MeshBasicMaterial( {color: 0xff0000} ); 
		material.opacity = 0.1;
		const cube = new THREE.Mesh( geometry, material ); 
		this.game.graphics.scene.add( cube );*/

		const model = this.game.graphics.assets['Character'].clone();

		player.add( model );

		const light = new THREE.PointLight( 0xFFD13C, 8, 150 );
		light.castShadow = true;
		light.position.set( 0, 1, -1 );
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
		player.position.y = -0.6;
		this.mesh.add( light, player );
		this.game.graphics.scene.add( this.mesh );
		
		const root = player.children[0];
		const body = root.children[0];
		const head = root.children[1];
		body.position.y = 0.2
		let headBobbingAnimationSwitchTS = Date.now();
		let headBobbingState = 0;
		let walkingAnimationSwitchTS = Date.now();
		let walkingState = 0;

		this.game.graphics.updateHandlers.push(() => {

			const index = this.dynamic;

			const r = dynamic.getR( index );
			const x = dynamic.getX( index );
			const y = dynamic.getY( index );
			const z = dynamic.getZ( index );
			const w = dynamic.getW( index );
			const h = dynamic.getH( index );
			const d = dynamic.getD( index );
			const vy = dynamic.getVY( index );

			//cube.position.set( x, y, z );

			this.mesh.position.set( x, y, z );

			this.mesh.rotation.y = -2*Math.PI*r - Math.PI/2;
			
			if ( this.movingRight ) {

				root.scale.x = -1;
			
			} else if ( this.movingLeft ) {
			
				root.scale.x = 1;
			
			}

			if ( this.movingLeft || this.movingRight ) {
				head.position.x = -0.004;
			} else {
				head.position.x = 0;
			}

			const now = Date.now();

			if ( now < headBobbingAnimationSwitchTS + 1200 ) {

				head.position.y = -0.06 * headBobbingState;

			} else {

				headBobbingAnimationSwitchTS = now;
				headBobbingState = (headBobbingState + 1) % 2;
			}

			const floorQuery = this.game.fixed.query( x, y - 0.05, z, w-0.05, h - 0.2, d-0.05 );

			if ( floorQuery.length === 0 ) {

				walkingAnimationSwitchTS = now;
				body.position.y = 0.05 - 0.1;
				root.position.y = 0.15;
				this.sound.walk.pause();

			} else if ( now < walkingAnimationSwitchTS + 250 && (this.movingRight || this.movingLeft) ) {

				body.position.y = 0.05 * walkingState - 0.1;
				root.position.y = 0.15 * walkingState;
				this.sound.walk.setLoop(true);
				this.sound.walk.detune = Math.random()*10 - 5;
				this.sound.walk.pause();
				this.sound.walk.play();

			} else if ( this.movingRight || this.movingLeft ) {

				walkingAnimationSwitchTS = now;
				walkingState = (walkingState + 1) % 2;
				this.sound.walk.setLoop(true);
				this.sound.walk.pause();
				this.sound.walk.detune = Math.random()*10 - 5;
				this.sound.walk.play();
			
			} else {

				walkingAnimationSwitchTS = now;
				body.position.y = 0;
				root.position.y = 0;
				this.sound.walk.pause();

			}

		});

		const listener = this.game.sound.listener;

		this.sound.jump = this.game.sound.create('Jump 1', 'sfx', this.mesh);
		this.sound.land = this.game.sound.create('Land 1', 'sfx', this.mesh);
		this.sound.walk = this.game.sound.create('Walking', 'sfx', this.mesh);
		this.sound.reset = this.game.sound.create('Player Death', 'sfx', this.mesh);

		this.sound.jump.setVolume(0.3);

	};

	initPhysics() {


		const index = this.dynamic;

		if ( this.game.playerIndex === undefined ) this.game.playerIndex = index;

		const dynamic = this.game.dynamic;

		const h = dynamic.getH( index );
		const d = dynamic.getD( index );
		const w = dynamic.getW( index );

		let touchingTheFloor = false;
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

			if ( this.jumping ) {

				const query = this.game.fixed.query( x, y - 0.001*dt, z, w, h, d );
				
				if ( query.length > 0 ) {

					dynamic.setVY( index, -1.3*this.game.gravity );
					
					this.sound.jump.pause();
					this.sound.jump.play();
					actuallyJumping = true;
				
				} else actuallyJumping = false;
			
			}

			if ( this.game.fixed.query( x, y - 0.001*dt, z, w, h, d ).length > 0 && !touchingTheFloor && !actuallyJumping ) {

				touchingTheFloor = true;
				this.sound.land.pause();
				this.sound.land.play();

			} else if ( Math.abs(Math.abs(vy) - Math.abs(this.game.gravity) + 0.00005) > 0.002 ) {

				touchingTheFloor = false;

			}

			if ( this.movingRight ) dynamic.addVR( index, +0.000014 );

			if ( this.movingLeft ) dynamic.addVR( index, -0.000014 );

			if ( ( this.movingRight || this.movingLeft ) ) {
					
					const query = this.game.fixed.query( x, y-0.001*dt, z, w+0.002*dt, h - 0.002*dt, d+0.002*dt );
					
					let goAhead = false;
					let delta = Infinity;

					for ( let i = 0; i < query.length; i ++ ) {

						const index = query[ i ];
						const sy = this.game.fixed.getY( index );
						const sh = this.game.fixed.getH( index );
						const smaxy = sy + sh/2;

						if ( smaxy < y ) {

							goAhead = true;
							delta = y - smaxy;
							break;

						}

					}

					if ( goAhead ) dynamic.addVY( index, 0.008*delta );

			} else {

				this.sound.walk.pause();
			
			}

			if ( !touchingTheFloor && vy + this.game.gravity < 0 ) {

				const enemies = dynamic.query( x, y-0.001*dt, z, w - 0.0005*dt, h+0.001*dt, d - 0.0005*dt );
				enemies.splice( enemies.indexOf( index ), 1 );
				
				for ( const enemy of enemies ) {

					const enemyY = dynamic.getY( enemy );

					if ( enemyY < y + h ) {

						dynamic.setVY( index, -1.2*this.game.gravity );
						dynamic.deactivate( enemy );
						break;

					}

				}
			
			}

			const deathQuery = dynamic.query( x, y + 0.001*dt, z, w, h - 0.001*dt, d );
			deathQuery.splice( deathQuery.indexOf( index ), 1 );

			if ( deathQuery.length > 0 || this.y < - 10 ) {
			
				this.kill();

			}

		});

	};

	kill() {

		this.sound.reset.play();
		this.reset();

	};

};
