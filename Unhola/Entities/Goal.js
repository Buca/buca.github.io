import * as THREE from 'three';

export class Goal {

	#r; #y;

	constructor({ game, r = 0, y = 0 }) {

		this.game = game
		this.name = "Goal";

		this.sound = {};

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

	toJSON() {

		return {
			"r": this.r,
			"y": this.y
		};

	};

	reset() {

		this.r = this.game.win.r;
		this.y = this.game.win.y;

		this.game.graphics.brightnessContrastEffect.uniforms.get("brightness").value = 0;
		this.game.graphics.brightnessContrastEffect.uniforms.get("contrast").value = 0;

	};

	initGraphics() {

		const oculusostium = this.game.graphics.assets['Oculusostium'].clone();

		//oculusostium.rotation.y = Math.PI/2;


		this.light = new THREE.PointLight( 0xFFFFFF, 100, 250 );
		this.light.castShadow = true;
		this.light.position.set( 4, 2, 0 );
		this.light.shadow.bias = -0.01;
		//oculusostium.add( light );

		const eyes = [];

		oculusostium.traverse( function ( child ) {

			if ( child.isMesh ) {

		    	child.castShadow = true;
		    	child.receiveShadow = true;
		   
			}
		
		});

		const graphics = this.game.graphics;
		const dynamic = this.game.dynamic;
		const index = this.game.player.dynamic;

		//graphics.scene.add( goal );
		graphics.scene.add( oculusostium );

		graphics.updateHandlers.push(() => {

			const now = Date.now();

			oculusostium.position.x = this.x;
			oculusostium.position.y = this.y;
			oculusostium.position.z = this.z;


			// Player position
			const x = dynamic.getX( index );
			const y = dynamic.getY( index );
			const z = dynamic.getZ( index );

			const renderRadius = this.game.settings['render-distance'];

			const minX = this.x - renderRadius;
			const minY = this.y - renderRadius;
			const minZ = this.z - renderRadius;
			const maxX = this.x + renderRadius;
			const maxY = this.y + renderRadius;
			const maxZ = this.z + renderRadius;

			const intersects = (

				x <= maxX &&
				x >= minX &&
				y <= maxY &&
				y >= minY &&
				z <= maxZ &&
				z >= minZ

			);

			if ( !intersects ) {

				//this.light.intensity = 0;
				if ( oculusostium.parent === this.game.graphics.scene ) oculusostium.removeFromParent();

			}
			
			else {

				//this.light.intensity = 30;
				if ( oculusostium.parent !== this.game.graphics.scene ) this.game.graphics.scene.add( oculusostium );

			}

			const distance = Math.hypot( this.x - x, this.y - y, this.z - z );

			if (distance <= 10) {

				// Distance between players center and the center of the goal
				const threshold = Math.min(1, Math.max(0, 1 - distance/10));

				graphics.brightnessContrastEffect.uniforms.get("brightness").value = 0.025*threshold;
				graphics.brightnessContrastEffect.uniforms.get("contrast").value = 0.4*threshold;

			}

			// This shouldn't be in the graphics:
			if (this.x - 1 < x && x < this.x + 1 &&
				this.y - 2 < y && y < this.y + 2 &&
				this.z - 1 < z && z < this.z + 1 ) {

				this.game.player.sound.reset.play();
				this.game.level += 1;
				this.game.new({ level: this.game.level });
				this.game.start();


			}

		});

		this.sound.whispering = this.game.sound.create('Whispering', 'sfx', oculusostium );
		this.sound.whispering.setVolume(0.1);

	};

};
