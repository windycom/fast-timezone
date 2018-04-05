const Path = require('path');
const { config } = require('../package.json');

// data path from config
const dataPath = Path.resolve(Path.join(__dirname, '..'), config.dataPath);

// Data file
const dataFile = Path.join(dataPath, 'tzdata.json');

//------------------------------------------------------------------------------
// Wait for event `endEvent` to occur on `obj` and resolve the promise.
// Also check for error events, which will reject the promise.
const waitEvent = (obj, endEvent = 'end') => new Promise((resolve, reject) => {
	obj.once(endEvent, resolve);
	obj.once('error', reject);
});

module.exports = {
	dataPath,
	dataFile,
	waitEvent,
};
