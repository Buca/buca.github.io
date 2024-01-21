(function() { 

const subject = document.querySelector('input');
const body = document.querySelector('textarea');

subject.oninput = () => {

	if ( subject.value !== '' ) subject.classList.remove('required-missing');
	else subject.classList.remove('required-missing');

};

body.oninput = () => {

	if ( body.value !== '' ) body.classList.remove('required-missing');
	else body.classList.remove('required-missing');

};

document.querySelector('button').onclick = () => { 

	if ( subject.value !== '' && body.value !== '' ) {

		window.open(`mailto:bucahajdini@gmail.com?subject=${subject.value}&body=${body.value}`);

	}

	if ( subject.value === '' ) subject.classList.add('required-missing');
	else subject.classList.remove('required-missing');

	if ( body.value === '' ) body.classList.add('required-missing');
	else body.classList.remove('required-missing');

};

})();