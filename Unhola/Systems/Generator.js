import * as THREE from 'three';
import { XORShift } from 'https://cdn.jsdelivr.net/npm/random-seedable@1.0.8/+esm';
import { PI, random, DRNG, combineSeeds } from '../Utilities.js';
import { Platform } from '../Entities/Platform.js';

export class Generator {

	constructor( game ) {

		this.game = game;

	};

	create( sections ) {

		const seed = combineSeeds( this.game.seed, this.game.level );
		const random = DRNG( seed );

		const TAU = 2*Math.PI;
		const cos = Math.cos;
		const sin = Math.sin;
		const min = Math.min;
		const max = Math.max;
		const abs = Math.abs;
		const minRadius = this.game.radius.min;
		const maxRadius = this.game.radius.max;
		const center = this.game.radius.center;
		const radius = this.game.radius.center;
		const yScalar = 20*sections;

		const startY = 0;
		const endY = yScalar;

		const pointsR = [ 0 ];
		const pointsY = [ startY, endY ];

		while ( pointsR[ pointsR.length - 1 ] < sections - 0.001 ) {

			const offset = pointsR[ pointsR.length - 1 ];
			pointsR.push( offset + 0.01 + 0.05*random.float() );

		}
		
		const numberOfPlatforms = pointsR.length;//Math.floor( random.float()*10 ) + 10;

		for ( let i = 0; i < numberOfPlatforms - 2; i ++ ) {

			const y = yScalar*random.float() - Math.max(0, Math.sin(Math.PI*pointsR[i]));
			pointsY.push( y );

		}

		pointsR.sort( ( a, b ) => a - b );
		pointsY.sort( ( a, b ) => a - b );

		const r = 0;

		let lastHeight = 5;

		this.spawn = {};
		this.spawn.enemies = [];

		for ( let i = 0; i < numberOfPlatforms - 1; i ++ ) {

			const r0 = -pointsR[ i ];
			const r1 = -pointsR[ i + 1 ];
			const y0 = pointsY[ i ];
			const y1 = pointsY[ i + 1 ];

			const x0 = radius*cos( TAU*r0 );
			const x1 = radius*cos( TAU*r1 );
			const z0 = radius*sin( TAU*r0 );
			const z1 = radius*sin( TAU*r1 );

			const r = (r0 + r1)/2; 

			const x = center*cos( TAU*r0 );
			const y = (2*y0 + y1)/3 - 2*lastHeight;
			const z = center*sin( TAU*r0 );

			const widthD = (.5*((cos( 2*(TAU*r + PI/2) ) + 1)))**10;
			const depthD = (.5*((cos( 2*(TAU*r) ) ) + 1))**10;

			const width = max(5, widthD*abs( x1 - x0 ));//Math.max( 0.3, widthD )*(16*random.float() + 1);
			const depth = max(5, depthD*abs( z1 - z0 ));//Math.max( 0.3, depthD )*(16*random.float() + 1);
			const height = max( 3, max(lastHeight*0.75, 6*random.float()));

			lastHeight = height;

			const spawnEnemy = random.float()**(numberOfPlatforms - i - 1) > 0.1;

			if ( spawnEnemy ) {

				this.spawn.enemies.push({ r: (r0 + r1)/2, y: y0 + height })

			}

			// Physics:
			if ( i === 0 ) this.game.spawn = { r: (r0 + r1)/2, y: y0 + height};

			const platform = new Platform({

				game: this.game, 
				r: (r0 + r1)/2, 
				y: y0, 
				width, 
				height: height, 
				depth,
				number: i

			});

			new Platform({

				game: this.game, 
				r: r0, 
				y: y0 - Math.max( .5*random.float(), 0.5 ), 
				width: width + widthD*random.float(),
				height: height + height*random.float(),
				depth: depth - depthD*random.float(),
				number: i + numberOfPlatforms ,
				visualOnly: true,
				visualDifference: 7

			});

			new Platform({

				game: this.game, 
				r: r0, 
				y: y0 - Math.max( 3*random.float(), 1 ), 
				width: width + 4*widthD*random.float(),
				height: height + 2*height*random.float(),
				depth: depth - 4*depthD*random.float(),
				number: i + 2*numberOfPlatforms,
				visualOnly: true,
				visualDifference: 9

			});

			/*new Platform({

				game: this.game, 
				r: r0, 
				y: y0 - Math.max( 2*random.float(), 1.5 ), 
				width: width + 2*width*random.float(),
				height: height + 2*height*random.float(),
				depth: depth + 2*depth*random.float(),
				number: i + 3*numberOfPlatforms,
				visualOnly: true,
				visualDifference: 11
			
			});*/

			const index = platform.fixed;

			if ( i === numberOfPlatforms - 2 )	{

				const maxY = this.game.fixed.getMaxY( index );
				this.game.win = { r: (r0 + r1)/2, y: maxY };

			}

		}

		for ( const position of this.spawn.enemies ) {

			const ex = center*Math.cos( TAU*position.r );
			const ey = position.y;
			const ez = center*Math.sin( TAU*position.r );

			const query = this.game.fixed.query( ex, ey, ez, 0.5, 0.5, 0.5 );

			if ( query.length > 0 ) {

				let maxY = -Infinity;

				for ( const index of query ) {

					maxY = Math.max( maxY, this.game.fixed.getMaxY( index ) );

				}

				position.y = maxY + 0.35;

			} 

		}
	
	};

};