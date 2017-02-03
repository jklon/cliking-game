var player;
var cell_size = 60;
var board;
var scores = {};
var board_data = {status : {}};
var socket = io.connect('http://localhost:3000');
var winner = [0,0];
$(document).ready(function(){
  player = Cookies.getJSON('player');
  console.log(1);
  if (player) {
    player_id = player.player_id;
    player_name = player.player_name;
    $("#name-enter").css({"display" : 'none'});
    $("#playername-input-field").val(player.player_name);
    socket.emit("player_id_found", {player_id : player_id})
  } else {
    $("#start-game").css({"display" : 'none'});
    console.log(2);
  }
  
  $("#start-game").on('click', function(){
    $("#game-block").html("");
    find_board();
    $("#winner-board").html("");
  })

  $("#name-enter").on('click', function(){
    socket.emit("player_name_entered",{name: $("#playername-input-field").val()})
    $("#game-block").html("");
    $("#winner-board").html("");
    $("#waiting").css("display", "initial");
  })

})

socket.on('player_id_generated', function(data) {
  if (data.player_id) {
    Cookies.set('player', data);
    player = data;
    find_board();
  }
})

socket.on("board_found", function(data){
  console.log(data);
  if (data.player.player_id == player.player_id) {
    player_color = data.player.player_color
    board = data.board
    board_data['board_id'] = data.board._id
  }

  if (data.board.player_count == 1) {

  } else if (data.board.player_count == 2) {
    draw_board();
    remove_main_overlay();
  } else if (data.player.player_id == player.player_id) {
    draw_board();
    remove_main_overlay();
    manage_board_lock(true);
  }
})

socket.on('board_lock', function(data){
  console.log('board_lock');
  board_data = data;
  console.log(data);
  manage_board_lock(true);
  calculate_scores();
  update_score_display();
  update_board_view();
})

socket.on('board_unlock', function(data){
  console.log('board_unlock');
  manage_board_lock(false);
})

socket.on('declare_winner', function(data){
  $("#winner-board").html("<p>"+ "Last game won by " + winner[1] + " with "+ winner[0] +" Cells</p>");
  $("#start-box").addClass('long-start-box');
  manage_board_lock(false);
  manage_main_overalay(true);
  manage_start_box(true);
  clear_game_data();
})

function manage_start_box(action){
  if(action == true) {
     $("#start-box").css("display", "initial");
     $("#waiting").css("display", "none");
  } else {
    $("#background-overlay").css("display", "none");
  }
}

function clear_game_data(){
  board = null;
  scores = {};
  board_data = {status : {}};
  winner = [0,0];
  $("#game-block").html("");
}

function manage_main_overalay(action){
  if(action == true) {
    $("#background-overlay").css("display", "initial");
  } else {
    $("#background-overlay").css("display", "none");
  }
}

function manage_board_lock(action){
  if(action == true) {
    $("#background-overlay").css("display", "initial");
    $("#lock").css("display", "initial");
  } else {
    $("#background-overlay").css("display", "none");
    $("#lock").css("display", "none");
  }
}

function update_score_display(){
  $("#score-board").html("");
  for (var name in scores){
    $("#score-board").append("<p>"+name+ " : " + scores[name] + "</p>")
  }
}

function update_board_view(){
  var cell_data;
  $('.game-cell-template').each(function(){
    cell_data = board_data.status[$(this).index()]
    if (cell_data) {
      $(this).css({
        'background-color' : cell_data.player_color
      })
      $(this).unbind('mouseenter mouseleave');
    }
  })
}

function find_board(){
  socket.emit("find_board", player);
}

function draw_board() {
  $(".game-cell-template").css({
    height: cell_size + 'px',
    width : cell_size + 'px',
    'background-color' : 'white' 
  })

  var dimension = (board.board_size)*cell_size + 'px';
  var left = (screen.width - board.board_size*cell_size)/2
  var html = Array((board.board_size)*(board.board_size) + 1).join($("#game-cell-template-html").html());
  $("#game-block").html("").css({
    'width' : dimension,
    'height': dimension,
    'left'  : left
  }).html(html);

  $(".game-cell-template").hover(function(){
    $(this).css({'background-color' : player_color})
  }, function (){
    $(this).css({'background-color' : 'white'})
  })

  $(".game-cell-template").on('click', function(){
    if (!board_data.status[$(this).index()]) {
      socket.emit('board_update', evaluate_response($(this)));
    }
  })

}

function evaluate_response(cell){
  var complete = false;
  if (Object.keys(board_data.status).length + 1 == (board.board_size)*(board.board_size)) {
    complete = true
  }
  board_data.status[cell.index()] = 
    {
      player_id : player.player_id, 
      player_name : player.player_name, 
      player_color : player_color
    }
  board_data['complete'] = complete;
  return board_data
}

function calculate_scores(){
  scores = {};
  for (var cell_id in board_data.status) {
    if (scores[board_data.status[cell_id].player_name]){
      scores[board_data.status[cell_id].player_name] = scores[board_data.status[cell_id].player_name] + 1
    } else{
      scores[board_data.status[cell_id].player_name] = 1
    }
    if (scores[board_data.status[cell_id].player_name] > winner[0]){
      winner[0] = scores[board_data.status[cell_id].player_name]
      winner[1] = board_data.status[cell_id].player_name
    }
  }

}

function remove_main_overlay(){
  $("#background-overlay").css("display", "none");
  $("#start-box").css("display", "none");
}


