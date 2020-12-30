let socket = io();
let div_turtles = document.getElementById('div_turtles')
let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')
let positionHistory = {}
let turtleMap = new TurtleMap()

socket.emit('test')
socket.on('turtleInfo', (turtleInfo) => {
    renderHTML(turtleInfo)
});

let turtles = {}

function renderCommandButton(div,turtle,command){
    let button = document.createElement('button')
    button.textContent = command
    button.onclick = ()=>{
        socket.emit('command',{label:turtle.label,action:command})
    }
    div.appendChild(button)
}

function renderTurtle(turtle){
    let turtle_div = document.createElement('div')

    let turtle_label = document.createElement('h2')
    turtle_label.textContent = turtle.label
    turtle_div.appendChild(turtle_label)
    

    let turtle_info = document.createElement('div')
    turtle_info.textContent = `x:${turtle.x}\n
    y:${turtle.y}\n
    z:${turtle.z}\n
    orientation:${turtle.orientation}\n
    fuel:${turtle.fuel}\n
    nextAction:${turtle.nextAction}\n
    slotsUsed:${turtle.slotsUsed}\n
    heldItems:${turtle.heldItems}\n
    `
    renderCommandButton(turtle_div,turtle,"left")
    renderCommandButton(turtle_div,turtle,"forward")
    renderCommandButton(turtle_div,turtle,"right")
    renderCommandButton(turtle_div,turtle,"up")
    renderCommandButton(turtle_div,turtle,"down")

    turtle_div.appendChild(turtle_info)
    return turtle_div
}

function renderHTML(turtleInfo){
    turtles = turtleInfo
    recordLocationsToGrid()

    //Clear turtle div
    div_turtles.innerHTML = ""

    //Populate turtle div
    for(let turtleLabel in turtles){
        let turtle = turtles[turtleLabel]
        let turtle_div = renderTurtle(turtle)
        div_turtles.appendChild(turtle_div)
    }
    turtleMap.Draw(ctx)
}

function recordLocationsToGrid(){
    //Record the current location of each turtle to a history object
    //This is used for drawing a map
    for(let turtleLabel in turtles){
        let turtle = turtles[turtleLabel]
        let x = turtle.x
        let y = turtle.z //Important, we want to draw top down so y=z
        if(!positionHistory.hasOwnProperty(x)){
            positionHistory[x] = {}
        }
        if(!positionHistory[x].hasOwnProperty(y)){
            positionHistory[x][y] = 1 //Visited
        }
    }
    //Now calculate the edge coordiantes for drawing the map to scale
    turtleMap.DetectEdgeCoordinates()
}

function difference(a, b){
    return Math.abs(a - b);
}

function orientationToArrowUnicode(orientation){
    //Return an arrow pointing north south east or west
    if(orientation == 1){
        return `↑`
    }else if(orientation == 2){
        return `→`
    }else if(orientation == 3){
        return `↓`
    }else if(orientation == 4){
        return `←`
    }

}

class TurtleMap{
    constructor(){

    }
    DetectEdgeCoordinates(){
        this.lowestX = Infinity
        this.lowestY = Infinity
        this.highestX = -Infinity
        this.highestY = -Infinity
        this.biggestDifferenceXY = 1
        //Find highest and lowest points
        for(let x in positionHistory){
            x = Number(x)
            if(x < this.lowestX){
                this.lowestX = x
            }
            if(x > this.highestX){
                this.highestX = x
            }
            for(let y in positionHistory[x]){
                y = Number(y)
                let locationState = positionHistory[x][y]
                if(y < this.lowestY){
                    this.lowestY = y
                }
                if(y > this.highestY){
                    this.highestY = y
                }
            }
        }
        //Get highest difference between xy for stuff
        let xDiff = difference(this.lowestX,this.highestX)
        if(xDiff > biggestDifferenceXY){
            biggestDifferenceXY = xDiff
        }
        let yDiff = difference(this.lowestY,this.highestY)
        if(yDiff > biggestDifferenceXY){
            biggestDifferenceXY = yDiff
        }
        this.gridScale = Math.min(canvas.width/biggestDifferenceXY,32)
    }
    DrawVisitedLocations(){
        ctx.fillStyle = 'lightgrey'
        for(let x in positionHistory){
            x = Number(x)
            for(let y in positionHistory[x]){
                y = Number(y)
                let adjustedX = x-lowestX
                let adjustedY = y-lowestY
                ctx.fillRect(adjustedX*gridScale,adjustedY*gridScale,gridScale,gridScale)
                console.log(adjustedX,adjustedY)
            }
        }
    }
    DrawTurtles(){
        ctx.font = "16px Arial";
        for(let turtleLabel in turtles){
            let turtle = turtles[turtleLabel]
            let x = turtle.x
            let y = turtle.z //Important, we want to draw top down so y=z
            let adjustedX = x-lowestX
            let adjustedY = y-lowestY
            ctx.fillStyle = 'lightgreen'
            ctx.fillRect(adjustedX*gridScale,adjustedY*gridScale,gridScale,gridScale)
            ctx.fillStyle = 'black'
            ctx.fillText(`${orientationToArrowUnicode(turtle.orientation)} ${turtle.label}`,5+(adjustedX*gridScale), 16+(adjustedY*gridScale));
        }
    }
    Draw(ctx){
        ctx.clearRect(0,0,800,800)

        //Draw visited places
        this.DrawVisitedLocations(ctx)
        //Draw turtles
        this.DrawTurtles(ctx)
    }
}

window.addEventListener("mousemove",(event)=>{
    mousePos = getMousePosOnCanvas(canvas,event)
})

function getMousePosOnCanvas(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
  