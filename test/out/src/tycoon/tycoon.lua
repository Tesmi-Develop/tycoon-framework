-- Compiled with roblox-ts v2.2.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local RunService = _services.RunService
local ServerStorage = _services.ServerStorage
local Workspace = _services.Workspace
local logAssert = TS.import(script, game:GetService("ReplicatedStorage"), "tycoon", "utility").logAssert
local _tycoon_item = TS.import(script, game:GetService("ReplicatedStorage"), "tycoon", "tycoon", "tycoon-item")
local TycoonItemCommunication = _tycoon_item.TycoonItemCommunication
local TycoonComponentsByTag = _tycoon_item.TycoonComponentsByTag
local Signal = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "beacon", "out").Signal
local produce = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "immut", "src").produce
local Maid = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "maid", "Maid")
local FOLDER_TYCOONS_NAME = TS.import(script, game:GetService("ReplicatedStorage"), "tycoon", "constants").FOLDER_TYCOONS_NAME
local generateTycoonData = function()
	return {
		Items = {},
	}
end
local tycoonStorage = Instance.new("Folder", ServerStorage)
tycoonStorage.Name = FOLDER_TYCOONS_NAME
local Tycoon
do
	Tycoon = setmetatable({}, {
		__tostring = function()
			return "Tycoon"
		end,
	})
	Tycoon.__index = Tycoon
	function Tycoon.new(...)
		local self = setmetatable({}, Tycoon)
		return self:constructor(...) or self
	end
	function Tycoon:constructor(model)
		self.OnMutatedData = Signal.new()
		self.OnOwnerChanged = Signal.new()
		self.OnRecreateData = Signal.new()
		self.isStarted = false
		self.components = {}
		self.maid = Maid.new()
		self.model = model
		self.data = generateTycoonData()
		self.itemStorage = Instance.new("Folder", tycoonStorage)
		self.itemStorage.Name = model.Name
		self.maid:GiveTask(self.itemStorage)
		self.maid:GiveTask(model)
		self.maid:GiveTask(self.OnMutatedData)
		self.maid:GiveTask(self.OnOwnerChanged)
		self.maid:GiveTask(self.OnRecreateData)
	end
	function Tycoon:scheduleFlush()
		if self.pendingFlush then
			return nil
		end
		self.pendingFlush = RunService.Heartbeat:Once(function()
			self.pendingFlush = nil
			self:flush()
		end)
	end
	function Tycoon:GetData()
		return self.data
	end
	function Tycoon:IsOwner(player)
		return self.owner == player
	end
	function Tycoon:HaveOwner()
		return self.owner ~= nil
	end
	function Tycoon:getTagComponent(instance)
		local _exp = (instance:GetTags())
		local _arg0 = function(tag)
			local _tag = tag
			return TycoonComponentsByTag[_tag] ~= nil
		end
		-- ▼ ReadonlyArray.find ▼
		local _result
		for _i, _v in _exp do
			if _arg0(_v, _i - 1, _exp) == true then
				_result = _v
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		return _result
	end
	function Tycoon:getAllItems()
		local components = {}
		local _exp = self.model:GetDescendants()
		local _arg0 = function(instance)
			local tag = self:getTagComponent(instance)
			local _condition = tag
			if _condition ~= "" and _condition then
				local _instance = instance
				components[_instance] = tag
				_condition = components
			end
		end
		for _k, _v in _exp do
			_arg0(_v, _k - 1, _exp)
		end
		return components
	end
	function Tycoon:flush()
		if self.pendingFlush then
			self.pendingFlush:Disconnect()
			self.pendingFlush = nil
		end
		if self.dataSinceLastFlush == self.data then
			return nil
		end
		self.dataSinceLastFlush = self.data
		self.OnMutatedData:Fire(self.data, self.owner)
	end
	function Tycoon:setItemData(key, newData)
		local oldData = self.data
		self.data = produce(self.data, function(draft)
			local _result = draft
			if _result ~= nil then
				local _items = _result.Items
				local _key = key
				local _newData = newData
				_items[_key] = _newData
			end
		end)
		local _ = oldData ~= self.data and self:scheduleFlush()
	end
	function Tycoon:setData(newData)
		local oldData = self.data
		self.data = newData
		local _ = oldData ~= self.data and self:scheduleFlush()
	end
	function Tycoon:createItem(instance, itemConstructor)
		local item
		item = itemConstructor.new(instance, self, TycoonItemCommunication.new(function(newData)
			self:setItemData(item:GetId(), newData)
		end, self.maid, self.itemStorage))
		return item
	end
	function Tycoon:initItems()
		local components = self:getAllItems()
		local _arg0 = function(tag, instance)
			local _tag = tag
			local componentConstructor = TycoonComponentsByTag[_tag]
			local component = self:createItem(instance, componentConstructor)
			local _components = self.components
			local _arg0_1 = component:GetId()
			logAssert(not (_components[_arg0_1] ~= nil), "Component " .. (component:GetId() .. " already exists"))
			local _components_1 = self.components
			local _arg0_2 = component:GetId()
			_components_1[_arg0_2] = component
			component:Start()
		end
		for _k, _v in components do
			_arg0(_v, _k, components)
		end
	end
	function Tycoon:ClearOwner()
		local data = self.data
		self.owner = nil
		self:setData(generateTycoonData())
		self.OnOwnerChanged:Fire(nil)
		return data
	end
	function Tycoon:SetOwner(player, data)
		local oldData = nil
		if self.owner then
			oldData = self:ClearOwner()
		end
		self.owner = player
		self:setData(data or generateTycoonData())
		self.OnRecreateData:Fire()
		self.OnOwnerChanged:Fire(player)
		return oldData
	end
	function Tycoon:Start()
		logAssert(not self.isStarted, "Tycoon is already started")
		self.isStarted = true
		self:initItems()
		return self
	end
end
local TycoonFactory
do
	TycoonFactory = setmetatable({}, {
		__tostring = function()
			return "TycoonFactory"
		end,
	})
	TycoonFactory.__index = TycoonFactory
	function TycoonFactory.new(...)
		local self = setmetatable({}, TycoonFactory)
		return self:constructor(...) or self
	end
	function TycoonFactory:constructor(model)
		self.tycoons = {}
		self.model = model
		model.Parent = ServerStorage
	end
	function TycoonFactory:Create(cframe)
		local cloneModel = self.model:Clone()
		local tycoon = Tycoon.new(cloneModel)
		cloneModel.Parent = Workspace
		local _fn = cloneModel
		local _cframe = cframe
		local _vector3 = Vector3.new(0, cloneModel.PrimaryPart.Size.Y / 2, 0)
		_fn:PivotTo(_cframe - _vector3)
		self.tycoons[cloneModel] = tycoon
		return tycoon:Start()
	end
	function TycoonFactory:GetTycoon(model)
		local _tycoons = self.tycoons
		local _model = model
		return _tycoons[_model]
	end
end
return {
	Tycoon = Tycoon,
	TycoonFactory = TycoonFactory,
}
