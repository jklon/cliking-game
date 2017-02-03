"use strict";
class Board{
  constructor(initiating_player, board_options) {
    this.initiating_player = initiating_player;
    this.board_options = board_options;
    this.db = require('../resources/db_connection').getDb();
  }

  find_or_create_board(succ) {
    var board_collection = this.db.collection('boards');
    var preferred_boards = this.db.collection('preferred_boards');  
    var live_boards      = this.db.collection('live_boards');
    var board_found;
    var preferred_board;

    board_collection.find({state : 'waiting'}, {limit : 5}).each((err, board) => {
      if (board){
        if (this.check_waiting_board_sanity(board) && !board_found) {
          console.log("Was the waiting board");
          board_found = true
          board_collection.findAndModify({_id : board._id}, ['board_id'],
           {$set : {state : 'live'}, $inc : {player_count : 1}}, {new:true},(err, doc) => {
            succ(doc.value);
          });
        } else if (!this.check_waiting_board_sanity(board)) {
          board_collection.findAndModify({_id : board._id}, ['board_id'],
           {$set : {state : 'dead'}}, {new:true},(err, doc) => {});
        }
      } else if (!board_found) {
        board_collection.find({state : 'live'}, {limit : 5}).each((err, board) => {
          if (board){
            if (this.check_live_board_sanity(board) && !board_found) {
              console.log("Was the live board");
              board_found = true
              board_collection.findAndModify({_id : board._id}, ['board_id'],
               {$set : {state : 'live'}, $inc : {player_count : 1}}, {new:true},(err, doc) => {
                succ(doc.value);
              });
            } else if (!this.check_live_board_sanity(board)) {
              board_collection.findAndModify({_id : board._id}, ['board_id'],
               {$set : {state : 'dead'}}, {new:true},(err, doc) => {});
            }
          } else if (!board_found) {
            this.generate_board(succ);
          }
        });
      }
    });
  }

  generate_board (succ){
    console.log("hi");
    var board_collection = this.db.collection('boards')
    board_collection.insert(
      {
        board_size : this.board_options.board_size,
        state : 'waiting',
        players : {},
        player_count : 1,
        game_progression : {}
      },
      (err, board) => {
        succ(board.ops[0]);
      }
    );
  }

  check_live_board_sanity(board) {
    var valid = false;
    if (board.player_count < board.board_size) {
      valid = true
    }
    return valid;
  }

  check_waiting_board_sanity(board) {
    return true;
  }

}
module.exports = Board