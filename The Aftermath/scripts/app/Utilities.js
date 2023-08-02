const filterList = [
	'list of',
	'filmography', 
	'discography'
];

function filterDocuments( titles ) {

	const result = [];

	console.log('Filter Documents: ', titles );

	for ( const item of titles ) {

		const doc = nlp( item.title ).normalize();

		for (const word of filterList) {

			if ( doc.has(word) || result.includes( item ) ) continue;

			result.push( item );

		}

	}

	return result;
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

		documents = filterDocuments( documents );


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

function chooseN( options, n ) {

	const result = [];

	while ( result.length < n ) {

		const index = Math.floor( Math.random() * options.length );
		const option = options[ index ];

		if ( !result.includes( option ) ) result.push( option );

	}

	return result;

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

function subwords( word ) {


	const result = [];

	for( let start = 0; start < word.length - 1; start ++ ) {

		if( word.charAt( start ) !== ' ' && start !== 0 ) continue;

		for( let end = start + 1; end < word.length; end ++ ) {

			if( word.charAt( end ) !== ' ' && end !== word.length - 1 ) continue;

			const subword = word.slice( start, end + 1 ).toLowerCase().trim().replace('(','').replace(')','');

			if( !result.includes( subword ) ) result.push( subword );

		}

	}

	return result.sort((a, b) => b.length - a.length);

};

function filterSubwords( subwords ) {

	return subwords.filter( word => {

		return 
			word == '' || word == 'the' ||
			words == 'and' || words == 'or' ||
			words == 'of';

	});

};

function popGreatestSubword( subwords ) {

	let subword = undefined;
	let index = 0;

	for( let i = 0; i < subwords.length; i ++ ) {

		if( subword === undefined || subwords[ i ].includes( subwords ) ) {

			index = i;
			subword = subwords[ i ];

		}

	}

	return subwords.splice( index, 1 )[ 0 ];

};


function obfuscate( title, text, threshold = 0 ) {

	// 1. Accumulate title to respective subwords
	// 2. Filter out duplicates and words like 'the', 'and' ...
	// 3. Pick the largest of the subwords
	// 4. Fuzzy match the subword with the text
	// 5. Replace that part with a OBFUSCATE term/object
	// 6. Repeat from step 3. with the next largest subword,
	//	  until you run out of words.
	// 7. Return final result.


	let words = subwords( title );
	let auxText = text;

	//words = filterSubwords( words );

	const matches = []; 

	while( words.length > 0 ) {

		const word = nlp(popGreatestSubword( words )).normalize().text();

		matches.push({

			match: `(${word}|~${word}~)`,
			tag: 'hide',
			fuzzy: 0.6

		});

	}

	const net = nlp.buildNet( matches );
	const doc = nlp( auxText ).normalize();
	const res = doc.sweep( net );
	
	const json = doc.json();

	const result = [];

	for( const sentance of json ) {

		const section = [];

		for( const term of sentance.terms ) {

			section.push({

				text: term.pre + term.text + term.post,
				hide: term.tags.includes( 'hide' ) || Math.random() > 1 - threshold

			});

		}

		result.push(section)

	}

	return result;

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

		let text = targetElement.textContent.slice(0, textContentLength - i - 1);

		if (targetElement.getAttribute('timer-id') !== timerId) return;
		if (removeHandler) removeHandler();

		if ( text === '' ) targetElement.textContent = '-';
		else targetElement.textContent = text;
		if ( i !== 0 ) timeoutId = await delay( 10 );

	}

	for( let i = 0; i < text.length; i ++ ) {

		if (targetElement.getAttribute('timer-id') !== timerId) return;

		if ( callback ) callback();

		const letter = text.charAt( i );
		if( i === 0 ) targetElement.textContent = letter;
		else targetElement.textContent += letter;

		if( i < text.length - 1 ) await delay( ms );

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