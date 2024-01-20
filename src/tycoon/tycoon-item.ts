import Maid from "@rbxts/maid";
import { Constructor, AttrubuteValues, IItemData, ItemId } from "../types";
import { logAssert } from "../utility";
import { Tycoon } from "./tycoon";
import { BASE_COMPONENT_TAG } from "../constants";

export const TycoonComponents = new Map<string, Constructor<TycoonBaseItem>>();
export const TycoonComponentsByTag = new Map<string, Constructor<TycoonBaseItem>>();

const getAttribute = <T extends AttrubuteValues>(
	model: Instance,
	name: string,
	typeValue: T,
	defaultValue?: CheckableTypes[T],
) => {
	const value = model.GetAttribute(name) ?? defaultValue;
	logAssert(typeIs(value, typeValue), `Attribute ${name} must be of type ${typeValue}`);

	return value as CheckableTypes[T];
};

export class TycoonItemCommunication {
	public readonly setDataCallback: (newData: IItemData) => void;
	public readonly maid: Maid;
	public readonly itemStorage: Folder;

	constructor(setData: (newData: IItemData) => void, maid: Maid, itemStorage: Folder) {
		this.setDataCallback = setData;
		this.maid = maid;
		this.itemStorage = itemStorage;
	}
}

export function TycoonComponent(tag: string) {
	return <T extends TycoonBaseItem>(component: Constructor<T>) => {
		logAssert(!TycoonComponents.has(`${component}`), `${component} has already been registered`);
		TycoonComponents.set(`${component}`, component);
		TycoonComponentsByTag.set(tag, component);
	};
}

@TycoonComponent(BASE_COMPONENT_TAG)
export class TycoonBaseItem<T extends Instance = Instance, D extends object = {}> {
	public readonly instance: T;
	public readonly id: ItemId;
	public readonly defaultLocked: boolean;
	public readonly tycoon: Tycoon;
	private readonly coommunication: TycoonItemCommunication;
	private readonly itemStorage: Folder;
	private readonly defaultParent: Instance;

	constructor(instance: T, tycoon: Tycoon, communication: TycoonItemCommunication) {
		logAssert(instance.Parent, `Item ${instance.Name} has no parent`);

		this.instance = instance;
		this.tycoon = tycoon;
		this.coommunication = communication;
		this.id = getAttribute(this.instance, "Id", "string", this.instance.Name);
		this.defaultLocked = getAttribute(this.instance, "Locked", "boolean", true);
		this.defaultParent = instance.Parent!;
		this.itemStorage = communication.itemStorage;
	}

	protected generateCustomData(): D {
		return {} as D;
	}

	protected onLock() {}
	protected onUnlock() {}
	protected onDestroy() {}

	public GetInstance() {
		return this.instance;
	}

	protected patchData(newData: Partial<D | IItemData>) {
		this.coommunication.setDataCallback({
			...this.GetData(),
			...newData,
		});
	}

	public GetData() {
		return this.tycoon.GetData().Items.get(this.id) as IItemData;
	}

	private generateData(): IItemData {
		return {
			Locked: this.defaultLocked,
			...this.generateCustomData(),
		};
	}

	public GetId() {
		return this.id;
	}

	public Lock() {
		this.patchData({ Locked: true });
		this.instance.Parent = this.itemStorage;
		this.onLock();
	}

	public Unlock() {
		this.patchData({ Locked: false });
		this.instance.Parent = this.defaultParent;
		this.onUnlock();
	}

	public Start() {
		!this.GetData() && this.coommunication.setDataCallback(this.generateData());
		this.GetData().Locked ? this.Lock() : this.Unlock();

		this.tycoon.OnRecreateData.Connect(() => {
			this.coommunication.setDataCallback(this.generateData());
			this.GetData().Locked ? this.Lock() : this.Unlock();
		});

		this.coommunication.maid.GiveTask(() => this.onDestroy());
	}
}
