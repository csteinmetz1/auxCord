var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var keys = require('../keys'); // mongodb connection string
const mlab_db_uri = keys.mlab_db_uri;

function test_connection() {
  MongoClient.connect(mlab_db_uri, function(err, db) {
    if(err) throw err;
    console.log("Database connected for connection test!");
    db.close();
  });
  return;
}

function query(input) {
  return new Promise( (resolve, reject) => {
    MongoClient.connect(mlab_db_uri, function(err, db) {
      if(err) throw err;
      console.log("Database connected for query!");
      let  dbo = db.db("auxcord");
      dbo.collection("auxCords").find(input, function(err, result) {
        if(err) throw err;
        if(result.length == 0) {
          reject("No results found for " + JSON.stringify(input) + ".");
        }
        else {
          //console.log("Query results: " + JSON.stringify(result));
          resolve("Entry found for: " + input + ".");
        }
      });
      db.close();
    });
  })
}

function insert(input) {
  MongoClient.connect(mlab_db_uri, function(err, db) {
    if(err) throw err;
    console.log("Database connected for insertion!");
    let  dbo = db.db("auxcord");
    dbo.collection("auxCords").insertOne(input, function(err, res) {
      if(err) throw err;
      console.log("Insertion into collection complete!");
    });
    db.close();
  });
  return;
}

function get(input) {
  return new Promise( (resolve, reject) => {
      MongoClient.connect(mlab_db_uri, function(err, db) {
      if(err)  reject(err);
      console.log("Database connected for get!");
      //console.log("Looking for: " + JSON.stringify(input));
      let  dbo = db.db("auxcord");
      dbo.collection("auxCords").findOne(input, function(err, result) {
        if(err)  reject(err);
        else {
          //console.log(result);
          resolve(result);
        }
      });
      db.close();
    });
  })
}

function auxId_check() {
  return new Promise ( (resolve, reject) => {
     MongoClient.connect(mlab_db_uri, function(err, db) {
      if(err)  reject(err);
      let  dbo = db.db("auxcord");
      dbo.collection("auxCords").find({}, { _id: 0, auxId: 1}).toArray(function(err, result) {
        if(err)  reject(err);
        else {
          resolve(result);
        }
      });
      db.close();
    });
  })
}

module.exports = {
  test_connection,
  query,
  insert,
  get,
  auxId_check
};