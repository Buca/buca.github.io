let paused = false;

window.addEventListener('blur', () => {

	paused = true;

});

window.addEventListener('focus', () => {

	paused = false;
	for ( const resolve of whenNotPausedResolve ) resolve();
	whenNotPausedResolve.length = 0;

});

const whenNotPausedResolve = [];

async function whenNotPaused() {

	return new Promise( ( resolve, reject ) => whenNotPausedResolve.push( resolve ));

};

async function retrieveSnippetsByTitle( title ) {

	const params = new URLSearchParams({

		origin: "*",
		action: "query",
		prop: "extracts",
    	exlimit: "max",
    	exintro: "",
    	explaintext: "",
    	titles: title,
    	format: "json",
    	redirects: ""
	
	});

	const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;

	const res = await( await fetch( url )).json();

	const key = Object.keys(res.query.pages)[0];

	return res.query.pages[ key ].extract;

};

async function retrieveTitlesFromRandomCategory() {

	// 1. Get a random article
	// 2. Get the category of the random article
	// 3. If there are not enough category members, go back to step 1. else continue to 4.
	// 4. ...

	const params = new URLSearchParams({

		origin: "*",
		action: "query",
		list: "random",
    	rnlimit: "1",
    	rnnamespace: 14,
    	format: "json"

	});

	const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;

	let documents = [];

	while( documents.length < 4 ) {

		const res = await( await fetch( url )).json();

		const title = res.query.random[0].title;

		documents = (await retrieveTitlesFromCategory( title ));

		if( documents === false ) continue;


	}

	return documents;

};

// TO DO: Filtration step, by title name and by category count:
async function searchCategories( text ) {

	const params = new URLSearchParams({

		origin: "*",
		profile: "normal",
		action: "opensearch",
    	limit: "100",
    	namespace: 14,
    	format: "json",
    	search: text

	});

	const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;

	const res = await( await fetch( url )).json();

	return res[ 1 ];

	const results = [];

	for( let i = 0; i < res.query.search.length; i ++ ) {

		results.push( res.query.search[ i ] );

	} 

	return results;

};

function chooseRemove( options ) {

	// Generate random index
	const index = Math.floor( Math.random() * options.length );

	// Remove at value index and return value
	return options.splice( index, 1 )[0];

};

async function retrieveTitlesFromCategory( category ) {

	let params = new URLSearchParams({
		
		origin: "*",
		action: "query",
    	cmnamespace: 0,
    	cmlimit: 10,
    	list: "categorymembers",
    	format: "json",
    	cmtitle: category

	});

	let url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;

	let response = await( await fetch( url )).json();
	let options = response.query.categorymembers;
	const selected = [];

	// needs to check if document has been guessed, belong to filter list, or dont have enough content
	while ( selected.length < 4 ) {

		let option;

		// If there are documents left in the response, then remove and return one randomly:
		if ( options.length > 0 ) option = chooseRemove( options );
		else if ( false /*query can be continued*/ ) {
		
			/*continue query*/
			params = new URLSearchParams({
				
				origin: "*",
				action: "query",
		    	cmnamespace: 0,
		    	cmlimit: 10,
		    	list: "categorymembers",
		    	format: "json",
		    	cmtitle: category,
		    	...response.continue

			});

			url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;

			response = await( await fetch( url )).json();
			options = response.query.categorymembers;

			continue;
		
		} 

		else return false;

		// Filter
		if( Game.documents.includes( option.pageid ) ) continue;
		//if( filterOption( option ) !== option ) continue;

		selected.push( option );

	}

	if( selected.length < 4 ) return false;

	// needs to check for duplicates in the options
	// continue query if you run out of options

	return selected;

};

function chooseOneRandomly( options ) {

	return options[ Math.floor( Math.random() * options.length )];

};

async function retrieveTurn( category, difficulty ) {

	let options;

	if( category.toLowerCase() === 'random' ) {

		// Retrieve 4 options from a random category 
		options = await retrieveTitlesFromRandomCategory();

	}

	else {

		// Retrieve 4 options from user specified category
		options = await retrieveTitlesFromCategory( category );

	}

	// Choose a winner
	const correct = chooseOneRandomly( options );

	// Retrieve document snippets text for the winner
	const snippets = await retrieveSnippetsByTitle( correct, difficulty );

	return { options, correct, snippets };

};

let NLPWorker;

async function obfuscate( title, text, threshold = 0 ) {

	if ( !NLPWorker ) NLPWorker = new Worker('scripts/app/NLPWorker.js'); 

	NLPWorker.postMessage({
	
		title: title,
		text: text,
		threshold: threshold
	
	});

	return new Promise( ( resolve ) => {

		NLPWorker.onmessage = ( evt ) => {
		
			NLPWorker.onmessage = undefined;
			resolve( evt.data );

		}

	});

};

function delay( ms ) {

	return new Promise( resolve => setTimeout( resolve, ms ) );	

};

async function writeEachLetter( text, targetElement, ms, callback, removeHandler ) {

	// check for typing attribute
	// if it true, cancel the typing
	// and retype

	const timerId = Math.random().toString();
	const textContentLength = targetElement.textContent.length;
	targetElement.setAttribute('timer-id', timerId);

	for ( let i = 0; i < textContentLength; i ++ ) {

		if ( paused ) await whenNotPaused();

		let text = targetElement.textContent.slice(0, textContentLength - i - 1);

		if (targetElement.getAttribute('timer-id') !== timerId) return;
		if (removeHandler) removeHandler();

		if ( text === '' ) targetElement.textContent = '-';
		else targetElement.textContent = text;
		if ( i !== 0 ) timeoutId = await delay( 10 );

	}

	for( let i = 0; i < text.length; i ++ ) {

		if ( paused ) await whenNotPaused();

		if (targetElement.getAttribute('timer-id') !== timerId) return;

		if ( callback ) callback();

		const letter = text.charAt( i );
		if( i === 0 ) targetElement.textContent = letter;
		else targetElement.textContent += letter;

		if( i < text.length - 1 ) timeoutId = await delay( ms );

	}

};

async function writeEachWord( words, targetElement, ms, callback ) {

	for( let i = 0; i < words.length; i ++ ) {

		callback();

		const word = words[ i ];
	
		const wordElement = document.createElement('p');

		wordElement.classList.add('word');
		wordElement.textContent = word.text;

		if( word.hide ) wordElement.classList.add('hide');

		targetElement.append( wordElement );
		targetElement.append( ' ' );

		if( i < words.length - 1 ) await delay( ms );
		
	}

};