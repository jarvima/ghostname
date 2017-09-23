var groupData = require('../lib/group-data');

var keys = {};
var debugCount = 9990;
var dupCount = 0;

function getCount() {
  return new Promise(function(resolve, reject) {
    //resolve(Object.keys(keys).length);
    resolve(debugCount);
  });
}

function checkUnique(key) {
  return new Promise(function(resolve, reject) {
    //console.log('keys:', keys);
    var unique = !keys[key];
    if (!unique) {
      dupCount ++;
    }
    resolve(unique);
  });
}

function getKeys(countCallback, checkCallback) {
  groupData.generateKey(getCount, checkUnique)
  .then(function(key) {
    keys[key] = true;

    debugCount++;
    if (debugCount < 10010) {
      if (debugCount % 1000000 === 0) {
        console.log('Processed numbers:', debugCount);
      }
      getKeys(countCallback, checkCallback);
    } else {
      console.log('Total duplicates:', dupCount);
      console.log('Keys generated:', debugCount);
      console.log('Percent duplicates:', (dupCount * 100 / debugCount));
    }
  });
}

getKeys(getCount, checkUnique);
