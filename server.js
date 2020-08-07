const express = require('express');
const { v4 : uuidV4 } = require('uuid');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.set('view engine','ejs');
app.set('views','views');
app.use(express.static(path.join(__dirname,'public')));

app.get('/',(req,res)=>{
    res.redirect(`/${uuidV4()}`)
});

app.get('/:room',(req,res)=>{
    res.render('room',{
        roomId:req.params.room
    });
});

io.on('connect', socket =>{
    socket.on('join',(roomId,userId) => {
        console.log('roomId:',roomId,'userId',userId);
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected',userId);

        socket.on('disconnect',()=>{
            socket.to(roomId).broadcast.emit('user-disconnected',userId)
        })
    });
})

server.listen(5000,()=>console.log('Server is running at 127.0.0.1:5000/'))