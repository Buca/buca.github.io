async function showNetworkStatus() {

	const status = document.getElementById('network-status');
	const title = status.querySelector('h1');
	const text = status.querySelector('.load-text');
	const icon = status.querySelector('i');

	status.classList.remove('hidden');
	status.classList.add('fade-in');

	icon.classList.remove('gg-check-o');
	icon.classList.add('gg-spinner-two-alt');

	text.classList.remove('hidden');
	status.onanimationend = () => {

		status.classList.remove('fade-in');

	};

	await delay( 250 );
	writeEachLetter( 'DISCONNECTED!', title, 5, Sound.TypeLetter, Sound.RemoveLetter );

};

async function hideNetworkStatus() {

	const status = document.getElementById('network-status');
	const title = status.querySelector('h1');
	const text = status.querySelector('.load-text');
	const icon = status.querySelector('i');

	icon.classList.remove('gg-spinner-two-alt');
	icon.classList.add('gg-check-o');

	text.classList.add('hidden');

	title.textContent = '';
	await writeEachLetter( 'CONNECTED!', title, 5, Sound.TypeLetter, Sound.RemoveLetter );

	document
		.getElementById('network-status')
		.classList.add('fade-out');

	status.onanimationend = () => {

		status.classList.add('hidden');
		status.classList.remove('fade-out');
		title.textContent = '';

	};

};


if ( !window.navigator.onLine ) showNetworkStatus(); 

window.addEventListener('online', () => hideNetworkStatus() );
window.addEventListener('offline', () => showNetworkStatus() );