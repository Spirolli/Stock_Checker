/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');

var db_name = "stocks";

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      if (!req.query.hasOwnProperty("stock")) {
        res.send("No stock given");
      }
      MongoClient.connect(CONNECTION_STRING, {useNewUrlParser: true}, function (err, connection) {
        if (err) console.log('Error in connecting to database: ' + err);
        else {
          console.log("\tDatabase connection successful");
          const db = connection.db();
          
          var stockArray = (typeof(req.query.stock) == "string") ? [req.query.stock] : req.query.stock;
          var filterArr = [];
          for (var stock_tick of stockArray) {
            filterArr.push({stock: stock_tick.toUpperCase()});
          }
          
          if (req.query.hasOwnProperty("like") && req.query.like == "true") {
            
            db.collection(db_name).updateMany(
              {$or: filterArr},
              {$inc: {likes: 1}},
            function (err, doc) {
              
              if (err || doc.modifiedCount != stockArray.length) {
                console.log("Error occurred in updating stock information: " + err);
              }
              getDocuments(db, filterArr, res);
            });
            
          } else {
            getDocuments(db, filterArr, res);
          }
        }
      });
    });
  
    function getDocuments (db, filterArray, response) {
      
      db.collection(db_name).find(
      {$or: filterArray},
      {projection: {_id: 0, description: 0}},
      function (err, cursor) {
        if (err) console.log("Error finding documents: " + err);
        else {
          // .find returns cursor object, we have to collect them with toArray()
          cursor.toArray(function (err, documents) {
            var stockDataObj = {};
            if (err) console.log("Error collecting documents into Array: " + err);
            else {
              if (documents.length == 2) {
                var firstLikes = documents[0].likes;
                var secondLikes = documents[1].likes;
                delete documents[0].likes;
                delete documents[1].likes;
                documents[0]["rel_likes"] = firstLikes - secondLikes;
                documents[1]["rel_likes"] = secondLikes - firstLikes;
              }
              stockDataObj["stockData"] = (documents.length == 2) ? documents : documents[0];
              response.json(stockDataObj);
            }
          });
        }
      });
    }
};
