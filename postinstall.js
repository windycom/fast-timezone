'use strict';

/**
 * @module postinstall
 * @author Arne Seib <arne.seib@windy.com>
 * Run via `npm install`. Extract geojson, but only, if it doesn't exist.
 */

const Fs = require('fs-extra');
const chalk = require('chalk');
const zlib = require('zlib');
const { dataFile,	waitEvent } = require('./src/utils');

//------------------------------------------------------------------------------
// Make sure the tmp and data folders exist.
const extractTzData = async () => {
	process.stdout.write('Extracting tzdata.json...');
	const gzip = zlib.createGunzip();
	const out = Fs.createWriteStream(dataFile);
	Fs.createReadStream(`${dataFile}.gz`).pipe(gzip).pipe(out);
	await waitEvent(out, 'close');
	console.log(chalk.greenBright(' OK'));
};

//------------------------------------------------------------------------------
if (!Fs.existsSync(dataFile)) {
	extractTzData().catch(error => {
		console.error(chalk.red(' ✗'));
		console.error(error.message);
		process.exit(1);
	});
}
