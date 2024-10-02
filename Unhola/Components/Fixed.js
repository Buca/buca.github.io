export class Fixed {

	constructor() {

		this.data = [];
		this.pool = [];

	};

	*[Symbol.iterator]() {

		for ( let i = 0; i < this.data.length; i += 7 ) {
			
			const isActive = this.data[ i + 6 ] === 1 ? true : false;

			if ( isActive ) yield i;
		
		}

	};

	reset() {

		this.data.length = 0;
		this.pool.length = 0;

	}

	getX( index ) { return this.data[ index ] };
	setX( index, value ) { return this.data[ index ] = value };
	getY( index ) { return this.data[ index + 1 ] };
	setY( index, value ) { return this.data[ index + 1 ] = value };
	getZ( index ) { return this.data[ index + 2 ] };
	setZ( index, value ) { return this.data[ index + 2 ] = value };

	getW( index ) { return this.data[ index + 3 ] };
	setW( index, value ) { return this.data[ index + 3 ] = value };
	getH( index ) { return this.data[ index + 4 ] };
	setH( index, value ) { return this.data[ index + 4 ] = value };
	getD( index ) { return this.data[ index + 5 ] };
	setD( index, value ) { return this.data[ index + 5 ] = value };

	getMinX( index ) { return this.data[ index + 0 ] - .5*this.data[ index + 3 ] };
	getMinY( index ) { return this.data[ index + 1 ] - .5*this.data[ index + 4 ] };
	getMinZ( index ) { return this.data[ index + 2 ] - .5*this.data[ index + 5 ] };

	getMaxX( index ) { return this.data[ index + 0 ] + .5*this.data[ index + 3 ] };
	getMaxY( index ) { return this.data[ index + 1 ] + .5*this.data[ index + 4 ] };
	getMaxZ( index ) { return this.data[ index + 2 ] + .5*this.data[ index + 5 ] };

	query( x, y, z, w, h, d ) {

		const minX = x - w/2;
		const minY = y - h/2;
		const minZ = z - d/2;
		const maxX = x + w/2;
		const maxY = y + h/2;
		const maxZ = z + d/2;

		const indices = [];

		for ( const i of this ) {

			const sX = this.data[ i + 0 ];
			const sY = this.data[ i + 1 ];
			const sZ = this.data[ i + 2 ];
			const sW = this.data[ i + 3 ];
			const sH = this.data[ i + 4 ];
			const sD = this.data[ i + 5 ];

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

	create( x = 0, y = 0, z = 0, w = 1, h = 1, d = 1, isActive = 1 ) {

		let index;

		if ( this.pool.length > 0 ) index = this.pool.pop();
		else index = this.data.length;

		this.data[ index + 0 ] = x;
		this.data[ index + 1 ] = y;
		this.data[ index + 2 ] = z;
		this.data[ index + 3 ] = w;
		this.data[ index + 4 ] = h;
		this.data[ index + 5 ] = d;
		this.data[ index + 6 ] = isActive;

		return index;

	};

	dispose( index ) {

		this.pool.push( index );
		this.deactivate( index );
	
	};

}