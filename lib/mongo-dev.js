var database = require('./mongo-driver');
var ObjectID = require('mongodb').ObjectID;
const GROUPS = 'groups';

//database.deleteMany(GROUPS, {groupName: 'vim94'})

/* *
database.findOne(GROUPS, {
	"groupName":"lub72",
	 "_id": new ObjectID("59c6d8853f207620e2ad040d"),
	 "devices.id": Number.parseInt('5832502940887597')
})
/* */

database.find(GROUPS, {})

.then(function(result) {
  console.log(result);
  console.log(JSON.stringify(result));
})
.then(function() {
  return database.close(true);
});
