import * as THREE from 'three';

export class Enemy {

	constructor({ game, r = 0, y = 0 }) {

		this.game = game;
		this.name = "Enemy";

		this.dynamic = game.dynamic.create( r, y, 0.5, 0.35, 0.5, 0, 0 );

		this.movingLeft = false;
		this.movingRight = false;
		this.jumping = false;

		this.initPhysics();
		this.initGraphics();
		this.initAgent();

	};

	dispose() {

		this.deathSound.setVolume(0);
		this.game.dynamic.deactivate( this.dynamic );


	};

	initGraphics() {

		const graphics = this.game.graphics;
		const dynamic = this.game.dynamic;
		const index = this.dynamic;
		const enemy = new THREE.Object3D();
		this.game.graphics.meshes.push( enemy );
		const model = this.game.graphics.assets['Enemy'].clone();
		model.rotation.y = Math.PI;
		model.position.y = -0.2;
		enemy.add( model );
		enemy.isEnemy = true;

		const light = new THREE.PointLight( 0xFFFFFF, 8, 150 );
		light.position.set( -1, 1, 0 );
		enemy.add( light );

		enemy.traverse( function ( child ) {
		
			if (child.isMesh) {

				child.castShadow = true;
				child.receiveShadow = true;
		   
			}
		
		});

		enemy.castShadow = true; //default is false
		enemy.receiveShadow = true; //default

		graphics.scene.add( enemy );

		const updateHandler = () => {

			if ( !dynamic.isActive( index ) ) {
				
				this.deathSound.play();
				const index = graphics.updateHandlers.indexOf( updateHandler );
				graphics.updateHandlers.splice( index, 1 );
				enemy.position.y = -100000; //.visible = false;
				return;
			
			}


			const r = dynamic.getR( index );
			const x = dynamic.getX( index );
			const y = dynamic.getY( index );
			const z = dynamic.getZ( index );

			const pr = dynamic.getR( this.game.player.dynamic );

			enemy.position.set( x, y, z );
			enemy.rotation.y = -2*Math.PI*pr - Math.PI;

			if ( this.movingRight ) {
				model.scale.z = -1;
			} else if ( this.movingLeft ) {
				model.scale.z = 1;
			}

		};

		graphics.updateHandlers.push( updateHandler );

		this.deathSound = new THREE.PositionalAudio( this.game.graphics.listener );
		this.deathSound.setBuffer( this.game.sound.buffers.get('Death') );
		this.voice1Sound = new THREE.PositionalAudio( this.game.graphics.listener );
		this.voice1Sound.setBuffer( this.game.sound.buffers.get('Enemy Voice 1') );
		this.voice2Sound = new THREE.PositionalAudio( this.game.graphics.listener );
		this.voice2Sound.setBuffer( this.game.sound.buffers.get('Enemy Voice 2') );
		this.voice3Sound = new THREE.PositionalAudio( this.game.graphics.listener );
		this.voice3Sound.setBuffer( this.game.sound.buffers.get('Enemy Voice 3') );
		this.voice4Sound = new THREE.PositionalAudio( this.game.graphics.listener );
		this.voice4Sound.setBuffer( this.game.sound.buffers.get('Enemy Voice 4') );

		enemy.add( this.deathSound, this.voice1Sound, this.voice2Sound, this.voice3Sound, this.voice4Sound );

	};

	initPhysics() {

		const index = this.dynamic;

		const dynamic = this.game.dynamic;

		const h = dynamic.getH( index );
		const d = dynamic.getD( index );
		const w = dynamic.getW( index );

		const beforeTick = () => {

			if ( !dynamic.isActive( index ) ) {

				const index = this.game.physics.beforeTick.indexOf( beforeTick );
				this.game.physics.beforeTick.splice( index, 1 );
				return;

			}

			const r = dynamic.getR( index );
			const x = dynamic.getX( index );
			const y = dynamic.getY( index );
			const z = dynamic.getZ( index );
			const vr = dynamic.getVR( index );

			const now = Date.now();

			if ( this.jumping ) {

				const query = this.game.fixed.query( x, y - 0.05, z, w - 0.05, h + 0.1, d - 0.05 );
				
				if ( query.length > 0 ) dynamic.setVY( index, -1.15*this.game.gravity );
				
			
			}

			if ( this.movingRight ) dynamic.addVR( index, !this.isWandering ? 0.00001 : 0.0000025 );

			if ( this.movingLeft ) dynamic.addVR( index, !this.isWandering ? -0.00001 : -0.0000025 );

			if ( ( this.movingRight || this.movingLeft ) ) {

					const query = this.game.fixed.query( x, y - 0.1, z, w+0.2, h - 0.2, d+0.2 );
					
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

					if ( goAhead ) dynamic.addVY( index, 0.002*delta );

			}

		};

		this.game.physics.beforeTick.push( beforeTick );

	};

	initAgent() {

		const dyn = this.game.dynamic;
		const fixed = this.game.fixed;
		const center = this.game.radius.center;
		let switchedDirectionTS = Date.now();
		let direction = 1;

		const beforeTick = () => {

			if ( !dyn.isActive( this.dynamic ) ) {

				const index = this.game.physics.beforeTick.indexOf( beforeTick );
				this.game.physics.beforeTick.splice( index, 1 );
				return;

			}

			const r = dyn.getR( this.dynamic );
			const x = dyn.getX( this.dynamic );
			const y = dyn.getY( this.dynamic );
			const z = dyn.getZ( this.dynamic );
			const w = dyn.getW( this.dynamic );
			const h = dyn.getH( this.dynamic );
			const d = dyn.getD( this.dynamic );
			const vr = dyn.getVR( this.dynamic );
			const vy = dyn.getVY( this.dynamic );

			const player = this.game.player;
			const pr = dyn.getR( player.dynamic );
			const px = dyn.getX( player.dynamic );
			const py = dyn.getY( player.dynamic );
			const pz = dyn.getZ( player.dynamic );
			const pvr = dyn.getVR( player.dynamic );
			const pvy = dyn.getVY( player.dynamic );

			const distance = Math.hypot( px - x, py - y, pz - z );

			if( distance > 10 ) return;

			let frontRA;
			let frontRB;

			if ( px - 5 < x && x < px + 5 &&
				py - 5 < y && y < py + 5 &&
				pz - 5 < z && z < pz + 5 ) {

				if ( this.isWandering ) {

					const N = Math.ceil(Math.random()*4);
					if ( N === 1 ) this.voice1Sound.play();
					else if ( N === 2 ) this.voice2Sound.play();
					else if ( N === 3 ) this.voice3Sound.play();
					else if ( N === 4 ) this.voice4Sound.play();

				}

				this.isWandering = false;

				if ( Math.abs(pr%1 - (r - 0.0065)%1) - Math.abs(pr%1 - (r + 0.0065)%1) < - 0.0002) {

					frontRA = (r - 0.00025);
					frontRB = frontRA - 0.000015;
					this.movingLeft = true;
					this.movingRight = false;

				} else if ( Math.abs(pr%1 - (r - 0.0065)%1) - Math.abs(pr%1 - (r + 0.0065)%1) > 0.0002) {

					frontRA = (r + 0.00025);
					frontRB = frontRA + 0.000015;
					this.movingLeft = false;
					this.movingRight = true;

				} else {

					this.movingLeft = false;
					this.movingRight = false;

				}
				
				const ax = center*Math.cos(2*Math.PI*frontRA);
				const az = center*Math.sin(2*Math.PI*frontRA); 
				const bx = center*Math.cos(2*Math.PI*frontRB);
				const bz = center*Math.sin(2*Math.PI*frontRB); 

				const queryWallInfront = fixed.query( ax, y + 0.05, az, w+0.01, h + 0.2, d+0.01 );
				const queryFloorInfront = fixed.query( bx, y-h, bz, w, h, d );

				if ((queryWallInfront.length > 0 && py > y + 1.5*h ) ||
					(queryFloorInfront.length === 0 && py > y)) this.jumping = true;
				else this.jumping = false;

			} else {

				this.isWandering = true;

				const now = Date.now();

				if ( now - switchedDirectionTS > 3000 ) {

					switchedDirectionTS = now;
					direction = Math.round(Math.random()*2 - 1);

				}

				if ( direction === 1 ) {

					this.movingRight = true;
					this.movingLeft = false;
					this.jumping = false;

				} else if ( direction === -1 ) {

					this.movingLeft = true;
					this.movingRight = false;
					this.jumping = false;

				} else {

					this.movingLeft = false;
					this.movingRight = false;
					this.jumping = false;

				}

			}

			if ( y < -10 ) this.game.dynamic.deactivate( this.dynamic );

		};

		this.game.physics.beforeTick.push( beforeTick );

	};

};
