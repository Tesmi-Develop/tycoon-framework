/// <reference types="@rbxts/types" />
/// <reference types="@rbxts/compiler-types" />
/// <reference types="maid" />
/// <reference types="@rbxts/compiler-types" />
import Maid from "@rbxts/maid";
import { Constructor, IItemData, ItemId } from "../types";
import { Tycoon } from "./tycoon";
export declare const TycoonComponents: Map<string, Constructor<TycoonBaseItem<Instance, {}>>>;
export declare const TycoonComponentsByTag: Map<string, Constructor<TycoonBaseItem<Instance, {}>>>;
export declare class TycoonItemCommunication {
    readonly setDataCallback: (newData: IItemData) => void;
    readonly maid: Maid;
    readonly itemStorage: Folder;
    constructor(setData: (newData: IItemData) => void, maid: Maid, itemStorage: Folder);
}
export declare function TycoonComponent(tag: string): <T extends TycoonBaseItem<Instance, {}>>(component: Constructor<T>) => void;
export declare class TycoonBaseItem<T extends Instance = Instance, D extends object = {}> {
    readonly instance: T;
    readonly id: ItemId;
    readonly defaultLocked: boolean;
    readonly tycoon: Tycoon;
    private readonly coommunication;
    private readonly itemStorage;
    private readonly defaultParent;
    constructor(instance: T, tycoon: Tycoon, communication: TycoonItemCommunication);
    protected generateCustomData(): D;
    protected onLock(): void;
    protected onUnlock(): void;
    protected onDestroy(): void;
    GetInstance(): T;
    protected patchData(newData: Partial<D | IItemData>): void;
    GetData(): IItemData;
    private generateData;
    GetId(): string;
    Lock(): void;
    Unlock(): void;
    Start(): void;
}
