local args = {...} --test
local x = tonumber(args[1])
local y = tonumber(args[2])
local z = tonumber(args[3])
local orientation = 1 --North
local label = os.getComputerLabel()
local fuel = turtle.getFuelLevel()
local inventorySlotsUsed = 0
local heldItems = 0
local neverBreakBlacklist = {"turtle"}

print(label,"starting at",x,y,z)

local function getLastPosition()
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

local function requestCommands()
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
    local resText = res.readAll()
    local action = textutils.unserialize(resText)
    if action.name ~= "" then
        print(action)
    end
    if action.name == "left" then
        left()
    end
    if action.name == "forward" then
        forward()
    end
    if action.name == "right" then
        right()
    end
    if action.name == "up" then
        up()
    end
    if action.name == "down" then
        down()
    end
end

local function inspectSafeToBreak(front,up,down)
    --Inspects block in ONE direction to see if we are allowed to break it
    --Searches for strings from neverBreakBlacklist
    --Returns true if block is safe to break
    local block = false
    if front then
        block = turtle.inspect()
    elseif up then
        block = turtle.inspectUp()
    elseif down then
        block = turtle.inspectDown()
    end
    if block then
        for key,value in ipairs(neverBreakBlacklist) do
            if string.find(block.name,value) ~= nil then
                return false
            end
        end
    end
    return true
end

local function digSuck(front,up,down)
    --Given up to three directions, digs a block after checking if it is allowed to do so, then sucks
    if front then
        if inspectSafeToBreak(true,nil,nil) then
            turtle.dig()
            turtle.suck()
        end
    end
    if up then
        if inspectSafeToBreak(nil,true,nil) then
            turtle.digUp()
            turtle.suckUp()
        end
    end
    if down then
        if inspectSafeToBreak(nil,nil,true) then
            turtle.digDown()
            turtle.suckDown()
        end
    end
    checkInventoryFullness()
end

local function digMoveForward()
    while not forward() do
        if turtle.detect() then
            digSuck(true)
        end
    end
end

local function digMoveUp()
    while not up() do
        if turtle.detectUp() then
            digSuck(false,true)
        end
    end
end

local function digMoveDown()
    while not down() do
        if turtle.detectDown() then
            digSuck(false,false,true)
        end
    end
end


local function forward()
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

local function left()
    if turtle.turnLeft() then
        orientation = orientation - 1
        if orientation < 1 then orientation = orientation + 4 end
        return true
    end
    return false
end

local function right()
    if turtle.turnRight() then
        orientation = orientation + 1
        if orientation > 4 then orientation = orientation - 4 end
        return true
    end
    return false
end

local function up()
    if turtle.up() then
        y = y + 1
        return true
    end
    return false
end

local function down()
    if turtle.down() then
        y = y - 1
        return true
    end
    return false
end

local function digMoveTo(x2,y2,z2)
    --Move on the Y Axis
    while y < y2 do
        digMoveUp()
    end
    while y > y2 do
        digMoveDown()
    end
    --Move on the Z Axis
    while z > z2 do
        turnToOrientation(1)--North
        digMoveForward()
    end
    while z < z2 do
        turnToOrientation(3)--South
        digMoveForward()
    end
    --Move on the X Axis
    while x > x2 do
        turnToOrientation(2)--East
        digMoveForward()
    end
    while x < x2 do
        turnToOrientation(4)--West
        digMoveForward()
    end
end

local function turnToOrientation(targetOrientation)
    while orientation < targetOrientation do
        right()
    end
    while orientation > targetOrientation do
        left()
    end
end

local function checkInventoryFullness()
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

local function tryTakeItems(stacks,stackSize,front,up,down)
    --Try suck (stacks) number of stacks of (stackSize) size from ground/inventory
    checkInventoryFullness()
    --Record old item total
    local oldItemCount = heldItems
    for i=0,stacks do
        if front then
            turtle.suck(stackSize)
        end
        if up then
            turtle.suckUp(stackSize)
        end
        if down then
            turtle.suckDown(stackSize)
        end
    end
    checkInventoryFullness()
    --Return how many items were taken
    return heldItems-oldItemCount
end

local function tryRefuel(needed)
    print( "Refueling" )
	fuel = turtle.getFuelLevel()
	if fuel == "unlimited" then
		return true
	end
	if fuel < needed then
		for n=1,16 do
			if turtle.getItemCount(n) > 0 then
				turtle.select(n)
				if turtle.refuel(1) then
					while turtle.getItemCount(n) > 0 and turtle.getFuelLevel() < needed do
						turtle.refuel(1)
					end
					if turtle.getFuelLevel() >= needed then
						turtle.select(1)
						return true
					end
				end
			end
		end
		turtle.select(1)
		return false
	end
	return true
end

local function tryUnload(front,up,down)
	print( "Unloading items..." )
	for n=1,16 do
		local nCount = turtle.getItemCount(n)
		if nCount > 0 then
            turtle.select(n)
            if front then
                turtle.drop()
            end
            if up then
                turtle.dropUp()
            end
            if down then
                turtle.dropDown()
            end
		end
    end
    checkInventoryFullness()
    turtle.select(1)
end

--Main code here
if x == nil and y == nil and z == nil then
    print("no position specified, downloading last position")
    getLastPosition()
end
checkInventoryFullness()
while true do
    requestCommands()
    sleep(1)
end