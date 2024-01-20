export interface ITycoonData extends ITycoonReadolyData {
	Items: Map<string, IItemData>;
}

export interface IItemData {
	Locked: boolean;
}

export interface ITycoonReadolyData {
	Items: ReadonlyMap<string, IItemData>;
}

export type Constructor<T = object> = new (...args: never[]) => T;
export type AttrubuteValues = ExtractKeys<CheckableTypes, AttributeValue>;
export type ItemId = string;
