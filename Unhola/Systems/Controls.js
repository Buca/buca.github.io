import { isTouchDevice } from '../Utilities.js';

export class Controls {

	constructor( game ) {

		this.game = game;
		this.paused = true;
		this.touch = isTouchDevice();

		this.game.events.addEventListener('start', () => {

			this.paused = false;
			if ( this.touch ) jumpButton.classList.remove('hidden');

		});

		this.game.events.addEventListener('resume', () => {

			this.paused = false;
			if ( this.touch ) jumpButton.classList.remove('hidden');

		});

		this.game.events.addEventListener('pause', () => {

			this.paused = true;
			if ( this.touch ) jumpButton.classList.add('hidden');

		});

		this.game.events.addEventListener('quit', () => {

			this.paused = true;
			if ( this.touch ) jumpButton.classList.add('hidden');

		});

		// Desktop/Keyboard Controls
		document.addEventListener("keydown", ( event ) => {

			const code = event.code;
			const player = this.game.player;

			console.log()

			if ( !this.paused ) {
				
				if ( code === 'KeyA' ) player.movingRight = true;
				if ( code === 'KeyD' ) player.movingLeft = true;
				if ( code === 'Space' ) player.jumping = true;
			
			}

		});

		document.addEventListener("keyup", ( event ) => {

			const code = event.code;
			const player = this.game.player;

			if ( code === 'KeyA' ) player.movingRight = false;
			if ( code === 'KeyD' ) player.movingLeft = false
			if ( code === 'Space' ) player.jumping = false;

		});

		// Mobile/Pointer Controls
		const jumpButton = document.getElementById('jump-button');
		let pointerDown = false;
		let moving = false;

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

		});

		document.addEventListener('pointermove', (event) => {
		    
			if ( this.paused || !this.touch ) return;

		    if (pointerDown && moving) pointerOneSide(event);
		
		});

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