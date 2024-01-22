-- Compiled with roblox-ts v2.2.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local exports = {}
local _tycoon_item = TS.import(script, game:GetService("ReplicatedStorage"), "tycoon", "tycoon", "tycoon-item")
exports.TycoonBaseComponent = _tycoon_item.TycoonBaseComponent
exports.TycoonComponent = _tycoon_item.TycoonComponent
exports.RegisterTycoon = TS.import(script, game:GetService("ReplicatedStorage"), "tycoon", "register-tycoon").RegisterTycoon
return exports
