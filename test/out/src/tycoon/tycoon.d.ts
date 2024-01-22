/// <reference types="@rbxts/types" />
/// <reference types="@rbxts/compiler-types" />
/// <reference types="@rbxts/types" />
/// <reference types="@rbxts/types" />
import { TycoonBaseComponent } from "./tycoon-item";
import { ComponentId, ITycoonData, ITycoonReadolyData } from "../types";
import { Signal } from "@rbxts/beacon";
export declare class Tycoon {
    readonly OnMutatedData: Signal<[ITycoonData, (Player | undefined)?]>;
    readonly OnOwnerChanged: Signal<[(Player | undefined)?]>;
    readonly OnRecreateData: Signal<[]>;
    readonly OnDestroyed: Signal<[]>;
    private owner?;
    private model;
    private isStarted;
    private data;
    private components;
    private componentsByInstances;
    private maid;
    private dataSinceLastFlush?;
    private pendingFlush?;
    private readonly itemStorage;
    constructor(model: Model);
    GetData(): Readonly<ITycoonReadolyData>;
    IsOwner(player: Player): boolean;
    HaveOwner(): boolean;
    GetComponent<T extends TycoonBaseComponent>(id: ComponentId | T["instance"]): T | undefined;
    ClearOwner(): ITycoonData;
    SetOwner(player: Player, data?: ITycoonData): ITycoonData | undefined;
    Destroy(): void;
    private scheduleFlush;
    private getTagComponent;
    private getAllItems;
    private flush;
    private setItemData;
    private setData;
    private createItem;
    private initItems;
    /**
     * @hidden
     */
    Start(): this;
}
export declare class TycoonFactory {
    private model;
    private tycoons;
    constructor(model: Model);
    Create(cframe: CFrame): Tycoon;
    Destroy(model: Model): void;
    GetTycoon(model: Model): Tycoon | undefined;
}
