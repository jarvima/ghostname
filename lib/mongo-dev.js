var database = require('./mongo-driver');
var ObjectID = require('mongodb').ObjectID;
const GROUPS = 'groups';

//database.deleteMany(GROUPS, {groupName: 'vim94'})

//database.findOne(GROUPS, { groupName: 'vim95' })

database.find(GROUPS, {})

.then(function(result) {
  console.log(result);
  console.log(JSON.stringify(result));
})
.then(function() {
  return database.close(true);
});
