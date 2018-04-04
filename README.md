# fast-timezone

Timezone lookup service.

## Credits

I'd like to start with the credts, since this repository is merely glue between some 
awesome libraries and data. So feel free to direct a considerable part of your
admiration to these projects:

### [timezone-boundary-builder](https://github.com/evansiroky/timezone-boundary-builder)

The timezone polygons are taken from there.

### [which-polygon](https://github.com/mapbox/which-polygon)

Used to find a timezone via latitude / longitude.

### [moment-timezone](https://momentjs.com/timezone/)

And finally there is moment-timezone to calculate the actual offset for a given
timezone name.

## About

Here at Windy we need a fast service to lookup timezones for a given location, while
memory consumption does not matter so much. So this library is biased towards speed.

The approach here is brutally simple: Load everything into memory. Doing so, fast-timezone
will typically consume a couple of hundreds MB of RAM.

Using which-polygon, the library can process around 8000 lookups / second (on some
flimsy VM I use for testing!).

fast-timezone also resolves nautical areas by calculating the timezone based on the
longitude, in case no territorial timezone is found for a given location.

## Installation

```bash
npm i windycom/fast-timezone
```

Preferably, install via `npm`. There is a postinstall script, that downloads
the latest data and creates the timezone data file.

You can also run the download script manually via `npm run update` or `node update`
if you want to update/restore the datafile.

## Usage

```JavaScript
const getTimezone = require('fast-timezone');

// Load geojson:
await getTimezone.init();

// Get a timezone by location:
const zone = getTimezone(50.047, 14.435);
```

In case a timezone is found (which is the case if the arguments are valid), an object is returned:

```JSON
{
  "id": "Europe/Prague",
  "name": "CEST",
  "offset": 120,
  "designator": "+02:00",
  "type": "t"
}
```

For a nautical timezone the result might look like this:

```JSON
{
  "id": "Z",
  "name": "Zulu",
  "offset": 0,
  "designator": "+00:00",
  "type": "n"
}
```

where `offset` is the offset in minutes at the moment of the query, and `designator`
is the zone designator according to ISO 8601.

In case no timezone can be found, `null` is returned.

## License

This software is licenced under the [MIT](https://opensource.org/licenses/MIT) license.
