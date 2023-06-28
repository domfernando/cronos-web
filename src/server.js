// const express = require('express');
// const app = express();
// const http = require('http').createServer(app);
// const io = require('socket.io')(http, {
//     cors: {
//         origin: '*',
//     }
// });

// app.use(express.static('public'));

// let timerValue = 0;
// let hh = 0;
// let mm = 0;
// let ss = 0;
// let msg = "";
// let intervalId = null;

// io.on('connection', (socket) => {

//     socket.emit('timer', "00:00");

//     socket.on('start', async() => {
//         if (!intervalId) {
//             intervalId = setInterval(() => {
//                 ss++;

//                 if (ss == 60) { //Verifica se deu 59 segundos
//                     ss = 0; //Volta os segundos para 0
//                     mm++; //Adiciona +1 na variável mm

//                     if (mm == 60) { //Verifica se deu 59 minutos
//                         mm = 0;//Volta os minutos para 0
//                         hh++;//Adiciona +1 na variável hora
//                     }
//                 }

//                 var hora = hh == 0 ? "" : `${(hh < 10 ? '0' + hh : hh) + ':'}`;
//                 var tempo = hora + (mm < 10 ? '0' + mm : mm) + ':' + (ss < 10 ? '0' + ss : ss);

//                 io.emit('timer', tempo);
//             }, 1000);

//             var clients = await io.fetchSockets();
//             console.log('Clients', clients);
//         }
//     });

//     socket.on('pause', () => {
//         clearInterval(intervalId);
//         intervalId = null;
//     });

//     socket.on('reset', () => {
//         timerValue = 0;
//         ss = 0;
//         mm = 0;
//         hh = 0;

//         io.emit('timer', "00:00");

//         clearInterval(intervalId);
//         intervalId = null;
//     });

//     socket.on("mensagem", (val) => {
//         msg = val;

//         if (val != "") {
//             setInterval(() => {
//                 io.emit("mensagem", msg);
//             }, 10000);
//         }
//     });

//     socket.on("defineAcao", (act) => {
//         socket.emit("defineAcao", act);
//     });

//     socket.on('disconnect', () => {
//         var clients = io.allSockets();
//         console.log('Clients', clients.length);

//         clearInterval(intervalId);
//     });
// });

// http.listen(3000, () => {
//     console.log('Server listening on port 3000');
// });

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});

app.use(express.static('public'));

let timerValue = 0;
let hh = 0;
let mm = 0;
let ss = 0;
let msg = "";
let intervalId = null;
let acao = "";
var viewers = [];
var online = [];

io.on('connection', (socket) => {

    socket.on("select_meet", (data) => {

        socket.join(data.meet);

        const viewerInRoom = viewers.find(
            (viewer) => viewer.name === data.name && viewer.meet === data.meet
        );

        if (viewerInRoom) {
            viewerInRoom.socket_id = socket.id;
        } else {
            viewers.push({
                meet: data.meet,
                name: data.name,
                socket_id: socket.id
            });

            online.push(socket);
        }
    });

    socket.on("getViewer", (name, meet) => {
        const viewerInRoom = viewers.find(
            (viewer) => viewer.name === name && viewer.meet === meet
        );
        io.emit('viewer', viewerInRoom);
    });

    socket.on("getViewers", () => {
        io.emit('viewers', viewers);
    })

    socket.emit('timer', "00:00");

    socket.on('start', async () => {
        if (!intervalId) {
            intervalId = setInterval(() => {
                ss++;

                if (ss == 60) { //Verifica se deu 59 segundos
                    ss = 0; //Volta os segundos para 0
                    mm++; //Adiciona +1 na variável mm

                    if (mm == 60) { //Verifica se deu 59 minutos
                        mm = 0;//Volta os minutos para 0
                        hh++;//Adiciona +1 na variável hora
                    }
                }

                var hora = hh == 0 ? "" : `${(hh < 10 ? '0' + hh : hh) + ':'}`;
                var tempo = hora + (mm < 10 ? '0' + mm : mm) + ':' + (ss < 10 ? '0' + ss : ss);

                io.emit('timer', tempo);
            }, 1000);           
        }
    });

    socket.on('pause', () => {
        clearInterval(intervalId);
        intervalId = null;
    });

    socket.on('reset', () => {
        timerValue = 0;
        ss = 0;
        mm = 0;
        hh = 0;

        io.emit('timer', "00:00");

        clearInterval(intervalId);
        intervalId = null;
    });

    socket.on("mensagem", (val) => {
        msg = val;

        if (val != "") {
            setInterval(() => {
                io.emit("mensagem", msg);
            }, 10000);
        }
    });

    socket.on("defineAcao", (act) => {
        acao = act;
        socket.emit("defineAcao", act);
    });

    socket.on("getAcao", () => {
        io.emit('acao', acao);
    });

    socket.on('disconnect', () => {

        var i = online.indexOf(socket);
        online.splice(i, 1);

        if(online.length <=0){
            clearInterval(intervalId);
        }        
    });
});

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});

