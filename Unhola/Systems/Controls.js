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

		});

		const jumpButton = document.getElementById('jump-button');
		let pointerDown = false;
		let moving = false;
/*
		document.addEventListener('pointerdown', (event) => {

			if ( this.paused || !this.touch ) return;

		    pointerDown = true;

		    if (event.target !== jumpButton) {
		        pointerOneSide(event);
		        moving = true;
		    }

		});

		document.addEventListener('pointerup', (event) => {

			if ( this.paused || !this.touch ) return;

			const player = this.game.player;

		    pointerDown = false;

		    if (event.target === jumpButton) {
		        
		        player.jumping = false;
		        return; // Prevent stopping movement when releasing the jump button
		    
		    }

		    moving = false;
		    player.movingLeft = false;
		    player.movingRight = false;
		    player.goDown = false;

		});

		document.addEventListener('pointermove', (event) => {
		    
			if ( this.paused || !this.touch ) return;

		    if (pointerDown && moving) pointerOneSide(event);
		
		});*/

		const openPauseMenuButton = document.getElementById('open-pause-menu-button');

		const pointerOneSide = (event) => {

			if ( event.target === openPauseMenuButton ) {
				return;
			}

			const player = this.game.player;
		    const width = document.body.clientWidth;
		    const pointerX = event.clientX;

		    if (pointerX < (width - 64) / 2) {
		
		        player.movingRight = true;
		        player.movingLeft = false;
		
		    } else if (pointerX > (width + 64) / 2) {
		
		        player.movingLeft = true;
		        player.movingRight = false;
		
		    }
		
		}

		// Handle Jump Button Separately
		jumpButton.addEventListener('pointerdown', () => {
		
			if ( this.paused || !this.touch ) return;

			const player = this.game.player;

		    player.jumping = true;
		
		});

		jumpButton.addEventListener('pointerenter', () => {
		
			if ( this.paused || !this.touch ) return;
			
			const player = this.game.player;

		    if (pointerDown) player.jumping = true;
		
		});

		jumpButton.addEventListener('pointerup', () => {
			
			if ( this.paused || !this.touch ) return;

			const player = this.game.player;

		    player.jumping = false;
		
		});

		jumpButton.addEventListener('pointerout', () => {
		
			if ( this.paused || !this.touch ) return;

			const player = this.game.player;

		    player.jumping = false;
		
		});

	};

	pause() { this.paused = true; };

	resume() { this.paused = false; };
	
}