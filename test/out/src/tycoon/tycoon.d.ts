/// <reference types="@rbxts/types" />
/// <reference types="@rbxts/compiler-types" />
/// <reference types="@rbxts/types" />
/// <reference types="@rbxts/types" />
import { ITycoonData, ITycoonReadolyData } from "../types";
import { Signal } from "@rbxts/beacon";
export declare class Tycoon {
    readonly OnMutatedData: Signal<[ITycoonData, (Player | undefined)?]>;
    readonly OnOwnerChanged: Signal<[(Player | undefined)?]>;
    readonly OnRecreateData: Signal<[]>;
    private owner?;
    private model;
    private isStarted;
    private data;
    private components;
    private maid;
    private dataSinceLastFlush?;
    private pendingFlush?;
    private readonly itemStorage;
    constructor(model: Model);
    private scheduleFlush;
    GetData(): Readonly<ITycoonReadolyData>;
    IsOwner(player: Player): boolean;
    HaveOwner(): boolean;
    private getTagComponent;
    private getAllItems;
    private flush;
    private setItemData;
    private setData;
    private createItem;
    private initItems;
    ClearOwner(): ITycoonData;
    SetOwner(player: Player, data?: ITycoonData): ITycoonData | undefined;
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
    GetTycoon(model: Model): Tycoon | undefined;
}
