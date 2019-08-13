/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

var currentLikes

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          //complete this one too
          var stockData = res.body.stockData;
          assert.equal(stockData.stock, "GOOG");
          assert.equal(stockData.price, "1174.71");
          assert.isNumber(stockData.likes);
          currentLikes = res.body.stockData.likes;
          done();
        });
      });
      
      test('1 stock with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: "true"})
        .end(function (err, res) {
         assert.equal(res.body.stockData.stock, "GOOG");
         assert.equal(res.body.stockData.likes, currentLikes + 1);
         done();
       });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: "true"})
        .end(function (err, res) {
         assert.equal(res.body.stockData.stock, "GOOG");
         assert.equal(res.body.stockData.likes, currentLikes + 2);
         done();
       });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['roku', 'pg']})
        .end(function (err, res) {
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData[1].stock, "ROKU");
          assert.equal(res.body.stockData[0].stock, "PG");
          assert.equal(res.body.stockData[1].price, "134.30");
          assert.equal(res.body.stockData[0].price, "116.03");
          assert.property(res.body.stockData[0], "rel_likes");
          assert.property(res.body.stockData[1], "rel_likes");
          done();
        });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['roku', 'pg'], like: "true"})
        .end(function (err, res) {
          var stockData = res.body.stockData;
          assert.property(stockData[0], "rel_likes");
          assert.property(stockData[1], "rel_likes");
          assert.equal(stockData[0].stock, "PG");
          assert.equal(stockData[1].stock, "ROKU");
          assert.isBelow(stockData[0].rel_likes, 0);
          assert.isAbove(stockData[1].rel_likes, 0);
          assert.equal(Math.abs(stockData[0].rel_likes), Math.abs(stockData[1].rel_likes));
          done();
        });
      });
      
    });

});
