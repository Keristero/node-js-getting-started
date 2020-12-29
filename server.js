const express = require('express')
const PORT = process.env.PORT || 3000

//Boilerplate
let app = require('express')();
let http = require('http');

var server = http.createServer(app);
var io = require('socket.io')(server);
app.use(express.static('client'))

let turtles = {}

function updateTurtleInfo(label,x,y,z,orientation){
    console.log(label,x,y,z,orientation)
    if(!turtles[label]){
        turtles[label] = new Turtle(label)
    }
    let turtle = turtles[label]
    turtle.recordPos(x,y,z,orientation)
}

class Turtle{
    constructor(label){
        this.label = label
    }
    recordPos(x,y,z,orientation){
        this.x = x;
        this.y = y;
        this.z = z;
        this.orientation = orientation
    }
    getNextAction(){
        let action = this.nextAction
        this.nextAction = ""
        return action
    }
}

function broadcastTurtleInfo(){
    io.emit('turtleInfo',turtles);
}

setInterval(()=>{broadcastTurtleInfo()},1000)

app.get('/turtle', (req, res) => {
    let label = req.header('label')
    let x = Number(req.header('x'))
    let y = Number(req.header('y'))
    let z = Number(req.header('z'))
    let orientation = Number(req.header('o'))
    updateTurtleInfo(label,x,y,z,orientation)
    let turtle = turtles[label]
    let nextAction = turtle.getNextAction()
    res.send(nextAction)
})

app.get('/lastPosition', (req, res) => {
    let label = req.header('label')
    if(turtles[label]){
        let turtle = turtles[label]
        let lastPos = {
            x:turtle.x,
            y:turtle.y,
            z:turtle.z,
            orientation:turtle.orientation
        }
        res.send(JSON.stringify(lastPos))
    }else{
        res.send("")
    }
})

server.listen(PORT);

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('command', (command) => {
        if(turtles[command.label]){
            let turtle = turtles[command.label]
            turtle.nextAction = command.action
            broadcastTurtleInfo()
        }
    });
});