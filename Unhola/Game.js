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
import { Settings } from './Systems/Settings.js';

import { XORShift } from 'https://cdn.jsdelivr.net/npm/random-seedable@1.0.8/+esm';

import { Player } from './Entities/Player.js';
import { Enemy } from './Entities/Enemy.js';
import { Goal } from './Entities/Goal.js';

class State {

	static fromJSON( state ) {};

	constructor( game ) {};

	toJSON() {};

};

export class Game {

	constructor({ version = "1.2.0", seed = 62832, gravity = -0.053, radius = { min: 20, max: 55 } }) {

		this.version = version;
		this.compatability = "^1.2.0";

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

		this.numOfPoints = 2;

		// Components
		this.entity = new Entity();
		this.dynamic = new Dynamic( this.radius.center );
		this.fixed = new Fixed( this.radius.center );

		// Systems
		this.events = new EventTarget();
		this.sound = new Sound( this );
		this.graphics = new Graphics( this );
		this.physics = new Physics( this );

		this.menu = new Menu( this );
		this.generator = new Generator( this ); //TODO: change name to generator
		this.controls = new Controls( this );
		this.settings = new Settings( this );

		// Entities
		this.enemies = [];
		this.player = new Player({ game: this, controls: true }); 

		this.entities = {
			platform: []
		};

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

		        const max = 2*this.FIXED_DT;
		        let amount = 0;

		        while (accumulatedTime >= this.FIXED_DT/* && amount <= max */) {

		            this.physics.update( this.FIXED_DT );
		            accumulatedTime -= this.FIXED_DT; //Math.min( accumulatedTime - this.FIXED_DT, 2*this.FIXED_DT );
		        	//amount += this.FIXED_DT;

		        }

		        this.graphics.update( delta );
		    
		    }

		    
		    if (!this.started) {

		    	this.graphics.update( delta );
		    
		    }
		    

		};

		update();

		document.addEventListener('visibilitychange', () => {
			
			if ( document.visibilityState === 'hidden' ) {
			
				if( this.started && !this.paused ) this.pause();
			
			}

		});

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

			for ( const platform of this.entities.platform ) platform.dispose();
			this.entities.platform.length = [];


				this.seed = game.seed;
				this.level = game.level;

				this.graphics.reset();
				this.fixed.reset();
			
				this.generator.create( this.level );

				if ( !this.goal ) {

					this.goal = new Goal({

						game: this,
						r: this.win.r,
						y: this.win.y

					});

				} else this.goal.reset();

				this.player.r = game.player.r;
				this.player.y = game.player.y;

				while ( this.enemies.length > 0 ) this.enemies[0].dispose();

				for ( let i = 0; i < game.enemies.length; i ++ ) {

					this.enemies.push( new Enemy({
					
						game: this,
						...game.enemies[ i ] 
					
					}));

				}

				document
				.getElementById('ingame-loader')
				.classList.add('hidden');
				
				//this.start();

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
		
			for ( const platform of this.entities.platform ) platform.dispose();
			this.entities.platform.length = [];

			this.level = level;

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

			while ( this.enemies.length > 0 ) this.enemies[ 0 ].dispose();

			for ( const position of this.generator.spawn.enemies ) {

				this.enemies.push( new Enemy({

					game: this,
					r: position.r,
					y: position.y

				}));

			}

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

	clear() {

		for ( const platform of this.entities.platform ) platform.dispose();
		this.entities.platform.length = [];

		while ( this.enemies.length > 0 ) this.enemies[ 0 ].dispose();

	};

	async requestWakeLock() {
        
        if ( 'wakeLock' in navigator ) {

			this.wakeLock = await navigator.wakeLock.request('screen');

			// Re-acquire wake lock if it gets released (e.g., if the user switches tabs)
			this.wakeLock.addEventListener('release', () => {
	
				this.wakeLock = null;
	
			});

        }

    };

    releaseWakeLock() {

        if ( this.wakeLock ) {
            
            this.wakeLock.release().then(() => {
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
