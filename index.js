var port = process.env.PORT || 3000,
    io = require('socket.io')(port),
    gameSocket = null;

    var clientLookup = {};

    var current_player;
    console.log(port);

gameSocket = io.on('connection', function(socket){
    console.log('socket connected: ' + socket.id);

    socket.on("JOIN_ROOM", function (pack) {
        current_player = {
            name: pack.name,
            id: socket.id,
            position:{
                "position":{
                    "x":"0",
                    "y":"2"
                }
            }
        };
        //console.log("player: " + socket.id + " joined room.");

        clientLookup[current_player.id] = current_player;
        
        pack = {
            "meta":{
                "event":"connection",
                "actorid":socket.id
            },
            "resource":current_player.position
        };
        console.log("player: " + socket.id + " JOIN_SUCCESS "+JSON.stringify(pack));
        socket.emit("JOIN_SUCCESS",pack);

        packSombra = {
                "meta":{
                    "event":"movimentation",
                    "actorid":socket.id
                },
                "resource":current_player.position

        };
       //Envia sombras
       console.log("player: " + socket.id + " JOIN_SUCCESS "+JSON.stringify(packSombra));
        socket.broadcast.emit("JOIN_SUCCESS",packSombra);
        //agora enviar TODOS os jogadores para o jogador atual
        for (client in clientLookup) {
            if (clientLookup[client].id != current_player.id) {
                pack = {
                        "meta":{
                            "event":"movimentation",
                            "actorid":clientLookup[client].id
                        },
                        "resource":clientLookup[client].position
                };
                console.log("player: " + clientLookup[client].id + " JOIN_SUCCESS "+JSON.stringify(pack));
                socket.emit("JOIN_SUCCESS",pack);
            } 
        }
        //enviar play local
        console.log(pack);
    });//END_SOCKET.ON

    socket.on("MOVE_AND_ROT", function (pack) {
        console.log("LOGOOOOOOOOOOOO");
        console.log(pack);
        console.log("LOGOOOOOOOOOOOO");
        clientLookup[pack.meta.actorid].position = pack.resource;
        console.log(" POSICAOOOOO "+JSON.stringify(clientLookup[pack.meta.actorid].position));

        console.log("player: " + socket.id + " UPDATE_POS_ROT "+JSON.stringify(pack));
        socket.broadcast.emit('UPDATE_POS_ROT', pack);
        //socket.emit('UPDATE_POS_ROT', data);
    });//END_SOCKET.ON


    socket.on('ANIMATION', function (pack) {
        console.log(pack);
        console.log("player: " + socket.id + " UPDATE_ANIMATOR "+JSON.stringify(pack));
        socket.broadcast.emit('UPDATE_ANIMATOR', pack);

    });//END_SOCKET.ON

    socket.on('disconnect', function () {        
        //Talvez não emit Disconect, fazer rotina de vericar de tempos em tempos
        delete clientLookup[socket.id];
        
        pack = {
           "meta":{
            "event":"disconnection",
            "actorid":socket.id
            },
            "resource":{
                "position":{"x":"0","y":"2"}
            }
        };
        
        socket.broadcast.emit('USER_DISCONNECTED',pack);
        console.log(pack);
    });//END_SOCKET.ON

});

console.log("------- server is running -------");