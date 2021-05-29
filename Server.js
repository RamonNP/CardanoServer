var express = require('express');

var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

var clientLookup = {};

io.on('connection', function(socket){

  var current_player;

  socket.on("PING",function(pack){


   console.log('menssagem recebida do unity: '+pack.message);

   var json_pack = {

     message:"pong!!!"

   };

  socket.emit("PONG",json_pack);


});//END_SOCKET.ON

socket.on("JOIN_ROOM",function(pack){

  current_player = {

    name : pack.name,
    id: socket.id
  };

 clientLookup[current_player.id] = current_player;

 socket.emit("JOIN_SUCCESS",current_player);

 //envia o jogador atual para TODOS  os jogadores online
 socket.broadcast.emit('SPAWN_PLAYER',current_player);

 //agora enviar TODOS os jogadores para o jogador atual
 for(client in clientLookup)
 {
   if(clientLookup[client].id!=current_player.id)
   {
     socket.emit('SPAWN_PLAYER',clientLookup[client]);
   }
 }


});//END_SOCKET.ON

socket.on("MOVE_AND_ROT",function(pack){

 var data = {
   id:current_player.id,
   position:pack.position,
   rotation:pack.rotation,
   mov:pack.mov
 };

 socket.broadcast.emit('UPDATE_POS_ROT',data);

});//END_SOCKET.ON

socket.on('ANIMATION',function(pack){

  socket.broadcast.emit('UPDATE_ANIMATOR',{id:pack.id,
                                            animation:pack.animation});

});//END_SOCKET.ON

socket.on('disconnect',function(){

 socket.broadcast.emit('USER_DISCONNECTED',{id:current_player.id});

 delete clientLookup[current_player.id];
 

});//END_SOCKET.ON

});//END_IO.ON


http.listen(process.env.PORT || 3000, function(){


  console.log(`Our app is running on port `+ process.env.PORT);

});

console.log("------- server is running -------");