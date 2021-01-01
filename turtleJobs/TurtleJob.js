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
        if(closestTurtle){
            closestTurtle.job = this
            this.allocated = true
            return true
        }
        return false
    }
    jobDone(turtle){
        //Job Dun :)
        turtle.job = false
        this.complete = true
        let action = {
            name:"done",
            text:"default job has nothing to do!"
        }
        return action
    }
    getNextAction(turtle,refuelDepot,storageDepot){
        return this.jobDone(turtle)
    }
}

class ExcavateJob extends TurtleJob{
    constructor(x,y,z){
        super()
        this.x = x
        this.y = y
        this.z = z
        this.itemsTakenToRefuel = false;
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
            if(!this.itemsTakenToRefuel){
                action = {
                    name:"takeItems",
                    stacks:4,
                    stackSize:16,
                    side:refuelDepot.side,
                }
                this.itemsTakenToRefuel = true
                return action
            }
            action = {
                name:"refuel",
                needed:4000
            }
            this.itemsTakenToRefuel = true
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
            action = {
                name:"digMoveTo",
                x:this.x,
                y:this.y,
                z:this.z
            }
            return action
        }
        //If turtle is not at bottom of hole
        if(turtle.y > 4){
            //dig to the bottom of the hole
            action = {
                name:"digMoveTo",
                x:this.x,
                y:4,
                z:this.z
            }
            return action
        }
        //If turtle is finished
        if(turtle.x != this.x && turtle.z != this.z && turtle.y == 4){
            return this.jobDone(turtle)
        }
    }
    jobDone(turtle){
        let action = super.jobDone(turtle)
        action.text = "finished excavation!"
        return action
    }
}

module.exports = {ExcavateJob}