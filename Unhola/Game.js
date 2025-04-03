import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { isVersionCompatible } from './Utilities.js';

import { Dynamic } from './Components/Dynamic.js';
import { Fixed } from './Components/Fixed.js';

import { Entity } from './Systems/Entity.js';
import { Physics } from './Systems/Physics.js';
import { Graphics } from './Systems/Graphics.js';
import { Sound } from './Systems/Sound.js';
import { Menu } from './Systems/Menu.js';
import { Generator } from './Systems/Generator.js';
import { Controls } from './Systems/Controls.js';

import { XORShift } from 'https://cdn.jsdelivr.net/npm/random-seedable@1.0.8/+esm';

import { Player } from './Entities/Player.js';
import { Enemy } from './Entities/Enemy.js';
import { Goal } from './Entities/Goal.js';

export class Game {

	constructor({ version = "1.1.0", seed = 62832, gravity = -0.053, radius = { min: 4, max: 20 } }) {

		this.version = version;
		this.compatability = "^1.1.0";

		this.seed = seed;

		// Game settings:
		this.gravity = gravity;
		this.radius = radius;

		Object.defineProperty( this.radius, 'center', {

			get: () => {

				const min = this.radius.min;
				const max = this.radius.max;

				return (max - min)/2 + min;

			}

		});

		this.numOfPoints = 20;

		// Components
		this.entity = new Entity();
		this.dynamic = new Dynamic( this.radius.center );
		this.fixed = new Fixed();

		// Systems
		this.events = new EventTarget();
		this.sound = new Sound( this );
		this.graphics = new Graphics( this );
		this.physics = new Physics( this );

		this.menu = new Menu( this );
		this.generator = new Generator( this ); //TODO: change name to generator
		this.controls = new Controls( this );

		// Entities
		this.enemies = [];
		this.player = undefined; 

		// Game properties
		this.started = false;
		this.paused = true;
		this.level = 1;

		this.FIXED_DT = 16.67;
		let accumulatedTime = 0;

		this.lastTS = Date.now();

		const update = () => {
		    
		    const currentTS = Date.now();
		    let delta = currentTS - this.lastTS;
		    this.lastTS = Date.now();

		    requestAnimationFrame(update);

		    if (!this.paused) {
		    
		        accumulatedTime += delta;

		        while (accumulatedTime >= this.FIXED_DT) {

		            this.physics.update( this.FIXED_DT );
		            accumulatedTime -= this.FIXED_DT;
		        
		        }

		        this.graphics.update( delta );
		    
		    }

		};

		update();

	};

	async load() {

		await this.sound.load([
			'Jump 1',
			'Death',
			'Distant Birds',
			'Whispering',
			'Walking',
			'Wind',
			'Enemy Voice 1',
			'Enemy Voice 2',
			'Enemy Voice 3',
			'Enemy Voice 4',
			'Land 1',
			'Player Death',
			'Start',
			'Click',
			'Close'
		]);

		await this.graphics.load();

		this.events.dispatchEvent(new Event('loaded'));

	};

	save() {
		
		const game = {

			"version": this.version,
			"seed": this.seed,
			"level": this.level,
			"player": this.player.toJSON(),
			"goal": this.goal.toJSON(),
			"enemies": []

		};

		for ( const enemy of this.enemies ) {

			game.enemies.push( enemy.toJSON() );

		}

		localStorage.setItem(`Unhola`, JSON.stringify( game ));

	};

	continue() {

		const saveStringified = localStorage.getItem('Unhola');

		if ( !saveStringified ) return;

		const game = JSON.parse( saveStringified );

		if ( isVersionCompatible( game.version, this.compatability ) ) {

			document
			.getElementById('ingame-loader')
			.classList.remove('hidden');

			//setTimeout( () => {

				this.seed = game.seed;
				this.level = game.level;

				this.graphics.reset();
				this.fixed.reset();
			
				this.generator.create( this.level );

				this.goal.r = game.goal.r;
				this.goal.y = game.goal.y;

				this.player.r = game.player.r;
				this.player.y = game.player.y;

				for ( let i = this.enemies.length - 1; i >= 0; i -- ) {

					this.enemies[ i ].dispose();

				}

				for ( let i = 0; i < game.enemies.length; i ++ ) {

					this.enemies.push( new Enemy({
					
						game: this,
						...game.enemies[ i ] 
					
					}));

				}


				this.start();
				
				document
				.getElementById('ingame-loader')
				.classList.add('hidden');

			//}, 0 );

		}

	};

	new({ level }) {

		document
			.getElementById('ingame-loader')
			.classList.remove('hidden');
		

		//setTimeout( () => {

			this.graphics.reset();
			this.fixed.reset();
			this.generator.create( level );

			if ( !this.player ) {

				this.player = new Player({

					game: this,
					r: this.spawn.r,
					y: this.spawn.y,
					controls: true

				});

				this.player.init();


			} else this.player.reset();

			while ( this.enemies.length > 0 ) this.enemies[0].dispose();
    	
			
		    // Reset the pool, but *not* the data array itself.
		    this.dynamic.pool = [];

		    // Correctly handle the dynamic data.
		    const playerIndex = this.player.dynamic; // Save the player index
		    const playerData = this.dynamic.data.slice(playerIndex, playerIndex + 8); // Save player data

		    // Clear the dynamic array, but keep the player data.
		    this.dynamic.data = [];
		    this.dynamic.data.push(...playerData);
			
			console.log( 'Empty spots: ', this.dynamic.pool.toString() );
			console.log( 'After disposal: ', this.dynamic.data.toString() );

			for ( let i = 0; i < 7*level; i ++ ) {

				this.enemies.push( new Enemy({

					game: this,
					r: this.spawn.r - i*1.45 - 0.6,
					y: this.spawn.y + i*1.45 + 8.25

				}));

			}

			console.log( 'Dynamic entities:', this.dynamic.data );


			if ( !this.goal ) {

				this.goal = new Goal({

					game: this,
					r: this.win.r,
					y: this.win.y

				});

			} else this.goal.reset();

			this.step();

			document
			.getElementById('ingame-loader')
			.classList.add('hidden');
		
		//}, 0 );

	};

	async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake lock is active');
                
                // Re-acquire wake lock if it gets released (e.g., if the user switches tabs)
                this.wakeLock.addEventListener('release', () => {
                    console.log('Wake lock released');
                    this.wakeLock = null;
                });
            } catch (err) {
                console.error('Failed to acquire wake lock:', err);
            }
        }
    };

    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release().then(() => {
                console.log('Wake lock released manually');
                this.wakeLock = null;
            });
        }
    };

    async start() {
        this.started = true;
        this.paused = false;
        this.events.dispatchEvent(new Event('start'));
        await this.requestWakeLock();
    };

    async resume() {
        this.paused = false;
        this.events.dispatchEvent(new Event('resume'));
        await this.requestWakeLock();
    };

    pause() {
        this.paused = true;
        this.events.dispatchEvent(new Event('pause'));
        this.releaseWakeLock();
    };

    quit() {
        this.paused = true;
        this.started = false;
        this.events.dispatchEvent(new Event('quit'));
        this.releaseWakeLock();
    };

	step() {

		this.physics.update(this.FIXED_DT);
		this.graphics.update(0);

	};

};
