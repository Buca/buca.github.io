import { Game } from './Game.js';

const game = new Game({});
await game.load();
let started = false;

// Move this to the Menu system
document.body.addEventListener('click', () => {
    if (started) return;
    started = true;

    // Resume Web Audio context if suspended
    if (game.sound.listener.context.state === 'suspended') {
        game.sound.listener.context.resume().then(() => {
            console.log('🔊 Web Audio Context Resumed');
        });
    }

    //document.body.append(game.graphics.renderer.domElement);
   // game.new({ level: 1 });
});


/*
Save file
{
	seed: 123,
	level: 3,
	player: { r, y },
	enemies: [
		{ r, y },
		{ r, y },
		{ r, y },
		...
	]
}

*/