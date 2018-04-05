'use strict';

/**
 * @module download
 * @author Arne Seib <arne.seib@windy.com>
 * Functions for downloading / updating data.
 */

const os = require('os');
const Fs = require('fs-extra');
const Path = require('path');
const { promisify } = require('util');
const chalk = require('chalk');
const axios = require('axios');
const extract = promisify(require('extract-zip'));
const { config } = require('../package.json');
const { dataFile,	waitEvent } = require('./utils');

// temp path
const tmp = Path.join(os.tmpdir(), 'fast-timezone');

//------------------------------------------------------------------------------
// Download a file via axios. Downloads to tmp folder and uses the original
// filename (without path).
// Returns the full path where the file was downloaded.
const downloadFile = async (url, force = false) => {
	process.stdout.write(`Downloading ${chalk.whiteBright(Path.basename(url))}...`);
	const targetFilename = Path.join(tmp, Path.basename(url));
	if (!force && Fs.existsSync(targetFilename)) {
		console.log(chalk.yellowBright(` Exists, skipping`));
		return targetFilename;
	}
	const response = await axios.get(url, {
		responseType: 'stream',
	});
	const stream = Fs.createWriteStream(targetFilename);
	response.data.pipe(stream);
	// Wait for the write stream to close, NOT the source stream, so we can be
	// sure the file is actually closed before returning.
	await waitEvent(stream, 'close');
	console.log(chalk.greenBright(` OK`));
	return targetFilename;
};

//------------------------------------------------------------------------------
// Download timezone-boundary-builder data.
const downloadTimezoneBoundaryBuilderData = (force = false) =>
	downloadFile(config.tbbUrl, force);

//------------------------------------------------------------------------------
// Unzip tbb-data. Returns the filename of the unzipped file.
const unzipTimezoneBoundaryBuilderData = async (zipFile, force = false) => {
	const fileName = Path.join(tmp, 'dist', 'combined.json');
	if (force || !Fs.existsSync(fileName)) {
		process.stdout.write(`Unzipping timezone boundary builder data...`);
		await extract(zipFile, { dir: tmp });
		console.log(chalk.greenBright(` OK`));
	} else {
		console.log(`Boundary builder data unzipped...`, chalk.greenBright(`OK`));
	}
	return fileName;
};

//------------------------------------------------------------------------------
// Extract / load tbb-data. Returns the loaded geojson.
const extractTimezoneBoundaryBuilderData = async (fileName, force = false) => {
	let geojson = null;
	if (force || !Fs.existsSync(dataFile)) {
		process.stdout.write(`Extracting timezone boundary builder features...`);
		const data = await Fs.readJson(fileName);
		geojson = {
			type: 'FeatureCollection',
			features: data.features.filter(feature => feature.properties.tzid),
		};
		geojson.features.forEach(feature => { feature.properties = { t: 'l', id: feature.properties.tzid }; });
		await Fs.writeJson(dataFile, geojson);
		console.log(chalk.greenBright(` OK`));
	} else {
		process.stdout.write(`Reading timezone boundary builder features...`);
		geojson = await Fs.readJson(dataFile);
		console.log(chalk.greenBright(` OK`));
	}
	return geojson;
};

//------------------------------------------------------------------------------
// Make sure the tmp and data folders exist.
const ensureFolders = async () => {
	process.stdout.write(`Creating data folder...`);
	await Fs.ensureDir(config.dataPath);
	console.log(chalk.greenBright(` OK`));

	process.stdout.write(`Creating tmp folder...`);
	await Fs.ensureDir(tmp);
	console.log(chalk.greenBright(` OK`));
};

//------------------------------------------------------------------------------
// Main: Download / extract data files and store in `data`.
module.exports = async (force = false) => {
	await ensureFolders();
	const downloadedZip = await downloadTimezoneBoundaryBuilderData(force);
	const fileName = await unzipTimezoneBoundaryBuilderData(downloadedZip, force);
	await extractTimezoneBoundaryBuilderData(fileName, force);
	console.log(chalk.greenBright(`Datafile saved as ${chalk.whiteBright(dataFile)}`));
	process.stdout.write(`Removing tmp folder...`);
	await Fs.remove(tmp);
	console.log(chalk.greenBright(` OK`));
};
