"use strict";
class Player{
  constructor(player_name){
    this.player_name = player_name
    this.db = require('../resources/db_connection').getDb();
  }

  check_existing_and_assign_id (player_id_handler) {
    var players = this.db.collection('players')
    var player_id;
    players.insert({name : this.player_name}, (err, item) => {
      player_id_handler(item.ops[0])
    })
  }

  get_color(index) {
    var colors = ['red', 'green', 'blue', 'black', 'purple', 'skyblue', 'yellow', 'violet'];
    return colors[index%8];
  }

}

module.exports = Player