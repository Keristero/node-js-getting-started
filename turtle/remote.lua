args = {...} --test
x = tonumber(args[1])
y = tonumber(args[2])
z = tonumber(args[3])
orientation = 1 --North
label = os.getComputerLabel()
fuel = turtle.getFuelLevel()
inventorySlotsUsed = 0
heldItems = 0

print(label,"starting at",x,y,z)

function tableHasKey(table,key)
    return table[key] ~= nil
end

function getLastPosition()
    local headers = {
        ["label"] = label
    }
    local res = http.get("https://dry-cove-25939.herokuapp.com/lastPosition",headers)
    if res.getResponseCode() ~= 200 then
        print("no last pos, run with x y z coordinates!")
        return false
    end

    local resText = res.readAll()
    local lastPos = textutils.unserialize(resText)
    x = lastPos.x
    y = lastPos.y
    z = lastPos.z
    orientation = lastPos.orientation
    print("got last pos!",x,y,z)
    return true
end

function requestCommands()
    fuel = turtle.getFuelLevel()
    local headers = {
        ["label"] = label,
        ["x"] = tostring(x),
        ["y"] = tostring(y),
        ["z"] = tostring(z),
        ["o"] = tostring(orientation),
        ["f"] = tostring(fuel),
        ["su"] = tostring(inventorySlotsUsed),
        ["hi"] = tostring(heldItems)
    }
    local res = http.get("https://dry-cove-25939.herokuapp.com/turtle",headers)
    local command = res.readAll()
    if command ~= "" then
        print(command)
    end
    if command == "left" then
        left()
    end
    if command == "forward" then
        forward()
    end
    if command == "right" then
        right()
    end
    if command == "up" then
        up()
    end
    if command == "down" then
        down()
    end
end

function digSuck(front,up,down)
    if front then
        turtle.dig()
        turtle.suck()
    end
    if up then
        turtle.digUp()
        turtle.suck()
    end
    if down then
        turtle.dig()
        turtle.suck()
    end
    checkInventoryFullness()
end

function digMoveForward()
    while not forward() do
        if turtle.detect() then
            digSuck(true)
        end
    end
end

function digMoveUp()
    while not up() do
        if turtle.detectUp() then
            digSuck(false,true)
        end
    end
end

function digMoveDown()
    while not down() do
        if turtle.detectDown() then
            digSuck(false,false,true)
        end
    end
end


function forward()
    if turtle then
        if turtle.forward() then
            if orientation == 1 then z = z-1 end --North
            if orientation == 2 then x = x+1 end --South
            if orientation == 3 then z = z+1 end --East
            if orientation == 4 then x = x-1 end --West
            return true
        end
    end
    return false
end

function left()
    if turtle then 
        if turtle.turnLeft() then
            orientation = orientation - 1
            if orientation < 1 then orientation = orientation + 4 end
            return true
        end
    end
    return false
end

function up()
    if turtle then 
        if turtle.up() then
            y = y + 1
            return true
        end
    end
    return false
end

function down()
    if turtle then 
        if turtle.down() then
            y = y - 1
            return true
        end
    end
    return false
end

function digMoveTo(x2,y2,z2)
    while y < y2 do
        digMoveUp()
    end
    while y > y2 do
        digMoveDown()
    end
    while z > z2 do
        turnToOrientation(1)--North
        digMoveForward()
    end
    while z < z2 do
        turnToOrientation(3)--South
        digMoveForward()
    end
    while x > x2 do
        turnToOrientation(2)--East
        digMoveForward()
    end
    while x < x2 do
        turnToOrientation(4)--West
        digMoveForward()
    end
end

function turnToOrientation(targetOrientation)
    while orientation < targetOrientation do
        right()
    end
    while orientation > targetOrientation do
        left()
    end
end

function right()
    if turtle then 
        if turtle.turnRight() then
            orientation = orientation + 1
            if orientation > 4 then orientation = orientation - 4 end
            return true
        end
    end
    return false
end

function checkInventoryFullness()
    inventorySlotsUsed = 16
    heldItems = 0
    for n=1,16 do
        local slotItemCount = turtle.getItemCount(n)
        if slotItemCount == 0 then
            inventorySlotsUsed = inventorySlotsUsed - 1
        else
            heldItems = heldItems + 1
        end
	end
end

if x == nil and y == nil and z == nil then
    print("no position specified, downloading last position")
    getLastPosition()
end
checkInventoryFullness()
while true do
    requestCommands()
    sleep(1)
end