class Clock {

    constructor() {

        this.startTS = 0;
        this.pauseTS = 0;
        this.isPaused = true;
        this.elapsed = 0;

    };

    start() {

        this.startTS = Date.now();
        this.clockPaused = false;

    };

    pause() {

        this.pauseTS = Date.now();
        this.clockPaused = true;
        this.elapsed += this.pauseTS - this.startTS; 

    };

    reset() {

        this.elapsed = 0;
        this.startTS = Date.now();
        this.pauseTS = Date.now();


    };

    now() {

        if ( this.isPaused ) return this.elapsed;
        else return this.elapsed - this.startTS + Date.now();

    };

    format() {

        const now = this.now();
        const seconds = Math.floor( now / 1000 ) % 60;
        const minutes = Math.floor( now / (60*1000) );

        return minutes + ':' + seconds;

    };

};

function openMenu() {

    document
        .getElementById('menu')
        .classList.remove('hidden');

};

function closeMenu() {

    document
        .getElementById('menu')
        .classList.add('hidden');

};

function closePages() {

    const pages = document.querySelecterAll('.pages');

    for ( const page of pages ) {

        pages.classList.add('hidden');

    }

}

function openStartMenu() {

    closePages();

    document
        .getElementById('start-menu')
        .classList.remove('hidden');

};

function openPauseMenu() {

    closePages();

    document
        .getElementById('start-menu')
        .classList.remove('hidden');

};

function openClickAnywhere() {

    closePages();

    document
        .getElementById('click-anywhere')
        .classList.remove('hidden');

};

function updatePlayerBody( delta ) {

    
};

function updateEnemyBodies() {};

function updateStats() {};

function generateNextPlatforms() {};

function removePlatforms() {};


function updateWorld( delta ) {

    updatePlayerBody( delta );
    updateEnemyBodies( delta );
    updatePlatforms();

};

function pauseWorld() {};

function resetWorld() {};

function startWorld() {};


function init() {



};