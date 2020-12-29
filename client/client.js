let socket = io();
let div_turtles = document.getElementById('div_turtles')

io.on('connection', (socket) => {
    socket.on('turtleInfo', (turtleInfo) => {
        renderHTML(turtleInfo)
    });
});

let turtles = {}

function renderTurtle(turtle){
    let turtle_div = document.createElement('div')

    let turtle_label = document.createElement('h2')
    turtle_label.textContent = turtle.label
    turtle_div.appendChild(turtle_label)
    

    let turtle_info = document.createElement('div')
    turtle_info.textContent = `x:${turtle.x}\n
    y:${turtle.y}\n
    z:${turtle.z}\n
    `
    turtle_div.appendChild(turtle_info)
    return turtle_div
}

function renderHTML(turtleInfo){
    turtles = turtleInfo

    //Clear turtle div
    while (div_turtles.firstChild) {
        div_turtles.removeChild(div_turtles.firstChild);
    }

    //Populate turtle div
    for(let turtleLabel in turtles){
        let turtle = turtles[turtleLabel]
        let turtle_div = renderTurtle(turtle)
        div_turtles.appendChild(turtle_div)
    }
}