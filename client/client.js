let socket = io();
let div_turtles = document.getElementById('div_turtles')
let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')
let positionHistory = {}

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
    nextAction:${turtle.nextAction}\n
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
    drawGrid()
}

function recordLocationsToGrid(){
    for(let turtleLabel in turtles){
        let turtle = turtles[turtleLabel]
        let x = turtle.x
        let y = turtle.z //Important, we want to draw top down so y=z
        if(!positionHistory[x]){
            positionHistory[x] = {}
            if(!positionHistory[x][y]){
                positionHistory[x][y] = 1 //Visited
            }
        }
    }
}

function difference(a, b){
    return Math.abs(a - b);
}

function drawGrid(){
    ctx.clearRect(0,0,800,800)
    let lowestX = Infinity
    let lowestY = Infinity
    let highestX = -Infinity
    let highextY = -Infinity
    let biggestDifferenceXY = 1
    //Find highest and lowest points
    for(let x in positionHistory){
        if(x < lowestX){
            lowestX = x
        }
        if(y < lowestY){
            lowestY = y
        }
        if(x > highestX){
            highestX = x
        }
        if(y > highextY){
            highextY = y
        }
        for(let y in positionHistory[x]){
            let locationState = positionHistory[x][y]
        }
    }
    //Get highest difference between xy for stuff
    if(difference(lowestX,highestX) > biggestDifferenceXY){
        biggestDifferenceXY = difference(lowestX,highestX)
    }
    if(difference(lowestY,highestY) > biggestDifferenceXY){
        biggestDifferenceXY = difference(lowestX,highestX)
    }
    let gridScale = 800/biggestDifferenceXY

    for(let x in positionHistory){
        for(let y in positionHistory[x]){
            ctx.fillStyle = 'grey'
            ctx.fillRect(x*gridScale,y*gridScale,gridScale,gridScale)
        }
    }
}