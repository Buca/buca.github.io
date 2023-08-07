importScripts('../libs/compromise.js');


function filterSubwords( subwords ) {

	return subwords.filter( word => {

		return 
			word == '' || word == 'the' ||
			words == 'and' || words == 'or' ||
			words == 'of';

	});

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

onmessage = ( evt ) => {
	
	const title = evt.data.title;
	const text = evt.data.text;
	let threshold;

	if ( evt.data.threshold === 'HARD' ) { threshold = 0.2 }
	else if ( evt.data.threshold === 'MEDIUM' ) { threshold = 0.4 }
	else if ( evt.data.threshold === 'EASY') { threshold = 0.6 }

	let words = subwords( title );
	let auxText = text;

	//words = filterSubwords( words );

	const matches = []; 

	while( words.length > 0 ) {

		const word = nlp(popGreatestSubword( words )).normalize().text();

		matches.push({

			match: `(${word}|~${word}~)`,
			tag: 'hide',
			fuzzy: threshold

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

	postMessage( result );

};