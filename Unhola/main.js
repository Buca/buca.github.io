import { Game } from './Game.js';


const game = new Game({});
game.pause();
await game.load();
let once = false;

document.body.addEventListener( 'click', () => {

	if ( once ) return;

	once = true;

	document
		.getElementById('press-screen-page')
		.classList.add('hidden');

	document.body.append( game.graphics.renderer.domElement );

	game.new({
		sections: game.level
	});
	
	game.start();

});
