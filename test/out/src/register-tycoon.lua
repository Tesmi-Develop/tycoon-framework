-- Compiled with roblox-ts v2.2.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local TycoonFactory = TS.import(script, game:GetService("ReplicatedStorage"), "tycoon", "tycoon", "tycoon").TycoonFactory
local logAssert = TS.import(script, game:GetService("ReplicatedStorage"), "tycoon", "utility").logAssert
local function RegisterTycoon(model)
	logAssert(model.PrimaryPart, "Model must have a PrimaryPart")
	local tycoonConstructor = TycoonFactory.new(model)
	return tycoonConstructor
end
return {
	RegisterTycoon = RegisterTycoon,
}
