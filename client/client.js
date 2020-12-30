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