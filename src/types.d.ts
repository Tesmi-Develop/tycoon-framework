export interface ITycoonData extends ITycoonReadolyData {
	Items: Map<string, IComponentData>;
}

export interface IComponentData {
	Locked: boolean;
}

export interface ITycoonReadolyData {
	Items: ReadonlyMap<string, IComponentData>;
}

export type Constructor<T = object> = new (...args: never[]) => T;
export type AttrubuteValues = ExtractKeys<CheckableTypes, AttributeValue>;
export type ComponentId = string;
