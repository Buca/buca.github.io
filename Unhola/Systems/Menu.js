import { isVersionCompatible, clamp } from '../Utilities.js';

export class Menu {

	constructor( game ) {

		this.game = game;
		this.closed = true;
		this.breadcrumbs = ['loading-page'];

		const saveStringified = localStorage.getItem('Unhola');
		
		if ( saveStringified ) {

			const save = JSON.parse( saveStringified );

			if ( isVersionCompatible( save.version, this.game.compatability ) ) {

				document.querySelector('.continue-game-button').disabled = false;

			}

		}

		this.game.events.addEventListener('loaded', () => {

			this.sound = {

				click: this.game.sound.create('Click', 'ui'),
				close: this.game.sound.create('Close', 'ui'),
				start: this.game.sound.create('Start', 'ui'),
				wind: this.game.sound.create('Wind', 'ambience'),
				birds: this.game.sound.create('Distant Birds', 'ambience')

			};

			this.sound.click.setVolume( 2 );
			this.sound.start.setVolume( 2 );
			this.sound.close.setVolume( 2 );
			this.sound.wind.setVolume( 2 );
			this.sound.wind.setLoop( true );
			this.sound.birds.setVolume( 3 );
			this.sound.birds.setLoop( true );

		});

		this.game.events.addEventListener('loaded', () => {

			this.open('press-screen-page');


		});

		this.game.events.addEventListener('start', () => {

			this.close();
			
			document
			.getElementById('open-pause-menu-button')
			.classList.remove('hidden');

			document
			.querySelector('.level span:last-child')
			.innerText = this.game.level + "."

			document
			.querySelector('.level')
			.classList.remove('hidden');

		});

		this.game.events.addEventListener('quit', () => {

			this.close();
			this.game.clear();
			this.open('main-menu');
			
			document
			.getElementById('open-pause-menu-button')
			.classList.add('hidden');

			document
			.getElementById('close-pause-menu-button')
			.classList.add('hidden');

			document
			.querySelector('.level')
			.classList.add('hidden');

		});

		this.game.events.addEventListener('resume', () => {

			this.close();

			document
			.getElementById('open-pause-menu-button')
			.classList.remove('hidden');

			document
			.getElementById('close-pause-menu-button')
			.classList.add('hidden');

		});

		this.game.events.addEventListener('pause', () => {

			document
			.querySelector('.save-game-button')
			.innerText = "SAVE";
			
			this.empty();
			this.open('pause-menu');

			document
			.getElementById('open-pause-menu-button')
			.classList.add('hidden');

			document
			.getElementById('close-pause-menu-button')
			.classList.remove('hidden');

		});

		document.addEventListener('keydown', ( event ) => {

			if ( !this.game.started ) return;

			if ( event.code === 'Escape' ) {

				if ( this.game.paused ) {

					this.back();
					if ( this.breadcrumbs.length === 0 ) this.game.resume();

				} else {

					this.sound.click.play();
					this.game.pause();

				}

			}

		});

		// Save game button
		document
		.querySelector('.save-game-button')
		.addEventListener('click', ( e ) => {

			this.game.save();

			e.target.disabled = true;
			e.target.innerText = "SAVING";

			setTimeout(() => {

				e.target.disabled = false;
				e.target.innerText = "SAVED";
				if ( document.activeElement === document.body ) e.target.focus();

			}, 750 );


		});

		// Press Screen Page
		document
		.getElementById('press-screen-page')
		.addEventListener('click', () => {

			this.open('main-menu');
			
			const canvas = this.game.graphics.renderer.domElement;
			document.body.append( canvas );
			canvas.style.opacity = 0;
			canvas.style.transition = "opacity 2s";

			setTimeout( () => canvas.style.opacity = 1, 0 );

			this.sound.wind.play();
			this.sound.birds.play();

		});

		// Open settings menu
		const openSettingsButtons = document.querySelectorAll('.open-settings-menu-button');
		
		for ( const button of openSettingsButtons ) {

			button.addEventListener('click', () => {
				
				this.sound.click.play();
				this.open('settings-menu');
			
			});
		
		}

		const openVideoSettingsButtons = document.querySelectorAll('.open-video-settings-menu-button');
		
		for ( const button of openVideoSettingsButtons ) {

			button.addEventListener('click', () => {
				
				this.sound.click.play();
				this.open('video-settings-menu');
			
			});
		
		}

		const openSoundSettingsButtons = document.querySelectorAll('.open-sound-settings-menu-button');
		
		for ( const button of openSoundSettingsButtons ) {

			button.addEventListener('click', () => {
				
				this.sound.click.play();
				this.open('sound-settings-menu');
			
			});
		
		}

		const openControlsSettingsButtons = document.querySelectorAll('.open-control-settings-menu-button');
		
		for ( const button of openControlsSettingsButtons ) {

			button.addEventListener('click', () => {
				
				this.sound.click.play();
				this.open('control-settings-menu');
			
			});
		
		}

		// Go back button
		const goBackButtons = document.querySelectorAll('.go-back-button');

		for ( const button of goBackButtons ) {

			button.addEventListener('click', () => {

				this.back();
				if ( this.breadcrumbs.length === 0 ) this.game.resume();

			});

		}

		const openPauseMenuButton = document.getElementById('open-pause-menu-button');
		const closePauseMenuButton = document.getElementById('close-pause-menu-button');

		// Pause button
		openPauseMenuButton.addEventListener('click', () => {

			this.sound.click.play();
			this.game.pause();

		});

		// Main Menu
		document
		.querySelector('#main-menu .new-game-button')
		.addEventListener('click', () => {

			this.sound.start.play();
			this.game.new({ level: 1 });
			this.game.start();

		});

		document
		.querySelector('#main-menu .continue-game-button')
		.addEventListener('click', () => {

			this.sound.start.play();
			this.game.continue();
			this.game.start();

		});

		// Back to Main Menu
		document
		.querySelector('.back-to-main-menu-button')
		.addEventListener('click', () => {

			this.sound.close.play();
			this.game.quit();

		});


		// Fullscreen
		const toggleFullscreenButton = document.querySelector('.toggle-fullscreen-button');
		toggleFullscreenButton.addEventListener('click', () => {

			this.game.settings['fullscreen'] = !this.game.settings['fullscreen'];

		});

		// Render Distance
		const renderDistanceInput = document.getElementById('render-distance-input');
		renderDistanceInput.addEventListener('input', () => {

			const value = renderDistanceInput.value;
			this.game.settings['render-distance'] = value;
			this.game.graphics.update();

		});

		// Brightness
		const brightnessInput = document.getElementById('brightness-input');
		brightnessInput.addEventListener('input', () => {

			const value = brightnessInput.value;
			this.game.settings['brightness'] = value;

		});

		// Contrast
		const contrastInput = document.getElementById('contrast-input');
		contrastInput.addEventListener('input', () => {

			const value = contrastInput.value;
			this.game.settings['contrast'] = value;

		});

		// Bloom
		const toggleBloomButton = document.querySelector('.toggle-bloom-button');
		toggleBloomButton.addEventListener('click', () => {

			this.game.settings['bloom'] = !this.game.settings['bloom'];
			this.game.graphics.update();

		});

		// Volumetric Light
		const toggleVolumetricLightButton = document.querySelector('.toggle-volumetric-light-button');
		toggleVolumetricLightButton.addEventListener('click', () => {

			this.game.settings['volumetric-light'] = !this.game.settings['volumetric-light'];
			this.game.graphics.update();

		});

		// Vignette
		const vignetteButton = document.querySelector('.toggle-vignette-button');
		vignetteButton.addEventListener('click', () => {

			this.game.settings['vignette'] = !this.game.settings['vignette'];
			this.game.graphics.update();

		});

		// Noise
		const noiseButton = document.querySelector('.toggle-noise-button');
		noiseButton.addEventListener('click', () => {

			this.game.settings['noise'] = !this.game.settings['noise'];

		});

		// Resolution
		const resolutionButton = document.querySelector('.toggle-resolution-button');
		resolutionButton.addEventListener('click', () => {

			const current = this.game.settings['resolution'];
			const next = Math.max(1, ((current + 1) % 8));

			this.game.settings['resolution'] = next;
			this.game.graphics.update();

		});

		// Master Volume
		const masterVolumeInput = document.getElementById('master-volume-input');
		masterVolumeInput.addEventListener('input', () => {

			const value = masterVolumeInput.value;
			this.game.settings['master'] = value;

		});

		// SFX Volume
		const sfxVolumeInput = document.getElementById('sfx-volume-input');
		sfxVolumeInput.addEventListener('input', () => {

			const value = sfxVolumeInput.value;
			this.game.settings['sfx'] = value;

		});

		// UI Volume
		const uiVolumeInput = document.getElementById('ui-volume-input');
		uiVolumeInput.addEventListener('input', () => {

			const value = uiVolumeInput.value;
			this.game.settings['ui'] = value;

		});

		// Ambience Volume
		const ambienceVolumeInput = document.getElementById('ambience-volume-input');
		ambienceVolumeInput.addEventListener('input', () => {

			const value = ambienceVolumeInput.value;
			this.game.settings['ambience'] = value;

		});

	};

	empty() {

		this.breadcrumbs.length = 0;

	};

	open( id ) {

		const element = document.getElementById( id );
		if ( element ) {


			const lastId = this.breadcrumbs[ this.breadcrumbs.length - 1 ];
			this.breadcrumbs.push( id );
			
			if ( lastId ) {
			
				document.getElementById( lastId )
				.classList.add('hidden');
			
			}

			document.getElementById( id )
			.classList.remove('hidden');

			const button = document
				.getElementById( id )
				.querySelector('button:not(disabled)');

			if ( button ) button.focus();

			this.closed = false;

		}

	};

	back() {

		this.sound.close.play();
		const lastId = this.breadcrumbs.pop();
		const id = this.breadcrumbs[ this.breadcrumbs.length - 1 ];
		
		if ( lastId ) {
			
			document.getElementById( lastId )
			.classList.add('hidden');
		}

		if ( id ) {

			document.getElementById( id )
			.classList.remove('hidden');

			const button = document
				.getElementById( id )
				.querySelector('button:not(disabled)');

			if ( button ) button.focus();
			
			this.closed = false;

		} else {

			this.closed = true;

		}

	};

	close() {

		const pages = document.querySelectorAll('.page');
		const menus = document.querySelectorAll('.menu');

		for ( const menu of menus ) menu.classList.add('hidden');
		for ( const page of pages ) page.classList.add('hidden');

		this.closed = true;

	};

}