'use strict';

/**
 * @module benchmark
 * @author Arne Seib <arne.seib@windy.com>
 * Does a couple of queries and prints some statistics.
 */

const getTimezone = require('./src');

const COUNT = 100000;

//------------------------------------------------------------------------------
const createLatLong = () => ({
	lat: (Math.random() * 180) - 90,
	long: (Math.random() * 360) - 180,
});

//------------------------------------------------------------------------------
const runTest = async (count, fn) => {
	const start = new Date();
	let hit = 0;
	let hitLand = 0;
	let hitWater = 0;
	let miss = 0;
	for (let n = 0; n < count; n++) {
		const ll = createLatLong();
		const ret = fn(ll.lat, ll.long);
		if (ret) {
			hit++;
			if (ret.type === 't') {
				hitLand++;
			} else {
				hitWater++;
			}
		} else {
			miss++;
		}
	}
	const end = new Date();
	const duration = end.getTime() - start.getTime();
	console.log(`${count} queries in ${duration.toFixed(1)} ms. That is ${(count / (duration / 1000)).toFixed()} queries per second.`);
	console.log(`Have ${hit} hits and ${miss} misses (${((miss / count) * 100).toFixed()}%).`);
	console.log(`Have ${hitLand} territorial hits and ${hitWater} nautical hits (${((hitLand / (hitLand + hitWater)) * 100).toFixed()}% land).`);
	console.log(`One query takes avg ${((duration * 1000) / count).toFixed(1)} us`);
	console.log(`---------------------------------------------------------------`);
	return duration;
};

//------------------------------------------------------------------------------
const main = async () => {
	console.log('Loading data...');
	await getTimezone.init();
	console.log('Running test...');
	await runTest(COUNT, getTimezone);
};

main();
