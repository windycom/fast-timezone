'use strict';

/**
 * @module postinstall
 * @author Arne Seib <arne.seib@windy.com>
 * Run via `npm install`. Extract geojson, but only, if it doesn't exist.
 */

const Fs = require('fs-extra');
const chalk = require('chalk');
const download = require('./src/download');

//------------------------------------------------------------------------------
if (!Fs.existsSync(download.dataFile)) {
	download.extractTzData().catch(error => {
		console.error(chalk.red(' ✗'));
		console.error(error.message);
		process.exit(1);
	});
}
