import { Players, Workspace } from "@rbxts/services";
import { RegisterTycoon } from "../register-tycoon";
import { GetProfileStore } from "@rbxts/profileservice";
import { Profile } from "@rbxts/profileservice/globals";
import { DefaultPlayerData } from "shared/DefaultPlayerData";
import { IPlayerData } from "types/IPlayerData";

const point = Workspace.FindFirstChild("Point") as BasePart;
const myTycoonFactory = RegisterTycoon(Workspace.FindFirstChild("Tycoon") as Model);
const profileStore = GetProfileStore("PlayersData", DefaultPlayerData);

const LoadProfile = (player: Player) => {
	return new Promise<Profile<IPlayerData>>((resolve, reject) => {
		const profile = profileStore.LoadProfileAsync(tostring(player.UserId), () => "Cancel");

		if (!profile) {
			reject("Failed to load profile");
			return;
		}

		profile.AddUserId(player.UserId);
		profile.Reconcile();
		profile.ListenToRelease(() => {
			player.Kick("Profile was released");
		});

		if (!player.IsDescendantOf(Players)) {
			profile.Release();
			reject("Failed to load profile");
			return;
		}
		resolve(profile);
	});
};

Players.PlayerAdded.Connect(async (player) => {
	const tycoon = myTycoonFactory.Create(point.CFrame);
	const profile = await LoadProfile(player);
	tycoon.SetOwner(player, profile.Data.Tycoons.get("Base"));

	tycoon.OnMutatedData.Connect((data) => {
		print("Mutated data:", data);
	});
});
