import * as THREE from 'three';
import { XORShift } from 'https://cdn.jsdelivr.net/npm/random-seedable@1.0.8/+esm';

function samplePositions( 

    random, count, 
    x, y, z, w, h, d, 
    min, max, exponent,
    output, offset = 0

) {

    const size = 4 * count;
    output = output || new Array(size).fill(0);
    let index = 0;

    while (index < size) {
        const rx = random.float() * w + (x - w / 2);
        const rz = random.float() * d + (z - d / 2);
        const distance = Math.hypot(rx - x, rz - z); // Fixed distance calculation
        const ratio = Math.max(0, Math.min(1, (distance - min) / (max - min)));

        if (random.float() ** exponent > ratio) {
            output[offset + index++] = rx;
            output[offset + index++] = y + h / 2;
            output[offset + index++] = rz;
            output[offset + index++] = 2 * Math.PI * random.float();
        }
    }

    return output;
}

function sampleGeometries(  
    random, count, 
    x, y, z, w, h, d, 
    minW, minH, minD, maxW, maxH, maxD, 
    min, max, exponent,
    output, offset = 0
) {

    const stride = 6;
    const size = stride * count;
    output = output || new Array(size).fill(0);
    let index = 0, pos = offset;

    while (index < count) {
        const rx = (random.float() * w) + (x - w / 2);
        const rz = (random.float() * d) + (z - d / 2);
        const distance = Math.hypot(rx - x, rz - z);
        const ratio = Math.max(0, Math.min(1, (distance - min) / (max - min)));

        if (random.float() ** exponent > ratio) {
            const rw = ratio * (random.float() * (maxW - minW)) + minW;
            const rh = ratio * (random.float() * (maxH - minH)) + minH;
            const rd = ratio * (random.float() * (maxD - minD)) + minD;

            output[pos++] = rx;
            output[pos++] = y + rh / 2;
            output[pos++] = rz;
            output[pos++] = rw;
            output[pos++] = rh;
            output[pos++] = rd;

            index++;
        }
    }

    return output;
}


function createInstancedMeshFromModel( model, positions, random ) {

	const meshes = [];
	const scales = [];
	const offsets = [];
	const count = positions.length/4;

	model.traverse( ( child ) => {
	
		if ( child.isMesh ) {
			
			const geometry = child.geometry;
			const material = child.material.clone();

			const mesh = new THREE.InstancedMesh( geometry, material, count );
			meshes.push( mesh );
			scales.push( child.scale.clone().multiply(model.scale) );
			offsets.push( child.position );
		
			mesh.castShadow = true;
			mesh.receiveShadow = true;

		}
	
	});

	for ( let i = 0; i < meshes.length; i ++ ) {

		const mesh = meshes[ i ];
		const offset = offsets[ i ];
		const scale = scales[ i ];


		const dummy = new THREE.Object3D();
		for ( let j = 0, p = 0; j < count; j ++ ) {

			dummy.position.copy( offset );
			dummy.scale.copy( scale );
			dummy.position.x += positions[ p ++ ];
			dummy.position.y += positions[ p ++ ];
			dummy.position.z += positions[ p ++ ];
			dummy.rotation.y = 2*Math.PI*random.float();
			p ++;
			

			dummy.updateMatrix();

			mesh.setMatrixAt( j, dummy.matrix );

		}

	}

	return meshes;

};

function createInstancedMeshFromGeometry( geometries, material ) {

	const count = geometries.length / 6;
	const geo = new THREE.BoxGeometry( 1, 1, 1 );
	const mesh = new THREE.InstancedMesh( geo, material, count );
	const dummy = new THREE.Object3D();

	for ( let i = 0, j = 0; i < count; i ++ ) {

		const x = geometries[ j ++ ];
		const y = geometries[ j ++ ];
		const z = geometries[ j ++ ];
		const w = geometries[ j ++ ];
		const h = geometries[ j ++ ];
		const d = geometries[ j ++ ];

		dummy.position.set( x, y, z );
		dummy.scale.set( w, h, d );
		dummy.updateMatrix();

		mesh.setMatrixAt( i, dummy.matrix );

	}

	return mesh;

};

export class Generator {

	constructor( game ) {

		this.game = game;

	};

	generatePlatforms( sections = 0, random ) {

		const TAU = 2*Math.PI;
		const cos = Math.cos;
		const sin = Math.sin;
		const min = Math.min;
		const max = Math.max;
		const minRadius = this.game.radius.min;
		const maxRadius = this.game.radius.max;
		const center = this.game.radius.center;
		const yScalar = 14*sections;

		const startY = 0;
		const endY = yScalar;

		const pointsR = [ 0 ];
		const pointsY = [ startY, endY ];
		
		while ( pointsR[ pointsR.length - 1 ] < sections - 0.001 ) {

			const offset = pointsR[ pointsR.length - 1 ];
			pointsR.push( offset + 0.03 + 0.04*(random.float()) );

		}
		
		const numberOfPlatforms = pointsR.length;//Math.floor( random.float()*10 ) + 10;

		for ( let i = 0; i < numberOfPlatforms - 2; i ++ ) {

			const y = yScalar*(random.float()) - Math.max(0, Math.sin(Math.PI*pointsR[i]));
			pointsY.push( y );

		}

		pointsR.sort( ( a, b ) => a - b );
		pointsY.sort( ( a, b ) => a - b );

		const indices = [];
		const r = 0;

		let lastHeight = 1;

		this.spawn = {};
		this.spawn.enemies = [];

		for ( let i = 0; i < numberOfPlatforms - 1; i ++ ) {

			const r0 = pointsR[ i ];
			const r1 = pointsR[ i + 1 ];
			const y0 = pointsY[ i ];
			const y1 = pointsY[ i + 1 ];

			const x = center*cos( -TAU*(r0 + r) );
			const y = (2*y0 + y1)/3 - 2*lastHeight;
			const z = center*sin( -TAU*(r0 + r) );

			const width = Math.abs(sin( -TAU*(r0 + r) )) * (random.float() * 8 + 4) + 2;
			const height = Math.max( lastHeight*0.75, 3*random.float() );
			const depth = Math.abs(cos( -TAU*(r0 + r) )) * (random.float() * 8 + 4) + 2;

			lastHeight = height;

			const spawnEnemy = random.float()**(numberOfPlatforms - i - 1) > 0.1;

			if ( spawnEnemy ) {

				this.spawn.enemies.push({ r: -r0 + r, y: y + height })

			}

			// Physics:
			if ( i === 0 ) this.game.spawn = { r: -r0 + r, y: y + height };
			if ( i === numberOfPlatforms - 2 ) this.game.win = { r: -r0 + r, y: y + height/2 }
			indices.push( this.game.fixed.create( x, y, z, width, height, depth ) );

		}

		for ( const position of this.spawn.enemies ) {

			const ex = center*Math.cos( TAU*position.r );
			const ey = position.y;
			const ez = center*Math.sin( TAU*position.r );

			const query = this.game.fixed.query( ex, ey, ez, 0.5, 0.5, 0.5 );

			if ( query.length > 0 ) {

				console.log('BONK');

				let maxY = -Infinity;

				for ( const index of query ) {

					maxY = Math.max( maxY, this.game.fixed.getMaxY( index ) );

				}

				position.y = maxY + 0.35;

			} 

		}

		return indices;		

	};

	create( sections ) {

		const fixed = this.game.fixed;
		const seed = this.game.seed;
		const random = new XORShift( seed + this.game.level );

		const platformIndices = this.generatePlatforms( sections, random );
		const material = this.game.graphics.materials.stone;

		const rockGeometries = [];
		const grassGroundGeometries = [];
		const dirtGround1Geometries = [];
		const dirtGround2Geometries = [];
		const dirtGround3Geometries = [];
		
		const tree1Positions = [];
		let tree1Total = 0;
		const tree2Positions = [];
		let tree2Total = 0;
		const tree3Positions = [];
		let tree3Total = 0;
		const rockPositions = [];
		let rockTotal = 0;
		const fungi1Positions = [];
		let fungi1Total = 0;

		for ( const k of platformIndices ) {

			const x = fixed.getX( k );
			const y = fixed.getY( k );
			const z = fixed.getZ( k );
			const w = fixed.getW( k );
			const h = fixed.getH( k );
			const d = fixed.getD( k );

			// Platform location and dimensions:
			rockGeometries.push( x, y, z, w, h, d );

			//grass level
			grassGroundGeometries.push( x, y + 0.95*h/2, z, w, 0.05*h, d );
			dirtGround1Geometries.push( x, y + 0.75*h/2, z, w, 0.15*h, d );
			dirtGround2Geometries.push( x, y + 0.30*h/2, z, w, 0.30*h, d );
			dirtGround3Geometries.push( x, y - 0.50*h/2, z, w, 0.50*h, d );

			const area = w*d;
			const rockwallN = Math.ceil( area/50 );
			const tree1N = Math.round( random.float() * area / 95 );
			tree1Total += tree1N;
			const tree2N = Math.round( random.float() * area / 75 );
			tree2Total += tree2N;
			const tree3N = Math.round( random.float() * area / 75 );
			tree3Total += tree3N;
			const rockN = Math.round( random.float() * area / 10 );
			rockTotal += rockN;
			const fungi1N = Math.round( random.float() * area / 50 );
			fungi1Total += fungi1N;

			samplePositions(
				random, tree1N,
				x, y, z, w, h, d,
				this.game.radius.min, this.game.radius.min + 5,
				10,
				tree1Positions, tree1Positions.length
			);

			samplePositions(
				random, tree2N,
				x, y, z, w, h, d,
				this.game.radius.min+2, this.game.radius.min + 5,
				2,
				tree2Positions, tree2Positions.length
			);

			samplePositions(
				random, tree3N,
				x, y, z, w, h, d,
				this.game.radius.min, this.game.radius.min + 5,
				10,
				tree3Positions, tree3Positions.length
			);

			samplePositions(
				random, fungi1N,
				x, y, z, w, h, d,
				this.game.radius.min, this.game.radius.min + 5,
				10,
				fungi1Positions, fungi1Positions.length
			);

			samplePositions(
				random, rockN,
				x, y, z, w, h, d,
				this.game.radius.min + 5, this.game.radius.min + 7,
				10,
				rockPositions, rockPositions.length
			);
			
		}



		const grassGroundInstancedMesh = createInstancedMeshFromGeometry( grassGroundGeometries, new THREE.MeshStandardMaterial( { color: 0x56AA0B } ) );
		this.game.graphics.meshes.push( grassGroundInstancedMesh );
		this.game.graphics.scene.add( grassGroundInstancedMesh );
		grassGroundInstancedMesh.castShadow = true;
		grassGroundInstancedMesh.receiveShadow = true;

		const dirtGround1InstancedMesh = createInstancedMeshFromGeometry( dirtGround1Geometries, new THREE.MeshStandardMaterial( { color: 0x9E8E64 } ) );
		this.game.graphics.meshes.push( dirtGround1InstancedMesh );
		this.game.graphics.scene.add( dirtGround1InstancedMesh );
		dirtGround1InstancedMesh.castShadow = true;
		dirtGround1InstancedMesh.receiveShadow = true;

		const dirtGround2InstancedMesh = createInstancedMeshFromGeometry( dirtGround2Geometries, new THREE.MeshStandardMaterial( { color: 0x704A5D } ) );
		this.game.graphics.meshes.push( dirtGround2InstancedMesh );
		this.game.graphics.scene.add( dirtGround2InstancedMesh );
		dirtGround2InstancedMesh.castShadow = true;
		dirtGround2InstancedMesh.receiveShadow = true;

		const dirtGround3InstancedMesh = createInstancedMeshFromGeometry( dirtGround3Geometries, new THREE.MeshStandardMaterial( { color: 0x5D465D } ) );
		this.game.graphics.meshes.push( dirtGround3InstancedMesh );
		this.game.graphics.scene.add( dirtGround3InstancedMesh );
		dirtGround3InstancedMesh.castShadow = true;
		dirtGround3InstancedMesh.receiveShadow = true;

		const tree1Model = this.game.graphics.assets['TREE1'];
		tree1Model.scale.set(1, 1, 1);
		const tree1InstancedMesh = createInstancedMeshFromModel( tree1Model, tree1Positions, random );
		this.game.graphics.meshes.push( ...tree1InstancedMesh );
		this.game.graphics.scene.add( ...tree1InstancedMesh );

		const tree2Model = this.game.graphics.assets['TREE2'];
		tree2Model.scale.set(0.5, 0.65, 0.5);
		const tree2InstancedMesh = createInstancedMeshFromModel( tree2Model, tree2Positions, random );
		this.game.graphics.meshes.push( ...tree2InstancedMesh );
		this.game.graphics.scene.add( ...tree2InstancedMesh );

		const tree3Model = this.game.graphics.assets['TREE3'];
		tree3Model.scale.set(0.65, 0.9, 0.65);
		const tree3InstancedMesh = createInstancedMeshFromModel( tree3Model, tree3Positions, random );
		this.game.graphics.meshes.push( ...tree3InstancedMesh );
		this.game.graphics.scene.add( ...tree3InstancedMesh );

		const fungi1Model = this.game.graphics.assets['FUNGI1'];
		fungi1Model.scale.set(0.02, 0.02, 0.02);
		const fungi1InstancedMesh = createInstancedMeshFromModel( fungi1Model, fungi1Positions, random );
		this.game.graphics.meshes.push( ...fungi1InstancedMesh );
		this.game.graphics.scene.add( ...fungi1InstancedMesh );
		
		const rockModel = this.game.graphics.assets['ROCK'];
		//rockModel.scale.set(0.05, 0.05, 0.05);
		const rockInstancedMesh = createInstancedMeshFromModel( rockModel, rockPositions, random );
		this.game.graphics.meshes.push( ...rockInstancedMesh );
		this.game.graphics.scene.add( ...rockInstancedMesh );

	};

};