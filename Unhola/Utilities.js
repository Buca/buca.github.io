export function cylinderDistance(r0, y0, r1, y1, R) {
	
	// Angular distance on the cylinder's surface
	let dr = Math.abs(r1 - r0);
	dr = Math.min(dr, 1 - dr); // Ensure shortest path around the cylinder
	let arcLength = 2 * Math.PI * R * dr; // Convert to actual distance

	// Vertical distance
	let dy = Math.abs(y1 - y0);

	// Total cylindrical distance
	return Math.sqrt(arcLength * arcLength + dy * dy);

};

export function isTouchDevice() {
	
	return ('ontouchstart' in window || navigator.maxTouchPoints > 0);

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