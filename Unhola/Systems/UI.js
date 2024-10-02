import * as THREE from 'three';

export class UI {

	constructor( game, root ) {

		this.game = game;

		this.root = root;
		this.element;

		this.inventory = {
			element: null,
			list: []
		};
		this.crafting = {
			element: null,
			list: [],
			pool: []
		};
		this.hotbar = {
			elment: null,
			list: []
		};
		this.interaction = {
			element: null
		};
		this.labels = {
			element: null,
			map: new Map(),
			pool: []
		};

		this.labels = new Map();



		this.init();

	};

	initCraftingWindow() {

		const crafting = document.createElement('div');
		crafting.id = 'crafting';

		const title = document.createElement('h2');
		title.textContent = `~ Crafting ~`;

		const search = document.createElement('input');
		search.type = 'search';

		const slots = document.createElement('div');
		slots.id = `crafting-slots`;
		
		crafting.append( title, slots );

		for ( let i = 0; i < 4; i ++ ) {
			for ( let j = 0; j < 2; j ++ ) {

				const slot = document.createElement('div');
				slot.classList.add('slot');

				const name = document.createElement('div');
				amount.classList.add('name');

				const item = document.createElement('div');
				item.classList.add('item');

				slot.append( amount, item );
				slots.append( slot )

			}
		}

		this.crafting.element = crafting;
		this.root.append( crafting );

	};

	updateCraftingWindow() {

		// Get crafting recepies/instructions available to the items in the player's inventory. 
		const recepies = this.game.avalableRecepies();
		

	};

	initInventoryWindow() {

		const inventory = document.createElement('div');
		inventory.id = 'inventory';

		const title = document.createElement('h2');
		title.textContent = `~ Inventory ~`;

		const slots = document.createElement('div');
		slots.id = `inventory-slots`;
		
		inventory.append( title, slots );

		for ( let i = 0; i < 4; i ++ ) {
			for ( let j = 0; j < 4; j ++ ) {

				const slot = document.createElement('div');
				slot.classList.add('slot');

				const amount = document.createElement('div');
				amount.classList.add('amount');

				const item = document.createElement('div');
				item.classList.add('item');

				slot.append( amount, item );
				slots.append( slot )

			}
		}

		this.inventory.element = inventory;
		this.root.append( inventory );

	};

	updateInventoryWindow() {

		const playerInventory = this.game.player.inventory;

		// 

	};

	initHotbarWindow() {

		const hotbar = document.createElement('div');
		hotbar.id = 'primary-inventory';

		for ( let i = 0; i < 4; i ++ ) {

			const slot = document.createElement('div');
			slot.classList.add('slot');

			const slotNumber = document.createElement('div');
			slotNumber.textContent = (i+1) + '.';
			slotNumber.classList.add('number');

			const item = document.createElement('div');
			item.classList.add('item');

			const amount = document.createElement('div');
			amount.classList.add('amount');

			slot.append( slotNumber, item, amount );

			hotbar.append( slot );

			if ( i === 0 ) slot.classList.add('selected');

		}

		this.hotbar.element = hotbar;
		this.root.prepend( hotbar );

	};

	updateHotbarWindow() {

		const hotbar = this.game.player.hotbar;

		for ( let i = 0; i < hotbar.length; i ++ ) {

			const entity = hotbar[ i ];
			const slot = this.hotbar.list[ i ];

			const stackable = Game.items.isStackable( entity.item );
			const amount = Game.items.getStackAmount( entity.item );

			const name = entity.name;

			entity.item.stac

		}


	};

	initInteractionWindow() {

		const interaction = document.createElement('div');
		interaction.id = 'interaction';

		const topRow = document.createElement('div');
		
		const left = document.createElement('button');
		const leftIcon = document.createElement('span');
		const leftKey = document.createElement('span');
		left.append( leftIcon, leftKey );

		const title = document.createElement('span');
		
		const right = document.createElement('button');
		const rightIcon = document.createElement('span');
		const rightKey = document.createElement('span');
		right.append( rightKey, rightIcon );

		topRow.append( left, title, right );


		const bottomRow = document.createElement('div');

		const primary = document.createElement('button');
		const primaryKey = document.createElement('span');
		const primaryText = document.createElement('span');
		const primaryBackground = document.createElement('div');
		primary.append( primaryBackground, primaryKey, primaryText );
		
		const secondary = document.createElement('button');
		const secondaryKey = document.createElement('span');
		const secondaryText = document.createElement('span');
		const secondaryBackground = document.createElement('div');
		secondary.append( secondaryBackground, secondaryKey, secondaryText );

		bottomRow.append( primary, secondary );
		
		this.interaction.element = interaction;
		this.root.append( crafting );

	};
	
	updateInteractionWindow() {

	};

	initLabelWindow() {};
	updateLabelWindow() {};




	initPrimaryInventory() {

		const primaryInventory = document.createElement('div');
		primaryInventory.id = 'primary-inventory';

		for ( let i = 0; i < 4; i ++ ) {

			const slot = document.createElement('div');
			slot.classList.add('slot');

			const slotNumber = document.createElement('div');
			slotNumber.textContent = (i+1) + '.';
			slotNumber.classList.add('number');

			const item = document.createElement('div');
			item.classList.add('item');

			const amount = document.createElement('div');
			amount.classList.add('amount');

			slot.append( slotNumber, item, amount );

			primaryInventory.append( slot );

			if ( i === 0 ) slot.classList.add('selected');

		}

		this.root.prepend( primaryInventory );

	};

	updatePrimaryInventory() {};

	initInteractionWindow() {};

	updateInteractionWindow() {};

	initLabelWindow() {

		const labels = document.createElement('div');
		labels.id = 'labels';

		this.root.prepend( labels );

	};

	updateLabelWindow() {

		// Remove the ones that aren't in attention anymore
		// add the new ones
		// and update the ones that stayed

		const container = document.getElementById('labels');

		const canvas = this.game.graphics.renderer.domElement; // `renderer` is a THREE.WebGLRenderer

		for ( const entity of this.game.player.attention ) {

			let element; 

			if ( !this.labels.has( entity ) ) {

				element = document.createElement('label');
				element.textContent = entity.name;

				this.labels.set( entity, element );

				container.append( element );

			} else {

				element = this.labels.get( entity );

			}

			const vector = new THREE.Vector3();

			entity.mesh.updateMatrixWorld();  // `obj´ is a THREE.Object3D
			vector.setFromMatrixPosition(entity.mesh.matrixWorld);

			vector.project(this.game.graphics.camera); // `camera` is a THREE.PerspectiveCamera

			const x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
			const y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

			const w = element.offsetWidth;
			const h = element.offsetHeight;

			element.style.transform = `translate(${Math.round(x - w/2)}px,${Math.round(y - h/2 - 45 )}px)`;

		}

		for ( const entity of this.labels.keys() ) {

			if ( !this.game.player.attention.includes( entity ) ) {

				const element = this.labels.get( entity );
				element.remove();
				this.labels.delete( entity );

			}

		}

	};

	init() {

		//this.initHotbarWindow();
		//this.initLabelWindow();
		//this.initInteractionWindow()

	};

	update() {

		//this.updateCraftingWindow();
		//this.updateInventoryWindow();
		//this.updateInteractionWindow();
		//this.updateHotbarWindow();
		//this.updateLabelWindow();

	}

}