export class Entity {

	constructor() {

		this.map = new Map();
		this.next = 0;

	};

	id() {

		return this.next ++;

	};

	get( id ) {

		return this.map.get( id );

	};

	create( entity ) {

		const id = this.id();
		this.map.set( id, entity );

		return entity;

	};

	dispose( id ) {

		this.map.delete( id );

	};

};