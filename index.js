const moment = require('moment-timezone');
const { getTimezone, loaded } = require('./lib/find.js');

//------------------------------------------------------------------------------
// Use moment-timezone to get timezone by name
const getTimezoneByName = (id, ts) => {
	const zone = moment(ts).tz(id);
	if (!zone) {
		return null;
	}
	return {
		id,
		offset: zone._offset,
		name: zone.format('z'),
		designator: zone.format('Z'),
		type: id.match(/^Etc\//) ? 'n' : 't',
	};
};

//------------------------------------------------------------------------------
// Get timezone by latitude / longitude.
const getTimezoneInfo = (lat, lng, ts /* = undefined */) => {
	const name = getTimezone(lat, lng);
	return name && getTimezoneByName(name, ts);
};

getTimezoneInfo.loaded = loaded;
module.exports = getTimezoneInfo;
