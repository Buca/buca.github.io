const seqA = new Tone.Sequence(( time, note ) => {

	musicSynthA.triggerAttackRelease( note, 2.5, time, 0.01 );

	}, [

		"D3", ["G2", "Bb2", "A2"],
		"D2", ["G2", "Bb2", "C3"],
		"G2", ["G2", "Bb2", "A2"],
		"D2", ["G2", "Bb2", "C3"]

	], 2).start( 0 );

const seqB = new Tone.Sequence(( time, note ) => {

	musicSynthB.triggerAttackRelease( note, 0.1, time, 0.1 );

}, [ 

	["D4", "E4", "G4", "A4"], 
	["A4", "G4", "E4", "D3"], 
	["D4", "E4", "G4", "G4"],
	["A4", "G4", "E4", "D3"],

	null,
	null,
	null,
	null


], 2).start( 8 );


const seqC = new Tone.Sequence(( time, note ) => {

	musicBassSynth.triggerAttackRelease( note, 0.15, time, 0.25 );

}, ["D1", "E1", "Bb1", "A1"], 1).start( 0 );

const UISynthA = new Tone.MonoSynth({
	oscillator: {
		type: "triangle",
	},
	envelope: {
		attack: 0,
		decay: 0.8,
		sustain: 1.0,
		release: 0.1
	}
}).connect( UIGain );

const UISynthB = new Tone.MonoSynth({
	oscillator: {
		type: "square"
	},
	envelope: {
		attack: 0,
		decay: 0.8,
		sustain: .3,
		release: 0.1
	}
}).connect( UIGain );

const UISynthC = new Tone.MonoSynth({
	oscillator: {
		type: "triangle",
	},
	envelope: {
		attack: 0,
		decay: 0.01,
		sustain: .01,
		release: 0.01
	}
}).connect( UIGain );
const UISynthD = new Tone.MonoSynth({
	oscillator: {
		type: "square"
	},
	envelope: {
		attack: 0.01,
		decay: 0.01,
		sustain: .01,
		release: 0.1
	}
}).connect( UIGain );
const UISynthE = new Tone.MonoSynth({
	oscillator: {
		type: "triangle",
	},
	envelope: {
		attack: 0,
		decay: 0.01,
		sustain: .01,
		release: 0.01
	}
}).connect( UIGain );
const UISynthF = new Tone.MonoSynth({
	oscillator: {
		type: "square"
	},
	envelope: {
		attack: 0.01,
		decay: 0.01,
		sustain: .01,
		release: 0.1
	}
}).connect( UIGain );
const UISynthG = new Tone.MonoSynth({
	oscillator: {
		type: "triangle"
	},
	envelope: {
		attack: 0.2,
		decay: 0.1,
		sustain: .1,
		release: 0.1
	}
}).connect( UIGain );


const UISynthH = new Tone.MonoSynth({
	oscillator: {
		type: "square"
	},
	envelope: {
		attack: 0.1,
		decay: 0.5,
		sustain: .01,
		release: 0.1
	}
}).connect( UIGain );

const UISynthI = new Tone.MonoSynth({
	oscillator: {
		type: "triangle"
	},
	envelope: {
		attack: 0.025,
		decay: 0.05,
		sustain: 0,
		release: 0.01
	}
}).connect( UIGain );


const UISynthJ = new Tone.MonoSynth({
	oscillator: {
		type: "square"
	},
	envelope: {
		attack: 0.025,
		decay: 0.05,
		sustain: 0,
		release: 0.01 
	}
}).connect( UIGain );

const UISynthK = new Tone.MonoSynth({
	oscillator: {
		type: "sawtooth"
	},
	envelope: {
		attack: 0.25,
		decay: 0.05,
		sustain: 0,
		release: 0.01
	}
}).connect( UIGain );


const UISynthL = new Tone.MonoSynth({
	oscillator: {
		type: "square"
	},
	envelope: {
		attack: 0.05,
		decay: 0.01,
		sustain: .01,
		release: 0.01
	}
}).connect( UIGain );

const UISynthN = new Tone.MonoSynth({
	oscillator: {
		type: "triangle"
	},
	envelope: {
		attack: 0.2,
		decay: 0.1,
		sustain: .1,
		release: 0.1
	}
}).connect( UIGain );


const UISynthM = new Tone.MonoSynth({
	oscillator: {
		type: "square"
	},
	envelope: {
		attack: 0.1,
		decay: 0.5,
		sustain: .01,
		release: 0.1
	}
}).connect( UIGain );

const UISynthX = new Tone.MonoSynth({
	oscillator: {
		type: 'square'
	}
}).connect( UIGain );
const UISynthY = new Tone.MonoSynth({
	oscillator: {
		type: 'triangle'
	}
}).connect( UIGain );
const UISynthZ = new Tone.MonoSynth({
	oscillator: {
		type: 'square'
	}
}).connect( UIGain );

const UINoiseSynthA = new Tone.NoiseSynth().connect( UIGain );
const UINoiseSynthB = new Tone.NoiseSynth().connect( UIGain );

function Win() {

	const vol = 0.05;

	UISynthX.triggerAttackRelease("C4", 0.05, Tone.now() + .05, vol );
	UISynthX.triggerAttackRelease("E4", 0.05, Tone.now() + .1, vol );
	UISynthX.triggerAttackRelease("G4", 0.05, Tone.now() + .15, vol );
	UISynthX.triggerAttackRelease("Bb4", 0.05, Tone.now() + .2, vol );

	UISynthX.triggerAttackRelease("Db4", 0.05, Tone.now() + .25, vol );
	UISynthX.triggerAttackRelease("F4", 0.05, Tone.now() + .3, vol );
	UISynthX.triggerAttackRelease("Gb4", 0.05, Tone.now() + .35, vol );
	UISynthX.triggerAttackRelease("B4", 0.05, Tone.now() + .4, vol );

	UISynthX.triggerAttackRelease("Eb4", 0.05, Tone.now() + .45, vol );
	UISynthX.triggerAttackRelease("G4", 0.05, Tone.now() + .5, vol );
	UISynthX.triggerAttackRelease("Bb4", 0.05, Tone.now() + .55, vol );
	UISynthX.triggerAttackRelease("Db4", 0.05, Tone.now() + .6, vol );

	UISynthX.triggerAttackRelease("C5", 0.3, Tone.now() + .65, 0.075 );
	UISynthX.triggerAttackRelease("G4", 0.3, Tone.now() + .95, 0.075 );
	UISynthY.triggerAttackRelease("C4", 0.5, Tone.now() + .95, 0.075 );

};

function Lose() {

	const vol = 0.05;

	UISynthX.triggerAttackRelease("C4", 0.05, Tone.now() + .05, vol );
	UISynthX.triggerAttackRelease("E4", 0.05, Tone.now() + .1, vol );
	UISynthX.triggerAttackRelease("G4", 0.05, Tone.now() + .15, vol );
	UISynthX.triggerAttackRelease("Bb4", 0.05, Tone.now() + .2, vol );

	UISynthX.triggerAttackRelease("Db4", 0.05, Tone.now() + .25, vol );
	UISynthX.triggerAttackRelease("F4", 0.05, Tone.now() + .3, vol );
	UISynthX.triggerAttackRelease("Gb4", 0.05, Tone.now() + .35, vol );
	UISynthX.triggerAttackRelease("B4", 0.05, Tone.now() + .4, vol );

	UISynthX.triggerAttackRelease("Eb4", 0.05, Tone.now() + .45, vol );
	UISynthX.triggerAttackRelease("G4", 0.05, Tone.now() + .5, vol );
	UISynthX.triggerAttackRelease("Bb4", 0.05, Tone.now() + .55, vol );
	UISynthX.triggerAttackRelease("Db4", 0.05, Tone.now() + .6, vol );

	//UISynthX.triggerAttackRelease("C5", 0.3, Tone.now() + 1.1, 0.2 );
	UISynthX.triggerAttackRelease("F#4", 0.3, Tone.now() + .65, 0.075 );
	UISynthX.triggerAttackRelease("C4", 0.3, Tone.now() + .95, 0.075 );
	UISynthY.triggerAttackRelease("C4", 0.5, Tone.now() + .95, 0.075 );

};

function AddCredits() {

	try {

	UISynthZ.triggerAttackRelease("C6", 0.025, Tone.now(), Math.random() * 0.01 + 0.01 );
	UISynthZ.triggerAttackRelease("G5", 0.025, Tone.now() + 0.025, Math.random() * 0.01 + 0.01 );
	
	} catch ( error ) { console.log( error ); }

};

function RemoveCredits() {

	try {

	UISynthZ.triggerAttackRelease("G5", 0.025, Tone.now(), Math.random() * 0.01 + 0.01 );
	UISynthZ.triggerAttackRelease("C6", 0.025, Tone.now() + 0.025, Math.random() * 0.01 + 0.01 );
	
	} catch ( error ) { console.log( error ); }

};

function FailClickButton() {

	try {

	UISynthK.triggerAttackRelease("C4", 0.05, Tone.now() + 0.05, Math.random() * 0.3 + 0.7 );
	UISynthL.triggerAttackRelease("F#4", 0.075, Tone.now(), Math.random() * 0.5 + 0.5 );
	
	} catch ( error ) { console.log( error ); }

};

function ClickButton() {

	try {

	UISynthK.triggerAttackRelease("C5", 0.05, Tone.now() + 0.05, Math.random() * 0.3 + 0.7 );
	UISynthL.triggerAttackRelease("G5", 0.075, Tone.now(), Math.random() * 0.5 + 0.5 );
	
	} catch ( error ) { console.log( error ); }

}

for( const e of document.querySelectorAll('button') ) e.addEventListener('click', () => {

	if( !e.classList.contains('disabled') ) ClickButton();

	else FailClickButton();

} );

function HoverButton() {

	try {

	UISynthI.triggerAttackRelease("C5", 0.025, Tone.now() + 0.025, Math.random() * 0.15 + 0.15 );
	UISynthJ.triggerAttackRelease("G5", 0.05, Tone.now(), Math.random() * 0.15 + 0.25 );
	
	} catch ( error ) { console.log( error ); }

}

for( const e of document.querySelectorAll('button') ) e.addEventListener('mouseover', HoverButton );


function Fail() {


	const now = Tone.now();
	UISynthA.triggerAttackRelease("C4", .3, now, 1 );
	UISynthB.triggerAttackRelease("C3", .1, now, 1 );

};

function TypeWord() {

	try {

	UISynthC.triggerAttackRelease("C5", 0.02, Tone.now(), Math.random() * 0.45 + 0.1 );
	UISynthD.triggerAttackRelease("C5", 0.02, Tone.now(), Math.random() * 0.45 + 0.1 );
	
	} catch ( error ) { console.log( error ); }

};

function TypeLetter() {

	try {

	UISynthE.triggerAttackRelease("C6", 0.02, Tone.now(), Math.random() * 0.45 + 0.1 );
	UISynthF.triggerAttackRelease("C5", 0.02, Tone.now(), Math.random() * 0.45 + 0.1 );
	UINoiseSynthA.triggerAttackRelease("16n", Tone.now(), .002 );

	} catch ( error ) { console.log( error ); }; 

};

function RemoveLetter() {

	try {

	UINoiseSynthA.triggerAttackRelease("16n", Tone.now(), .002);

	} catch ( error ) { console.log( error ); };

};

function OptionOut() {

	try {

	UISynthG.triggerAttackRelease("C4", 0.05, Tone.now(), .1 );
	UISynthH.triggerAttackRelease("G2", 0.075, Tone.now(), .2 );

	} catch ( error ) { console.log( error ); };

}

function OptionIn() {

	try {

	UISynthG.triggerAttackRelease("C5", 0.1, Tone.now(), .1 );
	UISynthH.triggerAttackRelease("C3", 0.05, Tone.now(), .3 );

	} catch ( error ) { console.log( error ); };
	
}

function CloseMenu() {

	try {

	UISynthM.triggerAttackRelease("C5", 0.3, Tone.now(), .4 );
	UISynthN.triggerAttackRelease("C3", 0.4, Tone.now() + 0.1, .6 );

	} catch ( error ) { console.log( error ); };
	
};

function OpenMenu() {

	try {

	UISynthM.triggerAttackRelease("C5", 0.3, Tone.now() + 0.2, .4 );
	UISynthN.triggerAttackRelease("C3", 0.3, Tone.now(), .6 );

	} catch ( error ) { console.log( error ); };
	
};

Object.assign( Sound, {

	Win, Lose,
	AddCredits, RemoveCredits,
	FailClickButton, ClickButton,
	HoverButton,
	TypeWord, TypeLetter, RemoveLetter,
	OptionOut, OptionIn,
	CloseMenu, OpenMenu

});