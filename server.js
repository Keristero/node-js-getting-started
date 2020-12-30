const express = require('express')
const PORT = process.env.PORT || 3000

//Boilerplate
let app = require('express')();
let http = require('http');

var server = http.createServer(app);
var io = require('socket.io')(server);
app.use(express.static('client'))

let turtles = {}

function updateOrCreateTurtle(turtleInfo){
    if(!turtles[turtleInfo.label]){
        turtles[turtleInfo.label] = new Turtle(turtleInfo.label)
    }
    let turtle = turtles[turtleInfo.label]
    turtle.updateInfo(turtleInfo)
}

class Turtle{
    constructor(label){
        this.label = label
    }
    updateInfo(turtleInfo){
        this.x = turtleInfo.x;
        this.y = turtleInfo.y;
        this.z = turtleInfo.z;
        this.orientation = turtleInfo.orientation
        this.fuel = turtleInfo.fuel
        this.slotsUsed = turtleInfo.slotsUsed;
        this.heldItems = turtleInfo.heldItems;
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

setInterval(()=>{broadcastTurtleInfo()},250)

app.get('/turtle', (req, res) => {
    //Turtles send a get with lots of header info here every second
    //This webserver responds with the next action they should take
    let turtleInfo = {
        label:req.header('label'),
        x:Number(req.header('x')),
        y:Number(req.header('y')),
        z:Number(req.header('z')),
        orientation:Number(req.header('o')),
        fuel:Number(req.header('f')),
        slotsUsed:Number(req.header('su')),
        heldItems:Number(req.header('hi'))
    }
    console.log(`${turtleInfo.label} fuel:${turtleInfo.fuel}`)
    updateOrCreateTurtle(turtleInfo)
    let turtle = turtles[turtleInfo.label]
    let nextAction = turtle.getNextAction()
    res.send(nextAction)
})

function ccSerialize(dict){
    //Serialize 1d dict into structure that computercraft can decode
    let str = `{`
    for(let i in dict){
        str+=`\n   ${i} = ${dict[i]},`
    }
    str+=`\n}`
    return str
}

app.get('/lastPosition', (req, res) => {
    //On startup turtles will request their last position for resuming
    let label = req.header('label')
    if(turtles[label]){
        let turtle = turtles[label]
        let lastPos = {
            x:turtle.x,
            y:turtle.y,
            z:turtle.z,
            orientation:turtle.orientation
        }
        res.send(ccSerialize(lastPos))
    }else{
        return res.status(400).send({
            message: 'No last position'
        });
    }
})

server.listen(PORT);

io.on('connection', (socket) => {
    //When a web user connects
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('command', (command) => {
        //When a web user issues a commnad for a turtle
        if(turtles[command.label]){
            let turtle = turtles[command.label]
            turtle.nextAction = command.action
            broadcastTurtleInfo()
        }
    });
});