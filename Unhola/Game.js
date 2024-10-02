import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Dynamic } from './Components/Dynamic.js';
import { Fixed } from './Components/Fixed.js';

import { Entity } from './Systems/Entity.js';
import { Physics } from './Systems/Physics.js';
import { Graphics } from './Systems/Graphics.js';
import { Sound } from './Systems/Sound.js';
import { UI } from './Systems/UI.js';
import { World } from './Systems/World.js';
import { XORShift } from 'https://cdn.jsdelivr.net/npm/random-seedable@1.0.8/+esm';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Player } from './Entities/Player.js';
import { Enemy } from './Entities/Enemy.js';
import { Goal } from './Entities/Goal.js';

export class Game {

	constructor({ seed = 62832, gravity = -0.053, radius = { min: 8, max: 16 } }) {
		
		this.random = new XORShift( seed );

		this.level = 1;

		// Game settings:
		this.gravity = gravity;
		this.radius = radius;

		Object.defineProperty( this.radius, 'center', {

			get: () => 0.5*(this.radius.max - this.radius.min) + this.radius.min

		});

		this.numOfPoints = 20;

		// Components
		this.entity = new Entity();
		this.dynamic = new Dynamic( this.radius.center );
		this.fixed = new Fixed();

		// Systems

		this.sound = new Sound( this );
		this.graphics = new Graphics( this );
		this.physics = new Physics( this );

		this.ui = new UI( this, document.body );
		this.world = new World( this ); //TODO: change name to generator

		this.enemies = [];

		this.paused = true;
		let time = Date.now();
		const update = () => {

			let delta = Date.now() - time;
			time = Date.now();

			requestAnimationFrame( update );

			if ( !this.paused ) { 

				this.physics.update( 32 );
				this.graphics.update();

			}

		};

		update();

		document.addEventListener( 'keydown', ( event ) => {

			if ( event.code === 'Escape' ) {

				//this.new({sections: this.level });
				
				if ( this.paused ) this.start();
				else this.pause();

			} else if ( event.code === 'Enter' ) {

				this.new({ sections: this.level })

			}

		})

	};

	async retrieveModels() {

		const loader = new GLTFLoader();
		const models = [
			'Pine', 'Polypody', 'Bush', 'Well',
			'Red Clover', 'Crooked Mushroom',
			'Birch', 'Dead Tree', 'Wheat', 'Red Mushroom', 'Bush Tree', 'Red Flower', 'Mushroom Brown', 'Moon Flower',
			'Character', 'TREE1', 'TREE2', 'TREE3', 'FUNGI1', 'ROCK', 'Goal', 'Enemy'
		]; 
		const promises = [];

		this.graphics.assets = {};
		this.graphics.instances = {};

		for ( const name of models ) {

			promises.push( new Promise( ( resolve ) => {

				loader.load( `Models/${name}.glb`, ( model ) => {
					this.graphics.assets[ name ] = model.scene;

					model.scene.traverse( function ( child ) {

						if ( child.isMesh ) {
						
							child.castShadow = true;
							child.receiveShadow = true;
							child.material.shadowSide = THREE.FrontSide;
						
						}

					});
					
					resolve();

				});

			}));

		}

		await Promise.all( promises );

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
			'Player Death'
		]);

		await this.retrieveModels();

		document
			.getElementById('loading-page')
			.classList.add('hidden');

		document
			.getElementById('press-screen-page')
			.classList.remove('hidden');

	};

	new({ sections }) {

		this.pause();

		this.random = new XORShift( Math.round(Math.random()*1000) );

		for ( const enemy of this.enemies ) enemy.dispose();

		this.graphics.reset();
		this.fixed.reset();
	
		this.world.generate( sections );

		if ( !this.player ) {

			this.player = new Player({

				game: this,
				r: this.spawn.r,
				y: this.spawn.y,
				controls: true

			});

		} else this.player.reset();

		for ( let i = 0; i < 7*sections; i ++ ) {

			this.enemies.push( new Enemy({

				game: this,
				r: this.spawn.r - i*1.45 - 0.6,
				y: this.spawn.y + i*1.45 + 8.25

			}));

		}

		if ( !this.goal ) {

			this.goal = new Goal({

				game: this,
				r: this.win.r,
				y: this.win.y

			});

		} else this.goal.reset();

		this.start();

	};

	start() { 
		
		document
			.getElementById('paused-page')
			.classList.add('hidden');

		this.graphics.renderer.domElement
			.classList.remove('blurred');

		this.paused = false; 
	
	};

	pause() { 

		document
			.getElementById('paused-page')
			.classList.remove('hidden');

		this.graphics.renderer.domElement
			.classList.add('blurred');

		this.paused = true; 

	};

};
