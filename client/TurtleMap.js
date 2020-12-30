class TurtleMap{
    constructor(){

    }
    DetectEdgeCoordinates(){
        this.lowestX = Infinity
        this.lowestY = Infinity
        this.highestX = -Infinity
        this.highestY = -Infinity
        let biggestDifferenceXY = 1
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
                let adjustedX = x-this.lowestX
                let adjustedY = y-this.lowestY
                ctx.fillRect(adjustedX*this.gridScale,adjustedY*this.gridScale,this.gridScale,this.gridScale)
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
            let adjustedX = x-this.lowestX
            let adjustedY = y-this.lowestY
            ctx.fillStyle = 'lightgreen'
            ctx.fillRect(adjustedX*this.gridScale,adjustedY*this.gridScale,this.gridScale,this.gridScale)
            ctx.fillStyle = 'black'
            ctx.fillText(`${orientationToArrowUnicode(turtle.orientation)} ${turtle.label}`,5+(adjustedX*this.gridScale), 16+(adjustedY*this.gridScale));
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