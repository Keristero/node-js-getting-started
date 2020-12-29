const express = require('express')
const PORT = process.env.PORT || 3000

//Boilerplate
let app = require('express')();
let http = require('http');

var server = http.createServer(app);
var io = require('socket.io')(server);
app.use(express.static('client'))

let turtles = {}
function updateTurtleInfo(label,x,y,z){
    console.log(label,x,y,z)
    if(!turtles[label]){
        turtles[label] = new Turtle(label)
    }
    let turtle = turtles[label]
    turtle.recordPos(x,y,z)
}

class Turtle{
    constructor(label){
        this.label = label
    }
    recordPos(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

function broadcastTurtleInfo(){
    io.emit('turtleInfo',turtles);
}

setTimeout(()=>{broadcastTurtleInfo()},1000)

app.get('/turtle', (req, res) => {
    let label = req.header('label')
    let x = req.header('x')
    let y = req.header('y')
    let z = req.header('z')
    updateTurtleInfo(label,x,y,z)
    res.send('ok')
})

server.listen(PORT);

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});