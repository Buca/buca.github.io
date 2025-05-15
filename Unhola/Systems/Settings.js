import { isFullscreen, goFullscreen, exitFullscreen, clamp } from '../Utilities.js';


export class Settings {

	constructor( game ) {

		this.game = game;
		this.values = {

			// Default values

			// Video
			'fullscreen': false,
			'brightness': 50,
			'contrast': 50,
			'volumetric-light': true,
			'noise': true,
			'vignette': true,
			'bloom': true,
			'resolution': 1,
			'render-distance': 20,

			// Audio
			'master': 100,
			'sfx': 100,
			'ui': 100,
			'ambience': 100

		};

		Object.defineProperty( this, 'fullscreen', {

			get: () => { return this.values['fullscreen'] },
			set: ( value ) => {

				this.values['fullscreen'] = !!value;

				const element = document.querySelector('.toggle-fullscreen-button span:last-child');

				if ( this.values['fullscreen'] ) {

					element.innerText = "ON";
					goFullscreen();

				} else {

					element.innerText = "OFF";
					if ( isFullscreen() ) exitFullscreen();

				}

			}

		});

		Object.defineProperty( this, 'render-distance', {

			get: () => { return this.values['render-distance'] },
			set: ( value ) => {

				value = clamp( value, 0, 100 );
				
				this.values['render-distance'] = value;

				const input = document.getElementById('render-distance-input');

				input.parentNode.querySelector('span:last-child').innerText = value;
				input.value = value;

				this.save();

			}

		});

		Object.defineProperty( this, 'brightness', {

			get: () => { return this.values['brightness'] },
			set: ( value ) => {

				value = clamp( value, 0, 100 );
				
				this.values['brightness'] = value;

				const input = document.getElementById('brightness-input');

				input.parentNode.querySelector('span:last-child').innerText = value;
				input.value = value;

				document.body.style.filter = `brightness(${.5 + value/100}) contrast(${.5 + this.contrast/100})`;

				this.save();

			}

		});

		Object.defineProperty( this, 'contrast', {

			get: () => { return this.values['contrast'] },
			set: ( value ) => {

				value = clamp( value, 0, 100 );
				
				this.values['contrast'] = value;

				const input = document.getElementById('contrast-input');

				input.parentNode.querySelector('span:last-child').innerText = value;
				input.value = value;

				document.body.style.filter = `brightness(${.5 + this.brightness/100}) contrast(${.5 + value/100})`;

				this.save();

			}

		});

		Object.defineProperty( this, 'volumetric-light', {

			get: () => { return this.values['volumetric-light'] },
			set: ( value ) => {

				const element = document.querySelector('.toggle-volumetric-light-button span:last-child');
				this.values['volumetric-light'] = value;

				if ( value ) {

					element.innerText = "ON";
					this.game.graphics.godRaysPass.enabled = true;

				} else {

					element.innerText = "OFF";
					this.game.graphics.godRaysPass.enabled = false;

				}

				this.save();

			}

		});

		Object.defineProperty( this, 'noise', {

			get: () => { return this.values['noise'] },
			set: ( value ) => {

				this.values['noise'] = value;

				const element = document.querySelector('.toggle-noise-button span:last-child');
				const noise = document.getElementById('noise');

				if ( value ) {

					element.innerText = "ON";
					noise.classList.remove('hidden');

				} else {

					element.innerText = "OFF";
					noise.classList.add('hidden');

				}

				this.save();

			}

		});

		Object.defineProperty( this, 'vignette', {

			get: () => { return this.values['vignette'] },
			set: ( value ) => {

				const element = document.querySelector('.toggle-vignette-button span:last-child');
				this.values['vignette'] = value;

				if ( value ) {

					element.innerText = "ON";
					this.game.graphics.vignettePass.enabled = true;

				} else {

					element.innerText = "OFF";
					this.game.graphics.vignettePass.enabled = false;

				}

				this.save();

			}

		});

		Object.defineProperty( this, 'bloom', {

			get: () => { return this.values['bloom'] },
			set: ( value ) => {

				const element = document.querySelector('.toggle-bloom-button span:last-child');
				this.values['bloom'] = value;

				if ( value ) {

					element.innerText = "ON";
					this.game.graphics.bloomPass.enabled = true;

				} else {

					element.innerText = "OFF";
					this.game.graphics.bloomPass.enabled = false;

				}

				this.save();

			}

		});

		Object.defineProperty( this, 'resolution', {

			get: () => { return this.values['resolution'] },
			set: ( value ) => {

				const element = document.querySelector('.toggle-resolution-button span:last-child');
				const canvas = this.game.graphics.renderer.domElement

				this.values['resolution'] = value;
				this.game.graphics.resolution = value;
				this.game.graphics.composer.setSize( window.innerWidth/this.resolution, window.innerHeight/this.resolution );

				canvas.style.scale = value;
				element.innerText = value + 'X';

				this.save();

			}

		});

		const mixer = this.game.sound.mixer;

		Object.defineProperty( this, 'master', {

			get: () => { return this.values['master'] },
			set: ( value ) => {

				value = clamp( value, 0, 100 );

				this.values['master'] = value;

				const input = document.getElementById('master-volume-input');

				input.value = value;

				input
				.parentNode
				.querySelector('.input-range-label span:last-child')
				.innerText = value;
				
				mixer.master.gain.value = value / 100;

				this.save();

			}

		});

		Object.defineProperty( this, 'sfx', {

			get: () => { return this.values['sfx'] },
			set: ( value ) => {

				value = clamp( value, 0, 100 );

				this.values['sfx'] = value;

				const input = document.getElementById('sfx-volume-input');
				
				input.value = value;
				
				input
				.parentNode
				.querySelector('.input-range-label span:last-child')
				.innerText = value;
				
				mixer.sfx.gain.value = value / 100;

				this.save();

			}

		});

		Object.defineProperty( this, 'ui', {

			get: () => { return this.values['ui'] },
			set: ( value ) => {

				value = clamp( value, 0, 100 );

				this.values['ui'] = value;

				const input = document.getElementById('ui-volume-input');
				
				input.value = value;

				input
				.parentNode
				.querySelector('.input-range-label span:last-child')
				.innerText = value;
				
				mixer.ui.gain.value = value / 100;

				this.save();

			}

		});

		Object.defineProperty( this, 'ambience', {

			get: () => { return this.values['ambience'] },
			set: ( value ) => {

				value = clamp( value, 0, 100 );

				this.values['ambience'] = value;

				const input = document.getElementById('ambience-volume-input');
				
				input.value = value;

				input
				.parentNode
				.querySelector('.input-range-label span:last-child')
				.innerText = value;
				
				mixer.ambience.gain.value = value / 100;

				this.save();

			}

		});

		this.init();

	};

	init() {

		let string = localStorage.getItem('UNHOLA-SETTINGS');
		let values;

		if ( !string ) {

			values = {};

			for ( const property in this.values ) {

				if ( property === 'fullscreen' ) values[ property ] = 'OFF';

				values[ property ] = this.values[ property ];

			}

			string = JSON.stringify( values );
			localStorage.setItem('UNHOLA-SETTINGS', string );

		} else {

			values = JSON.parse( string );

			for ( const property in values ) {

				if ( this.values[ property ] === undefined ) continue;

				this.values[ property ] = values[ property ];

			}

		}


		// Apply settings
		for ( const property in values ) {

			this[ property ] = values[ property ];

		}

	};

	save() {

		const values = {};

		for ( const property in this.values ) {

			if ( property === 'fullscreen' ) values[ property ] = false;

			values[ property ] = this.values[ property ];

		}

		const string = JSON.stringify( values );

		localStorage.setItem( 'UNHOLA-SETTINGS', string );

	};

};