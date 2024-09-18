// The code you're about to read contains partially commented code and general disorganization. You have been warned.
// Enjoy the health sound effect.

let elapsed = 0;
let startTS = 0;
let pausedTS = 0;
let clockPaused = false;

let lastSpawnTS = -Infinity;
let gameIsPaused = true;
let lastState = null;
let currentState = null;
const menu = document.querySelector('#menu');
const newGameButton = document.getElementById('new-game-button');
const continueGameButton = document.getElementById('continue-button');
const quitGameButton = document.getElementById('quit-button');
const leaderboardButtons = document.querySelectorAll('.leaderboard-button');
const killsValue = document.querySelector('#kills .value');
const timeValue = document.querySelector('#time .value');
const healthElem = document.getElementById('health');
const localStorageScoresKey = 'box-bandit';


// Bullets array
const bullets = [];

const enemies = []; // Array to hold multiple enemies

// Track mouse position
let mouseX = 0;
let mouseY = 0;

// Game variables
let level = 1;
let kills = 0;

const healthPacks = [];

// Set up the canvas and context
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const canvas2 = document.getElementById('glow-bullets');
const ctx2 = canvas2.getContext('2d');

// Define the player object
const player = {
	x: canvas.width/2 - 20,
	y: canvas.height/2 - 20,
	vx: 0,
	vy: 0,
	width: 40,
	height: 40,
	color: '#6fffd0',
	speed: 5,
	health: 3,
	angle: 0,
	reload: 100
};

const friction = 0.95;

const controls = new Map();
controls.set('w', false);
controls.set('a', false);
controls.set('s', false);
controls.set('d', false);
controls.set('shoot', false);

let lastShotTS = null;

const sounds = new Map();

addSound('hit.ogg');
addSound('death.ogg');
addSound('shoot.ogg');
addSound('hurt.ogg');
addSound('health.ogg');

function setState( name ) {

	lastState = currentState;
	currentState = name;

};

function resizeCanvas() {

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	canvas2.width = window.innerWidth;
	canvas2.height = window.innerHeight;

	ctx.shadowColor = "aliceblue"; // string
	ctx.shadowBlur = 150; // integer
	ctx2.shadowColor = "aliceblue"; // string
	ctx2.shadowBlur = 20; // integer

};

function init() {

	if ( !localStorage.getItem(localStorageScoresKey) ) {

		localStorage.setItem(localStorageScoresKey, JSON.stringify([]));

	}

	newGameButton.addEventListener('click', () => {
		startGame();
	});

	continueGameButton.addEventListener('click', () => {
		resumeGame();
	});

	quitGameButton.addEventListener('click', () => {
		pauseGame();
		openStartMenu()
	});

	for ( const button of leaderboardButtons ) {
		button.addEventListener('click', () => {
			openLeaderboard();
		});

	}

	// Set canvas dimensions
	window.addEventListener('resize', resizeCanvas, false);

	resizeCanvas();

	document.addEventListener("visibilitychange", () => { 
		if ( currentState === 'game' ) pauseGame(); 
	} );

	window.addEventListener('keyup', (e) => {
		if ( gameIsPaused ) return;
		const key = e.key.toLowerCase();
		if ( controls.has( key ) ) {
			e.preventDefault();
			controls.set(key, false);
		}
	});

	window.addEventListener('mousedown', () => {
		controls.set('shoot', true);
	});

	window.addEventListener('mouseup', () => {
		controls.set('shoot', false);
	});

	window.addEventListener('mousemove', (e) => {
		const rect = canvas.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	});

	document.getElementById('go-back-button').addEventListener('click', () => {

		openStartMenu();

	});

	document.getElementById('submit-score').addEventListener('click', () => {

		submitScore();
		openLeaderboard();

	});

	document.getElementById('restart-game').addEventListener('click', () => {

		startGame();
		closeMenu();

	});

	window.addEventListener('keydown', (e) => {

		const key = e.key.toLowerCase();

		if (currentState === 'start-menu') {

			// Escape does nothing

		} else if (currentState === 'game') {

			if (key === 'escape') {

				openPauseMenu();
				pauseGame();

			} else if (controls.has( key )) {

				controls.set(key, true);

			}

		} else if (currentState === 'score-submission-form') {

			if (key === 'escape') {

				closeMenu();
				startGame();

			} else if (key === 'enter' && document.activeElement !== document.getElementById('restart-game')) {

				submitScore();
				openLeaderboard();

			}

		} else if (currentState === 'leaderboard') {

			if (key === 'escape') {

			   openStartMenu();
			   
			}

		} else if (currentState === 'pause-menu') {

			if (key === 'escape') {

				closeMenu();
				resumeGame();

			}

		}

	});

	openStartMenu();

};

function openLeaderboard() {

	setState('leaderboard');

	for ( const page of document.querySelectorAll('.menu-container') ) {
		page.classList.add('hidden');
	}

	const leaderboard = document.getElementById('leaderboard');

	leaderboard.classList.remove('hidden');

	const leaderboardScores = document.getElementById('leaderboard-scores');

	const scores = getScores();

	for ( let i = leaderboardScores.children.length; i > 1 ; i -- ) leaderboardScores.children[ i - 1 ].remove();

	scores.sort( (a,b) => b.kills - a.kills );

	for ( let i = 0; i < scores.length; i ++ ) {

		const entry = document.createElement('div');
		const name = document.createElement('div');
		const kills = document.createElement('div');
		const time = document.createElement('div');
		entry.classList.add('row');
		entry.append( name, kills, time );
		name.innerText = scores[ i ].name;
		kills.innerText = scores[ i ].kills;
		time.innerText = formatTime( scores[ i ].time );
		leaderboardScores.append( entry );
	
	}

	openMenu();

	document.getElementById('go-back-button').focus();

};

function submitScore() {

	const input = document.querySelector('#score-submission-form input');
	if ( input.value.length === 0 ) {

		input.classList.add('field-missing');

	} else {

		const elapsedTime = document.querySelector('#score .time .value').innerText
		let [ minutes, seconds ] = elapsedTime.split(':');
		minutes = parseFloat( minutes );
		seconds = parseFloat( seconds );
		const time = minutes*60 + seconds;
		const totalKills = parseInt(document.querySelector('#score .kills .value').innerText);
		addScore( input.value, totalKills, time );

	}

};

function newGame() {

	setState('game');
	resetGame();
	gameIsPaused = false;

};

function openStartMenu() {

	setState('start-menu');

	for ( const page of document.querySelectorAll('.menu-container') ) {
		page.classList.add('hidden');
	}

	document
		.getElementById('start-menu')
		.classList.remove('hidden');

	openMenu();

	document.getElementById('new-game-button').focus();

};

function pauseGame() {

	openPauseMenu();
	gameIsPaused = true;
	resetControls();
	pauseClock();   

};

function resumeGame() {

	setState('game');
	closeMenu();
	gameIsPaused = false;
	startClock();

};

function openPauseMenu() {

	setState('pause-menu');

	for ( const page of document.querySelectorAll('.menu-container') ) {
		page.classList.add('hidden');
	}

	document
		.getElementById('pause-menu')
		.classList.remove('hidden');

	openMenu();

	document.getElementById('continue-button').focus();

};

function startGame() {

	setState('game');
	closeMenu();
	resetGame();
	startClock();
	gameIsPaused = false;

};

function togglePause() {

	const menu = document.getElementById('menu');
	const continueGame = document.getElementById('continue-button');
	gameIsPaused = !gameIsPaused;
	if ( !gameIsPaused ) {

		startClock()
		menu.classList.add('hidden');

	} else {

		pauseClock();
		menu.classList.remove('hidden');
		continueGame.focus();
	
	}

};

// Update the light's position to follow the player
function drawGradient() {
	const x = player.x + player.width / 2;
	const y = player.y + player.height / 2;
	const grad = ctx.createRadialGradient(
		x, y, 20, 
		x, y, 975
	);
	grad.addColorStop(0, "#333");
	grad.addColorStop(1, "#111");
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

};

// Player movement
function movePlayer() {

	// Calculate the angle between the player and the mouse
	const dx = mouseX - player.x;
	const dy = mouseY - player.y;
	player.angle = Math.atan2(dy, dx); // Angle in radians

	if (controls.get('w') && player.y > 0) {
		player.y -= player.speed;
	}
	if (controls.get('a') && player.x > 0) {
		player.x -= player.speed;
	}
	if (controls.get('s') && player.y + player.height < canvas.height) {
		player.y += player.speed;
	}
	if (controls.get('d') && player.x + player.width < canvas.width) {
		player.x += player.speed;
	}

	player.x += player.vx / 60;
	player.y += player.vy / 60;
	player.x = Math.min(Math.max(player.x, 0), canvas.width - player.width);
	player.y = Math.min(Math.max(player.y, 0), canvas.height - player.height)

	player.vx *= friction;
	player.vy *= friction;

};

// Bullet shooting mechanic
function shootBullet() {

	const now = nowClock();
	const width = player.width / 2;
	const height = player.height / 2;
	const angle = player.angle;

	if ( lastShotTS + 100 <= now ) {

		const bulletSpeed = 7;
		const r = Math.random()*Math.PI/16 - Math.PI/32;
		bullets.push({
			x: player.x + width + (width+5)*Math.cos(angle),
			y: player.y + height + (height+5)*Math.sin(angle),
			width: 5,
			height: 5,
			dx: Math.cos(angle + r) * bulletSpeed,
			dy: Math.sin(angle + r) * bulletSpeed
		});
		lastShotTS = now;
		playSound('shoot');
	}

};

// Check collision between bullet and enemy
function moveBullets() {

	for ( let i = 0; i < bullets.length; i ++ ) {

		const bullet = bullets[ i ];
		
		bullet.x += bullet.dx;
		bullet.y += bullet.dy;

		// Remove bullets if they go off-screen
		if ( bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height ) {
			bullets.splice( i, 1 );
		}

	}

};

// Draw bullets
function drawBullets() {

	for ( const bullet of bullets ) {

		ctx2.beginPath();
		ctx2.moveTo(bullet.x - 2*bullet.dx, bullet.y - 2*bullet.dy);
		ctx2.lineTo(bullet.x + bullet.dx, bullet.y + bullet.dy);
		ctx2.lineWidth = 3;
		ctx2.strokeStyle = "aliceblue";
		ctx2.stroke();

	}

};

function spawnEnemy() {

	const side = Math.floor(Math.random() * 4); // Randomly choose a side (0: top, 1: right, 2: bottom, 3: left)

	let x, y;
	const rsize = 3 + Math.round(3*Math.random()); 
	const enemySize = rsize * 10;

	if ( side === 0 ) { // Top
		x = Math.random() * canvas.width;
		y = -enemySize;
	} else if ( side === 1 ) { // Right
		x = canvas.width + enemySize;
		y = Math.random() * canvas.height;
	} else if ( side === 2 ) { // Bottom
		x = Math.random() * canvas.width;
		y = canvas.height + enemySize;
	} else { // Left
		x = -enemySize;
		y = Math.random() * canvas.height;
	}

	// Create a new enemy and push it into the enemies array
	enemies.push({

		x: x,
		y: y,
		vx: 0,
		vy: 0,
		width: enemySize,
		height: enemySize,
		color: '#CCC',
		health: rsize,
		speed: 1 + Math.random()*7,
		type: Math.round(Math.random())

	});

};

function openMenu() {

	document
		.getElementById('menu')
		.classList.remove('hidden');

	const canvases = document.querySelectorAll('canvas');

	for ( const canvas of canvases ) {

		canvas.style.filter = 'blur(4px)';

	}

};

function closeMenu() {

	document
		.getElementById('menu')
		.classList.add('hidden');

	const canvases = document.querySelectorAll('canvas');

	for ( const canvas of canvases ) {

		canvas.style.filter = 'blur(0px)';

	}

};

function getScores() {

	let scores = localStorage.getItem( localStorageScoresKey );
	
	scores = JSON.parse( scores );

	const n = scores.length;

	if ( n === 0 ) return [];
	else return scores;

};

function formatTime( time ) {

	let seconds = (parseInt(time) % 60).toString();
	seconds = seconds.length === 1 ? '0' + seconds : seconds;
	let minutes = (Math.floor(parseInt(time)/60)).toString();
	minutes = minutes.length === 1 ? '0' + minutes : minutes;

	return minutes + ':' + seconds; 

};

function addScore( name, kills, time ) {

	const scores = getScores();

	scores.push({
		name: name, 
		kills: kills, 
		time: time
	});

	localStorage.setItem( localStorageScoresKey, JSON.stringify( scores ) );

};

function getLastSavedName() {

	const scores = getScores();
	const n = scores.length;

	if ( n === 0 ) return false;
	else return scores[ n - 1 ].name;

};

function openSubmitScoreForm() {

	setState('score-submission-form');

	for ( const page of document.querySelectorAll('.menu-container') ) {
		page.classList.add('hidden');
	}

	document
		.getElementById('score-submission-form')
		.classList.remove('hidden');

	document.querySelector('#score .kills .value').innerText = kills;
	document.querySelector('#score .time .value').innerText = formatTime(Math.floor(nowClock()/1000));

	const input = document.querySelector('#score-submission-form input');
	input.focus();

	const name = getLastSavedName();

	if ( name ) input.value = name;

	openMenu();

};

function playerDeath() {

	pauseGame();
	openSubmitScoreForm();

};

// Collision with enemy
function checkCollisionWithEnemies() {

	for ( let i = enemies.length; i > 0; i -- ) {

		const enemy = enemies[ i - 1 ];

		if (player.x < enemy.x + enemy.width &&
			player.x + player.width > enemy.x &&
			player.y < enemy.y + enemy.height &&
			player.y + player.height > enemy.y) {
			player.vx += 3*enemy.vx;
			player.vy += 3*enemy.vy;
			player.health--;
			kills += 1;
			playSound( 'hurt', 0.2 );
			playSound( 'death', 0.2 );
			enemies.splice( i - 1, 1 ); // Remove enemy after collision
			if ( player.health === 0 ) playerDeath();
			
		}

	}

};

function addSound( source ) {

	const [ name, extension ] = source.split('.');

	sounds.set( name, new Audio( source ) );

};

function playSound( name, volume = 0.1 ) {

	const sound = sounds.get( name );

	if ( sound ) {

		sound.currentTime = 0;
		sound.volume = volume;
		sound.play();

	}

};

function checkBulletEnemyCollision() {

	for ( let i = bullets.length; i > 0; i -- ) {
		
		const bullet = bullets[ i - 1 ];

		for ( let j = enemies.length; j > 0; j -- ) {

			const enemy = enemies[ j - 1 ];

			if (bullet.x < enemy.x + enemy.width &&
				bullet.x + bullet.width > enemy.x &&
				bullet.y < enemy.y + enemy.height &&
				bullet.y + bullet.height > enemy.y) {


				bullets.splice( i - 1, 1 );
				enemy.health --;
				enemy.width -= 4;
				enemy.height -= 4;
				enemy.vx += 30*bullet.dx;
				enemy.vy += 30*bullet.dy;
			
				playSound('hit', 0.2);

				if ( enemy.health === 0 ) {

					const shouldDrop = Math.random() < 0.2;

					if ( shouldDrop ) createHealthPack( enemy.x, enemy.y, nowClock() );
					
					enemies.splice( j - 1, 1 );
					kills ++;

					playSound('death', 0.2);

				}

			}


		}

	}
	/*bullets.forEach((bullet, bulletIndex) => {
		enemies.forEach((enemy, enemyIndex) => {
			if (bullet.x < enemy.x + enemy.width &&
				bullet.x + bullet.width > enemy.x &&
				bullet.y < enemy.y + enemy.height &&
				bullet.y + bullet.height > enemy.y) {
				// Bullet hits the enemy
				playHitEnemySound();
				bullets.splice(bulletIndex, 1); // Remove bullet
				enemy.health--;
				enemy.width -= 4;
				enemy.height -= 4;
				enemy.x += 2;
				enemy.y += 2;
				enemy.vx += 30 * bullet.dx;
				enemy.vy += 30 * bullet.dy;
				if (enemy.health === 0) {
					if ( Math.random() < 0.2 ) createHealthPack( enemy.x, enemy.y, nowClock() ); 
					enemies.splice(enemyIndex, 1); // Remove enemy
					kills += 1; // Add score for hitting the enemy
					playEnemyDeathSound();
				}
			}
		});
	});*/

};

function moveEnemiesTowardPlayer() {

	for ( const enemy of enemies ) {

		if ( enemy.type === 0 ) {

			const dx = player.x - enemy.x;
			const dy = player.y - enemy.y;
			const distance = (dx**2 + dy**2)**(1/2);

			enemy.vx += enemy.speed*dx/distance;
			enemy.vy += enemy.speed*dy/distance;

		} else {

			if (enemy.x < player.x) enemy.vx += enemy.speed;
			if (enemy.x > player.x) enemy.vx -= enemy.speed;
			if (enemy.y < player.y) enemy.vy += enemy.speed;
			if (enemy.y > player.y) enemy.vy -= enemy.speed;

		}
	
		enemy.x += (enemy.vx) * 1 / 60;
		enemy.y += (enemy.vy) * 1 / 60;
		enemy.vx *= friction;
		enemy.vy *= friction;
	
	};

};

function checkHealthPackCollision() {

	for ( let i = healthPacks.length; i > 0; i -- ) {

		const pack = healthPacks[ i - 1 ];

		if ( player.x < pack.x + 40 &&
			 player.x + player.width > pack.x &&
			 player.y < pack.y + 40 &&
			 player.y + player.height > pack.y ) {

			player.health = Math.min(10, player.health + 1);
			healthPacks.splice( i - 1, 1 );
			playSound('health');

		}

	}

};

function resetControls() {

	controls.set('w', false);
	controls.set('a', false);
	controls.set('s', false);
	controls.set('d', false);
	controls.set('shoot', false);
	lastShotTS = 0;

};

function resetLevel() {
	
	level = 1;
	kills = 0;

};

function startClock() {

	clockPaused = false;
	startTS = Date.now();

};

function pauseClock() {

	clockPaused = true;
	pausedTS = Date.now();
	elapsed += pausedTS - startTS;

};

function resetClock() {

	elapsed = 0;
	startTS = Date.now();

};

function nowClock() {

	if ( clockPaused ) return elapsed;
	else return elapsed - startTS + Date.now();

};

function createHealthPack( x, y, time ) {

	healthPacks.push({ x, y, time });

};

function drawHealthPack( pack ) {

	ctx.fillStyle = 'aliceblue';
	ctx.fillRect(pack.x - 5, pack.y - 5, 10, 10);

};

function drawHealthPacks() {

	for ( const pack of healthPacks ) {
		
		ctx.save();
		ctx.translate(pack.x + 5, pack.y + 5); // Move to player center
		ctx.scale(0.75, 0.75);
		ctx.rotate(Math.PI/4); // Rotate player towards mouse
		ctx.fillStyle = player.color;
		ctx.fillRect(-26, -26, 44, 44)
		ctx.fillStyle = '#1a2a38';
		ctx.fillRect(-24, -24, 40, 40)
		ctx.fillStyle = player.color;
		ctx.fillRect(-5, -5, 10, 10);
		ctx.fillRect(-5, -15, 10, 10);
		ctx.fillRect(-15, -5, 10, 10);
		ctx.restore();

	}

};

function resetGame() {

	resetControls();
	resetLevel();
	resetClock();
	lastSpawnTS = -Infinity;
	player.health = 3;
	player.x = canvas.width/2 + 20;
	player.y = canvas.height/2 + 20;
	player.vx = 0;
	player.vy = 0;
	enemies.length = 0;
	bullets.length = 0;
	healthPacks.length = 0;

};

function drawPlayer() {

	const x = player.x;
	const y = player.y;
	const w = player.width;
	const h = player.height;
	const angle = player.angle;
	const color = player.color;
	
	ctx.save();
	ctx.translate( x + h/2, y + h/2 ); // Move to player center
	ctx.rotate( angle ); // Rotate player towards mouse
	ctx.fillStyle = color;
	ctx.fillRect(-w/2, -h/2, w, h); // Draw the player at rotated position
	ctx.restore();

};

function drawEnemies() {

	for ( const enemy of enemies ) {

		ctx.fillStyle = enemy.color;
		ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

	}

};

function drawSight() {

	const centerX = player.x + player.width/2;
	const centerY = player.y + player.height/2;
	const angle = player.angle;

	ctx.beginPath();
	ctx.moveTo(centerX, centerY);
	ctx.lineTo(centerX + 10000*Math.cos(angle), centerY + 10000*Math.sin(angle));
	ctx.lineWidth = 3;
	ctx.strokeStyle = "rgba(100,100,100,0.25)";
	ctx.stroke();

};

function resolveEnemyCollisions() {

	for ( let i = 0; i < enemies.length; i ++ ) {
		for ( let j = i + 1; j < enemies.length; j ++ ) {
			
			const enemyA = enemies[ i ];
			const enemyB = enemies[ j ];

			// Calculate the distance between the centers of the two enemies
			const dx = enemyB.x + enemyB.width / 2 - (enemyA.x + enemyA.width / 2);
			const dy = enemyB.y + enemyB.height / 2 - (enemyA.y + enemyA.height / 2);
			const distance = Math.sqrt(dx * dx + dy * dy);

			// Check if the distance is less than the sum of the half widths (collision detected)
			const minDist = (enemyA.width + enemyB.width) / 2;
			
			if (distance < minDist) {

				// Calculate the overlap
				const overlap = minDist - distance;

				// Normalize the direction vector
				const nx = dx / distance;
				const ny = dy / distance;

				// Separate the enemies based on their overlap
				enemyA.x -= nx * overlap / 2;
				enemyA.y -= ny * overlap / 2;
				enemyB.x += nx * overlap / 2;
				enemyB.y += ny * overlap / 2;

				// Optionally, adjust velocities to give a "bounce" effect
				const combinedSpeed = (enemyA.speed + enemyB.speed) / 2;
				enemyA.vx -= nx * combinedSpeed * 0.1;
				enemyA.vy -= ny * combinedSpeed * 0.1;
				enemyB.vx += nx * combinedSpeed * 0.1;
				enemyB.vy += ny * combinedSpeed * 0.1;
			}
		}
	}

};

function enemySpawningSystem() {

	const now = nowClock();

	if ( lastSpawnTS + 10000 <= now ) {

		for ( let i = 0; i < 1 + Math.random()*now/10000; i ++ ) spawnEnemy();
		lastSpawnTS = now;

	}

};

function updateHealthPacks() {

	const now = nowClock();

	for ( let i = healthPacks.length; i > 0; i -- ) {

		const pack = healthPacks[ i - 1 ];

		if ( now > pack.time + 15000 ) {

			healthPacks.splice( i - 1, 1 );

		}

	}

};

function updateStats() {

	killsValue.innerText = kills;
	const now = nowClock();
	let seconds = (Math.floor(now/1000) % 60).toString();
	seconds = seconds.length === 1 ? '0' + seconds : seconds;
	let minutes = (Math.floor(now/(1000*60))).toString();
	minutes = minutes.length === 1 ? '0' + minutes : minutes;
	timeValue.innerText = minutes + ':' + seconds;

	if ( player.health > healthElem.children.length ) {

		const delta = player.health - healthElem.children.length;
		for ( let i = 0; i < delta; i ++ ) {
			const heart = document.createElement('div');
			heart.classList.add('heart');
			health.append( heart );
		}

	} else if ( player.health < healthElem.children.length ) {

		const delta = healthElem.children.length - player.health;
		for ( let i = healthElem.children.length; i > 0; i -- ) healthElem.children[ i - 1 ].remove();

	}

};

function updateGameLogic() {

	if ( controls.get('shoot') ) shootBullet();
	enemySpawningSystem();
	movePlayer();
	moveEnemiesTowardPlayer();
	resolveEnemyCollisions();
	moveBullets();
	checkCollisionWithEnemies();
	checkHealthPackCollision();
	checkBulletEnemyCollision();
	updateHealthPacks();

};

function updateGameGraphics() {

	drawGradient();
	drawSight();
	drawBullets();
	drawPlayer();
	drawEnemies();
	drawHealthPacks();

};

// Main game loop
function update() {

	if ( !gameIsPaused ) {

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

		updateGameLogic();
		updateGameGraphics();
		updateStats();
	}

	requestAnimationFrame(update);

};

init();

update();