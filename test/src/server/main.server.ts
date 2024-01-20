import { Players, Workspace } from "@rbxts/services";
import { RegisterTycoon } from "../register-tycoon";

const point = Workspace.FindFirstChild("Point") as BasePart;
const myTycoonFactory = RegisterTycoon(Workspace.FindFirstChild("Tycoon") as Model);

Players.PlayerAdded.Connect((player) => {
	const tycoon = myTycoonFactory.Create(point.CFrame);
	tycoon.OnMutatedData.Connect((data) => {
		print("Mutated data:", data);
	});
	tycoon.SetOwner(player);
	print(tycoon.GetData());
});
