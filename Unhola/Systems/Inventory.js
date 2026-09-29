import { cylindricalDistance } from '../Utilities.js';

export class Inventory {

	constructor( game, { primarySize = 3, secondarySize = 10 } = {} ) {

		this.game = game;
		this.primary = Array( primarySize ).fill( null );
		this.secondary = Array( secondarySize ).fill( null );
		this.selectedPrimary = 0;
		this.expanded = false;
		this.pickupRange = 2.75;
		this.ui = document.querySelector( '.inventory-ui' );
		this.primaryEl = this.ui?.querySelector( '.inventory-primary' );
		this.secondaryEl = this.ui?.querySelector( '.inventory-secondary' );

		this.game.events.addEventListener( 'start', () => this.show() );
		this.game.events.addEventListener( 'resume', () => this.show() );
		this.game.events.addEventListener( 'pause', () => this.hide() );
		this.game.events.addEventListener( 'quit', () => this.hide() );

		this.render();

	}

	show() {

		this.ui?.classList.remove( 'hidden' );
		this.render();

	}

	hide() {

		this.ui?.classList.add( 'hidden' );
		this.expanded = false;
		this.render();

	}

	toggleExpanded() {

		this.expanded = !this.expanded;
		this.render();

	}

	reset() {

		this.primary.fill( null );
		this.secondary.fill( null );
		this.selectedPrimary = 0;
		this.expanded = false;
		this.render();

	}

	setSelectedPrimary( index ) {

		if ( index < 0 || index >= this.primary.length ) return;
		this.selectedPrimary = index;
		this.render();

	}

	get firstEmptyPrimaryIndex() { return this.primary.findIndex( ( item ) => item === null ); }
	get firstEmptySecondaryIndex() { return this.secondary.findIndex( ( item ) => item === null ); }

	add( item ) {

		let index = this.firstEmptyPrimaryIndex;
		if ( index >= 0 ) {

			this.primary[ index ] = item;
			item.pickUp();
			this.setMessage( `${ item.name } -> hot ${ index + 1 }` );
			this.render();
			return true;

		}

		index = this.firstEmptySecondaryIndex;
		if ( index >= 0 ) {

			this.secondary[ index ] = item;
			item.pickUp();
			this.setMessage( `${ item.name } -> cold ${ index + 1 }` );
			this.render();
			return true;

		}

		this.setMessage( 'inventory full' );
		return false;

	}

	findNearestPickup() {

		const player = this.game.player;
		if ( !player ) return null;

		let nearest = null;
		let nearestDistance = Infinity;
		for ( const item of this.game.items ?? [] ) {

			if ( item.held || item.disposed ) continue;
			const distance = cylindricalDistance( player.r, player.y, item.r, item.y, this.game.radius.center );
			if ( distance > this.pickupRange || distance >= nearestDistance ) continue;
			nearest = item;
			nearestDistance = distance;

		}

		return nearest;

	}

	pickupNearest() {

		const item = this.findNearestPickup();
		if ( !item ) {

			this.setMessage( 'nothing nearby' );
			return false;

		}

		return this.add( item );

	}

	dropSelectedPrimary() {

		const item = this.primary[ this.selectedPrimary ];
		if ( !item ) {

			this.setMessage( 'hot slot empty' );
			return false;

		}

		this.primary[ this.selectedPrimary ] = null;
		this.dropItemNearPlayer( item );
		this.setMessage( `dropped ${ item.name }` );
		this.render();
		return true;

	}

	dropItemNearPlayer( item ) {

		const player = this.game.player;
		const direction = player.movingLeft > player.movingRight ? -1 : 1;
		const r = player.r + direction * 0.006;
		let y = player.y - player.height * 0.5 + item.height * 0.5 + 0.08;
		const floor = this.game.fixed.queryRY( player.r, player.y - 0.55, 1.2, 1.4, 1.2 );
		for ( const index of floor ) y = Math.max( y, this.game.fixed.getMaxY( index ) + item.height * 0.5 + 0.06 );
		item.dropAt( r, y );

	}

	moveSecondaryToPrimary( secondaryIndex ) {

		const primaryIndex = this.firstEmptyPrimaryIndex;
		if ( primaryIndex < 0 ) return false;
		const item = this.secondary[ secondaryIndex ];
		if ( !item ) return false;
		this.secondary[ secondaryIndex ] = null;
		this.primary[ primaryIndex ] = item;
		this.setMessage( `${ item.name } -> hot ${ primaryIndex + 1 }` );
		this.render();
		return true;

	}

	setMessage( text ) {

		this.game.messages?.set( text );

	}

	renderSlot( item, index, type ) {

		const label = item ? item.name : '';
		const key = type === 'primary' ? `${ index + 1 }` : '';
		const selected = type === 'primary' && index === this.selectedPrimary;
		return `<div class="inventory-slot ${ type } ${ selected ? 'selected' : '' } ${ item ? 'filled' : '' }">
			<span class="inventory-slot-key">${ key }</span>
			<span class="inventory-slot-name">${ label }</span>
		</div>`;

	}

	render() {

		this.ui?.classList.toggle( 'expanded', this.expanded );
		if ( this.primaryEl ) this.primaryEl.innerHTML = this.primary.map( ( item, index ) => this.renderSlot( item, index, 'primary' ) ).join( '' );
		if ( this.secondaryEl ) this.secondaryEl.innerHTML = this.secondary.map( ( item, index ) => this.renderSlot( item, index, 'secondary' ) ).join( '' );

	}

	toJSON() {

		const serialize = ( item ) => item ? item.toJSON() : null;
		return {
			selectedPrimary: this.selectedPrimary,
			primary: this.primary.map( serialize ),
			secondary: this.secondary.map( serialize )
		};

	}

	fromJSON( data, createItem ) {

		this.reset();
		if ( !data ) return;
		this.selectedPrimary = data.selectedPrimary ?? 0;
		const hydrate = ( itemData ) => {

			if ( !itemData ) return null;
			const item = createItem( itemData );
			item.pickUp();
			return item;

		};
		this.primary = this.primary.map( ( _, index ) => hydrate( data.primary?.[ index ] ) );
		this.secondary = this.secondary.map( ( _, index ) => hydrate( data.secondary?.[ index ] ) );
		this.render();

	}

}
