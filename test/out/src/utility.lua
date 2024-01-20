-- Compiled with roblox-ts v2.2.0
local consolePrefix = "TycoonFramework"
local errorString = "--// [" .. (consolePrefix .. "]: Caught an error in your code //--")
local function logError(Message, DisplayTraceback)
	if DisplayTraceback == nil then
		DisplayTraceback = true
	end
	local _exp = Message
	local _condition = DisplayTraceback
	if _condition == nil then
		_condition = debug.traceback()
	end
	return error("\n " .. (errorString .. (" \n " .. (_exp .. (" \n \n " .. tostring(_condition))))))
end
local function logAssert(condition, message)
	-- eslint-disable-next-line roblox-ts/lua-truthiness
	local _ = not (condition ~= 0 and (condition == condition and (condition ~= "" and condition))) and logError(message)
end
return {
	logError = logError,
	logAssert = logAssert,
	consolePrefix = consolePrefix,
}
