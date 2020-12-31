let {distance} = require('../helpers.js')

class TurtleJob{
    constructor(){
        this.complete = false
        this.allocated = false
    }
    allocateTurtle(turtles){
        //Find the closest turtle with no job to do the job
        let closestTurtle = null
        let smallestDistance = Infinity
        for(let label in turtles){
            let turtle = turtles[label]
            if(!turtle.job){
                let dist = distance(turtle,this)
                if(dist < smallestDistance){
                    smallestDistance = dist
                    closestTurtle = turtle
                }
            }
        }
        closestTurtle.job = this
        this.allocated = true
        this.allocatedTurtle = closestTurtle
        return closestTurtle
    }
    getNextAction(turtle,refuelDepot,storageDepot){
        let action = {}
        action.name=""
        return action
    }
}

class ExcavateJob extends TurtleJob{
    constructor(x,y,z){
        this.x = x
        this.y = y
        this.z = z
    }
    getNextAction(turtle,refuelDepot,storageDepot){
        let action = {}
        //Refuel
        if(turtle.fuel < 500){
            //If turtle does not have enough fuel
            if(turtle.x != refuelDepot.x || turtle.y != refuelDepot.y || turtle.z != refuelDepot.z){
                //Go to the refuel depot
                action = {
                    name:"digMoveTo",
                    x:refuelDepot.x,
                    y:refuelDepot.y,
                    z:refuelDepot.z
                }
                return action
            }
            //Otherwise take fuel from the refuel depot
            action = {
                name:"takeItems",
                side:refuelDepot.side,
            }
            return action
        }
        //Drop off
        if(turtle.fuel < 500){
            //If turtle does not have enough fuel
            if(turtle.x != refuelDepot.x || turtle.y != refuelDepot.y || turtle.z != refuelDepot.z){
                //Go to the refuel depot
                action = {
                    name:"digMoveTo",
                    x:refuelDepot.x,
                    y:refuelDepot.y,
                    z:refuelDepot.z
                }
                return action
            }
        }
        //If turtle is not in correct place to dig
        if(turtle.x != this.x || turtle.z != this.z){
            //Move to dig site
            action.name="digMoveTo"
            action.x=this.x
            action.y=this.y
            action.z=this.z
            return action
        }
        //If turtle is not at bottom of hole
        if(turtle.y > 4){
            //dig to the bottom of the hole
            action.name="digMoveTo"
            action.x=this.x
            action.y=4
            action.z=this.z
            return action
        }
        //If turtle is finished
        if(turtle.x != this.x && turtle.z != this.z && turtle.y == 4){
            this.complete = true
            turtle.job = false
        }
    }
}

module.exports = {ExcavateJob}