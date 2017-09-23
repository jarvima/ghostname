var mongodb = require('mongodb');

var uri = process.env.MONGODB_URI;
var connectPromise;

function connect() {
  if (connectPromise) {
    return connectPromise;
  }
  connectPromise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(uri, function(err, db) {
      if (err) {
        reject(err);
        return;
      }

      resolve(db);
      return;
    });
  });
  return connectPromise;
}

function count(collection, query) {
  return connect().then(function(db) {
    return new Promise(function(resolve, reject) {
      db.collection(collection).count(query, function(err, docCount) {
        if (err) {
          reject(err);
          return;
        }

        resolve(docCount);
        return;
      });
    });
  });
}

function insert(collection, data) {
  return connect().then(function(db) {
    return new Promise(function(resolve, reject) {
      db.collection(collection).insert(data, function(err, result) {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
        return;
      });
    });
  });
}

function update(collection, query, data) {
  return connect().then(function(db) {
    return new Promise(function(resolve, reject) {
      console.log('updating:', query, data);
      db.collection(collection).update(query, data, function(err, result) {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
        return;
      });
    });
  });
}

function findAndModify(collection, query, sort, doc, options) {
  return connect().then(function(db) {
    return new Promise(function(resolve, reject) {
      db.collection(collection).findAndModify(query, sort, doc, options, function(err, result) {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
        return;
      });
    });
  });
}

function find(collection, query, sort) {
  return connect().then(function(db) {
    return new Promise(function(resolve, reject) {
      db.collection(collection).find(query).sort(sort).toArray(function(err, result) {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
        return;
      });
    });
  });
}

function findOne(collection, query) {
  return connect().then(function(db) {
    return new Promise(function(resolve, reject) {
      db.collection(collection).findOne(query, function(err, result) {
        if (err) {
          console.log('find one err:', err);
          reject(err);
          return;
        }

        console.log('find one result:', result);
        resolve(result);
        return;
      });
    });
  });
}

function deleteMany(collection, query) {
  return connect().then(function(db) {
    return new Promise(function(resolve, reject) {
      db.collection(collection).deleteMany(query, function(err, result) {
        if (err) {
          console.log('find one err:', err);
          reject(err);
          return;
        }

        console.log('find one result:', result);
        resolve(result);
        return;
      });
    });
  });
}

function drop(collection) {
  return connect().then(function(db) {
    return new Promise(function(resolve, reject) {
      db.collection(collection).drop(function(err, result) {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
        return;
      });
    });
  });
}

function close() {
  return connect().then(function(db) {
    return new Promise(function(resolve, reject) {
      db.close(function(err, result) {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
        return;
      });
    });
  });
}

module.exports = {
  connect: connect,
  count: count,
  insert: insert,
  update: update,
  findAndModify: findAndModify,
  find: find,
  findOne: findOne,
  deleteMany: deleteMany,
  drop: drop,
  close: close
};

