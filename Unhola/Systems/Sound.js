import * as THREE from 'three';

export class Sound {

	constructor( game ) {

		this.game = game;
		this.loader = new THREE.AudioLoader();
		this.buffers = new Map();

	};

	async load( sounds ) {

		const promises = [];

		for ( const sound of sounds ) {

			promises.push( new Promise( ( resolve ) => {
				this.loader.load( 'sounds/' + sound + '.ogg', ( buffer ) => {
					this.buffers.set( sound, buffer );
					resolve();
				});
			}));

		}

		await Promise.all( promises );

	};

}