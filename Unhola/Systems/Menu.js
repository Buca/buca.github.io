import { isVersionCompatible } from '../Utilities.js';

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

		});

		this.game.events.addEventListener('quit', () => {

			this.close();
			this.open('main-menu');
			
			document
			.getElementById('open-pause-menu-button')
			.classList.add('hidden');

			document
			.getElementById('close-pause-menu-button')
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
		.addEventListener('click', () => {

			this.game.save();

		});

		// Press Screen Page
		document
		.getElementById('press-screen-page')
		.addEventListener('click', () => {

			this.open('main-menu');
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

		});

		// Back to Main Menu
		document
		.querySelector('.back-to-main-menu-button')
		.addEventListener('click', () => {

			this.sound.close.play();
			this.game.quit();

		});

		const masterVolumeInput = document.getElementById('master-volume-input');
		const uiVolumeInput = document.getElementById('ui-volume-input');
		const soundFXVolumeInput = document.getElementById('sound-fx-volume-input');
		const ambienceVolumeInput = document.getElementById('ambience-volume-input');

		const volumeInputs = [ masterVolumeInput, uiVolumeInput, soundFXVolumeInput, ambienceVolumeInput ];

		for ( const input of volumeInputs ) {

			input.addEventListener('input', () => {

				saveSettings(); 
				applySettings();

			});

		}

		applySettings();

		function applySettings() {
		
			const settings = getSettings();

			const volumeInputs = [
				{ input: masterVolumeInput, value: settings.masterVolume },
				{ input: soundFXVolumeInput, value: settings.soundFXVolume },
				{ input: ambienceVolumeInput, value: settings.ambienceVolume },
				{ input: uiVolumeInput, value: settings.uiVolume }
			];

			volumeInputs.forEach(({ input, value }) => {
				input.value = value;
				input.parentNode.querySelector('.input-range-label span:last-child').innerText = value;
			});

			game.sound.mixer.master.gain.value = settings.masterVolume / 100;
			game.sound.mixer.sfx.gain.value = settings.soundFXVolume / 100;
			game.sound.mixer.ambience.gain.value = settings.ambienceVolume / 100;
			game.sound.mixer.ui.gain.value = settings.uiVolume / 100;
		
		};

		function saveSettings() {
		
			const settings = {
				masterVolume: Number(masterVolumeInput.value),
				soundFXVolume: Number(soundFXVolumeInput.value),
				ambienceVolume: Number(ambienceVolumeInput.value),
				uiVolume: Number(uiVolumeInput.value)
			};

			localStorage.setItem('UNHOLA-Settings', JSON.stringify(settings));
		
		};

		function getSettings() {
		
			const settingsString = localStorage.getItem('UNHOLA-Settings');

			if (!settingsString) {
		
				return {
					masterVolume: 100,
					soundFXVolume: 100,
					ambienceVolume: 100,
					uiVolume: 100
				};
		
			} else {
		
				const settings = JSON.parse(settingsString);

				return {
					masterVolume: Number(settings.masterVolume),
					soundFXVolume: Number(settings.soundFXVolume),
					ambienceVolume: Number(settings.ambienceVolume),
					uiVolume: Number(settings.uiVolume)
				};
		
			}
		
		};

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