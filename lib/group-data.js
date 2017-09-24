var database = require('./mongo-driver');
var ObjectID = require('mongodb').ObjectID;
const GROUPS = 'groups';

// data model
var group = {
  groupName: 'some name',
  created: 12341234,
  modified: 34523412,
  //latitude: 3.4,
  //longitude: 8.9,
  names: ['name 1', 'name 2', 'etc'],
  devices: [
    {id: 98769876, status:'starting|wait-read|reading|listening|guessing'}
  ],
}

var shortWords = [
  'ant', 'air', 'bug', 'bee', 'big', 'cat', 'cow', 'dog', 'dot', 'dip',
  'eel', 'egg', 'elf', 'emu', 'fat', 'far', 'fly', 'fun', 'gap', 'gem',
  'fox', 'gnu', 'gum', 'hot', 'hen', 'hog', 'hop', 'hat', 'ice', 'kid',
  'jag', 'job', 'jam', 'joy', 'jar', 'jet', 'jig', 'jog', 'jib', 'kit',
  'kin', 'leg', 'lub', 'lib', 'lid', 'lag', 'mat', 'mix', 'mug', 'mut',
  'mad', 'map', 'max', 'mid', 'mob', 'map', 'mop', 'nap', 'nit', 'owl',
  'old', 'pig', 'pit', 'pod', 'pow', 'pet', 'pin', 'pop', 'peg', 'pun',
  'rap', 'rob', 'rad', 'rib', 'ram', 'rat', 'row', 'rip', 'run', 'ski',
  'spy', 'sky', 'spa', 'tar', 'tux', 'tan', 'tin', 'ton', 'tag', 'tax',
  'tub', 'tap', 'top', 'toy', 'tug', 'vex', 'vat', 'vim', 'van', 'vet',
  'vid', 'web', 'wow', 'wit', 'yak', 'yip', 'yap', 'zap', 'zip', 'zig',
];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function generateName(count) {
  console.log('groups count:', count);
  var min, max;
  if (count < 1000) {
    min = 10;
    max = 100;
  } else {
    var factor = Math.floor(Math.log10(count));
    min = Math.pow(10, factor - 1);
    max = min * 10;
  }
  var name = shortWords[getRandomInt(0, shortWords.length)] + getRandomInt(min, max);
  return name;
}

function makeDevice() {
  return {
    id: getRandomInt(0, Number.MAX_SAFE_INTEGER),
    status: 'starting'
  };
}

function countGroups() {
  return database.count(GROUPS, {});
}

function findAvailableGroup(name) {
  return database.findOne(GROUPS, {groupName: name})
  .then(function(group) {
    if (group) {
      // TODO reuse group if it's stale
      // or do we just run a cron job that clears out stale groups
      return null;
    } else {
      var time = new Date().getTime();
      group = {
        groupName: name,
        created: time,
        modified: time,
        names: [],
        devices: [makeDevice()]
      };
      return database.insert(GROUPS, group)
      .then(function(result) {
        if (result.result.ok && result.ops[0]) {
          return result.ops[0];
        } else {
          return {
            errorMessage: 'could not insert group',
            result: result
          };
        }
      });
    }
  });
}

function buildGroup(count) {
  var name = generateName(count);

  return findAvailableGroup(name)
  .then(function(group) {
    if (group) {
      return group;
    } else {
      return buildGroup(count);
    }
  });
}

function createGroup() {
  return countGroups()
  .then(buildGroup);
}

/* findOne - good
{
    "lastErrorObject": {
        "updatedExisting": true,
        "n": 1
    },
    "value": {
        "_id": "59bdb9cfb79cf95d588c07d1",
        "groupName": "max96",
        "created": 1505606095434,
        "modified": 1505606095434,
        "names": []
    },
    "ok": 1
}*/

function joinGroup(request, response) {
  var groupName = request.body.groupName;
  var query = {
      groupName: groupName,
  };
  return database.findOne(GROUPS, query)
  .then(function(group) {
    if (!group) {
      return null;
    }

    // TOOD some sort of group secuity - maybe
    //var joinable = group.devices.every(function(group) {
    //  return (group.status === 'starting' || group.status === 'wait-read');
    //});
    var joinable = true;

    if (joinable) {
      return group;
    }
    return null;
  })
  .then(function(group) {
    if (!group) {
      return {errorMessage:'group not found'};
    }

    var newDevice = makeDevice();
    var query = { _id: group._id };
    var sort = [];
    var update = {
      $push: { devices: newDevice },
      $set: { modified: new Date().getTime() },
    };
    var options = { new: true };

    return database.findAndModify(GROUPS, query, sort, update, options)
    .then(function(result) {
      if (result.ok && result.value) {
        return { group: result.value, device: newDevice };
      }
      return { errorMessage: 'could not join group', error: result };
    });
  });
}

function getGroupInfo(request, response) {
  var query = {
    _id: new ObjectID(request.headers['x-user-group_id']),
    groupName: request.params.groupName
  };
  console.log('group info query:', query);
  return database.findOne(GROUPS, query);
}

function addName(request, response) {
  var secretName = request.body.secretName;
  if (!secretName || !secretName.trim()) {
    return new Promise(function(resolve, reject) {
      resolve({ errorMessage: 'could not add name', error: 'secret name empty' });
    });
  }

  var query = {
    groupName: request.body.groupName,
    _id: new ObjectID(request.body.group_id),
  };
  var sort = [];
  var update = {
    $push: { names: request.body.secretName },
  };
  var options = { new: true };

  return database.findAndModify(GROUPS, query, sort, update, options)
  .then(function(result) {
    if (result.ok && result.value) {
      return result.value;
    }
    return { errorMessage: 'could not add name', error: result };
  });
}

function stopAdding(request, response) {
  var query = {
    groupName: request.body.groupName,
    _id: new ObjectID(request.body.group_id),
    'devices.id': Number.parseInt(request.body.deviceId),
  };
  var sort = [];
  var update = {
    $set: { 'devices.$.status': 'wait-read' },
  };
  var options = { new: true };

  return database.findAndModify(GROUPS, query, sort, update, options)
  .then(function(result) {
    if (result.ok && result.value) {
      return result.value;
    }
    return { errorMessage: 'could not stop adding', error: result };
  });
}


function respond(callback, request, response) {
  callback(request, response)
  .then(function(result) {
    response.send(result);
  },
  function(reason) {
    response.send({ errorMessage: 'server rejection', error: reason });
  })
  .catch(function(error) {
    var time = new Date().getTime();
    console.log('Error: time:', time, ' object:', error);
    response.send({errorMessage:'server failure', time: time});
  });
}

// $inc $set $push $elemMatch

module.exports = {
  generateName: generateName,

  createGroup: function(request, response) {
    respond(createGroup, request, response);
  },

  joinGroup: function(request, response) {
    respond(joinGroup, request, response);
  },

  getGroupInfo: function(request, response) {
    respond(getGroupInfo, request, response);
  },

  addName: function(request, response) {
    respond(addName, request, response);
  },

  stopAdding: function(request, response) {
    respond(stopAdding, request, response);
  },

  startReading: function(request, response) {
    respond(createGroup, request, response);
  },

  startGuessing: function(request, response) {
    respond(createGroup, request, response);
  },

  restart: function(request, response) {
    respond(createGroup, request, response);
  },
};
