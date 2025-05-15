export const PI = Math.PI;
export const cos = Math.cos;
export const sin = Math.sin;
export const abs = Math.abs;
export const hypot = Math.hypot;
export const min = Math.min;
export const max = Math.max;

export function clamp( value, min, max ) {

	return Math.max( min, Math.min( max, value ) );

};

export function goFullscreen( element = document.body ) {
	
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.webkitRequestFullscreen) { // Safari
		element.webkitRequestFullscreen();
	} else if (element.mozRequestFullScreen) { // Firefox
		element.mozRequestFullScreen();
	} else if (element.msRequestFullscreen) { // IE/Edge
		element.msRequestFullscreen();
	}

};

export function exitFullscreen() {
	
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	}

};

export function floor( value, precision = 1 ) {

	return precision*Math.floor( value/precision );

};

export function round( value, precision = 1 ) {

	return precision*Math.round( value/precision );

};

export function ceil( value, precision = 1 ) {

	return precision*Math.ceil( value/precision );

};

export function angleDifference( a, b ) {

	const d = (b - a + 1.5) % 1 - 0.5;	
	return d;

};

export function circularLerp( a, b, t ) {
	
	return a + (((b - a + 1.5) % 1.0) - 0.5) * t;

}

export function cylindricalPointAABBDistance( r, y, boxR, boxY, w, h, d, R ) {
  
	let deltaR = abs(r - boxR);
	if (deltaR > 0.5) deltaR = 1.0 - deltaR;

	const halfW = w / 2;
	const rMin = 0;
	const rMax = halfW;

	const arcDist = max(0, 2*PI*R*deltaR - halfW);
	const yDist = max(0, abs(y - boxY) - h / 2);

	return hypot( arcDist, yDist );

};

export function cylindricalDistance( aTheta, aY, bTheta, bY, R ) {
	
	let deltaTheta = abs(bTheta - aTheta);

	if ( deltaTheta > 0.5 ) deltaTheta = 1 - deltaTheta;

	const arcLength = 2 * PI * R * deltaTheta;
	const vertical = bY - aY;

	return hypot(arcLength, vertical);

};

export function isTouchDevice() {
	
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;

};

export function isFullscreen() {

	return (
		document.fullscreenElement != null ||
		(window.innerHeight === screen.height &&
		window.innerWidth === screen.width)
	);
	
};

export function isVersionCompatible(version, range) {

	const [rangePrefix, ...rangeParts] = range.split(/(\d+\.\d+\.\d+)/).filter(Boolean);
	const rangeVersion = rangeParts.join('');
	
	if (!/^\d+\.\d+\.\d+$/.test(version) || !/^\d+\.\d+\.\d+$/.test(rangeVersion)) {
		throw new Error("Invalid version format. Expected format: '1.2.3' and range '^1.0.123'.");
	}

	const [majorV, minorV, patchV] = version.split('.').map(Number);
	const [majorR, minorR, patchR] = rangeVersion.split('.').map(Number);

	if (rangePrefix === '^') {
		// ^1.0.123 allows everything from 1.0.123 to <2.0.0
		return majorV === majorR && (minorV > minorR || (minorV === minorR && patchV >= patchR));
	}

	if (rangePrefix === '~') {
		// ~1.0.123 allows everything from 1.0.123 to <1.1.0
		return majorV === majorR && minorV === minorR && patchV >= patchR;
	}

	// If there's no special prefix, compare versions directly
	return version === rangeVersion;

};

export function DRNG( seed ) {

	function mulberry32( seed ) {

		return function() {
		
			seed |= 0;
			seed = seed + 0x6D2B79F5 | 0;
			var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
			t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		
		};

	};

	const random = mulberry32( seed );

	return {

		float( min = 0, max = 1 ) {

			return random() * (max - min) + min;

		},

		int( min, max ) {

			min = Math.ceil( min );
			max = Math.floor( max );
			return Math.floor( random() * (max - min + 1) ) + min;

		},

		raw() {
		
			return random();
		
		}

	};

};

function hashSeed(seed) {

    let h = seed;
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = h ^ (h >>> 16);
    return h >>> 0; // Force to unsigned 32-bit

};

export function combineSeeds( ...seeds ) {

    let combined = 0;

    for (const seed of seeds) {

        combined = hashSeed(combined + seed);

    }

    return combined;

};

export function random( ...args ) {

	// Based on MurmurHash3
	let hash = 0;
	for ( let i = 0; i < args.length; i ++ ) {
		
		let n = args[i];
		n = n | 0; // Ensure integer
		hash ^= n + 0x9e3779b9 + (hash << 6) + (hash >> 2);

	}

	// Mix bits like in XORShift
	hash ^= hash >>> 16;
	hash = Math.imul( hash, 0x85ebca6b );
	hash ^= hash >>> 13;
	hash = Math.imul( hash, 0xc2b2ae35 );
	hash ^= hash >>> 16;

	// Convert to float in (0, 1]
	const result = (hash >>> 0) / 0xffffffff;	
	return result === 0 ? 1.0 : result;

};