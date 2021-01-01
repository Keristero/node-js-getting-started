const express = require('express')
const PORT = process.env.PORT || 3000

//Boilerplate
let app = require('express')();
let http = require('http');

var server = http.createServer(app);
var io = require('socket.io')(server);
app.use(express.static('client'))

//Turtles
let {distance,randomInteger} = require('./helpers.js')
let {ExcavateJob} = require('./turtleJobs/TurtleJob')
let turtles = {}
let turtleJobs = []
let fuelDepots = []
let storageDepots = []

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
    findNearestFromArray(array){
        let closestEntity = null
        let smallestDistance = Infinity
        for(let entity of array){
            let dist = distance(this,entity)
            if(dist < smallestDistance){
                smallestDistance = dist
                closestEntity = entity
            }
        }
    }
    getNextAction(){
        this.fuelDepot = this.findNearestFromArray(fuelDepots)
        this.storageDepot = this.findNearestFromArray(storageDepots)
        let action = {name:""}
        if(this.job){
            //If turtle has a job
            action = this.job.getNextAction(this,this.fuelDepot,this.storageDepot)
        }else{
            //Otherwise just do next action, manual commands from website usually
            action = this.nextAction
            this.nextAction = {name:""}
            return action
        }
        console.log(`sending action to ${this.label}`,action)
        return action
    }
}

function broadcastInfo(){
    io.emit('turtleInfo',turtles);
}

setInterval(()=>{broadcastInfo()},250)
setInterval(()=>{processJobAllocations()},1000)

function decodeTurtleRequestHeaders(req){
    //Turtles send a get/post with lots of header info here every second
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
    return turtleInfo
}

app.get('/turtle', (req, res) => {
    //Turtle getting their next action
    let turtleInfo = decodeTurtleRequestHeaders(req)
    console.log(`${turtleInfo.label} fuel:${turtleInfo.fuel}`)
    updateOrCreateTurtle(turtleInfo)
    let turtle = turtles[turtleInfo.label]
    let nextAction = turtle.getNextAction()
    res.send(ccSerialize(nextAction))
})

app.post('/turtle', (req, res) => {
    //Turtles reporting their info
    let turtleInfo = decodeTurtleRequestHeaders(req)
    console.log(`${turtleInfo.label} fuel:${turtleInfo.fuel}`)
    updateOrCreateTurtle(turtleInfo)
})

function processJobAllocations(){
    //Delete any completed jobs
    for(let jobIndex in turtleJobs){
        let job = turtleJobs[jobIndex]
        if(job.complete){
            turtleJobs.splice(jobIndex,1)
            console.log(`deleted completed ${typeof job} job`)
        }
    }
    //Allocate any unallocated jobs
    for(let job of turtleJobs){
        if(!job.allocated){
            job.allocateTurtle(turtles)
        }
    }
}

function addTestJobs(testJobCount){
    for(i = 0; i < testJobCount; i++){
        let excavateJob = new ExcavateJob(randomInteger(900,950),78,randomInteger(240,260))
        turtleJobs.push(excavateJob)
    }
}

function addTestDepots(){
    let fuelDepot = {
        x:933,
        y:79,
        z:253,
        side:'up'
    }
    fuelDepots.push(fuelDepot)

    let storageDepot = {
        x:921,
        y:80,
        z:254,
        side:'down'
    }
    storageDepots.push(storageDepot)
}

addTestDepots()
addTestJobs(100)

function ccSerialize(dict){
    //Serialize 1d dict into structure that computercraft can decode
    let str = `{`
    for(let i in dict){
        let value = dict[i]
        let serialValue = ``
        if(typeof value == "string"){
            serialValue = `"${value}"`
        }
        if(typeof value == "number"){
            serialValue = `${value}`
        }
        str+=`\n   ${i} = ${serialValue},`
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
            turtle.nextAction = {name:command.action}
            broadcastInfo()
        }
    });
});