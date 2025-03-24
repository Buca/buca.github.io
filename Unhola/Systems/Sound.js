import * as THREE from 'three';

export class Sound {
	
	constructor( game ) {
		
		this.game = game;
		this.listener = new THREE.AudioListener();
		this.buffers = new Map();
		this.loader = new THREE.AudioLoader();

		// Mixer for audio channels (e.g., effects, music)
		this.mixer = {
			
			master: this.listener.context.createGain(),
			sfx: this.listener.context.createGain(),
			ambience: this.listener.context.createGain(),
			ui: this.listener.context.createGain()
		
		};

		// Connect mixers to the listener
		this.mixer.master.connect( this.listener.context.destination );
		this.mixer.ui.connect( this.mixer.master );
		this.mixer.sfx.connect( this.mixer.master );
		this.mixer.ambience.connect( this.mixer.master );
	
	};

	async load( soundNames ) {

		const promises = soundNames.map(soundName =>
			
			new Promise((resolve, reject) => {
			
				this.loader.load(`sounds/${soundName}.ogg`, (buffer) => {
					
					this.buffers.set(soundName, buffer);
					resolve();
			
				}, undefined, (err) => {
			
					reject(err);
			
				});
			
			})

		);

		await Promise.all(promises);
	
	};

	create( soundName, channelName, object3D ) {

		const buffer = this.buffers.get(soundName);
		const channel = this.mixer[channelName];

		const sound = new THREE.PositionalAudio(this.listener);
		sound.setBuffer(buffer);
		sound.setRefDistance(10); // Adjust as needed
		sound.setLoop(false);

		sound.setVolume(1.0);  // Default volume (adjustable)
		sound.gain.disconnect(); // Ensure no previous connections
		sound.gain.connect(channel);

		// Force initialization
		sound.play();
		sound.stop();

		if ( object3D ) object3D.add(sound);
		return sound;
	
	};

}
