#!/usr/bin/env node

'use strict';

/**
 * @module update
 * @author Arne Seib <arne.seib@windy.com>
 * Download data and generate geojson. Do so in any case, overwrite existing file.
 */

const chalk = require('chalk');
const download = require('./download');

//------------------------------------------------------------------------------
// Run download
download(true).catch(error => {
	console.error(chalk.red(' ✗'));
	console.error(error);
	process.exit(1);
});
