let Sound = {};

const masterGain = new Tone.Gain();
masterGain.toDestination();

const UIGain = new Tone.Gain().connect( masterGain );

const ambientGain = new Tone.Gain();
ambientGain.connect( masterGain );

const musicGain = new Tone.Gain();
musicGain.connect( masterGain );

const musicSynthA = new Tone.MonoSynth({
	oscillator: {
		type: "sawtooth"
	}
}).connect( musicGain );

const musicBassSynth = new Tone.MonoSynth({
	oscillator: {
		type: "triangle"
	}
}).connect( musicGain );

const musicSynthB = new Tone.MonoSynth({
	oscillator: {
		type: "sawtooth"
	}
}).connect( musicGain );

const introSynthGain = new Tone.Gain(1.3).connect(UIGain);
const introSynthA = new Tone.MonoSynth({

	oscillator:{
		type: 'triangle'
	}

}).connect( introSynthGain );

const introSynthB = new Tone.MonoSynth({

	oscillator:{
		type: 'square'
	},
	envelope: {
		attack: 3
	}

}).connect( introSynthGain );

document.onclick = Tone.start;

Sound.Intro = function () {

	let now = Tone.now();

	introSynthB.triggerAttackRelease("G1", 2.2, now, 0.15);
	introSynthA.triggerAttackRelease("F2", .2, now + 1.5, 0.3 );
	introSynthA.triggerAttackRelease("A3", .2, now + 1.7, 0.3 );
	introSynthA.triggerAttackRelease("D3", .3, now + 1.9, 0.3 );

	introSynthB.triggerAttackRelease("Bb1", 1, now + 2.1, 0.15);
	introSynthA.triggerAttackRelease("F3", 1, now + 2.1, 0.3 );

	introSynthB.triggerAttackRelease("A1", 10, now + 2.8, 0.15 );
	introSynthA.triggerAttackRelease("A3", 10, now + 2.8, 0.3 );

	introSynthGain.gain.rampTo(.3, now + 4);
	introSynthGain.gain.rampTo(0, now + 8);

};