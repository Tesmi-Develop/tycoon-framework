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
local TycoonComponentCommunication
do
	TycoonComponentCommunication = setmetatable({}, {
		__tostring = function()
			return "TycoonComponentCommunication"
		end,
	})
	TycoonComponentCommunication.__index = TycoonComponentCommunication
	function TycoonComponentCommunication.new(...)
		local self = setmetatable({}, TycoonComponentCommunication)
		return self:constructor(...) or self
	end
	function TycoonComponentCommunication:constructor(setData, maid, itemStorage)
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
local TycoonBaseComponent
do
	TycoonBaseComponent = setmetatable({}, {
		__tostring = function()
			return "TycoonBaseComponent"
		end,
	})
	TycoonBaseComponent.__index = TycoonBaseComponent
	function TycoonBaseComponent.new(...)
		local self = setmetatable({}, TycoonBaseComponent)
		return self:constructor(...) or self
	end
	function TycoonBaseComponent:constructor(instance, tycoon, communication)
		logAssert(instance.Parent, "Item " .. (instance.Name .. " has no parent"))
		self.instance = instance
		self.tycoon = tycoon
		self.coommunication = communication
		self.id = getAttribute(self.instance, "Id", "string", self.instance.Name)
		self.defaultLocked = getAttribute(self.instance, "Locked", "boolean", true)
		self.defaultParent = instance.Parent
		self.itemStorage = communication.itemStorage
	end
	function TycoonBaseComponent:generateCustomData()
		return {}
	end
	function TycoonBaseComponent:onLock()
	end
	function TycoonBaseComponent:onUnlock()
	end
	function TycoonBaseComponent:onDestroy()
	end
	function TycoonBaseComponent:GetInstance()
		return self.instance
	end
	function TycoonBaseComponent:patchData(newData)
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
	function TycoonBaseComponent:GetData()
		local _items = self.tycoon:GetData().Items
		local _id = self.id
		return _items[_id]
	end
	function TycoonBaseComponent:generateData()
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
	function TycoonBaseComponent:GetId()
		return self.id
	end
	function TycoonBaseComponent:Lock()
		self:patchData({
			Locked = true,
		})
		self.instance.Parent = self.itemStorage
		self:onLock()
	end
	function TycoonBaseComponent:Unlock()
		self:patchData({
			Locked = false,
		})
		self.instance.Parent = self.defaultParent
		self:onUnlock()
	end
	function TycoonBaseComponent:Start()
		local _ = not self:GetData() and self.coommunication.setDataCallback(self:generateData())
		if self:GetData().Locked then
			self:Lock()
		else
			self:Unlock()
		end
		self.tycoon.OnRecreateData:Connect(function()
			local _1 = not self:GetData() and self.coommunication.setDataCallback(self:generateData())
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
	TycoonBaseComponent = TycoonComponent(BASE_COMPONENT_TAG)(TycoonBaseComponent) or TycoonBaseComponent
end
return {
	TycoonComponent = TycoonComponent,
	TycoonComponents = TycoonComponents,
	TycoonComponentsByTag = TycoonComponentsByTag,
	TycoonComponentCommunication = TycoonComponentCommunication,
	TycoonBaseComponent = TycoonBaseComponent,
}
