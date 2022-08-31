var express = require('express');

var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);
 
var clientLookup = {};

var current_player;
io.on('connect', function (socket) {
    socket.on("JOIN_ROOM", function (pack) {
        console.log(pack.name);
        current_player = {
            name: pack.name,
            id: socket.id,
            position:'{"position":{"x":"0","y":"2"}}'
        };
        console.log("player: " + socket.id + " joined room.");

        clientLookup[current_player.id] = current_player;
        
        pack = {
            mEvent: '{"meta":{"event":"connection","actorid":"'+socket.id +'"},"resource":'+current_player.position+'}'
        };
        socket.emit("JOIN_SUCCESS",pack);

        packSombra = {
            mEvent: '{"meta":{"event":"movimentation","actorid":"'+socket.id +'"},"resource":'+current_player.position+'}'
        };

        //Envia sombras
        socket.broadcast.emit("JOIN_SUCCESS",packSombra);
        //agora enviar TODOS os jogadores para o jogador atual
        for (client in clientLookup) {
            if (clientLookup[client].id != current_player.id) {
                pack = {
                    mEvent: '{"meta":{"event":"movimentation","actorid":"'+clientLookup[client].id+'"},"resource":'+clientLookup[client].position+'}'
                };
                //socket.emit('SPAWN_PLAYER', clientLookup[client]);
                socket.emit("JOIN_SUCCESS",pack);
            } 
        }
        //enviar play local
        console.log(pack);
    });//END_SOCKET.ON

    socket.on("MOVE_AND_ROT", function (pack) {
        console.log(pack);
        lastPlayerPosition = JSON.parse(pack);
        clientLookup[lastPlayerPosition["meta"]["actorid"]].position = JSON.stringify(lastPlayerPosition["resource"]);

        var data = {
            mEvent:pack
        };
        socket.broadcast.emit('UPDATE_POS_ROT', data);
        //socket.emit('UPDATE_POS_ROT', data);
    });//END_SOCKET.ON

    socket.on('ANIMATION', function (pack) {
        console.log(pack);
        var data = {
            mEvent:pack
        };
        socket.broadcast.emit('UPDATE_ANIMATOR', data);

    });//END_SOCKET.ON

    socket.on('disconnect', function () {        
        //Talvez não emit Disconect, fazer rotina de vericar de tempos em tempos
        delete clientLookup[socket.id];
        
        pack = {
            mEvent: '{"meta":{"event":"disconnection","actorid":"'+socket.id+'"},"resource":{"position":{"x":"0","y":"2"}}}'
        };
        
        socket.broadcast.emit('USER_DISCONNECTED',pack);
        console.log('DESCONECTOU ZÈ');
    });//END_SOCKET.ON

});//END_IO.ON


http.listen(3045, function () {

    console.log('server listen on 3045!');

});

console.log("------- server is running -------");