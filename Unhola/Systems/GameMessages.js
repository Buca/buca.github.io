export class GameMessages {

	constructor( game, { max = 4 } = {} ) {

		this.game = game;
		this.max = max;
		this.active = false;
		this.nextId = 0;
		this.messages = [];
		this.ui = document.querySelector( '.game-messages' );

		this.game.events.addEventListener( 'start', () => this.show() );
		this.game.events.addEventListener( 'resume', () => this.show() );
		this.game.events.addEventListener( 'pause', () => this.hide() );
		this.game.events.addEventListener( 'quit', () => this.hide() );

		this.render();

	}

	show() {

		this.active = true;
		this.render();

	}

	hide() {

		this.active = false;
		this.render();

	}

	set( text, { duration = 2200 } = {} ) {

		if ( !text ) return;

		const id = ++this.nextId;
		this.messages.push({ id, text });
		if ( this.messages.length > this.max ) this.messages.shift();
		this.render();

		window.setTimeout( () => this.remove( id ), duration );

	}

	remove( id ) {

		this.messages = this.messages.filter( ( message ) => message.id !== id );
		this.render();

	}

	render() {

		if ( !this.ui ) return;

		this.ui.classList.toggle( 'hidden', !this.active || this.messages.length === 0 );
		this.ui.replaceChildren(
			...this.messages.map( ( message ) => {

				const element = document.createElement( 'div' );
				element.className = 'game-message';
				element.textContent = message.text;
				return element;

			})
		);

	}

}
