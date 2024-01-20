import { TycoonFactory } from "./tycoon/tycoon";
import { logAssert } from "./utility";

export function RegisterTycoon(model: Model) {
	logAssert(model.PrimaryPart, "Model must have a PrimaryPart");
	const tycoonConstructor = new TycoonFactory(model);
	return tycoonConstructor;
}
