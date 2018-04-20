# fast-timezone

Timezone lookup service.

## About

This is modified version of Evan Siroky's amazing [geo-tz](https://github.com/evansiroky/node-geo-tz/),
but optimized for speed without any compromises.

The approach here is brutally simple: Load everything into memory. Doing so, fast-timezone
will typically consume around 900MB memory extra. Don't even think about using it if you can't
spare at least 1GB of extra memory per process.

## Installation

```bash
npm i fast-timezone
```

## Usage

```JavaScript
const getTimezone = require('fast-timezone');

// It is a good idea to wait until the data is loaded. If any lookups are
// performed before that, an error will be thrown.
await getTimezone.loaded;

// Get a time zone by location:
const zone = getTimezone(50.047, 14.435);
```

Optionally, you can supply a timestamp as the third argument, and you will get the time zone
at that time.

In case a time zone is found (which is the case if the arguments are valid), an object is returned:

```JSON
{
  "id": "Europe/Prague",
  "name": "CEST",
  "offset": 120,
  "designator": "+02:00",
  "type": "t"
}
```

For a nautical time zone the result looks like:

```JSON
{
  "id": "Etc/GMT+3",
  "name": "-03",
  "offset": -180,
  "designator": "-03:00",
  "type": "n"
}
```

where `offset` is the offset in minutes at the moment of the query, and `designator`
is the zone designator according to ISO 8601.

Also note, the type is `n` for nautical time zones.

## License

This software is licenced under the [MIT](https://opensource.org/licenses/MIT) license.
