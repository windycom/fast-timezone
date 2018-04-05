'use strict';

/**
 * @module query
 * @author Arne Seib <arne.seib@windy.com>
 * Wrapper script for a most simple CLI.
 * DON'T USE THIS AS AN ACUTAL EVERY DAY TOOL! It is slow, since it needs to load
 * the data on each startup.
 */

const chalk = require('chalk');
const getTimezone = require('./src');

(async () => {
	process.stdout.write('Loading data... ');
	await getTimezone.init();
	console.log(chalk.greenBright(' OK'));
	const loc = process.argv.slice(2).join(' ').split(',').map(v => parseFloat(v));
	console.log(`Querying ${loc[0]},${loc[1]}`);
	console.log(getTimezone(...loc));
})();
