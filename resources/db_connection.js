var MongoClient = require( 'mongodb' ).MongoClient;
var _db;
module.exports = {
  connectToServer: function( callback ) {
    MongoClient.connect( "mongodb://localhost:27017/click_game", function( err, db ) {
      if (!err) {
        _db = db;
        db.dropCollection('boards')
        // db.createCollection('preferred_boards', {autoIndexId : true}, function(err, boards){});
        // db.createCollection('live_boards', {autoIndexId : true}, function(err, boards){});
        db.createCollection('boards',{autoIndexId : true}, function(err, boards){
          boards.createIndex('state', {w:1}, function(err, indexName){})
        });
        db.createCollection('players',{autoIndexId : true}, function(err, boards){});
        // db.createCollection('board_players', {autoIndexId : true}, function(err, boards){});
        // db.dropCollection('test')
        var test = db.collection('boards', function(err, suc){});
        // test.insert({name : 'Neeraj Khandelwal'});
        test.find({}, {limit : 10}).forEach(function(data){
          console.log(data);
        });

      }
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  }
};