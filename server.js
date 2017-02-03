// Load required packages
"use strict"; 
var express = require('express');
var compression = require('compression');
var path = require('path');
var homeController = require('./controllers/home_controller.js');
var Board = require("./resources/board.js");
var Player = require("./resources/player.js");
//Connect to db 
// Create our Express application
var app = express();
// Adding middleware support to serve public files
var oneDay = 0;
app.use(express.static(path.join(__dirname + '/public'), {maxAge : oneDay}));
// use gzip for content
app.use(compression()); 
// Set views path and engine, using jade
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'jade');
// Create our Express router
var router = express.Router();
// Initial dummy route for testing
router.get('/', homeController.index);
// Register all our routes
app.use(router);


// Start the server
var server = app.listen(3000);

// Initialising MongoDb usging the defaut driver
var mongoDb = require( './resources/db_connection' );
mongoDb.connectToServer( function( err ) {
  if (err) {
    console.log("Could not connect to the database");
  }
});

var io = require('socket.io')(server);
var locked_boards = {};

io.on('connection', function (socket) {
  console.log('A new player connected');
  socket.on('player_name_entered', function (data) {
    console.log('Player entered the name');
    var player = new Player(data.name);
    player.check_existing_and_assign_id(function (player) {
      console.log(player._id + " is the player ID generated");
      socket.emit('player_id_generated',
        {
          player_id : player._id,
          player_name : player.name,
        });
    });
  });

  socket.on('player_id_found', function(data){
    console.log(data);
  })

  socket.on('find_board', function(data){
    var board;
    var player;
    if (data.player_id) {
      board = new Board(data, {board_size : 2})
      player = new Player(data.player_name);
      board.find_or_create_board(function(board){
        console.log(board)
        data['player_color'] = player.get_color(board.player_count);
        if (board){
          socket.join(board._id);
          io.to(board._id).emit("board_found", {board : board, player : data});
        }
      })
    }
  })

  socket.on('board_update', function(data){
    console.log(data);
    if (locked_boards[data.board_id] != true){
      io.to(data.board_id).emit('board_lock', data)
      locked_boards[data.board_id] = true;
      if(data.complete){
        setTimeout(function(){
          io.to(data.board_id).emit('declare_winner', data);
        }, 300);
      } else {
        setTimeout(function(){
          locked_boards[data.board_id] = false;
          io.to(data.board_id).emit('board_unlock', data);
        }, 300);
      }
    }
  })
});













