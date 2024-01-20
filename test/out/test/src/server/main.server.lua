-- Compiled with roblox-ts v2.2.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local Workspace = _services.Workspace
local RegisterTycoon = TS.import(script, game:GetService("ReplicatedStorage"), "tycoon", "register-tycoon").RegisterTycoon
local point = Workspace:FindFirstChild("Point")
local myTycoonFactory = RegisterTycoon(Workspace:FindFirstChild("Tycoon"))
Players.PlayerAdded:Connect(function(player)
	local tycoon = myTycoonFactory:Create(point.CFrame)
	tycoon.OnMutatedData:Connect(function(data)
		print("Mutated data:", data)
	end)
	tycoon:SetOwner(player)
	print(tycoon:GetData())
end)
