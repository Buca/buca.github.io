const Game = {

	pricePerWord: 10,

	document: {

		winner: '', 
		snippets: [],
		options: [],
		nextSnippetIndex: 0

	},

	documents: [],

	stats: {

		credits: 0
		//...

	},

	settings: {

		// Category
		"category": "random",
		"recent-categories": [],

		// Controls
		keyboardShortcuts: 'on',
		chooseOptionA: 'A',
		chooseOptionB: 'B',
		chooseOptionC: 'C',
		chooseOptionD: 'D',
		toggleMenu: 'ESC',
		toggleSound: 'M',
		toggleNightmode: 'J',
		nextDocument: 'N',

		// Sound
		masterVolume: 1,
		UIVolume: 1,
		musicVolume: 1,
		ambientVolume: 1,		
	
		difficulty: 'EASY'
	}

};