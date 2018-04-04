'use strict';

/**
 * @module postinstall
 * @author Arne Seib <arne.seib@windy.com>
 * Run after `npm install`. Download data and generate geojson, but only, if not
 * not exists.
 */

const Fs = require('fs-extra');
const chalk = require('chalk');
const download = require('./src/download');

//------------------------------------------------------------------------------
// Run download only if file does not exist.
if (!Fs.existsSync(download.dataFile)) {
	download().catch(error => {
		console.error(chalk.red(' ✗'));
		console.error(error.message);
		process.exit(1);
	});
}
