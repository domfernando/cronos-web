const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});
const Cong = require('./dados/Cong.json');
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

// io.on('connection', (socket) => {

//     socket.on("select_meet", (data) => {

//         socket.join(data.meet);

//         const viewerInRoom = viewers.find(
//             (viewer) => viewer.name === data.name && viewer.meet === data.meet
//         );

//         if (viewerInRoom) {
//             viewerInRoom.socket_id = socket.id;
//         } else {
//             viewers.push({
//                 meet: data.meet,
//                 name: data.name,
//                 socket_id: socket.id
//             });
//             console.log(viewers);
//         }

//         online.push(socket);
//     });

//     socket.on("getViewer", (name, meet) => {
//         const viewerInRoom = viewers.find(
//             (viewer) => viewer.name === name && viewer.meet === meet
//         );
//         io.emit('viewer', viewerInRoom);
//     });

//     socket.on("getViewers", () => {
//         io.emit('viewers', viewers);
//     })

//     socket.emit('timer', "00:00");

//     socket.on('start', async (data) => {
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

//                 io.to(data.meet).emit("timer", tempo);
//                 //io.emit('timer', tempo);
//             }, 1000);
//         }
//     });

//     socket.on('pause', (data) => {
//         clearInterval(intervalId);
//         intervalId = null;
//     });

//     socket.on('reset', (data) => {
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
//         acao = act;
//         socket.emit("defineAcao", act);
//     });

//     socket.on("getAcao", () => {
//         io.emit('acao', acao);
//     });

//     socket.on('disconnect', () => {

//         var i = online.indexOf(socket);
//         online.splice(i, 1);

//         if (!online || online.length == 0) {
//             clearInterval(intervalId);
//         }
//     });
// });

let rooms = {};

io.on('connection', (socket) => {
    console.log('Usuário conectado', socket.id);

    socket.on('select_meet', (data) => {
        socket.join(data.meet);

        if (!rooms[data.meet]) {
            rooms[data.meet] = {
                hh: 0,
                mm: 0,
                ss: 0,
                intervalId: null,
                meet: data.meet,
                name: data.name,
                socket_id: socket.id,
                messagIntervalId: null,
                message: ''
            };
        }

        console.log(rooms);

        socket.emit('timer', formatTime(rooms[data.meet]));
    });

    socket.on('start', (meet) => {
        if (!rooms[meet].intervalId) {
            rooms[meet].intervalId = setInterval(() => {
                rooms[meet].ss++;
                if (rooms[meet].ss === 60) {
                    rooms[meet].ss = 0;
                    rooms[meet].mm++;
                    if (rooms[meet].mm === 60) {
                        rooms[meet].mm = 0; rooms[meet].hh++;
                    }
                }

                io.to(meet).emit('timer', formatTime(rooms[meet]));

            }, 1000);
        }
    });

    socket.on('pause', (meet) => {
        clearInterval(rooms[meet].intervalId);
        rooms[meet].intervalId = null;
    });

    socket.on('reset', (meet) => {
        clearInterval(rooms[meet].intervalId);
        rooms[meet].hh = 0;
        rooms[meet].mm = 0;
        rooms[meet].ss = 0;
        rooms[meet].intervalId = null;

        io.to(meet).emit('timer', formatTime(rooms[meet]));
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado', socket.id);
    });

    socket.on("enviaMensagem", (data) => {
        rooms[data.meet].message = data.msg;
        rooms[data.meet].messagIntervalId = null;
        rooms[data.meet].messagIntervalId = setInterval(() => {
            io.to(data.meet).emit("mensagem", rooms[data.meet].message);
        }, 10000);

        // if (!rooms[data.meet].messagIntervalId) {
        //     rooms[data.meet].messagIntervalId = setInterval(() => {
        //         io.to(data.meet).emit("mensagem", rooms[data.meet].message);
        //     }, 10000);
        // }

        // console.log(data);
        // if (data.msg != "") {
        //     setInterval(() => {
        //         io.to(data.meet).emit("mensagem", data.msg);
        //     }, 10000);
        // }
    });

    socket.on("limpaMensagem",(data) =>{
        rooms[data.meet].message = data.msg;
        rooms[data.meet].messagIntervalId = null;
    });
});

const formatTime = (room) => {
    const { hh, mm, ss } = room;
    const hours = hh > 0 ? `${hh < 10 ? '0' + hh : hh}:` : '';
    const minutes = `${mm < 10 ? '0' + mm : mm}`;
    const seconds = `${ss < 10 ? '0' + ss : ss}`;
    return `${hours}${minutes}:${seconds}`;
};

app.get('/teste', async function (req, res) {

    var _cong = undefined;
    var { codigo } = req.query;

    try {
        console.log(codigo);
        Cong.Congs.forEach(element => {
            if (element.codigo == codigo) {
                _cong = element;
            }
        });

        if (_cong != undefined) {
            return res.json({ success: true, cong: _cong });
        } else {
            return res.status(400).json({ success: false, message: 'Não encontrado.' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err });
    }
});

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});

