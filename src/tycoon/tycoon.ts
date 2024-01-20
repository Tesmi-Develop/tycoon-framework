import { RunService, ServerStorage, Workspace } from "@rbxts/services";
import { logAssert } from "../utility";
import { TycoonBaseItem, TycoonItemCommunication, TycoonComponentsByTag } from "./tycoon-item";
import { ItemId, Constructor, IItemData, ITycoonData, ITycoonReadolyData } from "../types";
import { Signal } from "@rbxts/beacon";
import { produce } from "@rbxts/immut";
import Maid from "@rbxts/maid";
import { FOLDER_TYCOONS_NAME } from "../constants";

const generateTycoonData = (): ITycoonData => ({
	Items: new Map<string, IItemData>(),
});

const tycoonStorage = new Instance("Folder", ServerStorage);
tycoonStorage.Name = FOLDER_TYCOONS_NAME;

export class Tycoon {
	public readonly OnMutatedData = new Signal<[ITycoonData, Player?]>();
	public readonly OnOwnerChanged = new Signal<[Player?]>();
	public readonly OnRecreateData = new Signal<[]>();
	private owner?: Player;
	private model: Model;
	private isStarted = false;
	private data: ITycoonData;
	private components = new Map<ItemId, TycoonBaseItem>();
	private maid = new Maid();
	private dataSinceLastFlush?: ITycoonData;
	private pendingFlush?: RBXScriptConnection;
	private readonly itemStorage: Folder;

	constructor(model: Model) {
		this.model = model;
		this.data = generateTycoonData();
		this.itemStorage = new Instance("Folder", tycoonStorage);
		this.itemStorage.Name = model.Name;
		this.maid.GiveTask(this.itemStorage);
		this.maid.GiveTask(model);
		this.maid.GiveTask(this.OnMutatedData);
		this.maid.GiveTask(this.OnOwnerChanged);
		this.maid.GiveTask(this.OnRecreateData);
	}

	private scheduleFlush() {
		if (this.pendingFlush) return;

		this.pendingFlush = RunService.Heartbeat.Once(() => {
			this.pendingFlush = undefined;
			this.flush();
		});
	}

	public GetData() {
		return this.data as Readonly<ITycoonReadolyData>;
	}

	public IsOwner(player: Player) {
		return this.owner === player;
	}

	public HaveOwner(): boolean {
		return this.owner !== undefined;
	}

	private getTagComponent(instance: Instance) {
		return (instance.GetTags() as string[]).find((tag) => TycoonComponentsByTag.has(tag));
	}

	private getAllItems() {
		const components = new Map<Instance, string>();

		this.model.GetDescendants().forEach((instance) => {
			const tag = this.getTagComponent(instance);
			tag && components.set(instance, tag);
		});

		return components;
	}

	private flush() {
		if (this.pendingFlush) {
			this.pendingFlush.Disconnect();
			this.pendingFlush = undefined;
		}

		if (this.dataSinceLastFlush === this.data) return;

		this.dataSinceLastFlush = this.data;
		this.OnMutatedData.Fire(this.data, this.owner);
	}

	private setItemData(key: ItemId, newData: IItemData) {
		const oldData = this.data;

		this.data = produce(this.data, (draft) => {
			draft?.Items.set(key, newData);
		});

		oldData !== this.data && this.scheduleFlush();
	}

	private setData(newData: ITycoonData) {
		const oldData = this.data;
		this.data = newData;

		oldData !== this.data && this.scheduleFlush();
	}

	private createItem(instance: Instance, itemConstructor: Constructor<TycoonBaseItem>) {
		const item = new itemConstructor(
			instance as never,
			this as never,
			new TycoonItemCommunication(
				(newData: IItemData) => {
					this.setItemData(item.GetId(), newData);
				},
				this.maid,
				this.itemStorage,
			) as never,
		);
		return item;
	}

	private initItems() {
		const components = this.getAllItems();

		components.forEach((tag, instance) => {
			const componentConstructor = TycoonComponentsByTag.get(tag)!;
			const component = this.createItem(instance, componentConstructor);

			logAssert(!this.components.has(component.GetId()), `Component ${component.GetId()} already exists`);
			this.components.set(component.GetId(), component);
			component.Start();
		});
	}

	public ClearOwner() {
		const data = this.data;
		this.owner = undefined;
		this.setData(generateTycoonData());
		this.OnOwnerChanged.Fire(undefined);

		return data;
	}

	public SetOwner(player: Player, data?: ITycoonData) {
		let oldData: ITycoonData | undefined = undefined;

		if (this.owner) {
			oldData = this.ClearOwner();
		}

		this.owner = player;
		this.setData(data ?? generateTycoonData());

		this.OnRecreateData.Fire();
		this.OnOwnerChanged.Fire(player);

		return oldData;
	}

	/**
	 * @hidden
	 */
	public Start() {
		logAssert(!this.isStarted, "Tycoon is already started");
		this.isStarted = true;

		this.initItems();

		return this;
	}
}

export class TycoonFactory {
	private model: Model;
	private tycoons = new Map<Model, Tycoon>();

	constructor(model: Model) {
		this.model = model;
		model.Parent = ServerStorage;
	}

	public Create(cframe: CFrame) {
		const cloneModel = this.model.Clone();
		const tycoon = new Tycoon(cloneModel);

		cloneModel.Parent = Workspace;
		cloneModel.PivotTo(cframe.sub(new Vector3(0, cloneModel.PrimaryPart!.Size.Y / 2, 0)));

		this.tycoons.set(cloneModel, tycoon);
		return tycoon.Start();
	}

	public GetTycoon(model: Model) {
		return this.tycoons.get(model);
	}
}
