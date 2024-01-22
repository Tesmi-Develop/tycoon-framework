/// <reference types="@rbxts/types" />
/// <reference types="@rbxts/compiler-types" />
/// <reference types="maid" />
/// <reference types="@rbxts/compiler-types" />
import Maid from "@rbxts/maid";
import { Constructor, IComponentData, ComponentId } from "../types";
import { Tycoon } from "./tycoon";
export declare const TycoonComponents: Map<string, Constructor<TycoonBaseComponent<Instance, {}>>>;
export declare const TycoonComponentsByTag: Map<string, Constructor<TycoonBaseComponent<Instance, {}>>>;
export declare class TycoonComponentCommunication {
    readonly setDataCallback: (newData: IComponentData) => void;
    readonly maid: Maid;
    readonly itemStorage: Folder;
    constructor(setData: (newData: IComponentData) => void, maid: Maid, itemStorage: Folder);
}
export declare function TycoonComponent(tag: string): <T extends TycoonBaseComponent<Instance, {}>>(component: Constructor<T>) => void;
export declare class TycoonBaseComponent<T extends Instance = Instance, D extends object = {}> {
    readonly instance: T;
    readonly id: ComponentId;
    readonly defaultLocked: boolean;
    readonly tycoon: Tycoon;
    private readonly coommunication;
    private readonly itemStorage;
    private readonly defaultParent;
    constructor(instance: T, tycoon: Tycoon, communication: TycoonComponentCommunication);
    protected generateCustomData(): D;
    protected onLock(): void;
    protected onUnlock(): void;
    protected onDestroy(): void;
    GetInstance(): T;
    protected patchData(newData: Partial<D | IComponentData>): void;
    GetData(): IComponentData;
    private generateData;
    GetId(): string;
    Lock(): void;
    Unlock(): void;
    Start(): void;
}
