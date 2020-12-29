args = {...}
x = tonumber(args[1])
y = tonumber(args[2])
z = tonumber(args[3])
orientation = 1 --North
local label = os.getComputerLabel()

print(label,"starting at",x,y,z)

function tableHasKey(table,key)
    return table[key] ~= nil
end

function getLastPosition()
    local headers = {
        ["label"] = label
    }
    local res = http.get("https://dry-cove-25939.herokuapp.com/lastPosition",headers)
    local resText = res.readAll()
    if(resText ~= "none"){
        lastPos = textutils.unserialize(res.readAll())
        x = lastPos.x
        y = lastPos.y
        z = lastPos.z
        orientation = lastPos.orientation
        print("got last pos!",x,y,z)
    }
end

function requestCommands()
    local headers = {
        ["label"] = label,
        ["x"] = tostring(x),
        ["y"] = tostring(y),
        ["z"] = tostring(z),
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
        right()
    end
    if command == "down" then
        right()
    end
end

function forward()
    if turtle then
        if turtle.forward() then
            if orientation == 1 then z = z-1 end --North
            if orientation == 2 then x = x+1 end --South
            if orientation == 3 then z = z+1 end --East
            if orientation == 4 then x = x-1 end --West
            print(x,y,z)
        end
    end
end

function left()
    if turtle then 
        if turtle.turnLeft() then
            orientation = orientation - 1
            if orientation < 1 then orientation = orientation + 4 end
        end
    end
end

function up()
    if turtle then 
        if turtle.up() then
            y = y + 1
        end
    end
end

function down()
    if turtle then 
        if turtle.down() then
            y = y - 1
        end
    end
end

function right()
    if turtle then 
        if turtle.turnRight() then
            orientation = orientation + 1
            if orientation > 4 then orientation = orientation - 4 end
        end
    end
end

getLastPosition()
while true do
    requestCommands()
    sleep(1)
end