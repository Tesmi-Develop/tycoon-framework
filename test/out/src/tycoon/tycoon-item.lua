-- Compiled with roblox-ts v2.2.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local logAssert = TS.import(script, game:GetService("ReplicatedStorage"), "tycoon", "utility").logAssert
local BASE_COMPONENT_TAG = TS.import(script, game:GetService("ReplicatedStorage"), "tycoon", "constants").BASE_COMPONENT_TAG
local TycoonComponents = {}
local TycoonComponentsByTag = {}
local getAttribute = function(model, name, typeValue, defaultValue)
	local _condition = model:GetAttribute(name)
	if _condition == nil then
		_condition = defaultValue
	end
	local value = _condition
	local _typeValue = typeValue
	logAssert(typeof(value) == _typeValue, "Attribute " .. (name .. (" must be of type " .. typeValue)))
	return value
end
local TycoonItemCommunication
do
	TycoonItemCommunication = setmetatable({}, {
		__tostring = function()
			return "TycoonItemCommunication"
		end,
	})
	TycoonItemCommunication.__index = TycoonItemCommunication
	function TycoonItemCommunication.new(...)
		local self = setmetatable({}, TycoonItemCommunication)
		return self:constructor(...) or self
	end
	function TycoonItemCommunication:constructor(setData, maid, itemStorage)
		self.setDataCallback = setData
		self.maid = maid
		self.itemStorage = itemStorage
	end
end
local function TycoonComponent(tag)
	return function(component)
		local _arg0 = tostring(component)
		logAssert(not (TycoonComponents[_arg0] ~= nil), tostring(component) .. " has already been registered")
		local _arg0_1 = tostring(component)
		local _component = component
		TycoonComponents[_arg0_1] = _component
		local _tag = tag
		local _component_1 = component
		TycoonComponentsByTag[_tag] = _component_1
	end
end
local TycoonBaseItem
do
	TycoonBaseItem = setmetatable({}, {
		__tostring = function()
			return "TycoonBaseItem"
		end,
	})
	TycoonBaseItem.__index = TycoonBaseItem
	function TycoonBaseItem.new(...)
		local self = setmetatable({}, TycoonBaseItem)
		return self:constructor(...) or self
	end
	function TycoonBaseItem:constructor(instance, tycoon, communication)
		logAssert(instance.Parent, "Item " .. (instance.Name .. " has no parent"))
		self.instance = instance
		self.tycoon = tycoon
		self.coommunication = communication
		self.id = getAttribute(self.instance, "Id", "string", self.instance.Name)
		self.defaultLocked = getAttribute(self.instance, "Locked", "boolean", true)
		self.defaultParent = instance.Parent
		self.itemStorage = communication.itemStorage
	end
	function TycoonBaseItem:generateCustomData()
		return {}
	end
	function TycoonBaseItem:onLock()
	end
	function TycoonBaseItem:onUnlock()
	end
	function TycoonBaseItem:onDestroy()
	end
	function TycoonBaseItem:GetInstance()
		return self.instance
	end
	function TycoonBaseItem:patchData(newData)
		local _fn = self.coommunication
		local _object = {}
		for _k, _v in self:GetData() do
			_object[_k] = _v
		end
		for _k, _v in newData do
			_object[_k] = _v
		end
		_fn.setDataCallback(_object)
	end
	function TycoonBaseItem:GetData()
		local _items = self.tycoon:GetData().Items
		local _id = self.id
		return _items[_id]
	end
	function TycoonBaseItem:generateData()
		local _object = {
			Locked = self.defaultLocked,
		}
		local _spread = self:generateCustomData()
		if type(_spread) == "table" then
			for _k, _v in _spread do
				_object[_k] = _v
			end
		end
		return _object
	end
	function TycoonBaseItem:GetId()
		return self.id
	end
	function TycoonBaseItem:Lock()
		self:patchData({
			Locked = true,
		})
		self.instance.Parent = self.itemStorage
		self:onLock()
	end
	function TycoonBaseItem:Unlock()
		self:patchData({
			Locked = false,
		})
		self.instance.Parent = self.defaultParent
		self:onUnlock()
	end
	function TycoonBaseItem:Start()
		local _ = not self:GetData() and self.coommunication.setDataCallback(self:generateData())
		if self:GetData().Locked then
			self:Lock()
		else
			self:Unlock()
		end
		self.tycoon.OnRecreateData:Connect(function()
			self.coommunication.setDataCallback(self:generateData())
			if self:GetData().Locked then
				self:Lock()
			else
				self:Unlock()
			end
		end)
		self.coommunication.maid:GiveTask(function()
			return self:onDestroy()
		end)
	end
	TycoonBaseItem = TycoonComponent(BASE_COMPONENT_TAG)(TycoonBaseItem) or TycoonBaseItem
end
return {
	TycoonComponent = TycoonComponent,
	TycoonComponents = TycoonComponents,
	TycoonComponentsByTag = TycoonComponentsByTag,
	TycoonItemCommunication = TycoonItemCommunication,
	TycoonBaseItem = TycoonBaseItem,
}
