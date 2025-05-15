import * as THREE from 'three';
import { DRNG, combineSeeds, cylindricalDistance, cylindricalPointAABBDistance, ceil, floor, min, PI } from '../Utilities.js';

function updateUVs( geometry, texture ) {

	const pos = geometry.attributes.position;
	const uv = geometry.attributes.uv;
	const scaleX = texture.repeat.x;
	const scaleY = texture.repeat.y;
	const scaleZ = 1;  // Assuming no need to adjust Z (as it's a BoxGeometry)

	for ( let i = 0; i < pos.count; i ++ ) {
		
		// Get the vertex positions
		const x = pos.getX( i );
		const y = pos.getY( i );
		const z = pos.getZ( i );

		// Adjust UV coordinates manually based on the vertex positions and texture repeat
		if ( i < 8 ) {
		
			uv.setXY( i, z * scaleX, y * scaleY ); // Adjust based on your geometry's face orientation
		
		} else if ( i < 16 ) {
		
			uv.setXY( i, x * scaleX, z * scaleY );
		
		} else {
		
			uv.setXY( i, y * scaleX, x * scaleY );
		}

	}

	uv.needsUpdate = true;

};

export class Platform {

	#r; #y; #width; #height; #depth;

	constructor({ game, r, y, width, height, depth, number, visualOnly = false, visualDifference = 0 }) {

		this.game = game;

		this.visualDifference = visualDifference;
		this.visualOnly = visualOnly;

		if( !visualOnly ) {
		
			this.fixed = this.game.fixed.create( r, y, width, height, depth );
		
		} else {

			this.#r = r;
			this.#y = y;
			this.#width = width;
			this.#height = height;
			this.#depth = depth;

		}

		if ( !this.game.entities.platform ) this.game.entities.platform = [];

		this.game.entities.platform.push( this );

		//this.graphics = this.game.graphics.create(); // Should support custom models

		this.disposed = false;
		this.number = number;

		this.generate();


		const radius = this.game.radius.center;

		// This should be a graphics handler
		this.game.graphics.updateHandlers.push(() => {

			if( this.disposed ) return;

			const pi = this.game.player.dynamic;
			const pMinX = this.game.dynamic.getMinX( pi );
			const pMinY = this.game.dynamic.getMinY( pi );
			const pMinZ = this.game.dynamic.getMinZ( pi );
			const pMaxX = this.game.dynamic.getMaxX( pi );
			const pMaxY = this.game.dynamic.getMaxY( pi );
			const pMaxZ = this.game.dynamic.getMaxZ( pi );

			const radius = this.game.settings['render-distance'];

			const minX = this.x - this.width/2 - radius - visualDifference/6;
			const minY = this.y - this.height/2 - radius - visualDifference/6;
			const minZ = this.z - this.depth/2 - radius - visualDifference/6;
			const maxX = this.x - this.width/2 + radius + visualDifference/6;
			const maxY = this.y - this.height/2 + radius + visualDifference/6;
			const maxZ = this.z - this.depth/2 + radius + visualDifference/6;


			const intersects = (

				pMinX > maxX ||
				pMaxX < minX ||
				pMinY > maxY ||
				pMaxY < minY ||
				pMinZ > maxZ ||
				pMaxZ < minZ

			);

			if ( intersects ) this.mesh.removeFromParent();
			else if ( this.mesh.parent !== this.game.graphics.scene ) this.game.graphics.scene.add( this.mesh );

		});

		//setTimeout( () => { this.dispose() }, 10000 )

	};

	// Position
	get r() { 

		if( this.visualOnly ) return this.#r;
		else return this.game.fixed.getR( this.fixed );


	};

	set r( value ) { 

		if( this.visualOnly ) return this.#r = value;
		else return this.game.fixed.setR( this.fixed, value ) ;
	
	};

	get y() { 

		if( this.visualOnly ) return this.#y;
		else return this.game.fixed.getY( this.fixed );

	};

	set y( value ) { 

		if( this.visualOnly ) return this.#y = value;
		else return this.game.fixed.setY( this.fixed, value ) ;
	
	};

	get x() {

		const radius = ( this.game.radius.center - this.visualDifference );

		if( this.visualOnly ) return radius*Math.cos( 2*Math.PI*this.#r );
		else return this.game.fixed.getX( this.fixed );

	};

	get z() {

		const radius = ( this.game.radius.center - this.visualDifference );

		if( this.visualOnly ) return radius*Math.sin( 2*Math.PI*this.#r );
		else return this.game.fixed.getZ( this.fixed );

	};

	// Dimensions
	get width() { 

		if( this.visualOnly ) return this.#width;
		else return this.game.fixed.getW( this.fixed );

	};

	set width( value ) { 

		if( this.visualOnly ) return this.#width = value;
		else return this.game.fixed.setW( this.fixed, value ) ;
	
	};

	get height() { 

		if( this.visualOnly ) return this.#height;
		else return this.game.fixed.getH( this.fixed );

	};

	set height( value ) { 

		if( this.visualOnly ) return this.#height = value;
		else return this.game.fixed.setH( this.fixed, value ) ;
	
	};

	get depth() { 

		if( this.visualOnly ) return this.#depth;
		else return this.game.fixed.getD( this.fixed );

	};

	set depth( value ) { 

		if( this.visualOnly ) return this.#depth = value;
		else return this.game.fixed.setD( this.fixed, value ) ;
	
	};

	get area() { return this.width*this.depth };

	dispose() {

		this.disposed = true;

		// Remove from scene
		this.mesh.removeFromParent();

		// Traverse and dispose of geometries and materials
		this.mesh.traverse(child => {

			if (child.isMesh || child.isInstancedMesh) {

				if (child.geometry) {
					child.geometry.dispose();
				}

				if (Array.isArray(child.material)) {
					child.material.forEach(mat => mat.dispose());
				} else if (child.material) {
					child.material.dispose();
				}

			}

		});

		// Optional: Remove from physics, references
		this.mesh = undefined;

	};

	generate() {

		const seed = combineSeeds( this.game.seed, this.game.level, this.number );
		const random = DRNG( seed );

		const area = this.area;
		
		const x = this.x;
		const y = this.y;
		const z = this.z;
		const w = this.width;
		const h = this.height;
		const d = this.depth;

		this.mesh = new THREE.Object3D();
		this.mesh.position.set( x, y, z );
		this.game.graphics.scene.add( this.mesh );

		const dummy = new THREE.Object3D();

		// Platform Mesh Setup
		const grassGeo = new THREE.BoxGeometry( w - 0.025, 0.05*h, d - 0.025 );
		const dirt1Geo = new THREE.BoxGeometry( w + 0.05, 0.15*h, d + 0.05 );
		const dirt2Geo = new THREE.BoxGeometry( w - 0.05, 0.30*h, d - 0.05 );
		const dirt3Geo = new THREE.BoxGeometry( w, 0.50*h, d );

		const grassMat = new THREE.MeshToonMaterial({ color: 0x378061 });
	
		if ( !this.game.graphics.materials['Dirt 1'] ) {

			this.game.graphics.materials['Dirt 1'] = new THREE.MeshToonMaterial({
				color: 0xFFFFFF,
				//color: 0x9E8E64,
				map: this.game.graphics.textures['Dirt 1']
			});		

		}

		if ( !this.game.graphics.materials['Dirt 2'] ) {

			this.game.graphics.materials['Dirt 2'] = new THREE.MeshToonMaterial({
				color: 0xFFFFFF,
				//color: 0x704A5D,
				map: this.game.graphics.textures['Dirt 2']
			});		

		}

		if ( !this.game.graphics.materials['Dirt 3'] ) {

			this.game.graphics.materials['Dirt 3'] = new THREE.MeshToonMaterial({
				color: 0xFFFFFF,
				//color: 0x5D465D,
				map: this.game.graphics.textures['Dirt 3']
			});

		}

		// Manually adjust the UVs for proper tiling without stretching
		updateUVs( dirt1Geo, this.game.graphics.textures['Dirt 1'] );
		updateUVs( dirt2Geo, this.game.graphics.textures['Dirt 2'] );
		updateUVs( dirt3Geo, this.game.graphics.textures['Dirt 3'] );

		const grassMesh = new THREE.Mesh( grassGeo, grassMat );
		const dirt1Mesh = new THREE.Mesh( dirt1Geo, this.game.graphics.materials['Dirt 1'] );
		const dirt2Mesh = new THREE.Mesh( dirt2Geo, this.game.graphics.materials['Dirt 2'] );
		const dirt3Mesh = new THREE.Mesh( dirt3Geo, this.game.graphics.materials['Dirt 3'] );



		grassMesh.castShadow = true;
		grassMesh.receiveShadow = true;
		dirt1Mesh.castShadow = true;
		dirt1Mesh.receiveShadow = true;
		dirt2Mesh.castShadow = true;
		dirt2Mesh.receiveShadow = true;
		dirt3Mesh.castShadow = true;
		dirt3Mesh.receiveShadow = true;

		grassMesh.position.set( 0, + 0.95*h/2, 0 );
		dirt1Mesh.position.set( 0, + 0.75*h/2, 0 );
		dirt2Mesh.position.set( 0, + 0.30*h/2, 0 );
		dirt3Mesh.position.set( 0, - 0.50*h/2, 0 );

		this.mesh.add( grassMesh, dirt1Mesh, dirt2Mesh, dirt3Mesh );

		// Randomn arguments:
		const s = this.game.seed;
		const l = this.game.level;
		const n = this.number;

		// Grass Blade Mesh Setup
		if ( !this.visualOnly ) {
			
			const grassBladeCount = ceil( 30*this.area );
			const grassBladeGeo = new THREE.BoxGeometry( 0.075, 0.1 + 0.5*random.float(), 0.075 );
			const grassBladeInstances = new THREE.InstancedMesh( grassBladeGeo, grassMat, grassBladeCount );
			const bleedWD = 0.25;

			for ( let i = 0; i < grassBladeCount; i ++ ) {

				dummy.rotation.y = 2*PI*random.float();

				const x = random.float()*(w - bleedWD) - (w - bleedWD)/2;
				const y = (h/2 + 0.3)*random.float()**3.5
				const z = random.float()*(d - bleedWD/2) - (d - bleedWD/2)/2;

				dummy.position.set( x, y, z );
				dummy.updateMatrix();
				grassBladeInstances.setMatrixAt( i, dummy.matrix );
			
			}

			this.mesh.add( grassBladeInstances );
		
		}

		// On top of the platform rocks and pebbles mesh setup
		{
			const rockMat = new THREE.MeshStandardMaterial( { color: 0xCCCCCC } );
			const rockCount = ceil( this.area / 12 );
			const rockGeo = new THREE.BoxGeometry( 1, 1, 1 );
			const rockInstances = new THREE.InstancedMesh( rockGeo, rockMat, rockCount );

			for ( let i = 0; i < rockCount; i ++ ) {

				dummy.rotation.y = 2*PI*random.float();
				const width = 2*random.float();
				const height = min( width, 0.5*random.float()**3 );
				dummy.scale.set( width, height, width );

				const x = random.float()*(this.width - width/2) - (this.width - width/2)/2;
				const y = this.height/2 + height/2;
				const z = random.float()*(this.depth - width/2) - (this.depth - width/2)/2

				dummy.position.set( x, y, z );
				dummy.updateMatrix();
				rockInstances.setMatrixAt( i, dummy.matrix );
			
			}

			this.mesh.add( rockInstances );
		}

		// Trees Setup
		{
			const treeCount = floor( this.area / 8);
			const treeTypes = ['TREE1', 'TREE2', 'TREE3', 'TREE4', 'TREE5'];

			for ( let i = 0; i < treeCount; i ++ ) {

				const treeType = treeTypes[ floor( random.float() * treeTypes.length ) ];
				const treeMesh = this.game.graphics.assets[ treeType ].clone();
				treeMesh.position.set( random.float()*this.width - this.width/2, this.height/2, random.float()*this.depth - this.depth/2 );
				treeMesh.rotation.y = 2*PI*random.float();
				const scale = random.float()*0.6 + 0.9;
				treeMesh.scale.set( scale, scale, scale );

				this.mesh.add( treeMesh );

			}
		}

		// Mushrooms Setup
		if( !this.visualOnly ) {
			const treeCount = floor( this.area / 20);
			const treeTypes = ['Purple Mushroom Patch 1', 'Mushroom 1', 'Mushroom 2'];

			for ( let i = 0; i < treeCount; i ++ ) {

				const treeType = treeTypes[ floor( random.float() * treeTypes.length ) ];
				const treeMesh = this.game.graphics.assets[ treeType ].clone();
				treeMesh.position.set( random.float()*this.width - this.width/2, this.height/2, random.float()*this.depth - this.depth/2 );
				treeMesh.rotation.y = 2*PI*random.float();
				const scale = random.float()*0.8 + 1.6;
				treeMesh.scale.set( scale, scale, scale );

				this.mesh.add( treeMesh );

			}
		}

		// On the bottom of the platform rocks and pebbles mesh setup
		{
			const rockMat = new THREE.MeshStandardMaterial( { color: 0xCCCCCC } );
			const rockCount = ceil( this.area / 5 );
			const rockGeo = new THREE.BoxGeometry( 1, 1, 1 );
			const rockInstances = new THREE.InstancedMesh( rockGeo, rockMat, rockCount );

			rockInstances.receiveShadow = true;

			for ( let i = 0; i < rockCount; i ++ ) {

				const width = 1.5*random.float();
				const height = 0.5*min( width, random.float()**3 );
				dummy.scale.set( width, height, width );

				const x = random.float()*(this.width - width/2) - (this.width - width/2)/2;
				const y = -this.height/2 - height/2;
				const z = random.float()*(this.depth - width/2) - (this.depth - width/2)/2

				dummy.position.set( x, y, z );
				dummy.updateMatrix();
				rockInstances.setMatrixAt( i, dummy.matrix );
			
			}

			this.mesh.add( rockInstances );
		}

		// Bottom of the platform roots mesh setup
		{
			const rootCount = ceil( this.area / 35 ) + 2;
			const rootTypes = [/*'Root 1',*/ 'Root 2', 'Root 3', 'Root 4'];

			for ( let i = 0; i < rootCount; i ++ ) {

				const rootType = rootTypes[ floor( random.float() * rootTypes.length ) ];
				const rootMesh = this.game.graphics.assets[ rootType ].clone();
				rootMesh.position.set( 
					random.float()*this.width - this.width/2, 
					-this.height/2, 
					random.float()*this.depth - this.depth/2 
				);
				rootMesh.rotation.y = 2*PI*random.float();
				const scale = random.float()*0.7 + 0.6;
				rootMesh.scale.set( scale, scale, scale );

				rootMesh.receiveShadow = true;

				this.mesh.add( rootMesh );

			}
		}


		const sideRockDensity = 0.5;
		const sideRockTypes = ['Side Rocks 1', 'Side Rocks 2', 'Side Rocks 3', 'Side Rocks 4'];
		// Front side of the platform roots mesh setup
		{
			const sideRocksCount = ceil( sideRockDensity * this.depth * this.height / 15 );
			const size = sideRockTypes.length;

			for ( let i = 0; i < sideRocksCount; i ++ ) {

				const sideRockType = sideRockTypes[ floor( random.float() * size ) ];
				const sideRockMesh = this.game.graphics.assets[ sideRockType ].clone();
				sideRockMesh.position.set( 
					this.width/2, 
					random.float()*this.height*0.2 - this.height/2,
					random.float()*this.depth - this.depth/2, 
				);
				const scale = random.float()*0.6 + 0.4;
				sideRockMesh.scale.set( scale, scale, scale );


				this.mesh.add( sideRockMesh );

			}
		}

		// Back side of the platform roots mesh setup
		{
			const sideRocksCount = ceil( sideRockDensity * this.depth * this.height / 15 );
			const size = sideRockTypes.length;

			for ( let i = 0; i < sideRocksCount; i ++ ) {

				const sideRockType = sideRockTypes[ floor( random.float() * size ) ];
				const sideRockMesh = this.game.graphics.assets[ sideRockType ].clone();
				sideRockMesh.rotation.y = -Math.PI;
				sideRockMesh.position.set( 
					-this.width/2, 
					random.float()*this.height*0.2 - this.height/2,
					random.float()*this.depth - this.depth/2, 
				);
				const scale = random.float()*0.6 + 0.4;
				sideRockMesh.scale.set( scale, scale, scale );


				this.mesh.add( sideRockMesh );

			}
		}

		// Left side of the platform roots mesh setup
		{
			const sideRocksCount = ceil( sideRockDensity * this.width * this.height / 15 );
			const size = sideRockTypes.length;

			for ( let i = 0; i < sideRocksCount; i ++ ) {

				const sideRockType = sideRockTypes[ floor( random.float() * size ) ];
				const sideRockMesh = this.game.graphics.assets[ sideRockType ].clone();
				sideRockMesh.position.set( 
					random.float()*this.width - this.width/2, 
					random.float()*this.height*0.2 - this.height/2,
					this.depth/2, 
				);
				sideRockMesh.rotation.y = Math.PI/2;
				const scale = random.float()*0.6 + 0.4;
				sideRockMesh.scale.set( scale, scale, scale );


				this.mesh.add( sideRockMesh );

			}
		}

		// Right side of the platform roots mesh setup
		{
			const sideRocksCount = ceil( sideRockDensity * this.width * this.height / 15 );
			const size = sideRockTypes.length;

			for ( let i = 0; i < sideRocksCount; i ++ ) {

				const sideRockType = sideRockTypes[ floor( random.float() * size ) ];
				const sideRockMesh = this.game.graphics.assets[ sideRockType ].clone();
				sideRockMesh.position.set( 
					random.float()*this.width - this.width/2, 
					random.float()*this.height*0.2 - this.height/2,
					-this.depth/2, 
				);
				sideRockMesh.rotation.y = -Math.PI/2;
				const scale = random.float()*0.6 + 0.4;
				sideRockMesh.scale.set( scale, scale, scale );


				this.mesh.add( sideRockMesh );

			}
		}

	};


};