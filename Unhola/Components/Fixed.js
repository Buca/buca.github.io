const cos = Math.cos;
const sin = Math.sin;
const PI = Math.PI;

export class Fixed {

	constructor( radius ) {

		this.data = [];
		this.pool = [];
		this.next = 0;
		this.radius = radius;

	};

	*[Symbol.iterator]() {

		for ( let i = 0; i < this.data.length; i += 6 ) {
			
			const isActive = this.data[ i + 5 ] === 1 ? true : false;

			if ( isActive ) yield i;
		
		}

	};

	reset() {

		this.data.length = 0;
		this.pool.length = 0;
		this.next = 0;

	}

	getR( index ) { return this.data[ index ] };
	setR( index, value ) { return this.data[ index ] = value % 1 };
	addR( index, value ) { return this.data[ index ] = (this.data[ index ] + value) % 1 };

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

	query( x, y, z, w, h, d ) {

		const minX = x - w/2;
		const minY = y - h/2;
		const minZ = z - d/2;
		const maxX = x + w/2;
		const maxY = y + h/2;
		const maxZ = z + d/2;

		const indices = [];

		for ( const i of this ) {

			const sminX = this.getMinX( i );
			const sminY = this.getMinY( i );
			const sminZ = this.getMinZ( i );
			const smaxX = this.getMaxX( i );
			const smaxY = this.getMaxY( i );
			const smaxZ = this.getMaxZ( i );

			const hit = !(
				minX >= smaxX || maxX <= sminX ||
		    	minY >= smaxY || maxY <= sminY ||
		    	minZ >= smaxZ || maxZ <= sminZ
			);

			if ( hit ) indices.push( i );

		}

		return indices;

	};

	queryRY( r, y, w, h, d ) {

		const x = this.radius * cos( 2*PI*r );
		const z = this.radius * sin( 2*PI*r );

		return this.query( x, y, z, w, h, d );

	};

	create( r = 0, y = 0, w = 1, h = 1, d = 1, isActive = 1 ) {

		let i;

		if ( this.pool.length > 0 ) i = this.pool.pop();
		else {

			i = this.next;
			this.next += 6;

		}

		this.data[ i + 0 ] = r;
		this.data[ i + 1 ] = y;
		this.data[ i + 2 ] = w;
		this.data[ i + 3 ] = h;
		this.data[ i + 4 ] = d;
		this.data[ i + 5 ] = isActive;

		return i;

	};

	dispose( index ) {

		this.pool.push( index );
		this.deactivate( index );
	
	};

}