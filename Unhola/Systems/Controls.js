import { isTouchDevice } from '../Utilities.js';

const abs = Math.abs;
const min = Math.min;
const max = Math.max;

export class Controls {

	constructor( game ) {

		this.game = game;
		this.paused = true;
		this.touch = isTouchDevice();

		this.game.events.addEventListener('start', () => {

			this.paused = false;
			if ( this.touch ) {

				joystick.classList.remove('hidden');
				jumpButton.classList.remove('hidden');

			}

		});

		this.game.events.addEventListener('resume', () => {

			this.paused = false;
			if ( this.touch ) {

				joystick.classList.remove('hidden');
				jumpButton.classList.remove('hidden');

			}

		});

		this.game.events.addEventListener('pause', () => {

			this.paused = true;
			if ( this.touch ) {

				joystick.classList.add('hidden');
				jumpButton.classList.add('hidden');

			}

		});

		this.game.events.addEventListener('quit', () => {

			this.paused = true;
			if ( this.touch ) {

				joystick.classList.add('hidden');
				jumpButton.classList.add('hidden');

			}

		});

		// Prevents right clicks and long pressing in touch device from opening the context menu.
		document.addEventListener('contextmenu', event => event.preventDefault());

		// Desktop/Keyboard Controls
		document.addEventListener("keydown", ( event ) => {

			const code = event.code;
			const player = this.game.player;

			if ( !this.paused ) {
				
				if ( code === 'KeyA' ) player.movingRight = 1;
				if ( code === 'KeyD' ) player.movingLeft = 1;
				if ( code === 'Space' ) {

					//player.numberOfJumps ++;
					player.jumping = true;

				}
				if ( code === 'KeyS' ) player.goDown = true;
			
			}

		});

		document.addEventListener("keyup", ( event ) => {

			const code = event.code;
			const player = this.game.player;

			if ( code === 'KeyA' ) player.movingRight = 0;
			if ( code === 'KeyD' ) player.movingLeft = 0;
			if ( code === 'Space' ) {

				player.jumping = false;
			
			}
			if ( code === 'KeyS' ) player.goDown = false;

		});

		

		// Mobile/Pointer Controls
		const joystick = document.querySelector('.joystick');
		const stick = document.querySelector('.stick');
		let pointerDownOnJoystick = false;
		joystick.addEventListener('pointerdown', () => {

			pointerDownOnJoystick = true;

		});

		joystick.addEventListener('pointerup', () => {

			pointerDownOnJoystick = false;

			const player = this.game.player;
			player.movingLeft = 0;
			player.movingRight = 0;
			player.goDown = false;

			stick.style.translate = `0px 0px`;

		});

		joystick.addEventListener('pointermove', ( event ) => {

			if ( !pointerDownOnJoystick ) return;

			const player = this.game.player;

			const width = stick.offsetWidth;
			const height = stick.offsetHeight;
			const maxWidth = joystick.offsetWidth;
			const x = max( -maxWidth/3, min( event.offsetX - width/2, maxWidth/3 ) );
			const y = max( -maxWidth/3, min( event.offsetY - height/2, maxWidth/3 ) );

			if ( x > 0 ) {

				player.movingLeft = min( abs( x / (maxWidth / 4) ), 1 );
				player.movingRight = 0;

			}

			if ( x < 0) {

				player.movingLeft = 0;
				player.movingRight = min( abs( x / (maxWidth / 4) ), 1 );

			}

			if ( y > maxWidth / 4 ) {

				player.goDown = true;

			} else {

				player.goDown = false;

			}

			stick.style.translate = `${x}px ${y}px`;
			stick.style.boxShadow = `${-x/12}px ${-y/12}px 0 8px grey`;

		});

		const jumpButton = document.getElementById('jump-button');
		let pointerDown = false;
		let moving = false;

		const openPauseMenuButton = document.getElementById('open-pause-menu-button');

		// Handle Jump Button Separately
		jumpButton.addEventListener('pointerdown', () => {
		
			if ( this.paused || !this.touch ) return;

			jumpButton.classList.add('pressed');

			const player = this.game.player;

		    player.jumping = true;

		
		});

		jumpButton.addEventListener('pointerenter', () => {
		
			if ( this.paused || !this.touch ) return;

			jumpButton.classList.add('pressed');
			
			const player = this.game.player;

		    if (pointerDown) player.jumping = true;
		
		});

		jumpButton.addEventListener('pointerup', () => {
			
			if ( this.paused || !this.touch ) return;

			jumpButton.classList.remove('pressed');

			const player = this.game.player;

		    player.jumping = false;
		
		});

		jumpButton.addEventListener('pointerout', () => {
		
			if ( this.paused || !this.touch ) return;

			jumpButton.classList.remove('pressed');

			const player = this.game.player;

		    player.jumping = false;
		
		});

	};

	pause() { this.paused = true; };

	resume() { this.paused = false; };
	
}