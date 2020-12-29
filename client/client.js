let socket = io();
let div_turtles = document.getElementById('div_turtles')

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

    //Clear turtle div
    div_turtles.innerHTML = ""

    //Populate turtle div
    for(let turtleLabel in turtles){
        let turtle = turtles[turtleLabel]
        let turtle_div = renderTurtle(turtle)
        div_turtles.appendChild(turtle_div)
    }
}