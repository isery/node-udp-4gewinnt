var myLib = require('./test');

BROADCAST = '255.255.255.255';
HOST = '';
var PORT = 32442;
var flag = false;

proto = {
    'version':2,
    'clienttype':1,
    'stage':1,
    'clientname':myLib.name
};

proto2Invite = {
    'version':2,
    'clienttype':1,
    'stage':2,
    'clientname':myLib.name
};

proto2Accept = {
    'version':2,
    'clienttype':1,
    'stage':2
};

proto3 = {
    'version':2,
    'clienttype':1,
    'stage':3
};

proto4 = {
    'version':2,
    'clienttype':1,
    'stage':4,
    'column':0,
    'turn': -1
};

proto5 = {
    'version':2,
    'clienttype':1,
    'stage':5
};

proto99 = {
    'version':2,
    'clienttype':1,
    'stage':99
};

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app, { log:false }),
    fs = require('fs')

app.listen(81);

var dgram = require('dgram');
games = [];
availablePlayers = [];
stage1Flag = false;
stage2Flag = false;
stage3Flag = false;
stage4Flag = false;
stage5Flag = false;
stage99Flag = false;

timeoutStage1 = 0;
timeoutStage2Accept = 0;
timeoutStage2Invite = 0;
timeoutStage3Invite = 0;
timeoutStage3Accept = 0;
timeoutStage4 = 0;
timeoutStage5 = 0;
timeoutStage99 = 0;
timeoutStage99Accept = 0;

intervalStage1 = 0;
intervalStage2Accept = 0;
intervalStage2Invite = 0;
intervalStage3Invite = 0;
intervalStage3Accept = 0;
intervalStage4 = 0;
intervalStage5 = 0;
intervalStage99 = 0;
intervalStage99Accept = 0;

var client = dgram.createSocket('udp4');
client.bind(PORT);
client.setBroadcast(false);
function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.sockets.on('connection', function (socket) {
    socket.emit('server ready', { hello:'world' });
    socket.on('stopclear', function () {
        clearInterval(int7);
    });
    socket.on('findGame', function () {
        stage1Flag = true;
        intervalStage1 = setInterval(findGame, 2000); //alle 2 Sekunden Broadcast schicken
        if (stage5Flag) {
            stage5Flag = false;
            clearInterval(intervalStage5);
        }
    });

    socket.on('newPlayerName', function (data) {
        proto2Invite.clientname = proto.clientname = myLib.name = data.name;
    });
    socket.on('sendRequest', function (data) {
        myLib.getPlayer(data.name);
        stage2Flag = true;
        intervalStage2Invite = setInterval(sendingInvite, 2000);
        timeoutStage2Invite = setTimeout(function () {
            clearInterval(intervalStage2Invite);
            stage2Flag = false;
        }, 10000);
    });

    socket.on('wantToPlay', function (data) {
        myLib.getPlayer(data.name);
	    console.log("want to play");
        acceptingInvite();
        console.log(proto2Accept);
        intervalStage2Accept = setInterval(acceptingInvite, 2000);
        timeoutStage2Accept = setTimeout(function () {
            clearInterval(intervalStage2Accept);
        }, 10000);
    });

    socket.on('turn', function (data) {

        proto4.column = parseInt(data.column);
        proto4.turn++;
        console.log("TURN");
        console.log(proto4);
        sendingStage4();
        intervalStage4 = setInterval(sendingStage4, 2000);
        timeoutStage4 = setTimeout(function () {
            clearInterval(intervalStage4);
            sendErrorMessage();
            socket.emit("activeShowList", {});
	        console.log("STAGE 99 getting TrUE - 30 second TIMEOUT");
            stage99Flag = true;
        }, 30000);
    });

    socket.on('winner', function (data) {
        clearInterval(intervalStage4);
        intervalStage5 = setInterval(sendingStage5, 2000);
    })


    client.on('message', function (message, remote) {
        try {
            m = JSON.parse(message);
        }
        catch (e) {
            console.log(e);
        }
        if (m.stage != 1) {
            console.log('\n **** ' + m.stage + ' ****\n');
        }
        switch (parseInt(m.stage)) {
            case 1:
                if (stage1Flag) {
                    if (!myLib.searchList(games, m)) {
                        m.address = remote.address;
                        m.limit = function () {
                            var that = this;
                            setTimeout(function () {
                                myLib.destroyMe(that)
                                socket.emit('availableGames', {name:games});
                            }, 10000)
                        };
                        m.limit();
                        games.push(m);
                        socket.emit('availableGames', {name:games});
                    }
                }
                break;

            case 2:
                if (m.clientname != undefined) {
                console.log('case2 with clientname')
                    if (!myLib.searchList(availablePlayers, m)) {
                        m.address = remote.address;
                        m.limit = function () {
                            var that = this;
                            setTimeout(function () {
                                myLib.destroyMeStage2(that);
                                socket.emit('availablePlayer', {name:availablePlayers});
                            }, 10000);
                        };
                        m.limit();
                        availablePlayers.push(m);
                        socket.emit('availablePlayer', {name:availablePlayers});
                    }
                }
                else if ((!(stage2Flag)) && m.clientname == undefined) {
                    console.log('case2 no clientname flag false')
                    stage3Flag = true;
                    stage2Flag = true;
                    clearInterval(intervalStage1);


                    intervalStage3Invite = setInterval(sendingStage3, 2000);
                    timeoutStage3Invite = setTimeout(function () {
                        console.log("TimeoutStage3Invite");
                        clearInterval(intervalStage3Invite);
                        sendErrorMessage();
                        socket.emit("activeShowList", {});
                    }, 10000);
                }

                else {
                    console.log("case2 no clientname flag true");
                }
                break;

            case 3:
                if (!stage3Flag) {
                    clearInterval(intervalStage2Accept);
                    clearInterval(timeoutStage2Accept);
                    stage3Flag = true;
                    intervalStage3Accept = setInterval(acceptingStage3, 2000);
                    timeoutStage3Accept = setTimeout(function () {
                        clearInterval(intervalStage3Accept);
                        sendErrorMessage();
                        socket.emit("activeShowList", {});
                    }, 10000);
                }
                else {
                    console.log("clear TimeoutStage3Invite");
	                clearInterval(intervalStage2Invite);
	                clearTimeout(timeoutStage2Invite);
                    clearInterval(intervalStage3Invite);
                    clearTimeout(timeoutStage3Invite);
                    socket.emit('hideShowList', {});


                }
                break;

            case 4:
                if (!stage4Flag) {
	                console.log("IF CASE 4");
	                clearInterval(intervalStage3Accept);
                    clearTimeout(timeoutStage3Accept);

                    stage4Flag = true;
                }
                else {
	                console.log("ELSE CASE 4");
                }
	            clearInterval(intervalStage4);
	            clearTimeout(timeoutStage4);
                socket.emit('getEnemyToken', {
                    turn:parseInt(m.turn),
                    column:m.column
                });
                break;
            case 5:
                clearInterval(intervalStage4);
	            clearTimeout(timeoutStage4);
	            stage5Flag = true;
                break;
            case 99:
                if (!stage99Flag) {
                    stage99Flag = true;
                    intervalStage99Accept = setInterval(sendErrorMessage, 2000);
                    timeoutStage99Accept = setTimeout(function () {
                        clearInterval(intervalStage99Accept);
                    }, 20000);
                }
                break;
            default:

        }
    });

    function findGame() {
        proto.clientname = myLib.name;
        var message = new Buffer(JSON.stringify(proto));
        client.setBroadcast(true);
        client.send(message, 0, message.length, PORT, BROADCAST);
        //client.setBroadcast(false);
    }

    function sendingInvite() {
        var message = new Buffer(JSON.stringify(proto2Invite));
        client.setBroadcast(false);
        client.send(message, 0, message.length, PORT, HOST);

    }

    function acceptingInvite() {
	    console.log("accepting invite");
        var message = new Buffer(JSON.stringify(proto2Accept));
        client.setBroadcast(false);
        client.send(message, 0, message.length, PORT, HOST);

    }

    function sendingStage3() {
        var message = new Buffer(JSON.stringify(proto3));
        client.setBroadcast(false);
        client.send(message, 0, message.length, PORT, HOST);
    }

    function acceptingStage3() {
        var message = new Buffer(JSON.stringify(proto3));
        client.setBroadcast(false);
        client.send(message, 0, message.length, PORT, HOST);
    }

    function sendingStage4() {
        console.log('sendingstage4');
        var message = new Buffer(JSON.stringify(proto4));
        client.setBroadcast(false);
        client.send(message, 0, message.length, PORT, HOST);
    }

    function sendingStage5() {
	    console.log('sendingstage5');
	    var message = new Buffer(JSON.stringify(proto5));
        client.setBroadcast(false);
        client.send(message, 0, message.length, PORT, HOST);
    }

    function sendErrorMessage() {
	    console.log("sending error message");
        var message = new Buffer(JSON.stringify(proto99));
        client.setBroadcast(false);
        client.send(message, 0, message.length, PORT, HOST);
    }


}); //end of socket.io



