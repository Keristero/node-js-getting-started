args = {...}
x = tonumber(args[1])
y = tonumber(args[2])
z = tonumber(args[3])
local orientation = 1 --North
local label = os.getComputerLabel()

print(label,"starting at",x,y,z)

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
end

function forward()
    if turtle then
        if turtle.forward() then
            if orientation == 1 then z = z-1 end --North
            if orientation == 2 then x = x+1 end --South
            if orientation == 3 then z = z+1 end --East
            if orientation == 4 then x = x-1 end --West
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

function right()
    if turtle then 
        if turtle.turnRight() then
            orientation = orientation + 1
            if orientation > 4 then orientation = orientation - 4 end
        end
    end
end

while true do
    requestCommands()
    sleep(1)
end