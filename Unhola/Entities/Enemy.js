import * as THREE from 'three';
import { cylindricalDistance, angleDifference, abs } from '../Utilities.js';

export class Enemy {

	constructor({ game, r = 0, y = 0, dead = false }) {

		this.game = game;
		this.name = "Enemy";

		this.dynamic = !dead ? this.game.dynamic.create( 0, 0, 0.7, 0.7, 0.7, 0, 0 ) : undefined;
		this.sound = {};

		this.r = r;
		this.y = y;

		this.wanderingSpeed = 0.00025;
		this.followingSpeed = 0.00075;
		this.jumpingSpeed = 0.175;

		this.movingLeft = false;
		this.movingRight = false;
		this.jumping = false;
		this.dead = dead;

		this.initPhysics();
		this.initGraphics();
		this.initAgent();

	};

	// Position
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

			"r": this.r,
			"y": this.y,
			"dead": this.dead

		};

	};

	dispose() {



		const index = this.game.enemies.indexOf( this );
		if ( index !== -1 ) this.game.enemies.splice( index, 1 );

		const physicsIndex = this.game.physics.beforeTick.indexOf( this.beforePhysicsTick );
		if ( physicsIndex !== -1 ) this.game.physics.beforeTick.splice( physicsIndex, 1 );
		
		if ( this.sound.death ) this.sound.death.setVolume( 0 );

		if ( this.dynamic ) this.game.dynamic.dispose( this.dynamic );

	};

	initGraphics() {

		if ( this.dead ) return;

		const graphics = this.game.graphics;
		const dynamic = this.game.dynamic;
		const index = this.dynamic;
		const enemy = new THREE.Object3D();
		
		// HITBOX for debugging
		/*const w = dynamic.getW(index);
		const h = dynamic.getH(index);
		const d = dynamic.getD(index);
		const geometry = new THREE.BoxGeometry( w, h, d ); 
		const material = new THREE.MeshBasicMaterial( {color: 0xff0000} ); 
		material.opacity = 0.5;
		const cube = new THREE.Mesh( geometry, material );
		this.game.graphics.scene.add( cube );*/
		
		this.game.graphics.meshes.push( enemy );
		const model = this.game.graphics.assets['Enemy'].clone();
		model.rotation.y = Math.PI;
		model.position.y = -0.35;
		enemy.add( model );
		enemy.isEnemy = true;

		this.light = new THREE.PointLight( 0xFFFFFF, 20, 250 );
		graphics.scene.add( this.light );


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
				
				this.sound.death.play();
				const index = graphics.updateHandlers.indexOf( updateHandler );
				if ( index !== -1 ) graphics.updateHandlers.splice( index, 1 );

				enemy.position.y = -100000; //.visible = false;
				this.sound.death.position.y = 100000;
				this.light.intensity = 0;
				return;

			}

			const r = dynamic.getR( index );
			const x = dynamic.getX( index );
			const y = dynamic.getY( index );
			const z = dynamic.getZ( index );

			const radius = this.game.radius.center;
			const lx = ( radius + 2 )*Math.cos( 2*Math.PI*r );
			const lz = ( radius + 2 )*Math.sin( 2*Math.PI*r );

			this.light.position.set( lx, y+.5, lz );

			const pi = this.game.player.dynamic;
			const pr = this.game.dynamic.getR( pi );
			const px = dynamic.getX( pi );
			const py = dynamic.getY( pi );
			const pz = dynamic.getZ( pi );

			const renderRadius = this.game.settings['render-distance'];

			const minX = x - renderRadius;
			const minY = y - renderRadius;
			const minZ = z - renderRadius;
			const maxX = x + renderRadius;
			const maxY = y + renderRadius;
			const maxZ = z + renderRadius;

			const intersects = (

				px <= maxX &&
				px >= minX &&
				py <= maxY &&
				py >= minY &&
				pz <= maxZ &&
				pz >= minZ

			);

			if ( !intersects ) {

				this.light.intensity = 0;
				if ( enemy.parent === this.game.graphics.scene ) enemy.removeFromParent();

			}

			else {

				this.light.intensity = 30;
				if ( enemy.parent !== this.game.graphics.scene ) this.game.graphics.scene.add( enemy );

			}

			enemy.position.set( x, y, z );
			enemy.rotation.y = -2*Math.PI*pr - Math.PI;

			if ( this.movingRight ) {
				model.scale.z = -1;
			} else if ( this.movingLeft ) {
				model.scale.z = 1;
			}

		};

		graphics.updateHandlers.push( updateHandler );

		this.sound.death = this.game.sound.create('Death', 'sfx', enemy);
		this.sound.voice1 = this.game.sound.create('Enemy Voice 1', 'sfx', enemy);
		this.sound.voice2 = this.game.sound.create('Enemy Voice 2', 'sfx', enemy);
		this.sound.voice3 = this.game.sound.create('Enemy Voice 3', 'sfx', enemy);
		this.sound.voice4 = this.game.sound.create('Enemy Voice 4', 'sfx', enemy);

		this.sound.death.setVolume(0.3);
		this.sound.voice1.setVolume(0.2);
		this.sound.voice2.setVolume(0.2);
		this.sound.voice3.setVolume(0.2);
		this.sound.voice4.setVolume(0.2);

	};

	initPhysics() {

		if ( this.dead ) return;
		
		const index = this.dynamic;
		const dynamic = this.game.dynamic;

		this.beforePhysicsTick = (dt) => {

			const h = dynamic.getH( index );
			const d = dynamic.getD( index );
			const w = dynamic.getW( index );

			if ( !dynamic.isActive( index ) ) {

		        this.dead = true;
		        const idx = this.game.physics.beforeTick.indexOf( this.beforePhysicsTick );
		        this.game.physics.beforeTick.splice( idx, 1 );
		        return;

		    
		    }

			const r = dynamic.getR( index );
			const x = dynamic.getX( index );
			const y = dynamic.getY( index );
			const z = dynamic.getZ( index );
			const vr = dynamic.getVR( index );

			if ( this.jumping ) {

				const platformQuery = this.game.fixed.query( x, y - 0.05, z, w - 0.05, h + 0.1, d - 0.05 );
				const enemiesQuery = this.game.dynamic.query( x, y - 0.05, z, w - 0.1, h + 0.1, d - 0.1 );
				enemiesQuery.splice( enemiesQuery.indexOf( this.dynamic ), 1 );
				if ( platformQuery.length > 0 || enemiesQuery.length > 0 ) dynamic.setVY( index, -(1+this.jumpingSpeed)*this.game.gravity );
				
			}

			let speed = !this.isWandering ? this.followingSpeed : this.wanderingSpeed;
			speed /= 2*Math.PI*this.game.radius.center;

			if ( this.movingRight ) dynamic.addVR( index, speed );

			if ( this.movingLeft ) dynamic.addVR( index, -speed );

			if ( this.movingRight || this.movingLeft ) {

				const query = this.game.fixed.query( x, y, z, w + 0.002*dt, h, d + 0.002*dt );
				let delta = Infinity;

				for ( let i = 0; i < query.length; i ++ ) {

					const index = query[ i ];
					const sy = this.game.fixed.getY( index );
					const sh = this.game.fixed.getH( index );
					const smaxy = sy + sh/2;

					if ( smaxy < y ) {

						const index = query[ i ];
						const sy = this.game.fixed.getY( index );
						const sh = this.game.fixed.getH( index );
						const smaxy = sy + sh/2;

						if ( smaxy < this.y ) {

							delta = abs( y - smaxy );
							dynamic.addVY( this.dynamic, 0.005*delta );

						}
					}

				}

			}

		};

		this.game.physics.beforeTick.push( this.beforePhysicsTick );

	};

	initAgent() {

		if ( this.dead ) return;
		
		const index = this.dynamic;
		const dyn = this.game.dynamic;
		const fixed = this.game.fixed;
		const center = this.game.radius.center;
		let switchedDirectionTS = Date.now();
		let direction = 1;

		const beforeTick = () => {

			if ( !dyn.isActive( this.dynamic ) ) {

				const idx = this.game.physics.beforeTick.indexOf( beforeTick );
		        this.game.physics.beforeTick.splice( idx, 1 );
		        return;
		    
			}

			const r = dyn.getR( index );
			const x = dyn.getX( index );
			const y = dyn.getY( index );
			const z = dyn.getZ( index );
			const w = dyn.getW( index );
			const h = dyn.getH( index );
			const d = dyn.getD( index );
			const vr = dyn.getVR( index );
			const vy = dyn.getVY( index );

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
					if ( N === 1 ) this.sound.voice1.play();
					else if ( N === 2 ) this.sound.voice2.play();
					else if ( N === 3 ) this.sound.voice3.play();
					else if ( N === 4 ) this.sound.voice4.play();

				}

				this.isWandering = false;

				const diff = angleDifference(r, pr);

				if (Math.abs(diff) < 0.001) {
					
					this.movingLeft = false;
					this.movingRight = false;
				
				} else if (diff < 0) {
					
					this.movingLeft = true;
					this.movingRight = false;
				
				} else {
				
					this.movingLeft = false;
					this.movingRight = true;
				
				}
				
				const ax = center*Math.cos(2*Math.PI*frontRA);
				const az = center*Math.sin(2*Math.PI*frontRA); 
				const bx = center*Math.cos(2*Math.PI*frontRB);
				const bz = center*Math.sin(2*Math.PI*frontRB); 

				const queryWallInfront = fixed.query( 

					ax, y + h/2, az, 		// Position
					w + 0.01, h, d + 0.01 	// Dimensions
				
				);
				const queryFloorInfront = fixed.query( bx, y-h, bz, w, h, d );


				if ((queryWallInfront.length > 0 && py > y + h/2) 
					|| (queryFloorInfront.length === 0 && py > y)
					) {

					this.jumping = true;
				
				} else {

					this.jumping = false;

				}

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

		// This needs to be removed on disposal

	};

}
