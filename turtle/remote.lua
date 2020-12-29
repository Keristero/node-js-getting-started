args = {...}
local x = args[1]
local y = args[2]
local z = args[3]
local label = os.getComputerLabel()

print(label,"starting at",x,y,z)

function requestCommands()
    local headers = {
        ["label"] = label,
        ["x"] = x,
        ["y"] = y,
        ["z"] = z,
    }
    local res = http.get("https://dry-cove-25939.herokuapp.com/turtle",headers)
    print(res)
end

while true do
    requestCommands()
    sleep(1)
end