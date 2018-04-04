'use strict';

/**
 * @module fast-timezone
 * @author Arne Seib <arne.seib@windy.com>
 * Main: Timezone lookups.
 */

const Path = require('path');
const Fs = require('fs-extra');
const whichPolygon = require('which-polygon');
const moment = require('moment-timezone');
const { config } = require('../package.json');

//------------------------------------------------------------------------------
// Nautical zones: Offset maps to letters / the NATO phonetic alphabet
const nauticalZones = new Map([
	[0, { id: 'Z', name: 'Zulu' }],
	[-1, { id: 'N', name: 'November' }],
	[-2, { id: 'O', name: 'Oscar' }],
	[-3, { id: 'P', name: 'Papa' }],
	[-4, { id: 'Q', name: 'Quebec' }],
	[-5, { id: 'R', name: 'Romeo' }],
	[-6, { id: 'S', name: 'Sierra' }],
	[-7, { id: 'T', name: 'Tango' }],
	[-8, { id: 'U', name: 'Uniform' }],
	[-9, { id: 'V', name: 'Victor' }],
	[-10, { id: 'W', name: 'Whiskey' }],
	[-11, { id: 'X', name: 'X-ray' }],
	[-12, { id: 'Y', name: 'Yankee' }],
	[1, { id: 'A', name: 'Alpha' }],
	[2, { id: 'B', name: 'Bravo' }],
	[3, { id: 'C', name: 'Charlie' }],
	[4, { id: 'D', name: 'Delta' }],
	[5, { id: 'E', name: 'Echo' }],
	[6, { id: 'F', name: 'Foxtrot' }],
	[7, { id: 'G', name: 'Golf' }],
	[8, { id: 'H', name: 'Hotel' }],
	[9, { id: 'I', name: 'India' }],
	[10, { id: 'K', name: 'Kilo' }],
	[11, { id: 'L', name: 'Lima' }],
	[12, { id: 'M', name: 'Mike' }],
]);

let whichPolygonQuery = null;

//------------------------------------------------------------------------------
// Timezone offset in hrs for a given longitude
const getOffset = (lng) => Math.round(lng / 15);

//------------------------------------------------------------------------------
// Format hrs with leading zero
const formatHrs = (hrs) => {
	const s = `00${Math.abs(hrs)}`.substr(-2);
	return (hrs < 0) ? `-${s}` : `+${s}`;
};

//------------------------------------------------------------------------------
// Use moment-timezone to get timezone by name
const getTimezoneByName = (id) => {
	const zone = moment().tz(id);
	if (!zone) {
		return null;
	}
	return {
		id,
		offset: zone._offset,
		name: zone.format('z'),
		designator: zone.format('Z'),
		type: 't',
	};
};

//------------------------------------------------------------------------------
// Get timezone-name by latitude / longitude.
const getTimezoneNameByLocation = (lat, lng) => {
	if (!whichPolygonQuery) {
		throw new Error('You need to call init() first.');
	}
	// which-polygon takes x/y-values, while we use latitude/longitute
	const result = whichPolygonQuery([lng, lat]);
	return (result && result.id) || null;
};

//------------------------------------------------------------------------------
// Get timezone by latitude / longitude.
const getTimezone = (lat, lng) => {
	lat = parseFloat(lat);
	lng = parseFloat(lng);
	const name = getTimezoneNameByLocation(lat, lng);
	if (name) {
		return getTimezoneByName(name);
	}
	// not found, so use nautical zones
	const offset = getOffset(lng);
	const result = nauticalZones.get(offset);
	return result ? {
		id: result.id,
		offset: offset * 60,
		name: result.name,
		designator: `${formatHrs(offset)}:00`,
		type: 'n',
	} : null;
};

//------------------------------------------------------------------------------
// Init: Load datafile and initialize which-polygon.
const init = async (file = null) => {
	if (whichPolygonQuery) {
		return;
	}
	const dataFile = file || Path.resolve(Path.join(__dirname, '..'), config.dataPath, 'tzdata.json');
	if (!Fs.existsSync(dataFile)) {
		throw new Error(
			`Datafile not found at ${dataFile}. You might have to run download.js first to download and generate the timezone data.`);
	}
	module.exports.query = whichPolygonQuery = whichPolygon(await Fs.readJson(dataFile));
};

//------------------------------------------------------------------------------
module.exports = getTimezone;
module.exports.init = init;
