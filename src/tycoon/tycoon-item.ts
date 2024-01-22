import Maid from "@rbxts/maid";
import { Constructor, AttrubuteValues, IComponentData, ComponentId } from "../types";
import { logAssert } from "../utility";
import { Tycoon } from "./tycoon";
import { BASE_COMPONENT_TAG } from "../constants";

export const TycoonComponents = new Map<string, Constructor<TycoonBaseComponent>>();
export const TycoonComponentsByTag = new Map<string, Constructor<TycoonBaseComponent>>();

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

export class TycoonComponentCommunication {
	public readonly setDataCallback: (newData: IComponentData) => void;
	public readonly maid: Maid;
	public readonly itemStorage: Folder;

	constructor(setData: (newData: IComponentData) => void, maid: Maid, itemStorage: Folder) {
		this.setDataCallback = setData;
		this.maid = maid;
		this.itemStorage = itemStorage;
	}
}

export function TycoonComponent(tag: string) {
	return <T extends TycoonBaseComponent>(component: Constructor<T>) => {
		logAssert(!TycoonComponents.has(`${component}`), `${component} has already been registered`);
		TycoonComponents.set(`${component}`, component);
		TycoonComponentsByTag.set(tag, component);
	};
}

@TycoonComponent(BASE_COMPONENT_TAG)
export class TycoonBaseComponent<T extends Instance = Instance, D extends object = {}> {
	public readonly instance: T;
	public readonly id: ComponentId;
	public readonly defaultLocked: boolean;
	public readonly tycoon: Tycoon;
	private readonly coommunication: TycoonComponentCommunication;
	private readonly itemStorage: Folder;
	private readonly defaultParent: Instance;

	constructor(instance: T, tycoon: Tycoon, communication: TycoonComponentCommunication) {
		logAssert(instance.Parent, `Item ${instance.Name} has no parent`);

		this.instance = instance;
		this.tycoon = tycoon;
		this.coommunication = communication;
		this.id = getAttribute(this.instance, "Id", "string", this.instance.Name);
		this.defaultLocked = getAttribute(this.instance, "Locked", "boolean", false);
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

	protected patchData(newData: Partial<D | IComponentData>) {
		this.coommunication.setDataCallback({
			...this.GetData(),
			...newData,
		});
	}

	public GetData() {
		return this.tycoon.GetData().Items.get(this.id) as IComponentData;
	}

	private generateData(): IComponentData {
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
			!this.GetData() && this.coommunication.setDataCallback(this.generateData());
			this.GetData().Locked ? this.Lock() : this.Unlock();
		});

		this.coommunication.maid.GiveTask(() => this.onDestroy());
	}
}
