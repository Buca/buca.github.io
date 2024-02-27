const DOMParserSupport = (function () {
	
	if ( !window.DOMParser ) return false;
	
	const parser = new DOMParser();
	
	try { parser.parseFromString('x', 'text/html'); }
	catch ( error ) { return false; }
	
	return true;

})();

function stringToHTML( str ) {

	if ( DOMParserSupport ) {
		
		const parser = new DOMParser();
		const doc = parser.parseFromString(str, 'text/html');
		
		return doc.body;
	
	}

	// Fallback:
	const doc = document.createElement('body');
	doc.innerHTML = str;
	return doc;

};

async function getHTMLFromURL( url ) {

	let response;
	let html;

	try {
	    
	    response = await fetch( url );
	    let status = response.ok;

	    if ( !status ) response = await fetch('../not-found.html');

	    const text = await response.text();
		html = stringToHTML( text ).querySelector('.window');

		if ( !status ) html.querySelector('#file-name').append( url );

	} catch ( e ) {
	    
		response = await fetch('../not-found.html');

		const text = await response.text();
		html = stringToHTML( text ).querySelector('.window');

		html.querySelector('#file-name').append( url );

	};

	return html;

};

function getHash() {

	return location.hash.substring( 1 );

};

async function initHash() {

	const href = getHash();

	if ( href !== '' ) await retrieveAndDisplayPage( href );

	const directory = href.split('/')[0];

	const unselect = document.querySelector(`header .selected`);
	const select = document.querySelector(`header [href='#${directory}']`)

	if ( unselect ) unselect.classList.remove('selected');
	if ( select ) select.classList.add('selected');

	addEventListener( "hashchange", () => {

		const href = getHash();

		if ( href !== '' ) retrieveAndDisplayPage( href );

		const directory = href.split('/')[0];

		const unselect = document.querySelector(`header .selected`);
		const select = document.querySelector(`header [href='#${directory}']`)

		if ( unselect ) unselect.classList.remove('selected');
		if ( select ) select.classList.add('selected');
		

	});

	if ( href === '' ) window.location.hash = 'about-me';

};

async function init() {

	if ( window.location.hash === '' ) {

		window.location.hash = '?';
		window.location.hash = '';

	}

	initHash();

};

async function retrieveAndDisplayPage( href ) {

	const loading = document.querySelector('.loader-container');

	loading.classList.remove('hidden');

	let element = await getHTMLFromURL( href + '.html' );

	if ( !document.querySelector('.window') ) {

		document
			.querySelector('main')
			.append( element );

		const scripts = element.querySelectorAll('script');
		for ( script of scripts ) {


			const e = document.createElement('script');
			e.src = script.src;

			script.remove();

			const re = document.querySelector(`script[src='${script.src}']`);

			if ( re ) re.replaceWith( e ); 
			else document.body.append(e);

			loading.classList.add('hidden');

		}

	}

	else {

		const windowElement = document.querySelector('.window');

		windowElement.classList.add('window-exit');

		windowElement.onanimationend = () => {

			windowElement.onanimationend = undefined;

			windowElement.replaceWith( element );

			const scripts = element.querySelectorAll('script');
			for ( script of scripts ) {


				const e = document.createElement('script');
				e.src = script.src;

				script.remove();

				const re = document.querySelector(`script[src='${script.src}']`);

				if ( re ) re.replaceWith( e ); 
				document.body.append(e);

				loading.classList.add('hidden');

			}

		}

	}


};


function initScrollRestoration() {

	// If current href is the same as the last href,
	// then scroll to the last y scroll position.
	// Otherwise update last page to current one and reset the y-scroll

	const lastHash = localStorage.getItem('bh-last-page');
	const currentHash = getHash();

	if ( lastHash === currentHash ) {

		const scrollY = localStorage.getItem('bh-scroll-y');
		window.scrollTo( 0, scrollY );

	} else {

		localStorage.setItem('bh-last-page', currentHash );
		localStorage.setItem('bh-scroll-y', window.scrollY );

	}

	document.addEventListener('scroll', ( event ) => {

		localStorage.setItem('bh-scroll-y', window.scrollY );

	});

	addEventListener( "hashchange", () => {

		const lastHash = localStorage.getItem('bh-last-page');
		const currentHash = getHash();

		if ( lastHash === currentHash ) {

			const scrollY = localStorage.getItem('bh-scroll-y');
			window.scrollTo( 0, scrollY );

		} else {

			localStorage.setItem('bh-last-page', currentHash );
			localStorage.setItem('bh-scroll-y', window.scrollY );

		}

	});

};


init();