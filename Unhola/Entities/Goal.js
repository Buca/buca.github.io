import * as THREE from 'three';

export class Goal {

	#r; #y;

	constructor({ game, r = 0, y = 0 }) {

		this.game = game
		this.name = "Goal";

		this.#r = r;
		this.#y = y;

		this.initGraphics();

	};

	get r() { return this.#r; };
	set r( value ) { this.#r = value; };
	get y() { return this.#y; };
	set y( value ) { this.#y = value; };
	get x() { return this.game.radius.center*Math.cos( 2*Math.PI*this.r ) };
	get z() { return this.game.radius.center*Math.sin( 2*Math.PI*this.r ) };

	reset() {

		this.r = this.game.win.r;
		this.y = this.game.win.y;

		this.game.graphics.brightnessContrastEffect.uniforms.get("brightness").value = 0;
		this.game.graphics.brightnessContrastEffect.uniforms.get("contrast").value = 0;

	};

	initGraphics() {

		const goal = new THREE.Object3D();

		goal.castShadow = true;
		goal.receiveShadow = true;

		const model = this.game.graphics.assets['Goal'].clone();

		model.scale.set( 2, 2, 2 );

		goal.add( model );

		const light = new THREE.PointLight( 0xFFD13C, 8, 150 );
		light.castShadow = true;
		light.position.set( 0, 0, 0 );
		light.shadow.bias = -0.01;
		goal.add( light );

		goal.traverse( function ( child ) {
		
			if ( child.isMesh ) {

		    	child.castShadow = true;
		    	child.receiveShadow = true;
		   
			}
		
		});

		const diamond = model.children[ 1 ];

		const graphics = this.game.graphics;
		const dynamic = this.game.dynamic;
		const index = this.game.player.dynamic;

		graphics.scene.add( goal );

		const gravity = this.game.gravity;

		graphics.updateHandlers.push(() => {

			const now = Date.now();

			goal.position.x = this.x;
			goal.position.y = this.y;
			goal.position.z = this.z;

			diamond.rotation.z += 0.02;
			diamond.rotation.x += 0.02;

			diamond.position.y = 0.15*Math.cos( 2*Math.PI*0.0002*now ) + 1.5;

			// Player position
			const x = dynamic.getX( index );
			const y = dynamic.getY( index );
			const z = dynamic.getZ( index );

			if (this.x - 10 < x && x < this.x + 10 &&
				this.y - 5 < y && y < this.y + 5 &&
				this.z - 10 < z && z < this.z + 10 ) {

				// Distance between players center and the center of the goal
				const distance = Math.hypot( this.x - x, this.y - y, this.z );
				const threshold = Math.min(1, Math.max(0, 1 - distance/5));

				graphics.brightnessContrastEffect.uniforms.get("brightness").value = 0.2*threshold;
				graphics.brightnessContrastEffect.uniforms.get("contrast").value = 0.1*threshold;

			}

			if (this.x - 1 < x && x < this.x + 1 &&
				this.y - 2 < y && y < this.y + 2 &&
				this.z - 1 < z && z < this.z + 1 ) {

				this.game.player.resetSound.play();
				this.game.level += 1;
				this.game.new({ sections: this.game.level });


			}

		});

		this.whisperingSound = new THREE.PositionalAudio( graphics.listener );
		this.game.sound.loader.load( 'sounds/Whispering.ogg', ( buffer ) => {
			this.whisperingSound.setBuffer( buffer );
			this.whisperingSound.setLoop( true );
			this.whisperingSound.setVolume( 1 );
			this.whisperingSound.play();
		});

		/*
		this.whisperingSound.setBuffer( this.game.sound.buffers.get('Whispering') );
		this.whisperingSound.setRefDistance( 0 );
		this.whisperingSound.setLoop( true );
		this.whisperingSound.play();
		*/

		goal.add( this.whisperingSound );

	};

};