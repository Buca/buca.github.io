const PI = Math.PI;
const cos = Math.cos;
const sin = Math.sin;

export class Physics {

	constructor( game, options = {} ) {

		this.game = game;

		this.gravity = options.gravity || -0.053;
		this.frictionR = options.frictionR || 0.85;
		this.frictionY = options.frictionY || 0.99;

		this.beforeTick = [];

		this.sensor = [];

	};

	update( dt ) {
		
		//dt = 22;

		const now = Date.now();
		const radius = this.game.radius.center;

		const gravity = this.gravity;
		const frictionR = this.frictionR;
		const frictionY = this.frictionY;
		
		const dynamic = this.game.dynamic;
		const fixed = this.game.fixed;

		for ( const k of dynamic ) {

			const w = .5*dynamic.getW( k );
			const h = .5*dynamic.getH( k );
			const d = .5*dynamic.getD( k );

			const pR = dynamic.getR( k ) + dt*dynamic.getVR( k );
			const pY = dynamic.getY( k ) + dt*( dynamic.getVY( k ) + gravity );

			let x = radius*cos( 2*PI*pR );
			let z = radius*sin( 2*PI*pR );
			let y = pY;

			for (const j of dynamic) {

			if (j === k) continue; // don't compare an entity to itself

				const w1 = .5 * dynamic.getW(k);
				const h1 = .5 * dynamic.getH(k);
				const d1 = .5 * dynamic.getD(k);

				const w2 = .5 * dynamic.getW(j);
				const h2 = .5 * dynamic.getH(j);
				const d2 = .5 * dynamic.getD(j);

				const r1 = dynamic.getR(k) + dt * dynamic.getVR(k);
				const y1 = dynamic.getY(k) + dt * (dynamic.getVY(k) + gravity);
				const x1 = radius * cos(2 * PI * r1);
				const z1 = radius * sin(2 * PI * r1);

				const r2 = dynamic.getR(j) + dt * dynamic.getVR(j);
				const y2 = dynamic.getY(j) + dt * (dynamic.getVY(j) + gravity);
				const x2 = radius * cos(2 * PI * r2);
				const z2 = radius * sin(2 * PI * r2);

				// AABB overlap check
				const overlap =
					!(x1 + w1 <= x2 - w2 || x1 - w1 >= x2 + w2 ||
					  y1 + h1 <= y2 - h2 || y1 - h1 >= y2 + h2 ||
					  z1 + d1 <= z2 - d2 || z1 - d1 >= z2 + d2);

				if (overlap) {

					// Get current velocities
					const vr1 = dynamic.getVR(k);
					const vy1 = dynamic.getVY(k);
					const vr2 = dynamic.getVR(j);
					const vy2 = dynamic.getVY(j);
					const r1 = dynamic.getR(k);
					const r2 = dynamic.getR(j);

					// Simple elastic-like exchange of movement
					/*
					const avgVR = 0.5 * (vr1 + vr2);
					const avgVY = 0.5 * (vy1 + vy2);

					dynamic.setVR(k, 0.3 * avgVR + 0.7 * vr1);
					dynamic.setVR(j, 0.3 * avgVR + 0.7 * vr2);

					dynamic.setVY(k, 0.3 * avgVY + 0.7 * vy1);
					dynamic.setVY(j, 0.3 * avgVY + 0.7 * vy2);
					*/

					// Optional: separate slightly to prevent sticking
					const separation = 0.001; // small push away

					// Get angular difference between entities k and j
					let deltaR = dynamic.getR(k) - dynamic.getR(j);

					// Ensure shortest path around the circle
					if (deltaR > 0.5) deltaR -= 1;
					if (deltaR < -0.5) deltaR += 1;

					const separationR = separation / (2 * PI * radius);

					// Apply small separation by modifying velocities instead of positions
					const velocityAdjustment = separationR * Math.sign(deltaR);

					// Adjust velocities for both entities to resolve overlap
					dynamic.setVR(k, dynamic.getVR(k) + velocityAdjustment);
					dynamic.setVR(j, dynamic.getVR(j) - velocityAdjustment);
				
				}
			}	

			for ( const i of fixed ) {

				const x0 = fixed.getMinX( i );
				const y0 = fixed.getMinY( i );
				const z0 = fixed.getMinZ( i );
				const x1 = fixed.getMaxX( i );
				const y1 = fixed.getMaxY( i );
				const z1 = fixed.getMaxZ( i );

				const iterations = 20;
				for ( let j = iterations; j >= 0; j -- ) {

					let vr = dynamic.getVR( k )*j/iterations;
					let px = radius*cos( 2*PI*( dynamic.getR( k ) + dt*vr ) );
					let pz = radius*sin( 2*PI*( dynamic.getR( k ) + dt*vr ) );

					if ( !(
						x0 >= px + w || x1 <= px - w ||
		    			y0 >= y + h || y1 <= y - h ||
		    			z0 >= pz + d || z1 <= pz - d
		    		) ) continue;
					
					else {

						dynamic.setVR( k, vr );
						break;

					}

				}

				{

					let vr = dynamic.getVR( k );
					let x = radius*cos( 2*PI*( dynamic.getR( k ) + dt*vr ) );
					let z = radius*sin( 2*PI*( dynamic.getR( k ) + dt*vr ) );

					const hit = !(
						x0 >= x + w || x1 <= x - w ||
			    		y0 >= y + h || y1 <= y - h ||
			    		z0 >= z + d || z1 <= z - d
			    	);

					if ( hit ) dynamic.setVY( k, -gravity );

				}

			}

			dynamic.addR( k, dt*dynamic.getVR( k ) );

			const previousY = dynamic.getY( k );
			dynamic.addY( k, dt*( dynamic.getVY( k ) + gravity ) );
			const currentY =  dynamic.getY( k );

			// Frictional forces:
			dynamic.mulVR( k, frictionR );
			dynamic.mulVY( k, frictionY );
			
		}

		for ( const handler of this.beforeTick ) handler( dt );

	};

};