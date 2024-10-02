export class Ticker {

	constructor( rate ) {

		this.rate = rate;
		this.ticks = 0;
		this.lastTickTS = null;
		this.correction = 0;
		this.timeoutId = null;

		this.handlers = new Map();


	};

	add( handler, rate ) {

		this.handler.set( handler, rate );

	};

	tick() {


		for ( const [ handler, rate ] of this.handlers ) {

			if ( this.ticks % rate === 0 ) handler();

		}
		
		const now = Date.now();
		if (this.lastTickTS !== null ) this.correction = (now - this.lastTickTS) - this.rate;
		this.lastTickTS = now;

		this.ticks ++;

	};

	start() {

		const tickHandler = () => {

			this.tick();

			tickhandler();


		};

 
		this.timeoutId = setTimeout( tickhandler, this.rate + this.correction );

	}

	pause() {

		clearTimeout( this.timeoutId );
		this.lastTickTS = null;

	}

};