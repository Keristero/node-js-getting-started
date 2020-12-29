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
    fuel:${turtle.fuel}\n
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
    let highestY = -Infinity
    let biggestDifferenceXY = 1
    //Find highest and lowest points
    for(let x in positionHistory){
        x = Number(x)
        if(x < lowestX){
            lowestX = x
        }
        if(x > highestX){
            highestX = x
        }
        for(let y in positionHistory[x]){
            y = Number(y)
            let locationState = positionHistory[x][y]
            if(y < lowestY){
                lowestY = y
            }
            if(y > highestY){
                highestY = y
            }
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
        x = Number(x)
        for(let y in positionHistory[x]){
            y = Number(y)
            let adjustedX = x-lowestX
            let adjustedY = y-lowestY
            ctx.fillStyle = 'grey'
            ctx.fillRect(adjustedX*gridScale,adjustedY*gridScale,gridScale,gridScale)
            console.log(adjustedX,adjustedY)
        }
    }
}