class TurtleMap{
    constructor(){

    }
    DetectEdgeCoordinates(){
        this.lowestX = Infinity
        this.lowestZ = Infinity
        this.highestX = -Infinity
        this.highestZ = -Infinity
        let biggestDifferenceXZ = 1
        //Find highest and lowest points
        for(let x in positionHistory){
            x = Number(x)
            if(x < this.lowestX){
                this.lowestX = x
            }
            if(x > this.highestX){
                this.highestX = x
            }
            for(let z in positionHistory[x]){
                z = Number(z)
                let locationState = positionHistory[x][z]
                if(z < this.lowestZ){
                    this.lowestZ = z
                }
                if(z > this.highestZ){
                    this.highestZ = z
                }
            }
        }
        //Get highest difference between xz for stuff
        let xDiff = difference(this.lowestX,this.highestX)
        if(xDiff > biggestDifferenceXZ){
            biggestDifferenceXZ = xDiff
        }
        let zDiff = difference(this.lowestZ,this.highestZ)
        if(zDiff > biggestDifferenceXZ){
            biggestDifferenceXZ = zDiff
        }
        this.gridScale = Math.min(canvas.width/biggestDifferenceXZ,32)
    }
    DrawVisitedLocations(){
        ctx.fillStyle = 'lightgrey'
        for(let x in positionHistory){
            x = Number(x)
            for(let z in positionHistory[x]){
                z = Number(z)
                let adjustedX = x-this.lowestX
                let adjustedZ = z-this.lowestZ
                ctx.fillRect(adjustedX*this.gridScale,adjustedZ*this.gridScale,this.gridScale,this.gridScale)
            }
        }
    }
    YLevelToBrightness(y,minBrightnessOffset=100){
        let brightness = (255+minBrightnessOffset)/(y+(1+minBrightnessOffset))
        return brightness
    }
    DrawTurtles(){
        ctx.font = "16px Arial";
        for(let turtleLabel in turtles){
            let turtle = turtles[turtleLabel]
            let x = turtle.x
            let y = turtle.y
            let z = turtle.z
            let adjustedX = x-this.lowestX
            let adjustedZ = z-this.lowestZ
            ctx.fillStyle = `hsl(114,100%,${this.YLevelToBrightness(y)}%,1)`
            ctx.fillRect(adjustedX*this.gridScale,adjustedZ*this.gridScale,this.gridScale,this.gridScale)
            ctx.fillStyle = 'black'
            ctx.fillText(`${orientationToArrowUnicode(turtle.orientation)} ${turtle.label}`,5+(adjustedX*this.gridScale), 16+(adjustedZ*this.gridScale));
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