export class Physics {

	constructor( game ) {

		this.game = game;
		this.beforeTick = [];

		this.sensor = [];

	};

	update( dt ) {
		
		//dt = 22;
		
		const PI = Math.PI;
		const cos = Math.cos;
		const sin = Math.sin;
		const now = Date.now();
		const radius = this.game.radius.center;
		const gravity = this.game.gravity;
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

			for ( const i of fixed ) {

				const x0 = fixed.getMinX( i );
				const y0 = fixed.getMinY( i );
				const z0 = fixed.getMinZ( i );
				const x1 = fixed.getMaxX( i );
				const y1 = fixed.getMaxY( i );
				const z1 = fixed.getMaxZ( i );

				const iterations = 10;
				for ( let j = iterations; j > -1; j -- ) {

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

			// TODO: Fix this by re calculating the velocity after:
			const previousY = dynamic.getY( k );
			dynamic.addY( k, dt*( dynamic.getVY( k ) + gravity ) );
			const currentY =  dynamic.getY( k );
			const deltaY = (currentY - previousY)/dt;

			//dynamic.setVY( deltaY );

			// Frictional forces:
			dynamic.mulVR( k, 0.72 );
			dynamic.mulVY( k, 0.99 );
			
		}

		
		for ( const handler of this.beforeTick ) handler();

	};

};