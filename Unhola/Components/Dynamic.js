const cos = Math.cos;
const sin = Math.sin;
const PI = Math.PI;


export class Dynamic {
	
	constructor( radius ) {

		this.radius = radius;
		this.data = [];
		this.pool = [];
		this.next = 0;


	};

	get length() {

		return this.data.length/8 - this.pool.length;

	};

	*[Symbol.iterator]() {

		for ( let i = 0; i < this.data.length; i += 8 ) {

			if ( this.data[ i + 7 ] === 1 ) yield i;
		
		}

	};

	getR( index ) { return this.data[ index ] };
	setR( index, value ) { return this.data[ index ] = ((value % 1) + 1) % 1 };
	addR( index, value ) { return this.data[ index ] = ((this.data[ index ] + value) % 1 + 1) % 1 };

	getX( index ) { return this.radius*cos( 2*PI*this.data[ index ] ) };

	getY( index ) { return this.data[ index + 1 ] };
	setY( index, value ) { return this.data[ index + 1 ] = value };
	addY( index, value ) { return this.data[ index + 1 ] += value };
	
	getZ( index ) { return this.radius*sin( 2*PI*this.data[ index ] ) };

	getW( index ) { return this.data[ index + 2 ] };
	setW( index, value ) { return this.data[ index + 2 ] = value };

	getH( index ) { return this.data[ index + 3 ] };
	setH( index, value ) { return this.data[ index + 3 ] = value };

	getD( index ) { return this.data[ index + 4 ] };
	setD( index, value ) { return this.data[ index + 4 ] = value };

	getMinX( index ) { return this.getX( index ) - .5*this.getW( index ) };
	getMinY( index ) { return this.getY( index ) - .5*this.getH( index ) };
	getMinZ( index ) { return this.getZ( index ) - .5*this.getD( index ) };

	getMaxX( index ) { return this.getX( index ) + .5*this.getW( index ) };
	getMaxY( index ) { return this.getY( index ) + .5*this.getH( index ) };
	getMaxZ( index ) { return this.getZ( index ) + .5*this.getD( index ) };

	getVR( index ) { return this.data[ index + 5 ] };
	setVR( index, value ) { return this.data[ index + 5 ] = value };
	addVR( index, value ) { return this.data[ index + 5 ] += value };
	mulVR( index, value ) { return this.data[ index + 5 ] *= value };

	getVY( index ) { return this.data[ index + 6 ] };
	setVY( index, value ) { return this.data[ index + 6 ] = value };
	addVY( index, value ) { return this.data[ index + 6 ] += value };
	mulVY( index, value ) { return this.data[ index + 6 ] *= value };

	isActive( index ) { return this.data[ index + 7 ] === 1; };
	activate( index ) { this.data[ index + 7 ] = 1 };
	deactivate( index ) { this.data[ index + 7 ] = 0 };

	create( r = 0, y = 0, w = 1, h = 1, d = 1, vr = 0, vy = 0, isActive = 1 ) {

		let i;

		if ( this.pool.length > 0 ) i = this.pool.pop();
		else {

			i = this.next;
			this.next += 8;

		}

		this.data[ i + 0 ] = r;
		this.data[ i + 1 ] = y;
		this.data[ i + 2 ] = w;
		this.data[ i + 3 ] = h;
		this.data[ i + 4 ] = d;
		this.data[ i + 5 ] = vr;
		this.data[ i + 6 ] = vy;
		this.data[ i + 7 ] = isActive;

		return i;

	};

	query( x, y, z, w, h, d ) {

		const minX = x - w/2;
		const minY = y - h/2;
		const minZ = z - d/2;
		const maxX = x + w/2;
		const maxY = y + h/2;
		const maxZ = z + d/2;

		const indices = [];

		for ( const i of this ) {

			const sX = this.getX( i );
			const sY = this.getY( i );
			const sZ = this.getZ( i );
			const sW = this.getW( i );
			const sH = this.getH( i );
			const sD = this.getD( i );

			const sminX = sX - sW/2;
			const sminY = sY - sH/2;
			const sminZ = sZ - sD/2;
			const smaxX = sX + sW/2;
			const smaxY = sY + sH/2;
			const smaxZ = sZ + sD/2;

			const hit = !(
				minX >= smaxX || maxX <= sminX ||
		    	minY >= smaxY || maxY <= sminY ||
		    	minZ >= smaxZ || maxZ <= sminZ
			);

			if ( hit ) indices.push( i );

		}

		return indices;

	};

	dispose( index ) {

		this.deactivate( index );
		this.pool.push( index );

	};

}