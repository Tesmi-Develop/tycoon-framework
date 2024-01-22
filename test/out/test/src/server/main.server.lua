-- Compiled with roblox-ts v2.2.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Players = _services.Players
local Workspace = _services.Workspace
local RegisterTycoon = TS.import(script, game:GetService("ReplicatedStorage"), "tycoon", "register-tycoon").RegisterTycoon
local GetProfileStore = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "profileservice", "src").GetProfileStore
local DefaultPlayerData = TS.import(script, game:GetService("ReplicatedStorage"), "shared", "DefaultPlayerData").DefaultPlayerData
local point = Workspace:FindFirstChild("Point")
local myTycoonFactory = RegisterTycoon(Workspace:FindFirstChild("Tycoon"))
local profileStore = GetProfileStore("PlayersData", DefaultPlayerData)
local LoadProfile = function(player)
	return TS.Promise.new(function(resolve, reject)
		local profile = profileStore:LoadProfileAsync(tostring(player.UserId), function()
			return "Cancel"
		end)
		if not profile then
			reject("Failed to load profile")
			return nil
		end
		profile:AddUserId(player.UserId)
		profile:Reconcile()
		profile:ListenToRelease(function()
			player:Kick("Profile was released")
		end)
		if not player:IsDescendantOf(Players) then
			profile:Release()
			reject("Failed to load profile")
			return nil
		end
		resolve(profile)
	end)
end
Players.PlayerAdded:Connect(TS.async(function(player)
	local tycoon = myTycoonFactory:Create(point.CFrame)
	local profile = TS.await(LoadProfile(player))
	tycoon:SetOwner(player, profile.Data.Tycoons.Base)
	tycoon.OnMutatedData:Connect(function(data)
		print("Mutated data:", data)
	end)
end))
