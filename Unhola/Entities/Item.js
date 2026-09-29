import * as THREE from 'three';

const TAU = 2 * Math.PI;

export class Item {

	constructor({
		game,
		r = 0,
		y = 0,
		type = 'shard',
		name = 'Shard',
		color = 0xd35bff
	}) {

		this.game = game;
		this.r = r;
		this.y = y;
		this.type = type;
		this.name = name;
		this.color = color;
		this.held = false;
		this.disposed = false;
		this.height = 0.62;
		this.createdAt = performance.now();

		this.initGraphics();

		this.game.items ??= [];
		this.game.items.push( this );

	}

	get x() { return this.game.radius.center * Math.cos( TAU * this.r ); }
	get z() { return this.game.radius.center * Math.sin( TAU * this.r ); }

	initGraphics() {

		const group = new THREE.Object3D();
		group.name = `Item: ${ this.name }`;

		const coreGeometry = new THREE.BoxGeometry( 0.58, 0.58, 0.58 );
		const coreMaterial = new THREE.MeshToonMaterial({
			color: this.color,
			emissive: this.color,
			emissiveIntensity: 0.12
		});
		const core = new THREE.Mesh( coreGeometry, coreMaterial );
		core.castShadow = true;
		core.receiveShadow = true;
		group.add( core );

		const bandGeometry = new THREE.BoxGeometry( 0.76, 0.12, 0.12 );
		const bandMaterial = new THREE.MeshBasicMaterial({ color: 0xf1dfba });
		const band = new THREE.Mesh( bandGeometry, bandMaterial );
		band.position.y = 0.03;
		group.add( band );

		this.mesh = group;
		this.game.graphics.scene.add( group );

		this.game.graphics.updateHandlers.push(( dt ) => {

			if ( this.disposed ) return;
			this.updateGraphics( dt );

		});

	}

	updateGraphics() {

		if ( !this.mesh ) return;
		this.mesh.visible = this.game.started && !this.held;
		if ( !this.mesh.visible ) return;

		const time = ( performance.now() - this.createdAt ) * 0.001;
		this.mesh.position.set( this.x, this.y + Math.sin( time * 2.8 ) * 0.055, this.z );
		this.mesh.rotation.y = -TAU * this.r + time * 1.6;
		this.mesh.rotation.z = Math.round( Math.sin( time * 2.1 ) * 2 ) * 0.08;

	}

	pickUp() {

		this.held = true;
		if ( this.mesh ) this.mesh.visible = false;

	}

	dropAt( r, y ) {

		this.r = r;
		this.y = y;
		this.held = false;
		this.createdAt = performance.now();
		this.updateGraphics();

	}

	toJSON() {

		return {
			r: this.r,
			y: this.y,
			type: this.type,
			name: this.name,
			color: this.color
		};

	}

	dispose() {

		this.disposed = true;
		this.mesh?.removeFromParent();
		const index = this.game.items?.indexOf( this ) ?? -1;
		if ( index >= 0 ) this.game.items.splice( index, 1 );

	}

	static fromJSON( game, data ) {

		return new Item({
			game,
			r: data.r,
			y: data.y,
			type: data.type,
			name: data.name,
			color: data.color
		});

	}

}
