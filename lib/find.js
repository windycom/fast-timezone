var Fs = require('fs-extra')
var Path = require('path')

var geobuf = require('geobuf')
var inside = require('@turf/boolean-point-in-polygon').default
var Pbf = require('pbf')
var point = require('@turf/helpers').point

var tzData = require('../data/index.json')

let tzQuads = null;

const oceanZones = [
  { tzid: 'Etc/GMT-12', left: 172.5, right: 180 },
  { tzid: 'Etc/GMT-11', left: 157.5, right: 172.5 },
  { tzid: 'Etc/GMT-10', left: 142.5, right: 157.5 },
  { tzid: 'Etc/GMT-9', left: 127.5, right: 142.5 },
  { tzid: 'Etc/GMT-8', left: 112.5, right: 127.5 },
  { tzid: 'Etc/GMT-7', left: 97.5, right: 112.5 },
  { tzid: 'Etc/GMT-6', left: 82.5, right: 97.5 },
  { tzid: 'Etc/GMT-5', left: 67.5, right: 82.5 },
  { tzid: 'Etc/GMT-4', left: 52.5, right: 67.5 },
  { tzid: 'Etc/GMT-3', left: 37.5, right: 52.5 },
  { tzid: 'Etc/GMT-2', left: 22.5, right: 37.5 },
  { tzid: 'Etc/GMT-1', left: 7.5, right: 22.5 },
  { tzid: 'Etc/GMT', left: -7.5, right: 7.5 },
  { tzid: 'Etc/GMT+1', left: -22.5, right: -7.5 },
  { tzid: 'Etc/GMT+2', left: -37.5, right: -22.5 },
  { tzid: 'Etc/GMT+3', left: -52.5, right: -37.5 },
  { tzid: 'Etc/GMT+4', left: -67.5, right: -52.5 },
  { tzid: 'Etc/GMT+5', left: -82.5, right: -67.5 },
  { tzid: 'Etc/GMT+6', left: -97.5, right: -82.5 },
  { tzid: 'Etc/GMT+7', left: -112.5, right: -97.5 },
  { tzid: 'Etc/GMT+8', left: -127.5, right: -112.5 },
  { tzid: 'Etc/GMT+9', left: -142.5, right: -127.5 },
  { tzid: 'Etc/GMT+10', left: -157.5, right: -142.5 },
  { tzid: 'Etc/GMT+11', left: -172.5, right: -157.5 },
  { tzid: 'Etc/GMT+12', left: -180, right: -172.5 }
]

const TREE_FOLDERS = ['a', 'b', 'c', 'd'];

const loadFolder = async (relPath) => {
  const files = (await Fs.readdir(relPath)).map(f => ({
    path: Path.join(relPath, f),
    name: f,
  }));
  const folders = {};
  for (const file of files) {
    if (file.name === 'geo.buf') {
      // A buffer: Return immediately with content. Don't check other files or
      // folders here (there shouldn't be any).
      return geobuf.decode(new Pbf(await Fs.readFile(file.path)));
    } else if (TREE_FOLDERS.includes(file.name)) {
      // A known folder. Traverse.
      folders[file.name] = await loadFolder(file.path);
    }
  }
  return folders;
};

const loadTree = async () => {
  tzQuads = await loadFolder(Path.join(__dirname, '..', 'data'));
};

var getTimezoneAtSea = function (lon) {
  for (var i = 0; i < oceanZones.length; i++) {
    var z = oceanZones[i]
    if (z.left <= lon && z.right >= lon) {
      return z.tzid
    }
  }
}

var getTimezone = function (lat, lon) {
  if (!tzQuads) {
    throw new Error('Not loaded yet. You should wait for the loaded-promise to be fulfilled.');
  }
  lat = parseFloat(lat)
  lon = parseFloat(lon)

  // validate latitude
  if (isNaN(lat) || lat > 90 || lat < -90) {
    return null;
  }

  // validate longitude
  if (isNaN(lon) || lon > 180 || lon < -180) {
    return null;
  }

  // fix edges of the world
  if (lat === 90) {
    lat = 89.9999
  } else if (lat === -90) {
    lat = -89.9999
  }

  if (lon === 180) {
    lon = 179.9999
  } else if (lon === -180) {
    lon = -179.9999
  }

  var pt = point([lon, lat])
  var quadData = {
    top: 90,
    bottom: -90,
    left: -180,
    right: 180,
    midLat: 0,
    midLon: 0
  }
  var quadPos = ''
  var curTzData = tzData.lookup

  while (true) {
    // calculate next quadtree position
    var nextQuad
    if (lat >= quadData.midLat && lon >= quadData.midLon) {
      nextQuad = 'a'
      quadData.bottom = quadData.midLat
      quadData.left = quadData.midLon
    } else if (lat >= quadData.midLat && lon < quadData.midLon) {
      nextQuad = 'b'
      quadData.bottom = quadData.midLat
      quadData.right = quadData.midLon
    } else if (lat < quadData.midLat && lon < quadData.midLon) {
      nextQuad = 'c'
      quadData.top = quadData.midLat
      quadData.right = quadData.midLon
    } else {
      nextQuad = 'd'
      quadData.top = quadData.midLat
      quadData.left = quadData.midLon
    }

    // console.log(nextQuad)
    curTzData = curTzData[nextQuad]
    // console.log()
    quadPos += nextQuad

    // analyze result of current depth
    if (!curTzData) {
      // no timezone in this quad, therefore must be timezone at sea
      return getTimezoneAtSea(lon)
    } else if (curTzData === 'f') {
      var geoJson = quadPos.split('').reduce((el, name) => el && el[name], tzQuads)
      for (var i = 0; i < geoJson.features.length; i++) {
        if (inside(pt, geoJson.features[i])) {
          return geoJson.features[i].properties.tzid
        }
      }

      // not within subarea, therefore must be timezone at sea
      return getTimezoneAtSea(lon)
    } else if (typeof curTzData === 'number') {
      // exact match found
      return tzData.timezones[curTzData]
    } else if (typeof curTzData !== 'object') {
      // not another nested quad index, throw error
      throw new Error('Unexpected data type')
    }

    // calculate next quadtree depth data
    quadData.midLat = (quadData.top + quadData.bottom) / 2
    quadData.midLon = (quadData.left + quadData.right) / 2
  }
}

module.exports = {
  getTimezone,
  loaded: loadTree(),
}

