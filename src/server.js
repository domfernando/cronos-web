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

io.on('connection', (socket) => {

    socket.emit('timer', "00:00");

    socket.on('start', () => {
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
        socket.emit("defineAcao", act);
    });

    socket.on('disconnect', () => {
        clearInterval(intervalId);
    });
});

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});

